const NhaXuatBanService = require("../services/nhaxuatban.service");
const MongoDBUtil = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    if (!req.body.nxb_ten) {
        return next(new ApiError(400, "Tên nhà xuất bản không được để trống."));
    }

    try {
        const nxbService = new NhaXuatBanService(MongoDBUtil.client);
        const document = await nxbService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi tạo nhà xuất bản."));
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const nxbService = new NhaXuatBanService(MongoDBUtil.client);
        const { name } = req.query;
        let filter = {};
        if (name) {
            filter = { nxb_ten: { $regex: new RegExp(name), $options: "i" } };
        }
        documents = await nxbService.find(filter);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi tìm kiếm nhà xuất bản."));
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const nxbService = new NhaXuatBanService(MongoDBUtil.client);
        const document = await nxbService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhà xuất bản."));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi lấy nhà xuất bản có id = ${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    try {
        const nxbService = new NhaXuatBanService(MongoDBUtil.client);
        const document = await nxbService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhà xuất bản để cập nhật."));
        }
        return res.send({ message: "Cập nhật nhà xuất bản thành công!", data: document });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi cập nhật nhà xuất bản có id = ${req.params.id}`));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const nxbService = new NhaXuatBanService(MongoDBUtil.client);
        const document = await nxbService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhà xuất bản để xóa."));
        }
        return res.send({ message: "Xóa nhà xuất bản thành công!" });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi xóa nhà xuất bản có id = ${req.params.id}`));
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const nxbService = new NhaXuatBanService(MongoDBUtil.client);
        const deletedCount = await nxbService.deleteAll();
        return res.send({ message: `Xóa thành công ${deletedCount} nhà xuất bản.` });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi xóa tất cả nhà xuất bản."));
    }
};
