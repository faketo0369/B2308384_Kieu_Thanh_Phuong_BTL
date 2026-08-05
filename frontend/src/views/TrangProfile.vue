<template>
  <div class="container py-5 animate-fade-in text-main">
    <div v-if="alertMsg" class="alert alert-custom mb-4" :class="alertClass">
      <i class="fas mr-2" :class="alertIcon"></i> {{ alertMsg }}
    </div>

    <div class="row justify-content-center">
      <!-- Profile Header Summary -->
      <div class="col-lg-4 mb-4">
        <div class="glass-panel p-4 text-center h-100 d-flex flex-column align-items-center justify-content-center">
          <div class="profile-avatar-large mb-3">
            <i class="fas fa-4x" :class="store.userType === 'staff' ? 'fa-user-tie text-primary-custom' : 'fa-user text-accent-custom'"></i>
          </div>
          <h4 class="font-weight-bold text-main mb-1">
            {{ store.userType === 'staff' ? store.user.nv_hoTen : `${store.user.DG_hoLot} ${store.user.DG_ten}` }}
          </h4>
          <span class="badge mb-3 px-3 py-2 rounded-pill" :class="store.userType === 'staff' ? 'badge-warning-custom' : 'badge-info-custom'">
            {{ store.userType === 'staff' ? store.user.nv_chucVu : 'Độc giả' }}
          </span>
          <div class="text-muted text-sm border-top-glow pt-3 w-100">
            <div class="mb-2"><span class="font-weight-bold text-main">Tài khoản:</span> {{ store.userType === 'staff' ? store.user.nv_ma : store.user.DG_id }}</div>
            <div><span class="font-weight-bold text-main">Liên hệ:</span> {{ store.userType === 'staff' ? store.user.nv_sdt : store.user.DG_sdt }}</div>
          </div>
        </div>
      </div>

      <!-- Profile Edit Form -->
      <div class="col-lg-8 mb-4">
        <div class="glass-panel p-5">
          <h3 class="font-weight-bold text-main mb-4">
            <i class="fas fa-id-card text-primary-custom mr-2"></i> Thông Tin Cá Nhân
          </h3>
          
          <form @submit.prevent="saveProfile">
            <!-- Reader fields -->
            <template v-if="store.userType === 'reader'">
              <div class="row">
                <div class="col-md-6 form-group">
                  <label>Họ lót</label>
                  <input type="text" class="form-control" v-model="profileData.DG_hoLot" required />
                </div>
                <div class="col-md-6 form-group">
                  <label>Tên</label>
                  <input type="text" class="form-control" v-model="profileData.DG_ten" required />
                </div>
              </div>

              <div class="row mt-3">
                <div class="col-md-6 form-group">
                  <label>Ngày sinh</label>
                  <input type="date" class="form-control" v-model="profileData.DG_ngaySinh" required />
                </div>
                <div class="col-md-6 form-group">
                  <label>Giới tính</label>
                  <select class="form-control form-select" v-model="profileData.DG_phai" required>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div class="row mt-3">
                <div class="col-md-6 form-group">
                  <label>Số điện thoại</label>
                  <input type="tel" class="form-control" v-model="profileData.DG_sdt" required />
                </div>
                <div class="col-md-6 form-group">
                  <label>Mã Độc Giả (Khóa)</label>
                  <input type="text" class="form-control" :value="profileData.DG_id" disabled />
                </div>
              </div>

              <div class="form-group mt-3">
                <label>Địa chỉ</label>
                <input type="text" class="form-control" v-model="profileData.DG_diaChi" required />
              </div>
            </template>

            <!-- Staff fields -->
            <template v-else-if="store.userType === 'staff'">
              <div class="row">
                <div class="col-md-6 form-group">
                  <label>Họ và Tên</label>
                  <input type="text" class="form-control" v-model="profileData.nv_hoTen" required />
                </div>
                <div class="col-md-6 form-group">
                  <label>Chức vụ (Khóa)</label>
                  <input type="text" class="form-control" :value="profileData.nv_chucVu" disabled />
                </div>
              </div>

              <div class="row mt-3">
                <div class="col-md-6 form-group">
                  <label>Số điện thoại</label>
                  <input type="tel" class="form-control" v-model="profileData.nv_sdt" required />
                </div>
                <div class="col-md-6 form-group">
                  <label>Mã Nhân Viên (Khóa)</label>
                  <input type="text" class="form-control" :value="profileData.nv_ma" disabled />
                </div>
              </div>

              <div class="form-group mt-3">
                <label>Địa chỉ</label>
                <input type="text" class="form-control" v-model="profileData.nv_diaChi" required />
              </div>
            </template>

            <!-- Change Password Section -->
            <div class="mt-4 pt-3 border-top-glow">
              <h5 class="font-weight-bold text-main mb-3"><i class="fas fa-key text-accent-custom mr-2"></i> Thay đổi mật khẩu</h5>
              <div class="row">
                <div class="col-md-4 form-group">
                  <label>Mật khẩu hiện tại</label>
                  <input type="password" class="form-control" v-model="passwordForm.PasswordCu" placeholder="Nhập mật khẩu hiện tại..." />
                </div>
                <div class="col-md-4 form-group">
                  <label>Mật khẩu mới</label>
                  <input type="password" class="form-control" v-model="passwordForm.Password" placeholder="Nhập mật khẩu mới..." />
                </div>
                <div class="col-md-4 form-group">
                  <label>Nhập lại mật khẩu mới</label>
                  <input type="password" class="form-control" v-model="passwordForm.PasswordConfirm" placeholder="Nhập lại mật khẩu mới..." />
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-4 pt-3 d-flex justify-content-end">
              <button type="submit" class="btn btn-glass rounded-pill px-4" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
                <i class="fas fa-save mr-1"></i> Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ===== MEMBERSHIP BENEFITS (Reader Only) ===== -->
    <div v-if="store.userType === 'reader'" class="row justify-content-center mt-2">
      <div class="col-lg-12">
        <div class="glass-panel p-5">
          <h3 class="font-weight-bold text-main mb-2">
            <i class="fas fa-medal text-accent-custom mr-2"></i> Phúc Lợi Hạng Thành Viên
          </h3>
          <p class="text-muted text-sm mb-4">Tích điểm uy tín bằng cách trả sách đúng hạn để nâng hạng và nhận nhiều quyền lợi hơn!</p>

          <!-- Progress Bar -->
          <div class="rank-progress-wrapper mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="font-weight-bold text-main">
                <i class="fas fa-star mr-1" :style="{ color: rankColor }"></i>
                Hạng hiện tại: <span :style="{ color: rankColor }">{{ rankDisplayName }}</span>
              </span>
              <span class="text-muted text-sm">{{ currentPoints }} điểm</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progressPercent + '%', background: progressGradient }"></div>
              <div v-for="marker in progressMarkers" :key="marker.pos" class="progress-marker" :style="{ left: marker.pos + '%' }">
                <span class="marker-label">{{ marker.label }}</span>
              </div>
            </div>
            <div class="text-center mt-2">
              <span v-if="nextRankInfo" class="text-sm" style="color: var(--text-secondary);">
                🎯 Còn <strong class="text-main">{{ nextRankInfo.pointsNeeded }} điểm</strong> nữa để lên
                <strong :style="{ color: nextRankInfo.color }">Hạng {{ nextRankInfo.name }}</strong>
              </span>
              <span v-else class="text-sm" style="color: #f9a825;">
                🏆 Chúc mừng! Bạn đã đạt hạng cao nhất!
              </span>
            </div>
          </div>

          <!-- Benefits Cards -->
          <div class="benefits-grid">
            <!-- Hạng Đồng -->
            <div class="benefit-card" :class="{ 'benefit-active': currentRank === 'Dong' }" style="--card-accent: #cd7f32;">
              <div v-if="currentRank === 'Dong'" class="active-badge">Đang áp dụng</div>
              <div class="benefit-icon">🥉</div>
              <h5 class="benefit-title" style="color: #cd7f32;">Hạng Đồng</h5>
              <p class="benefit-range">0 – 49 điểm</p>
              <ul class="benefit-list">
                <li><i class="fas fa-book mr-2"></i>Mượn tối đa <strong>2 cuốn</strong></li>
                <li><i class="fas fa-calendar-alt mr-2"></i>Thời hạn <strong>7 ngày</strong></li>
                <li class="text-muted"><i class="fas fa-minus mr-2"></i>Quyền lợi cơ bản</li>
              </ul>
            </div>

            <!-- Hạng Bạc -->
            <div class="benefit-card" :class="{ 'benefit-active': currentRank === 'Bac' }" style="--card-accent: #8e9aaf;">
              <div v-if="currentRank === 'Bac'" class="active-badge">Đang áp dụng</div>
              <div class="benefit-icon">🥈</div>
              <h5 class="benefit-title" style="color: #8e9aaf;">Hạng Bạc</h5>
              <p class="benefit-range">50 – 99 điểm</p>
              <ul class="benefit-list">
                <li><i class="fas fa-book mr-2"></i>Mượn tối đa <strong>4 cuốn</strong></li>
                <li><i class="fas fa-calendar-alt mr-2"></i>Thời hạn <strong>14 ngày</strong></li>
                <li><i class="fas fa-bolt mr-2" style="color:#f9a825;"></i><strong>Ưu tiên duyệt</strong></li>
              </ul>
            </div>

            <!-- Hạng Vàng -->
            <div class="benefit-card" :class="{ 'benefit-active': currentRank === 'Vang' }" style="--card-accent: #f9a825;">
              <div v-if="currentRank === 'Vang'" class="active-badge">Đang áp dụng</div>
              <div class="benefit-icon">🥇</div>
              <h5 class="benefit-title" style="color: #f9a825;">Hạng Vàng</h5>
              <p class="benefit-range">≥ 100 điểm</p>
              <ul class="benefit-list">
                <li><i class="fas fa-book mr-2"></i>Mượn tối đa <strong>6 cuốn</strong></li>
                <li><i class="fas fa-calendar-alt mr-2"></i>Thời hạn <strong>30 ngày</strong></li>
                <li><i class="fas fa-fire mr-2" style="color:#e53935;"></i><strong>Giữ sách hot</strong> + Miễn cọc</li>
              </ul>
            </div>
          </div>

          <!-- Point Rules -->
          <div class="point-rules mt-4">
            <h6 class="font-weight-bold text-main mb-2"><i class="fas fa-info-circle text-primary-custom mr-1"></i> Quy tắc tính điểm</h6>
            <div class="d-flex flex-wrap" style="gap: 12px;">
              <span class="rule-chip rule-positive"><i class="fas fa-arrow-up mr-1"></i> +10 điểm khi trả sách đúng hạn</span>
              <span class="rule-chip rule-negative"><i class="fas fa-arrow-down mr-1"></i> −15 điểm khi trả sách trễ hạn</span>
              <span class="rule-chip rule-info"><i class="fas fa-shield-alt mr-1"></i> Điểm thấp nhất: 0 (không âm)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { store } from "../store";
