const { ObjectId } = require("mongodb");

class DocGiaService {
    // Hằng số quy tắc xếp hạng
    static RANK_THRESHOLDS = [
        { min: 100, rank: "Vang" },
        { min: 50, rank: "Bac" },
        { min: 0, rank: "Dong" }
    ];

    // Hằng số giới hạn mượn sách theo hạng
    static RANK_LIMITS = {
        Dong: { maxBooks: 2, maxDays: 7 },
        Bac:  { maxBooks: 4, maxDays: 14 },
        Vang: { maxBooks: 6, maxDays: 30 }
    };

    constructor(client) {
        this.DocGia = client.db().collection("DocGia");
    }

    // Tính hạng thành viên từ điểm uy tín
    static calculateRank(diem) {
        if (diem === undefined || diem === null) diem = 0;
        for (const tier of DocGiaService.RANK_THRESHOLDS) {
            if (diem >= tier.min) return tier.rank;
        }
        return "Dong";
    }

    // Lấy tên hạng hiển thị
    static getRankDisplayName(rank) {
        switch (rank) {
            case "Vang": return "Vàng";
            case "Bac": return "Bạc";
            case "Dong": default: return "Đồng";
        }
    }

    extractReaderData(payload) {
        const reader = {
            DG_hoLot: payload.DG_hoLot,
            DG_ten: payload.DG_ten,
            DG_ngaySinh: payload.DG_ngaySinh,
            DG_phai: payload.DG_phai,
            DG_diaChi: payload.DG_diaChi,
            DG_sdt: payload.DG_sdt,
            DG_password: payload.DG_password,
            DG_cccd: payload.DG_cccd,
            DG_diemUyTin: payload.DG_diemUyTin !== undefined ? Number(payload.DG_diemUyTin) : undefined,
            DG_hangThanhVien: payload.DG_hangThanhVien,
        };
        // Remove undefined fields
        Object.keys(reader).forEach(
            (key) => reader[key] === undefined && delete reader[key]
        );
        return reader;
    }

    async generateCustomId() {
        const lastReader = await this.DocGia.find({}, { projection: { DG_id: 1 } })
            .sort({ DG_id: -1 })
            .limit(1)
            .toArray();
        if (lastReader.length === 0) {
            return "DG0001";
        }
        const lastIdStr = lastReader[0].DG_id;
        const lastIdNum = parseInt(lastIdStr.replace("DG", ""), 10);
        const nextIdNum = isNaN(lastIdNum) ? 1 : lastIdNum + 1;
        return "DG" + String(nextIdNum).padStart(4, "0");
    }

    async create(payload) {
        const reader = this.extractReaderData(payload);
        // Generate custom ID
        reader.DG_id = await this.generateCustomId();
        // Gán giá trị mặc định cho hạng thành viên
        reader.DG_diemUyTin = reader.DG_diemUyTin ?? 0;
        reader.DG_hangThanhVien = reader.DG_hangThanhVien ?? "Dong";
        const result = await this.DocGia.insertOne(reader);
        return { _id: result.insertedId, ...reader };
    }

    async find(filter) {
        const cursor = await this.DocGia.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        return await this.DocGia.findOne({
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { DG_id: id }
            ]
        });
    }

    async findByDienThoai(sdt) {
        return await this.DocGia.findOne({ DG_sdt: sdt });
    }

    async update(id, payload) {
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { DG_id: id }
            ]
        };
        const update = this.extractReaderData(payload);
        const result = await this.DocGia.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    // Cập nhật điểm uy tín và tự động tính lại hạng
    async updateReputation(dgId, deltaPoints) {
        const reader = await this.findById(dgId);
        if (!reader) return null;

        let newDiem = (reader.DG_diemUyTin || 0) + deltaPoints;
        if (newDiem < 0) newDiem = 0; // Không cho điểm âm

        const newRank = DocGiaService.calculateRank(newDiem);

        await this.DocGia.updateOne(
            { DG_id: reader.DG_id },
            { $set: { DG_diemUyTin: newDiem, DG_hangThanhVien: newRank } }
        );

        return { DG_diemUyTin: newDiem, DG_hangThanhVien: newRank };
    }

    async delete(id) {
        const result = await this.DocGia.findOneAndDelete({
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { DG_id: id }
            ]
        });
        return result;
    }

    async deleteAll() {
        const result = await this.DocGia.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = DocGiaService;
