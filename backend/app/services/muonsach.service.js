const { ObjectId } = require("mongodb");
const DocGiaService = require("./docgia.service");

class MuonSachService {
    constructor(client) {
        this.client = client;
        this.TheoDoiMuonSach = client.db().collection("TheoDoiMuonSach");
        this.Sach = client.db().collection("Sach");

        // Bổ sung unique & sparse index cho tdms_ma
        this.TheoDoiMuonSach.createIndex({ tdms_ma: 1 }, { unique: true, sparse: true }).catch(err => {
            console.error("Lỗi khi tạo index cho TheoDoiMuonSach:", err);
        });
    }

    extractBorrowData(payload) {
        const borrow = {
            tdms_ma: payload.tdms_ma,
            DG_id: payload.DG_id,
            S_ma: payload.S_ma,
            nv_ma: payload.nv_ma,
            tdms_ngayMuon: payload.tdms_ngayMuon ? new Date(payload.tdms_ngayMuon) : undefined,
            tdms_ngayTra: payload.tdms_ngayTra ? new Date(payload.tdms_ngayTra) : undefined,
            tdms_trangThai: payload.tdms_trangThai,
            tdms_tinhTrangSach: payload.tdms_tinhTrangSach,
        };
        // Remove undefined fields
        Object.keys(borrow).forEach(
            (key) => borrow[key] === undefined && delete borrow[key]
        );
        return borrow;
    }

    async generateMaPhieu() {
        const lastRecord = await this.TheoDoiMuonSach.findOne(
            { tdms_ma: { $regex: /^PM\d+$/ } },
            { sort: { tdms_ma: -1 } }
        );
        let nextNumber = 1;
        if (lastRecord && lastRecord.tdms_ma) {
            const matches = lastRecord.tdms_ma.match(/^PM(\d+)$/);
            if (matches) {
                nextNumber = parseInt(matches[1], 10) + 1;
            }
        }
        return `PM${String(nextNumber).padStart(4, "0")}`;
    }

    async create(payload) {
        const borrow = this.extractBorrowData(payload);
        if (!borrow.tdms_trangThai) {
            borrow.tdms_trangThai = "Chờ duyệt";
        }
        if (!borrow.tdms_ngayMuon) {
            borrow.tdms_ngayMuon = new Date();
        }

        // Tự động sinh mã phiếu mượn
        borrow.tdms_ma = await this.generateMaPhieu();

        // ===== KIỂM TRA RÀNG BUỘC HẠNG THÀNH VIÊN =====
        const docGiaService = new DocGiaService(this.client);
        const reader = await docGiaService.findById(borrow.DG_id);
        if (!reader) {
            throw new Error("Không tìm thấy thông tin độc giả.");
        }

        const rank = reader.DG_hangThanhVien || "Dong";
        const limits = DocGiaService.RANK_LIMITS[rank] || DocGiaService.RANK_LIMITS.Dong;
        const rankName = DocGiaService.getRankDisplayName(rank);

        // Đếm số sách đang mượn (Chờ duyệt + Đang mượn)
        const activeBorrows = await this.TheoDoiMuonSach.countDocuments({
            DG_id: borrow.DG_id,
            tdms_trangThai: { $in: ["Chờ duyệt", "Đang mượn"] }
        });

        if (activeBorrows >= limits.maxBooks) {
            throw new Error(
                `Bạn đã đạt giới hạn mượn sách của Hạng ${rankName} (tối đa ${limits.maxBooks} quyển). ` +
                `Hãy trả sách để tích điểm uy tín và nâng hạng thành viên!`
            );
        }

        // Tự động tính tdms_ngayTra = tdms_ngayMuon + số ngày tối đa theo hạng
        const ngayMuon = new Date(borrow.tdms_ngayMuon);
        const ngayTra = new Date(ngayMuon);
        ngayTra.setDate(ngayTra.getDate() + limits.maxDays);
        borrow.tdms_ngayTra = ngayTra;

        // Before creating, check if the book exists and has stock
        const book = await this.Sach.findOne({ S_ma: borrow.S_ma });
        if (!book) {
            throw new Error("Sách không tồn tại.");
        }
        if (book.S_soQuyen <= 0) {
            throw new Error("Sách đã hết bản sao khả dụng để mượn.");
        }

        const result = await this.TheoDoiMuonSach.insertOne(borrow);
        return { _id: result.insertedId, ...borrow };
    }

