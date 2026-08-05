const NhanVienService = require("../services/nhanvien.service");
const DocGiaService = require("../services/docgia.service");
const MongoDBUtil = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.login = async (req, res, next) => {
    const { username, Password } = req.body;
    if (!username || !Password) {
        return next(new ApiError(400, "Vui lòng nhập tài khoản và mật khẩu."));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDBUtil.client);
        const docGiaService = new DocGiaService(MongoDBUtil.client);

        // 1. Kiểm tra tài khoản trong Collection NhanVien trước (nv_ma hoặc nv_sdt)
        const staffList = await nhanVienService.find({
            $or: [
                { nv_ma: username },
                { nv_sdt: username }
            ]
        });

        if (staffList.length > 0) {
            const staff = staffList[0];
            if (staff.nv_password === Password) {
                const { nv_password: _, ...staffWithoutPassword } = staff;
                return res.send({
                    user: staffWithoutPassword,
                    userType: "staff",
                    role: "NHANVIEN"
                });
            } else {
                return next(new ApiError(401, "Mật khẩu không chính xác."));
            }
        }

        // 2. Nếu không có ở NhanVien, kiểm tra tiếp trong Collection DocGia (DG_id hoặc DG_sdt)
        const readerList = await docGiaService.find({
            $or: [
                { DG_id: username },
                { DG_sdt: username }
            ]
        });

        if (readerList.length > 0) {
            const reader = readerList[0];
            if (reader.DG_password === Password) {
                const { DG_password: _, ...readerWithoutPassword } = reader;
                return res.send({
                    user: readerWithoutPassword,
                    userType: "reader",
                    role: "DOCGIA"
                });
            } else {
                return next(new ApiError(401, "Mật khẩu không chính xác."));
            }
        }

        // 3. Không tìm thấy ở cả hai bảng
        return next(new ApiError(401, "Tài khoản hoặc mật khẩu không đúng."));
    } catch (error) {
        console.error("Login controller error:", error);
        return next(new ApiError(500, "Đã xảy ra lỗi trong quá trình đăng nhập."));
    }
};
