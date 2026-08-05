const NhanVienService = require("../services/nhanvien.service");
const MongoDBUtil = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.login = async (req, res, next) => {
    const { username, Password } = req.body;
    if (!username || !Password) {
        return next(new ApiError(400, "MSNV/SĐT và mật khẩu không được trống."));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDBUtil.client);
        const staff = await nhanVienService.findByMSNV(username);
        if (!staff || staff.nv_password !== Password) {
            return next(new ApiError(401, "Tài khoản hoặc mật khẩu nhân viên không chính xác."));
        }
        return res.send(staff);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi nhân viên đăng nhập."));
    }
};

exports.create = async (req, res, next) => {
    if (!req.body.nv_hoTen || !req.body.nv_password) {
        return next(new ApiError(400, "Tên nhân viên và mật khẩu không được để trống."));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDBUtil.client);
        const document = await nhanVienService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi tạo nhân viên."));
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const nhanVienService = new NhanVienService(MongoDBUtil.client);
        const { name } = req.query;
        let filter = {};
        if (name) {
            filter = {
                $or: [
                    { nv_hoTen: { $regex: new RegExp(name), $options: "i" } },
                    { nv_ma: { $regex: new RegExp(name), $options: "i" } },
                    { nv_sdt: { $regex: new RegExp(name), $options: "i" } }
                ]
            };
        }
        documents = await nhanVienService.find(filter);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi tìm kiếm nhân viên."));
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDBUtil.client);
        const document = await nhanVienService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy thông tin nhân viên."));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi lấy nhân viên có id = ${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDBUtil.client);
        const currentStaff = await nhanVienService.findById(req.params.id);
        if (!currentStaff) {
            return next(new ApiError(404, "Không tìm thấy nhân viên để cập nhật."));
        }

        // Đổi mật khẩu
        const { PasswordCu, PasswordMoi } = req.body;
        if (PasswordCu && PasswordMoi) {
            if (currentStaff.nv_password !== PasswordCu) {
                return next(new ApiError(400, "Mật khẩu cũ không chính xác."));
            }
            req.body.nv_password = PasswordMoi;
        }

        const document = await nhanVienService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Không thể cập nhật nhân viên."));
        }
        return res.send({ message: "Cập nhật nhân viên thành công!", data: document });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi cập nhật nhân viên có id = ${req.params.id}`));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDBUtil.client);
        const currentStaff = await nhanVienService.findById(req.params.id);
        if (!currentStaff) {
            return next(new ApiError(404, "Không tìm thấy nhân viên để xóa."));
        }

        // Ngăn chặn xóa tài khoản Admin tối cao
        if (currentStaff.nv_ma === "NV0001") {
            return next(new ApiError(403, "Không thể xóa tài khoản Quản lý tối cao gốc (NV0001)."));
        }

        const document = await nhanVienService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhân viên để xóa."));
        }
        return res.send({ message: "Xóa nhân viên thành công!" });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi xóa nhân viên có id = ${req.params.id}`));
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDBUtil.client);
        const deletedCount = await nhanVienService.deleteAll();
        return res.send({ message: `Xóa thành công ${deletedCount} nhân viên.` });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi xóa tất cả nhân viên."));
    }
};
