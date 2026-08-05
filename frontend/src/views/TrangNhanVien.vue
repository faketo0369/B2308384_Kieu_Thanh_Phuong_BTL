<template>
  <div class="container py-5 animate-fade-in">
    <div v-if="!isAuthorized" class="text-center py-5">
      <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
      <h3 class="text-white font-weight-bold">Không Có Quyền Truy Cập</h3>
      <p class="text-secondary">Trang này chỉ dành riêng cho Ban Quản Lý thư viện.</p>
      <router-link to="/" class="btn btn-primary rounded-pill px-4 mt-3">Quay lại Trang chủ</router-link>
    </div>

    <div v-else>
      <div v-if="alertMsg" class="alert alert-custom mb-4" :class="alertClass">
        <i class="fas mr-2" :class="alertIcon"></i> {{ alertMsg }}
      </div>

      <NhanVienList 
        :staffList="staffList"
        @save="saveStaff"
        @delete="deleteStaff"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import NhanVienList from "../components/NhanVienList.vue";
import NhanVienService from "../services/nhanvien.service";
import { store } from "../store";

export default {
  name: "TrangNhanVien",
  components: {
    NhanVienList
  },
  setup() {
    const router = useRouter();
    const staffList = ref([]);

    // Alert states
    const alertMsg = ref(null);
    const alertClass = ref("");
    const alertIcon = ref("");

    const isAuthorized = computed(() => {
      return store.userType === "staff" && store.user?.nv_chucVu === "Quản lý";
    });

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

    const retrieveStaff = async () => {
      try {
        staffList.value = await NhanVienService.getAll();
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhân viên:", error);
      }
    };

    onMounted(() => {
      if (!store.user) {
        router.push("/admin/login");
        return;
      }
      if (isAuthorized.value) {
        retrieveStaff();
      }
    });

    const saveStaff = async (data) => {
      try {
        if (data.nv_ma || data._id) {
          // Update
          await NhanVienService.update(data.nv_ma || data._id, data);
          showAlert("Cập nhật thông tin nhân viên thành công!");
        } else {
          // Create
          await NhanVienService.create(data);
          showAlert("Thêm mới nhân viên thành công!");
        }
        await retrieveStaff();
      } catch (error) {
        showAlert(error.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin nhân viên.", "error");
      }
    };

    const deleteStaff = async (id) => {
      if (confirm("Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?")) {
        try {
          await NhanVienService.delete(id);
          showAlert("Đã xóa nhân viên thành công.");
          await retrieveStaff();
        } catch (error) {
          showAlert("Không thể xóa nhân viên này.", "error");
        }
      }
    };

    return {
      store,
      staffList,
      isAuthorized,
      alertMsg,
      alertClass,
      alertIcon,
      saveStaff,
      deleteStaff
    };
  }
};
</script>

<style scoped>
.alert-custom {
  border-radius: 12px;
  padding: 14px 20px;
}
.alert-success-custom {
  background: rgba(16, 185, 129, 0.12);
  color: #a7f3d0;
  border: 1px solid rgba(16, 185, 129, 0.3);
}
.alert-danger-custom {
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
</style>
