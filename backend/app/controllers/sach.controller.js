const SachService = require("../services/sach.service");
const MongoDBUtil = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    if (!req.body.S_ten) {
        return next(new ApiError(400, "Tên sách không được để trống."));
    }

    try {
        const sachService = new SachService(MongoDBUtil.client);
        const document = await sachService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi tạo đầu sách."));
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const sachService = new SachService(MongoDBUtil.client);
        const { name } = req.query;
        let filter = {};
        if (name) {
            filter = {
                $or: [
                    { S_ten: { $regex: new RegExp(name), $options: "i" } },
                    { S_tacGia: { $regex: new RegExp(name), $options: "i" } },
                    { S_theLoai: { $regex: new RegExp(name), $options: "i" } }
                ]
            };
        }
        documents = await sachService.find(filter);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi tìm kiếm danh mục sách."));
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDBUtil.client);
        const document = await sachService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy đầu sách."));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi lấy thông tin sách có id = ${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDBUtil.client);
        const document = await sachService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách để cập nhật."));
        }
        return res.send({ message: "Cập nhật sách thành công!", data: document });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi cập nhật sách có id = ${req.params.id}`));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDBUtil.client);
        const document = await sachService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách để xóa."));
        }
        return res.send({ message: "Xóa đầu sách thành công!" });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi xóa sách có id = ${req.params.id}`));
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDBUtil.client);
        const deletedCount = await sachService.deleteAll();
        return res.send({ message: `Xóa thành công ${deletedCount} đầu sách.` });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi xóa tất cả đầu sách."));
    }
};
