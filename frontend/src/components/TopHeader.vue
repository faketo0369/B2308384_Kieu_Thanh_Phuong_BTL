<template>
  <header class="top-header d-flex align-items-center justify-content-between px-4">
    <!-- Left: Logo -->
    <div class="logo-area">
      <router-link to="/" class="navbar-brand d-flex align-items-center m-0">
        <i class="fas fa-book-reader mr-2 text-primary-logo"></i>
        <span class="brand-text">Thư Viện <span class="highlight">VeenY</span></span>
      </router-link>
    </div>

    <!-- Center: Search -->
    <div class="search-area flex-grow-1 mx-4 max-w-500">
      <InputSearch v-model="store.searchQuery" @submit="handleSearch" />
    </div>

    <!-- Right: Rank Button + User/Login Actions -->
    <div class="d-flex align-items-center" style="gap: 10px;">
      <!-- Rank & Benefits Button -->
      <button class="btn-rank-info" @click="showPhucLoi = true">
        👑 <span class="d-none d-md-inline">Hạng & Uy tín</span>
      </button>

      <!-- User Profile / Login -->
      <div class="user-action-area">
        <div v-if="store.user" class="dropdown">
          <button 
            @click.stop="toggleDropdown"
            class="btn user-profile-btn dropdown-toggle d-flex align-items-center" 
            type="button" 
          >
            <div class="avatar-circle mr-2">
              <i class="fas" :class="store.userType === 'staff' ? 'fa-user-cog text-primary-custom' : 'fa-user text-accent-custom'"></i>
            </div>
            <div class="text-left user-info-text d-none d-sm-block mr-1">
              <div class="username-title font-weight-bold">
                {{ store.userType === 'staff' ? store.user.nv_hoTen : `${store.user.DG_hoLot} ${store.user.DG_ten}` }}
              </div>
              <div class="user-role-sub text-muted d-flex align-items-center" style="gap: 6px;">
                {{ store.userType === 'staff' ? store.user.nv_chucVu : 'Độc giả' }}
                <span v-if="store.userType === 'reader'" class="badge rounded-pill px-2 py-0" :class="getRankBadgeClass()" style="font-size: 0.65rem;">
                  <i class="fas fa-medal mr-1" style="font-size: 0.55rem;"></i>{{ getRankName() }}
                </span>
              </div>
            </div>
          </button>
          <div class="dropdown-menu dropdown-menu-right glass-dropdown" :class="{ show: isDropdownOpen }">
            <div class="dropdown-header text-main border-bottom pb-2 mb-2">
              <div class="font-weight-bold">{{ store.userType === 'staff' ? store.user.nv_hoTen : `${store.user.DG_hoLot} ${store.user.DG_ten}` }}</div>
              <small class="text-muted">{{ store.userType === 'staff' ? `Chức vụ: ${store.user.nv_chucVu}` : `Mã Độc giả: ${store.user.DG_id}` }}</small>
            </div>
            <button @click="logout" class="dropdown-item text-danger">
              <i class="fas fa-sign-out-alt mr-2"></i> Đăng xuất
            </button>
          </div>
        </div>
        <router-link v-else to="/login" class="btn btn-glass rounded-pill px-4">
          <i class="fas fa-sign-in-alt mr-1"></i> Đăng nhập
        </router-link>
      </div>
    </div>

    <!-- Phuc Loi Modal -->
    <PhucLoiModal :visible="showPhucLoi" @close="showPhucLoi = false" />
  </header>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { store } from "../store";
import { useRouter } from "vue-router";
import InputSearch from "./InputSearch.vue";
import PhucLoiModal from "./PhucLoiModal.vue";

export default {
  name: "TopHeader",
  components: {
    InputSearch,
    PhucLoiModal
  },
  setup() {
    const router = useRouter();
    const isDropdownOpen = ref(false);
    const showPhucLoi = ref(false);

    const handleSearch = () => {
      if (router.currentRoute.value.path !== "/") {
        router.push("/");
      }
    };

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    const closeDropdown = (e) => {
      if (!e.target.closest(".dropdown")) {
        isDropdownOpen.value = false;
      }
    };

    onMounted(() => {
      window.addEventListener("click", closeDropdown);
    });

    onUnmounted(() => {
      window.removeEventListener("click", closeDropdown);
    });

    const logout = () => {
      store.logout();
      isDropdownOpen.value = false;
      router.push("/login");
    };

    const getRankName = () => {
      const rank = store.user?.DG_hangThanhVien || "Dong";
      switch (rank) {
        case "Vang": return "Vàng";
        case "Bac": return "Bạc";
        default: return "Đồng";
      }
    };

    const getRankBadgeClass = () => {
      const rank = store.user?.DG_hangThanhVien || "Dong";
      switch (rank) {
        case "Vang": return "badge-rank-vang";
        case "Bac": return "badge-rank-bac";
        default: return "badge-rank-dong";
      }
    };

    return {
      store,
      isDropdownOpen,
      showPhucLoi,
      handleSearch,
      toggleDropdown,
      logout,
      getRankName,
      getRankBadgeClass
    };
  }
};
</script>

<style scoped>
.top-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  z-index: 100;
  height: 70px;
}

.text-primary-logo {
  color: var(--primary-blue);
  font-size: 1.5rem;
}

.brand-text {
  font-weight: 700;
  letter-spacing: 0.5px;
  font-size: 1.3rem;
  color: var(--text-main);
}

.highlight {
  color: var(--primary-blue);
}

.max-w-500 {
  max-width: 500px;
}

.user-profile-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 50px;
  padding: 5px 15px 5px 8px;
  transition: all 0.25s ease;
}

.user-profile-btn::after {
  display: none;
}

.user-profile-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  border-color: var(--border-color);
}

.avatar-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  border: 1px solid var(--border-color);
}

.text-primary-custom {
  color: var(--primary-blue);
}

.text-accent-custom {
  color: var(--accent-pink);
}

.username-title {
  font-size: 0.88rem;
  line-height: 1.2;
  color: var(--text-main);
}

.user-role-sub {
  font-size: 0.72rem;
  line-height: 1;
  color: var(--text-muted);
}

.glass-dropdown {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 8px 0;
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
}

.glass-dropdown.show {
  display: block;
}

.dropdown-item {
  color: var(--text-muted);
  font-size: 0.9rem;
  padding: 8px 20px;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
  color: var(--text-main);
}

.dropdown-item.text-danger:hover {
  background: #ffebee;
  color: #c62828;
}

/* ===== RANK BUTTON ===== */
.btn-rank-info {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 20px;
  padding: 6px 14px;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-rank-info:hover {
  background: #dbeafe;
  border-color: #93c5fd;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12);
  transform: translateY(-1px);
}
</style>
