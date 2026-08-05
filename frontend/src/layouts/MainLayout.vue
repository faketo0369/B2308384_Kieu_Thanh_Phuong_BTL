<template>
  <div class="dashboard-wrapper">
    <!-- Left Sidebar -->
    <AppSidebar />

    <!-- Right Content Area -->
    <div class="main-layout-content">
      <!-- Sticky Top Header -->
      <TopHeader class="sticky-top" />

      <!-- Content Body -->
      <main class="content-body flex-fill py-3 px-2">
        <router-view />
      </main>

      <!-- Footer -->
      <footer class="py-4 text-center border-top-glow mt-auto">
        <div class="container text-secondary text-sm">
          &copy; 2026 Hệ Thống Thư Viện VeenY
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import TopHeader from "../components/TopHeader.vue";
import AppSidebar from "../components/AppSidebar.vue";

export default {
  name: "MainLayout",
  components: {
    TopHeader,
    AppSidebar
  }
};
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-layout-content {
  margin-left: 260px; /* Width of the sidebar */
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0; /* Prevents text and table layout overflows */
}

.content-body {
  display: flex;
  flex-direction: column;
}

.border-top-glow {
  border-top: 1px solid var(--border-color);
}
</style>
