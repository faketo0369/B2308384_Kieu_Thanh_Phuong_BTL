const MuonSachService = require("../services/muonsach.service");
const MongoDBUtil = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    if (!req.body.DG_id || !req.body.S_ma) {
        return next(new ApiError(400, "Mã độc giả và Mã sách không được trống."));
    }

    try {
        const muonSachService = new MuonSachService(MongoDBUtil.client);
        const document = await muonSachService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error("Lỗi khi tạo yêu cầu mượn sách:", error);
        return next(new ApiError(400, error.message || "Đã xảy ra lỗi khi đăng ký mượn sách."));
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const muonSachService = new MuonSachService(MongoDBUtil.client);
        const { readerId, DG_id } = req.query;
        let filter = {};
        const queryId = readerId || DG_id;
        if (queryId) {
            filter = { DG_id: queryId };
        }
        documents = await muonSachService.find(filter);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi tìm danh sách phiếu mượn."));
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDBUtil.client);
        const document = await muonSachService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy phiếu mượn sách."));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi lấy thông tin phiếu mượn có id = ${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDBUtil.client);
        const document = await muonSachService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy phiếu mượn sách để cập nhật."));
        }
        return res.send({ message: "Cập nhật phiếu mượn thành công!", data: document });
    } catch (error) {
        console.error("Lỗi khi cập nhật phiếu mượn:", error);
        return next(new ApiError(400, error.message || `Lỗi khi cập nhật phiếu mượn có id = ${req.params.id}`));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDBUtil.client);
        const document = await muonSachService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy phiếu mượn sách để xóa."));
        }
        return res.send({ message: "Xóa phiếu mượn thành công!" });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi xóa phiếu mượn có id = ${req.params.id}`));
    }
};
