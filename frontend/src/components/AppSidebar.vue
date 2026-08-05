<template>
  <aside class="app-sidebar d-flex flex-column justify-content-between">
    <div>
      <!-- User Profile summary at the top of the sidebar -->
      <div v-if="store.user" class="sidebar-profile-card text-center p-3 mb-4">
        <div class="profile-avatar mb-2 mx-auto">
          <i class="fas fa-3x" :class="store.userType === 'staff' ? 'fa-user-tie text-primary-custom' : 'fa-user text-accent-custom'"></i>
        </div>
        <h6 class="text-main font-weight-bold mb-1 ellipsis">
          {{ store.userType === 'staff' ? store.user.nv_hoTen : `${store.user.DG_hoLot} ${store.user.DG_ten}` }}
        </h6>
        <span class="badge" :class="store.userType === 'staff' ? 'badge-warning-custom' : 'badge-info-custom'">
          {{ store.userType === 'staff' ? store.user.nv_chucVu : 'Độc giả' }}
        </span>
        <!-- Badge hạng thành viên cho Độc giả -->
        <div v-if="store.userType === 'reader'" class="mt-2">
          <span class="badge rounded-pill px-3 py-1" :class="rankBadgeClass">
            <i class="fas fa-medal mr-1"></i> Hạng {{ rankDisplayName }}
          </span>
          <div class="mt-1 text-muted" style="font-size: 0.72rem;">
            {{ store.user.DG_diemUyTin || 0 }} điểm uy tín
          </div>
        </div>
      </div>

      <!-- Navigation links -->
      <ul class="nav flex-column sidebar-nav px-2">
        <!-- Guest links -->
        <template v-if="!store.user">
          <li class="nav-item">
            <router-link to="/" class="nav-link" exact-active-class="active">
              <i class="fas fa-home mr-3"></i> Trang chủ kho sách
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/login" class="nav-link" active-class="active">
              <i class="fas fa-sign-in-alt mr-3"></i> Đăng nhập
            </router-link>
          </li>
        </template>

        <!-- Reader Navigation -->
        <template v-if="store.userType === 'reader'">
          <li class="nav-item">
            <router-link to="/" class="nav-link" exact-active-class="active">
              <i class="fas fa-book-open mr-3"></i> Trang chủ kho sách
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/muonsach" class="nav-link" active-class="active">
              <i class="fas fa-history mr-3"></i> Lịch sử mượn sách
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/profile" class="nav-link" active-class="active">
              <i class="fas fa-user-circle mr-3"></i> Thông tin cá nhân
            </router-link>
          </li>
        </template>

        <!-- Staff / Admin Navigation -->
        <template v-if="store.userType === 'staff'">
          <li class="nav-item">
            <router-link to="/admin/dashboard" class="nav-link" active-class="active">
              <i class="fas fa-chart-pie mr-3"></i> Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/" class="nav-link" exact-active-class="active">
              <i class="fas fa-book-open mr-3"></i> Trang chủ kho sách
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/muonsach" class="nav-link" active-class="active">
              <i class="fas fa-clipboard-list mr-3"></i> Quản lý Phiếu mượn
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/sach" class="nav-link" active-class="active">
              <i class="fas fa-book mr-3"></i> Quản lý Kho sách
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/nxb" class="nav-link" active-class="active">
              <i class="fas fa-building mr-3"></i> Quản lý Nhà xuất bản
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/docgia" class="nav-link" active-class="active">
              <i class="fas fa-users mr-3"></i> Quản lý Độc giả
            </router-link>
          </li>
          <li class="nav-item" v-if="store.user?.nv_chucVu === 'Quản lý'">
            <router-link to="/admin/nhanvien" class="nav-link" active-class="active">
              <i class="fas fa-user-shield mr-3"></i> Quản lý Nhân viên
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/profile" class="nav-link" active-class="active">
              <i class="fas fa-user-circle mr-3"></i> Thông tin cá nhân
            </router-link>
          </li>
        </template>
      </ul>
    </div>

    <!-- Sidebar footer / bottom section -->
    <div class="sidebar-footer p-3 text-center text-muted border-top-glow">
      <small>&copy; Thư Viện VeenY</small>
    </div>
  </aside>
</template>

<script>
import { computed } from "vue";
import { store } from "../store";

export default {
  name: "AppSidebar",
  setup() {
    const rankDisplayName = computed(() => {
      const rank = store.user?.DG_hangThanhVien || "Dong";
      switch (rank) {
        case "Vang": return "Vàng";
        case "Bac": return "Bạc";
        default: return "Đồng";
      }
    });

    const rankBadgeClass = computed(() => {
      const rank = store.user?.DG_hangThanhVien || "Dong";
      switch (rank) {
        case "Vang": return "badge-rank-vang";
        case "Bac": return "badge-rank-bac";
        default: return "badge-rank-dong";
      }
    });

    return {
      store,
      rankDisplayName,
      rankBadgeClass
    };
  }
};
</script>

<style scoped>
.app-sidebar {
  width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.03);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 90;
  padding-top: 85px; /* Offset for TopHeader height plus spacing */
  overflow-y: auto;
}

.sidebar-profile-card {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin: 0 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.profile-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
}

.text-primary-custom {
  color: var(--primary-blue);
}

.text-accent-custom {
  color: var(--accent-pink);
}

.badge-warning-custom {
  background: var(--bg-panel);
  color: var(--accent-pink-hover);
  border: 1px solid #ffb3c1;
  font-size: 0.75rem;
}

.badge-info-custom {
  background: #e3f2fd;
  color: #0288d1;
  border: 1px solid #b3e5fc;
  font-size: 0.75rem;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-link {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.92rem;
  padding: 11px 18px;
  border-radius: 10px;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
}

.nav-link:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.5);
  transform: translateX(4px);
}

.nav-link.active {
  color: var(--text-main);
  background: var(--bg-card);
  border-left: 4px solid var(--primary-blue);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.disabled-link-custom {
  cursor: not-allowed;
  opacity: 0.6;
}

.border-top-glow {
  border-top: 1px solid var(--border-color);
}
</style>
