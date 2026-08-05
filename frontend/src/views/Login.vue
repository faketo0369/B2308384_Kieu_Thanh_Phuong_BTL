<template>
  <div class="container py-5 d-flex justify-content-center align-items-center min-vh-80">
    <div class="card glass-panel p-5 login-card animate-fade-in col-md-6 col-lg-5">
      <div class="text-center mb-4">
        <i class="fas fa-book-reader fa-3x text-primary mb-3"></i>
        <h3 class="font-weight-bold text-white">Đăng Nhập</h3>
        <p class="text-secondary text-sm">Chào mừng quay lại! Đăng nhập dành cho Độc giả & Thủ thư.</p>
      </div>

      <div v-if="error" class="alert alert-danger-custom text-sm mb-3">
        <i class="fas fa-exclamation-circle mr-2"></i> {{ error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username"><i class="fas fa-user-circle mr-1"></i> Mã số / Số điện thoại</label>
          <input
            id="username"
            type="text"
            class="form-control"
            v-model="credentials.username"
            placeholder="Mã độc giả, Mã NV hoặc số điện thoại..."
            required
          />
        </div>

        <div class="form-group mt-3">
          <label for="Password"><i class="fas fa-lock mr-1"></i> Mật khẩu</label>
          <input
            id="Password"
            type="password"
            class="form-control"
            v-model="credentials.Password"
            placeholder="Nhập mật khẩu..."
            required
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block mt-4 rounded-pill py-2 font-weight-bold" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
          Đăng Nhập
        </button>
      </form>

      <div class="text-center mt-4">
        <span class="text-secondary">Chưa có tài khoản độc giả? </span>
        <router-link to="/register" class="register-link font-weight-bold">Đăng ký ngay</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AuthService from "../services/auth.service";
import { store } from "../store";

export default {
  name: "Login",
  setup() {
    const router = useRouter();
    const credentials = ref({ username: "", Password: "" });
    const error = ref(null);
    const loading = ref(false);

    const handleLogin = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await AuthService.login(credentials.value);
        store.login(response.user, response.userType);
        
        if (response.userType === "staff") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      } catch (err) {
        error.value = err.response?.data?.message || "Tài khoản hoặc mật khẩu không chính xác.";
      } finally {
        loading.value = false;
      }
    };

    return {
      credentials,
      error,
      loading,
      handleLogin
    };
  }
};
</script>

<style scoped>
.min-vh-80 {
  min-height: 80vh;
}
.login-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.alert-danger-custom {
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
}
.register-link {
  color: var(--accent-color);
  transition: all 0.25s ease;
}
.register-link:hover {
  color: var(--accent-hover);
  text-decoration: none;
}
</style>