    async find(filter) {
        const cursor = await this.TheoDoiMuonSach.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        return await this.TheoDoiMuonSach.findOne({
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { tdms_ma: id }
            ]
        });
    }

    async update(id, payload) {
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { tdms_ma: id }
            ]
        };
        const currentRecord = await this.TheoDoiMuonSach.findOne(filter);
        if (!currentRecord) {
            return null;
        }

        const updateData = this.extractBorrowData(payload);

        // Handle stock changes based on state transitions
        if (updateData.tdms_trangThai && updateData.tdms_trangThai !== currentRecord.tdms_trangThai) {
            const bookId = currentRecord.S_ma;

            // 1. Moving to "Đang mượn" (Approved) from "Chờ duyệt"
            if (updateData.tdms_trangThai === "Đang mượn" && (currentRecord.tdms_trangThai === "Chờ duyệt" || currentRecord.tdms_trangThai === "Từ chối")) {
                const book = await this.Sach.findOne({ S_ma: bookId });
                if (!book || book.S_soQuyen <= 0) {
                    throw new Error("Không thể duyệt mượn vì sách đã hết hàng.");
                }
                // Decrement stock by 1
                await this.Sach.updateOne({ S_ma: bookId }, { $inc: { S_soQuyen: -1 } });
            }

            // 2. Moving to "Đã trả" (Returned) from "Đang mượn"
            if (updateData.tdms_trangThai === "Đã trả" && currentRecord.tdms_trangThai === "Đang mượn") {
                // Kiểm tra tình trạng sách khi trả để quyết định số lượng tồn kho
                const condition = updateData.tdms_tinhTrangSach || "Mới / Bình thường";
                if (condition === "Mới / Bình thường") {
                    await this.Sach.updateOne({ S_ma: bookId }, { $inc: { S_soQuyen: 1 } });
                }

                // ===== TÍNH ĐIỂM UY TÍN =====
                const docGiaService = new DocGiaService(this.client);
                const now = new Date();
                const deadline = currentRecord.tdms_ngayTra ? new Date(currentRecord.tdms_ngayTra) : null;

                if (deadline && now > deadline) {
                    // Trả TRỄ HẠN → Trừ 15 điểm
                    await docGiaService.updateReputation(currentRecord.DG_id, -15);
                } else {
                    // Trả ĐÚNG HẠN → Cộng 10 điểm
                    await docGiaService.updateReputation(currentRecord.DG_id, +10);
                }

                // Cập nhật tdms_ngayTra thành ngày thực trả
                updateData.tdms_ngayTra = now;
            }

            // 3. Moving back from "Đang mượn" - restore stock
            if (currentRecord.tdms_trangThai === "Đang mượn" && (updateData.tdms_trangThai === "Từ chối" || updateData.tdms_trangThai === "Chờ duyệt" || updateData.tdms_trangThai === "Đã hủy")) {
                await this.Sach.updateOne({ S_ma: bookId }, { $inc: { S_soQuyen: 1 } });
            }
        }

        const result = await this.TheoDoiMuonSach.findOneAndUpdate(
            filter,
            { $set: updateData },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { tdms_ma: id }
            ]
        };
        const currentRecord = await this.TheoDoiMuonSach.findOne(filter);
        if (currentRecord && currentRecord.tdms_trangThai === "Đang mượn") {
            await this.Sach.updateOne({ S_ma: currentRecord.S_ma }, { $inc: { S_soQuyen: 1 } });
        }
        const result = await this.TheoDoiMuonSach.findOneAndDelete(filter);
        return result;
    }
}

module.exports = MuonSachService;