import DocGiaService from "../services/docgia.service";
import NhanVienService from "../services/nhanvien.service";

export default {
  name: "TrangProfile",
  setup() {
    const profileData = ref({});
    const passwordForm = ref({
      PasswordCu: "",
      Password: "",
      PasswordConfirm: ""
    });
    const loading = ref(false);

    // Alert states
    const alertMsg = ref(null);
    const alertClass = ref("");
    const alertIcon = ref("");

    const showAlert = (msg, type = "success") => {
      alertMsg.value = msg;
      if (type === "success") {
        alertClass.value = "alert-success-custom";
        alertIcon.value = "fa-check-circle";
      } else {
        alertClass.value = "alert-danger-custom";
        alertIcon.value = "fa-exclamation-circle";
      }
      setTimeout(() => {
        alertMsg.value = null;
      }, 4000);
    };

    // ===== RANK COMPUTED PROPERTIES =====
    const RANK_MAX = 120; // Scale for progress bar display

    const currentPoints = computed(() => store.user?.DG_diemUyTin || 0);
    const currentRank = computed(() => store.user?.DG_hangThanhVien || "Dong");

    const rankDisplayName = computed(() => {
      switch (currentRank.value) {
        case "Vang": return "Vàng";
        case "Bac": return "Bạc";
        default: return "Đồng";
      }
    });

    const rankColor = computed(() => {
      switch (currentRank.value) {
        case "Vang": return "#f9a825";
        case "Bac": return "#8e9aaf";
        default: return "#cd7f32";
      }
    });

    const progressPercent = computed(() => {
      const pts = currentPoints.value;
      if (pts >= RANK_MAX) return 100;
      return Math.min(100, (pts / RANK_MAX) * 100);
    });

    const progressGradient = computed(() => {
      if (currentRank.value === "Vang") return "linear-gradient(90deg, #cd7f32, #8e9aaf, #f9a825)";
      if (currentRank.value === "Bac") return "linear-gradient(90deg, #cd7f32, #8e9aaf)";
      return "linear-gradient(90deg, #cd7f32, #d4956b)";
    });

    const progressMarkers = computed(() => [
      { pos: (50 / RANK_MAX) * 100, label: "Bạc (50đ)" },
      { pos: (100 / RANK_MAX) * 100, label: "Vàng (100đ)" }
    ]);

    const nextRankInfo = computed(() => {
      const pts = currentPoints.value;
      if (pts < 50) {
        return { name: "Bạc", pointsNeeded: 50 - pts, color: "#8e9aaf" };
      } else if (pts < 100) {
        return { name: "Vàng", pointsNeeded: 100 - pts, color: "#f9a825" };
      }
      return null; // Already at max rank
    });

    onMounted(() => {
      // Clone user store data locally
      profileData.value = { ...store.user };
    });

    const saveProfile = async () => {
      // 1. Password change validation
      const changePassword = passwordForm.value.Password;
      if (changePassword) {
        if (!passwordForm.value.PasswordCu) {
          showAlert("Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới.", "error");
          return;
        }
        if (passwordForm.value.Password !== passwordForm.value.PasswordConfirm) {
          showAlert("Mật khẩu xác nhận nhập lại không khớp.", "error");
          return;
        }
      }

      loading.value = true;
      try {
        const id = store.userType === "reader" ? store.user.DG_id : store.user.nv_ma;
        const data = { ...profileData.value };
        
        // Remove password fields from payload clone (we send it separately or using explicit properties)
        delete data.DG_password;
        delete data.nv_password;
        delete data.Password;

        if (changePassword) {
          data.PasswordMoi = passwordForm.value.Password;
          data.PasswordCu = passwordForm.value.PasswordCu;
        }

        let result;
        if (store.userType === "reader") {
          result = await DocGiaService.update(id, data);
        } else {
          result = await NhanVienService.update(id, data);
        }

        // Save new user state back to store and localStorage
        const updatedUser = result.data || result;
        store.login(updatedUser, store.userType);
        // Đồng bộ lại từ server để đảm bảo dữ liệu hoàn toàn chính xác
        await store.refreshUser();
        profileData.value = { ...store.user };

        // Reset password form
        passwordForm.value = {
          PasswordCu: "",
          Password: "",
          PasswordConfirm: ""
        };

        showAlert("Cập nhật thông tin cá nhân thành công!");
      } catch (error) {
        console.error("Lỗi cập nhật hồ sơ cá nhân:", error);
        const errMsg = error.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin.";
        showAlert(errMsg, "error");
      } finally {
        loading.value = false;
      }
    };

    return {
      store,
      profileData,
      passwordForm,
      loading,
      alertMsg,
      alertClass,
      alertIcon,
      saveProfile,
      // Rank properties
      currentPoints,
      currentRank,
      rankDisplayName,
      rankColor,
      progressPercent,
      progressGradient,
      progressMarkers,
      nextRankInfo
    };
  }
};
</script>

