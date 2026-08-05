<template>
  <div class="container py-5 animate-fade-in">
    <div v-if="alertMsg" class="alert alert-custom mb-4" :class="alertClass">
      <i class="fas mr-2" :class="alertIcon"></i> {{ alertMsg }}
    </div>

    <!-- If not editing/adding, show list -->
    <div v-if="!activeForm">
      <SachList 
        :books="books"
        :publishers="publishers"
        @add="addBookMode"
        @edit="editBookMode"
        @delete="deleteBook"
      />
    </div>

    <!-- If adding/editing, show form inside glass panel -->
    <div v-else class="glass-panel p-5 animate-fade-in col-lg-8 mx-auto">
      <h3 class="font-weight-bold text-white mb-4">
        <i class="fas" :class="editingBookId ? 'fa-edit text-info' : 'fa-plus text-success'"></i>
        {{ editingBookId ? 'Cập Nhật Thông Tin Sách' : 'Thêm Sách Mới Vào Kho' }}
      </h3>
      <SachForm 
        :key="formKey"
        :book="activeBook"
        @submit="saveBook"
        @cancel="cancelForm"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import SachList from "../components/SachList.vue";
import SachForm from "../components/SachForm.vue";
import SachService from "../services/sach.service";
import NhaXuatBanService from "../services/nhaxuatban.service";
import { store } from "../store";

export default {
  name: "TrangSach",
  components: {
    SachList,
    SachForm
  },
  setup() {
    const router = useRouter();
    const books = ref([]);
    const publishers = ref([]);

    // Form states
    const activeForm = ref(false);
    const activeBook = ref(null);
    const editingBookId = ref(null);
    const formKey = ref(0); // For resetting component state

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

    const retrieveBooks = async () => {
      try {
        books.value = await SachService.getAll();
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sách:", error);
      }
    };

    const retrievePublishers = async () => {
      try {
        publishers.value = await NhaXuatBanService.getAll();
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nhà xuất bản:", error);
      }
    };

    onMounted(() => {
      if (store.userType !== "staff") {
        router.push("/admin/login");
        return;
      }
      retrieveBooks();
      retrievePublishers();
    });

    const addBookMode = () => {
      activeBook.value = {
        S_ten: "",
        S_tacGia: "",
        S_donGia: 0,
        S_soQuyen: 0,
        S_namXB: new Date().getFullYear(),
        S_nxb: "",
        S_tomTat: "",
        S_viTri: "",
        S_theLoai: "",
        S_hinhAnh: ""
      };
      editingBookId.value = null;
      activeForm.value = true;
      formKey.value++;
    };

    const editBookMode = (book) => {
      activeBook.value = { ...book };
      editingBookId.value = book.S_ma || book._id;
      activeForm.value = true;
      formKey.value++;
    };

    const cancelForm = () => {
      activeForm.value = false;
      activeBook.value = null;
      editingBookId.value = null;
    };

    const saveBook = async (data) => {
      try {
        if (editingBookId.value) {
          await SachService.update(editingBookId.value, data);
          showAlert("Cập nhật thông tin sách thành công!");
        } else {
          await SachService.create(data);
          showAlert("Thêm sách mới vào kho thành công!");
        }
        activeForm.value = false;
        await retrieveBooks();
      } catch (error) {
        showAlert("Đã xảy ra lỗi khi lưu thông tin sách.", "error");
      }
    };

    const deleteBook = async (id) => {
      if (confirm("Bạn có chắc chắn muốn xóa quyển sách này khỏi hệ thống?")) {
        try {
          await SachService.delete(id);
          showAlert("Quyển sách đã được xóa thành công.");
          await retrieveBooks();
        } catch (error) {
          showAlert("Không thể xóa sách này. Có thể sách đang được liên kết với phiếu mượn.", "error");
        }
      }
    };

    return {
      books,
      publishers,
      activeForm,
      activeBook,
      editingBookId,
      formKey,
      alertMsg,
      alertClass,
      alertIcon,
      addBookMode,
      editBookMode,
      cancelForm,
      saveBook,
      deleteBook
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
