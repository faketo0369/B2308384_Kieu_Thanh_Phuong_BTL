<template>
  <div class="container py-5 animate-fade-in">
    <div v-if="alertMsg" class="alert alert-custom mb-4" :class="alertClass">
      <i class="fas mr-2" :class="alertIcon"></i> {{ alertMsg }}
    </div>

    <DocGiaList 
      :readers="readers"
      @save="saveReader"
      @delete="deleteReader"
    />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import DocGiaList from "../components/DocGiaList.vue";
import DocGiaService from "../services/docgia.service";
import { store } from "../store";

export default {
  name: "TrangDocGia",
  components: {
    DocGiaList
  },
  setup() {
    const router = useRouter();
    const readers = ref([]);

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

    const retrieveReaders = async () => {
      try {
        readers.value = await DocGiaService.getAll();
      } catch (error) {
        console.error("Lỗi khi tải danh sách độc giả:", error);
      }
    };

    onMounted(() => {
      if (store.userType !== "staff") {
        router.push("/admin/login");
        return;
      }
      retrieveReaders();
    });

    const saveReader = async (data) => {
      try {
        if (data.DG_id || data._id) {
          // Update
          await DocGiaService.update(data.DG_id || data._id, data);
          showAlert("Cập nhật thông tin độc giả thành công!");
        } else {
          // Create / Register
          await DocGiaService.register(data);
          showAlert("Thêm mới độc giả thành công!");
        }
        await retrieveReaders();
      } catch (error) {
        showAlert(error.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin độc giả.", "error");
      }
    };

    const deleteReader = async (id) => {
      if (confirm("Bạn có chắc chắn muốn xóa tài khoản độc giả này? Mọi lịch sử mượn sách liên quan sẽ bị ảnh hưởng.")) {
        try {
          await DocGiaService.delete(id);
          showAlert("Đã xóa tài khoản độc giả thành công.");
          await retrieveReaders();
        } catch (error) {
          showAlert("Không thể xóa độc giả này.", "error");
        }
      }
    };

    return {
      readers,
      alertMsg,
      alertClass,
      alertIcon,
      saveReader,
      deleteReader
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
