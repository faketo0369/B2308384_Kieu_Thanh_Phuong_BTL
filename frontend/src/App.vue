<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { onMounted } from "vue";
import { store } from "./store";

export default {
  name: "App",
  setup() {
    onMounted(() => {
      // Đồng bộ thông tin user từ server mỗi khi app khởi tạo
      store.refreshUser();
    });
  }
};
</script>

<style>
/* Global transitions and layout adjustments */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
