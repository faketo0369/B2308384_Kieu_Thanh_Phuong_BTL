<template>
  <div class="container py-5 text-center d-flex flex-column align-items-center justify-content-center min-vh-85 animate-fade-in">
    <i class="fas fa-map-marked-alt fa-4x text-primary mb-4 animate-bounce"></i>
    <h1 class="display-3 font-weight-bold text-white mb-2">404</h1>
    <h3 class="text-white font-weight-bold mb-3">Không Tìm Thấy Trang</h3>
    <p class="text-secondary mb-4 max-w-500">
      Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển sang địa chỉ khác.
    </p>
    <router-link to="/" class="btn btn-primary rounded-pill px-4 py-2 font-weight-bold">
      Quay Lại Trang Chủ
    </router-link>
  </div>
</template>

<script>
export default {
  name: "NotFound"
};
</script>

<style scoped>
.min-vh-85 {
  min-height: 85vh;
}
.max-w-500 {
  max-width: 500px;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-bounce {
  animation: bounce 2s infinite ease-in-out;
}
</style>
