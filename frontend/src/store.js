import { reactive } from "vue";
import DocGiaService from "./services/docgia.service";
import NhanVienService from "./services/nhanvien.service";

export const store = reactive({
    user: JSON.parse(localStorage.getItem("user")) || null,
    userType: localStorage.getItem("userType") || null, // 'reader' or 'staff'
    searchQuery: "",
    
    login(user, type) {
        this.user = user;
        this.userType = type;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userType", type);
    },
    
    logout() {
        this.user = null;
        this.userType = null;
        localStorage.removeItem("user");
        localStorage.removeItem("userType");
    },

    // Đồng bộ thông tin user mới nhất từ server về store + localStorage
    async refreshUser() {
        if (!this.user || !this.userType) return;
        try {
            let freshUser;
            if (this.userType === "reader") {
                freshUser = await DocGiaService.get(this.user.DG_id);
            } else {
                freshUser = await NhanVienService.get(this.user.nv_ma);
            }
            if (freshUser) {
                this.user = freshUser;
                localStorage.setItem("user", JSON.stringify(freshUser));
            }
        } catch (err) {
            console.error("Lỗi khi đồng bộ thông tin user:", err);
        }
    }
});