<style scoped>
.profile-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-color);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}

.text-primary-custom {
  color: var(--primary-blue);
}

.text-accent-custom {
  color: var(--accent-pink-hover);
}

.badge-warning-custom {
  background: var(--bg-panel);
  color: var(--accent-pink-hover);
  border: 1px solid #ffb3c1;
}

.badge-info-custom {
  background: #e3f2fd;
  color: #0288d1;
  border: 1px solid #b3e5fc;
}

.border-top-glow {
  border-top: 1px solid var(--border-color);
}

.alert-custom {
  border-radius: 12px;
  padding: 14px 20px;
}

.alert-success-custom {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.alert-danger-custom {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

/* ===== PROGRESS BAR ===== */
.rank-progress-wrapper {
  background: var(--bg-secondary);
  border-radius: 14px;
  padding: 20px 24px;
  border: 1px solid var(--border-color);
}

.progress-track {
  position: relative;
  height: 14px;
  background: #e0e0e0;
  border-radius: 7px;
  overflow: visible;
  margin-top: 26px;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 7px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.progress-marker {
  position: absolute;
  top: -2px;
  width: 3px;
  height: 18px;
  background: #bdbdbd;
  border-radius: 2px;
  transform: translateX(-50%);
}

.marker-label {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: var(--text-secondary);
  white-space: nowrap;
  font-weight: 600;
}

/* ===== BENEFITS GRID ===== */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.benefit-card {
  position: relative;
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  border: 2px solid var(--border-color);
  transition: all 0.35s ease;
}

.benefit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.benefit-active {
  border-color: var(--card-accent) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--card-accent) 25%, transparent),
              0 6px 20px rgba(0, 0, 0, 0.1);
  background: color-mix(in srgb, var(--card-accent) 5%, var(--bg-secondary));
}

.active-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--card-accent);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 14px;
  border-radius: 20px;
  white-space: nowrap;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.benefit-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.benefit-title {
  font-weight: 700;
  margin-bottom: 4px;
}

.benefit-range {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 14px;
  font-weight: 500;
}

.benefit-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.benefit-list li {
  padding: 6px 0;
  font-size: 0.88rem;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
}

.benefit-list li:last-child {
  border-bottom: none;
}

/* ===== RULE CHIPS ===== */
.rule-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
}

.rule-positive {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.rule-negative {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.rule-info {
  background: #e3f2fd;
  color: #1565c0;
  border: 1px solid #bbdefb;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .benefits-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
