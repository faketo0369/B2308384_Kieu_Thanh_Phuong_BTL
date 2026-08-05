<template>
  <div class="container py-5 animate-fade-in">
    <div v-if="alertMsg" class="alert alert-custom mb-4" :class="alertClass">
      <i class="fas mr-2" :class="alertIcon"></i> {{ alertMsg }}
    </div>

    <NXBList 
      :publishers="publishers"
      @save="savePublisher"
      @delete="deletePublisher"
    />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import NXBList from "../components/NXBList.vue";
import NhaXuatBanService from "../services/nhaxuatban.service";
import { store } from "../store";

export default {
  name: "TrangNXB",
  components: {
    NXBList
  },
  setup() {
    const router = useRouter();
    const publishers = ref([]);

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

    const retrievePublishers = async () => {
      try {
        publishers.value = await NhaXuatBanService.getAll();
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhà xuất bản:", error);
      }
    };

    onMounted(() => {
      if (store.userType !== "staff") {
        router.push("/admin/login");
        return;
      }
      retrievePublishers();
    });

    const savePublisher = async (data) => {
      try {
        if (data.nxb_ma || data._id) {
          // Update
          await NhaXuatBanService.update(data.nxb_ma || data._id, data);
          showAlert("Đã cập nhật thông tin nhà xuất bản thành công!");
        } else {
          // Create
          await NhaXuatBanService.create(data);
          showAlert("Đã tạo mới nhà xuất bản thành công!");
        }
        await retrievePublishers();
      } catch (error) {
        showAlert("Đã xảy ra lỗi khi lưu thông tin.", "error");
      }
    };

    const deletePublisher = async (id) => {
      if (confirm("Bạn có chắc chắn muốn xóa nhà xuất bản này? Mọi quyển sách liên kết với nhà xuất bản này có thể bị ảnh hưởng.")) {
        try {
          await NhaXuatBanService.delete(id);
          showAlert("Đã xóa nhà xuất bản thành công.");
          await retrievePublishers();
        } catch (error) {
          showAlert("Không thể xóa nhà xuất bản này.", "error");
        }
      }
    };

    return {
      publishers,
      alertMsg,
      alertClass,
      alertIcon,
      savePublisher,
      deletePublisher
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
