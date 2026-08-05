const DocGiaService = require("../services/docgia.service");
const MongoDBUtil = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.register = async (req, res, next) => {
    if (!req.body.DG_sdt || !req.body.DG_password) {
        return next(new ApiError(400, "Số điện thoại và mật khẩu không được trống."));
    }

    try {
        const docGiaService = new DocGiaService(MongoDBUtil.client);
        // Kiểm tra số điện thoại đã tồn tại
        const existingReader = await docGiaService.findByDienThoai(req.body.DG_sdt);
        if (existingReader) {
            return next(new ApiError(400, "Số điện thoại này đã được đăng ký tài khoản."));
        }

        const document = await docGiaService.create(req.body);
        return res.send({ message: "Đăng ký tài khoản độc giả thành công!", user: document });
    } catch (error) {
        console.error("Register controller error:", error);
        return next(new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo tài khoản."));
    }
};

exports.login = async (req, res, next) => {
    const { username, Password } = req.body;
    if (!username || !Password) {
        return next(new ApiError(400, "Tài khoản và mật khẩu không được trống."));
    }

    try {
        const docGiaService = new DocGiaService(MongoDBUtil.client);
        const reader = await docGiaService.findByDienThoai(username);
        if (!reader || reader.DG_password !== Password) {
            return next(new ApiError(401, "Tài khoản hoặc mật khẩu không chính xác."));
        }
        return res.send(reader);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi đăng nhập."));
    }
};

exports.create = async (req, res, next) => {
    if (!req.body.DG_sdt || !req.body.DG_password) {
        return next(new ApiError(400, "Số điện thoại và mật khẩu không được trống."));
    }

    try {
        const docGiaService = new DocGiaService(MongoDBUtil.client);
        const existingReader = await docGiaService.findByDienThoai(req.body.DG_sdt);
        if (existingReader) {
            return next(new ApiError(400, "Số điện thoại này đã được đăng ký tài khoản."));
        }

        const document = await docGiaService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi tạo độc giả."));
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const docGiaService = new DocGiaService(MongoDBUtil.client);
        const { name } = req.query;
        let filter = {};
        if (name) {
            filter = {
                $or: [
                    { DG_ten: { $regex: new RegExp(name), $options: "i" } },
                    { DG_hoLot: { $regex: new RegExp(name), $options: "i" } },
                    { DG_sdt: { $regex: new RegExp(name), $options: "i" } }
                ]
            };
        }
        documents = await docGiaService.find(filter);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi tìm kiếm độc giả."));
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDBUtil.client);
        const document = await docGiaService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy thông tin độc giả."));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi lấy độc giả có id = ${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDBUtil.client);
        const currentReader = await docGiaService.findById(req.params.id);
        if (!currentReader) {
            return next(new ApiError(404, "Không tìm thấy thông tin độc giả để cập nhật."));
        }

        // Logic đổi mật khẩu hoặc reset mật khẩu
        const { PasswordCu, PasswordMoi, isStaffReset } = req.body;
        if (!isStaffReset && PasswordCu && PasswordMoi) {
            if (currentReader.DG_password !== PasswordCu) {
                return next(new ApiError(400, "Mật khẩu cũ không chính xác."));
            }
            req.body.DG_password = PasswordMoi;
        } else if (isStaffReset && PasswordMoi) {
            req.body.DG_password = PasswordMoi;
        }

        const document = await docGiaService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Không thể cập nhật độc giả."));
        }
        return res.send({ message: "Cập nhật thông tin độc giả thành công!", data: document });
    } catch (error) {
        console.error("Update reader controller error:", error);
        return next(new ApiError(500, `Lỗi khi cập nhật độc giả có id = ${req.params.id}`));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDBUtil.client);
        const document = await docGiaService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy độc giả để xóa."));
        }
        return res.send({ message: "Xóa độc giả thành công!" });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi xóa độc giả có id = ${req.params.id}`));
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDBUtil.client);
        const deletedCount = await docGiaService.deleteAll();
        return res.send({ message: `Xóa thành công ${deletedCount} độc giả.` });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi xóa tất cả độc giả."));
    }
};
