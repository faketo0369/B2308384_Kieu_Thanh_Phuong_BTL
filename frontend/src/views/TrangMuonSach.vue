<template>
  <div class="container py-5 animate-fade-in">
    <div class="row">
      <div class="col-12 mb-4">
        <h2 class="text-white font-weight-bold">
          <i class="fas fa-clipboard-list mr-2 text-primary"></i>
          {{ store.userType === 'staff' ? 'Hệ Thống Quản Lý Mượn Sách' : 'Lịch Sử Mượn Sách' }}
        </h2>
        <p class="text-secondary">
          {{ store.userType === 'staff' 
              ? 'Duyệt các yêu cầu mượn sách trực tuyến và quản lý trạng thái mượn trả tại quầy.' 
              : 'Theo dõi tiến trình phê duyệt và thời hạn trả sách của bạn.' 
          }}
        </p>
      </div>

      <div class="col-12">
        <div v-if="alertMsg" class="alert alert-custom mb-4" :class="alertClass">
          <i class="fas mr-2" :class="alertIcon"></i> {{ alertMsg }}
        </div>

        <MuonSachList 
          :records="records"
          :books="books"
          :readers="readers"
          :isAdmin="store.userType === 'staff'"
          @approve="approveRecord"
          @reject="rejectRecord"
          @return="returnRecord"
          @delete="deleteRecord"
          @filter-status="fetchFilteredRecords"
          @refresh="refreshData"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import MuonSachList from "../components/MuonSachList.vue";
import MuonSachService from "../services/muonsach.service";
import SachService from "../services/sach.service";
import DocGiaService from "../services/docgia.service";
import { store } from "../store";

export default {
  name: "TrangMuonSach",
  components: {
    MuonSachList
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const records = ref([]);
    const books = ref([]);
    const readers = ref([]);
    
    // Alert messaging
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

    const loadDependencies = async () => {
      try {
        const booksPromise = SachService.getAll();
        const readersPromise = store.userType === "staff"
          ? DocGiaService.getAll()
          : Promise.resolve(store.user ? [store.user] : []);

        const [booksData, readersData] = await Promise.all([booksPromise, readersPromise]);
        books.value = booksData;
        readers.value = readersData;
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu phụ trợ:", err);
      }
    };

    const fetchRecords = async (status = "") => {
      if (!store.user) {
        router.push("/login");
        return;
      }

      try {
        let params = {};
        if (status) {
          params.status = status;
        }

        // If reader, filter by their custom reader code
        if (store.userType === "reader") {
          params.readerId = store.user.DG_id;
        }

        // Tải lại thông tin phụ trợ (sách, độc giả) để đảm bảo đồng bộ tên mới nhất
        await loadDependencies();

        records.value = await MuonSachService.getAll(params);
      } catch (err) {
        console.error("Lỗi khi tải hồ sơ mượn sách:", err);
      }
    };

    onMounted(async () => {
      await fetchRecords();
    });

    // Watch the route path to automatically reload when switching views (e.g. from /muonsach to /admin/muonsach)
    watch(() => route.path, async () => {
      await fetchRecords();
    });

    const refreshData = async () => {
      showAlert("Đang đồng bộ và làm mới dữ liệu...");
      await fetchRecords();
    };

    const fetchFilteredRecords = async (status) => {
      await fetchRecords(status);
    };

    const approveRecord = async (id) => {
      try {
        // Approve request -> set status to "Đang mượn"
        await MuonSachService.update(id, { tdms_trangThai: "Đang mượn" });
        showAlert("Duyệt phiếu mượn thành công! Số lượng sách khả dụng đã tự động trừ 1.");
        await fetchRecords();
        await loadDependencies(); // Reload books to refresh stock counter
      } catch (err) {
        showAlert(err.response?.data?.message || "Lỗi khi duyệt mượn.", "error");
      }
    };

    const rejectRecord = async (id) => {
      try {
        await MuonSachService.update(id, { tdms_trangThai: "Từ chối" });
        showAlert("Đã từ chối phiếu yêu cầu mượn sách.");
        await fetchRecords();
      } catch (err) {
        showAlert(err.response?.data?.message || "Lỗi khi cập nhật trạng thái.", "error");
      }
    };

    const returnRecord = async (id, tinhTrang) => {
      try {
        // Return book -> set status to "Đã trả" and set actual return date & book condition
        await MuonSachService.update(id, { 
          tdms_trangThai: "Đã trả", 
          tdms_tinhTrangSach: tinhTrang, 
          tdms_ngayTra: new Date() 
        });
        
        let customMsg = "Xác nhận trả sách thành công! Quyển sách đã được hoàn trả về kho.";
        if (tinhTrang === "Rách / Hư hỏng") {
          customMsg = "Xác nhận trả sách thành công! Trạng thái: Rách / Hư hỏng (Yêu cầu nộp phạt và giữ nguyên tồn kho).";
        } else if (tinhTrang === "Báo mất sách") {
          customMsg = "Xác nhận trả sách thành công! Trạng thái: Báo mất sách (Quyển sách đã bị trừ khỏi tồn kho).";
        }

        showAlert(customMsg);
        await fetchRecords();
        await loadDependencies(); // Reload books to refresh stock counter
      } catch (err) {
        showAlert(err.response?.data?.message || "Lỗi khi trả sách.", "error");
      }
    };

    const deleteRecord = async (id) => {
      if (confirm("Bạn có chắc chắn muốn xóa hồ sơ mượn sách này không?")) {
        try {
          await MuonSachService.delete(id);
          showAlert("Đã xóa hồ sơ mượn sách.");
          await fetchRecords();
          await loadDependencies();
        } catch (err) {
          showAlert("Không thể xóa hồ sơ.", "error");
        }
      }
    };

    return {
      store,
      records,
      books,
      readers,
      alertMsg,
      alertClass,
      alertIcon,
      fetchFilteredRecords,
      approveRecord,
      rejectRecord,
      returnRecord,
      deleteRecord,
      refreshData
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
