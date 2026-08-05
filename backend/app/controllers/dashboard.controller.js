const MongoDBUtil = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.getSummary = async (req, res, next) => {
    try {
        const db = MongoDBUtil.client.db();
        const totalBooks = await db.collection("Sach").countDocuments();
        
        // Sum S_soQuyen of all books
        const copiesResult = await db.collection("Sach").aggregate([
            { $group: { _id: null, totalCopies: { $sum: "$S_soQuyen" } } }
        ]).toArray();
        const totalCopies = copiesResult.length > 0 ? copiesResult[0].totalCopies : 0;

        const totalBorrowPending = await db.collection("TheoDoiMuonSach").countDocuments({ tdms_trangThai: "Chờ duyệt" });
        const totalBorrowing = await db.collection("TheoDoiMuonSach").countDocuments({ tdms_trangThai: "Đang mượn" });
        
        const totalOverdue = await db.collection("TheoDoiMuonSach").countDocuments({
            tdms_trangThai: "Đang mượn",
            tdms_ngayTra: { $lt: new Date() }
        });

        const totalBorrowReturned = await db.collection("TheoDoiMuonSach").countDocuments({ tdms_trangThai: "Đã trả" });
        const totalBorrowRejected = await db.collection("TheoDoiMuonSach").countDocuments({ tdms_trangThai: "Từ chối" });

        res.json({
            totalBooks,
            totalCopies,
            totalBorrowPending,
            totalBorrowing,
            totalOverdue,
            totalBorrowReturned,
            totalBorrowRejected
        });
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy số liệu thống kê tổng quan."));
    }
};

exports.getTopBooks = async (req, res, next) => {
    try {
        const db = MongoDBUtil.client.db();
        const topBooks = await db.collection("TheoDoiMuonSach").aggregate([
            {
                $group: {
                    _id: "$S_ma",
                    borrowCount: { $sum: 1 }
                }
            },
            { $sort: { borrowCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "Sach",
                    localField: "_id",
                    foreignField: "S_ma",
                    as: "bookInfo"
                }
            },
            { $unwind: "$bookInfo" },
            {
                $project: {
                    _id: 1,
                    borrowCount: 1,
                    S_ma: "$bookInfo.S_ma",
                    S_ten: "$bookInfo.S_ten",
                    S_tacGia: "$bookInfo.S_tacGia",
                    S_hinhAnh: "$bookInfo.S_hinhAnh",
                    S_theLoai: "$bookInfo.S_theLoai"
                }
            }
        ]).toArray();

        res.json(topBooks);
    } catch (error) {
        console.error("Lỗi aggregation top-books:", error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy top sách mượn nhiều nhất."));
    }
};

exports.getLowStock = async (req, res, next) => {
    try {
        const db = MongoDBUtil.client.db();
        const lowStock = await db.collection("Sach").find({ S_soQuyen: { $lte: 2 } }).toArray();
        res.json(lowStock);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy sách sắp hết kho."));
    }
};

exports.getOverdueReaders = async (req, res, next) => {
    try {
        const db = MongoDBUtil.client.db();
        const overdue = await db.collection("TheoDoiMuonSach").aggregate([
            {
                $match: {
                    tdms_trangThai: "Đang mượn",
                    tdms_ngayTra: { $lt: new Date() }
                }
            },
            {
                $lookup: {
                    from: "DocGia",
                    localField: "DG_id",
                    foreignField: "DG_id",
                    as: "readerInfo"
                }
            },
            { $unwind: "$readerInfo" },
            {
                $lookup: {
                    from: "Sach",
                    localField: "S_ma",
                    foreignField: "S_ma",
                    as: "bookInfo"
                }
            },
            { $unwind: "$bookInfo" },
            {
                $project: {
                    _id: 1,
                    tdms_ma: 1,
                    tdms_ngayMuon: 1,
                    tdms_ngayTra: 1,
                    DG_id: 1,
                    ReaderName: { $concat: ["$readerInfo.DG_hoLot", " ", "$readerInfo.DG_ten"] },
                    DG_sdt: "$readerInfo.DG_sdt",
                    S_ten: "$bookInfo.S_ten"
                }
            }
        ]).toArray();

        res.json(overdue);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách độc giả quá hạn."));
    }
};
