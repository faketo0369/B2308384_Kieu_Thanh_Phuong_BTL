<template>
  <div class="glass-panel p-4 animate-fade-in text-main">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="m-0 font-weight-bold text-main"><i class="fas fa-users mr-2 text-primary-custom"></i> Danh sách Độc Giả</h4>
      <button @click="openAddModal" class="btn btn-glass rounded-pill btn-sm px-3">
        <i class="fas fa-plus mr-1"></i> Thêm độc giả mới
      </button>
    </div>

    <!-- Inline Add/Edit Form -->
    <div v-if="showForm" class="p-4 mb-4 rounded-lg bg-dark-glow border-glow">
      <h5 class="text-main mb-3">{{ editMode ? 'Cập nhật' : 'Thêm' }} Độc Giả</h5>
      <form @submit.prevent="submitForm">
        <div class="row">
          <div class="col-md-3 form-group">
            <label>Họ lót</label>
            <input type="text" class="form-control" v-model="formLocal.DG_hoLot" required placeholder="Họ lót..." />
          </div>
          <div class="col-md-3 form-group">
            <label>Tên</label>
            <input type="text" class="form-control" v-model="formLocal.DG_ten" required placeholder="Tên..." />
          </div>
          <div class="col-md-3 form-group">
            <label>Số điện thoại</label>
            <input type="text" class="form-control" v-model="formLocal.DG_sdt" required placeholder="Số điện thoại..." :disabled="editMode" />
          </div>
          <div class="col-md-3 form-group" v-if="!editMode">
            <label>Mật khẩu</label>
            <input type="password" class="form-control" v-model="formLocal.DG_password" required placeholder="Mật khẩu..." />
          </div>
        </div>
        <div class="row mt-2">
          <div class="col-md-3 form-group">
            <label>Số CCCD</label>
            <input type="text" class="form-control" v-model="formLocal.DG_cccd" required placeholder="Số CCCD..." />
          </div>
          <div class="col-md-3 form-group">
            <label>Ngày sinh</label>
            <input type="date" class="form-control" v-model="formLocal.DG_ngaySinh" required />
          </div>
          <div class="col-md-2 form-group">
            <label>Phái</label>
            <select class="form-control form-select" v-model="formLocal.DG_phai" required>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div class="col-md-4 form-group">
            <label>Địa chỉ</label>
            <input type="text" class="form-control" v-model="formLocal.DG_diaChi" required placeholder="Địa chỉ..." />
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-md-12 d-flex justify-content-end">
            <button type="button" @click="closeForm" class="btn btn-outline-secondary mr-2 rounded-pill px-4">
              Hủy
            </button>
            <button type="submit" class="btn btn-primary rounded-pill px-4">
              Lưu thông tin
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Search bar -->
    <div class="row mb-4">
      <div class="col-md-5">
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text bg-transparent border-right-0 border-glow"><i class="fas fa-search text-muted"></i></span>
          </div>
          <input type="text" class="form-control border-left-0 border-glow" v-model="searchQuery" placeholder="Tìm theo tên, điện thoại, CCCD..." />
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Mã Độc Giả</th>
            <th>CCCD</th>
            <th>Họ & Tên</th>
            <th>Điện Thoại</th>
            <th>Ngày Sinh</th>
            <th>Phái</th>
            <th>Địa Chỉ</th>
            <th>Điểm uy tín</th>
            <th>Hạng</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reader in filteredReaders" :key="reader.DG_id || reader._id">
            <td class="font-weight-bold text-primary-custom">{{ reader.DG_id }}</td>
            <td class="font-weight-bold">{{ reader.DG_cccd || "Chưa cập nhật" }}</td>
            <td>{{ reader.DG_hoLot }} {{ reader.DG_ten }}</td>
            <td>{{ reader.DG_sdt }}</td>
            <td>{{ reader.DG_ngaySinh }}</td>
            <td>
              <span class="badge" :class="reader.DG_phai === 'Nam' ? 'badge-nam' : 'badge-nu'">
                {{ reader.DG_phai }}
              </span>
            </td>
            <td>{{ reader.DG_diaChi }}</td>
            <td class="font-weight-bold text-center">{{ reader.DG_diemUyTin || 0 }}</td>
            <td>
              <span class="badge rounded-pill" :class="getRankClass(reader.DG_hangThanhVien)">
                {{ getRankName(reader.DG_hangThanhVien) }}
              </span>
            </td>
            <td class="text-right">
              <button @click="initiateResetPassword(reader)" class="btn btn-sm btn-outline-warning mr-2 rounded-circle action-btn" title="Cấp lại mật khẩu">
                <i class="fas fa-key"></i>
              </button>
              <button @click="openEditModal(reader)" class="btn btn-sm btn-outline-info mr-2 rounded-circle action-btn" title="Sửa">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="$emit('delete', reader.DG_id || reader._id)" class="btn btn-sm btn-outline-danger rounded-circle action-btn" title="Xóa">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
          <tr v-if="readers.length === 0">
            <td colspan="10" class="text-center text-muted py-4">
              <i class="fas fa-folder-open fa-2x mb-2 d-block"></i>
              Không tìm thấy độc giả nào.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Librarian Reset Password Modal -->
    <teleport to="body">
      <div v-if="resettingReader" class="modal-backdrop-custom">
        <div class="modal-content-custom glass-panel p-4 p-md-5 animate-fade-in col-11 col-sm-10 col-md-5 mx-auto">
          <div class="d-flex justify-content-between align-items-start mb-4">
            <h4 class="font-weight-bold text-main m-0">Cấp Lại Mật Khẩu</h4>
            <button @click="closeResetModal" class="close-btn"><i class="fas fa-times"></i></button>
          </div>
          
          <p class="text-muted text-sm mb-4">
            Độc giả: <span class="font-weight-bold text-main">{{ resettingReader.DG_hoLot }} {{ resettingReader.DG_ten }}</span> <br/>
            Mã số: <span class="font-weight-bold text-main">{{ resettingReader.DG_id }}</span> <br/>
            Số CCCD đối chiếu: <span class="font-weight-bold text-main">{{ resettingReader.DG_cccd || "Chưa cập nhật" }}</span>
          </p>

          <form @submit.prevent="submitResetPassword">
            <div class="form-group mb-3">
              <label class="text-main">Mật khẩu mới</label>
              <input 
                type="password" 
                class="form-control" 
                v-model="newPassword" 
                required 
                placeholder="Nhập mật khẩu mới cho độc giả..." 
                autoFocus 
              />
            </div>

            <div class="mt-4 pt-3 border-top-glow d-flex justify-content-end">
              <button type="button" @click="closeResetModal" class="btn btn-outline-secondary mr-2 rounded-pill px-4">
                Hủy
              </button>
              <button type="submit" class="btn btn-glass rounded-pill px-4">
                <i class="fas fa-key mr-1"></i> Cấp mật khẩu mới
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import { ref, computed } from "vue";

export default {
  name: "DocGiaList",
  props: {
    readers: {
      type: Array,
      required: true
    }
  },
  emits: ["save", "delete"],
  setup(props, { emit }) {
    const searchQuery = ref("");
    const filteredReaders = computed(() => {
      if (!searchQuery.value) return props.readers;
      const query = searchQuery.value.toLowerCase();
      return props.readers.filter(r => 
        ((r.DG_hoLot || "") + " " + (r.DG_ten || "")).toLowerCase().includes(query) ||
        (r.DG_sdt && r.DG_sdt.includes(query)) ||
        (r.DG_cccd && r.DG_cccd.includes(query)) ||
        (r.DG_id && r.DG_id.toLowerCase().includes(query))
      );
    });

    const showForm = ref(false);
    const editMode = ref(false);
    const formLocal = ref({
      DG_id: "",
      DG_hoLot: "",
      DG_ten: "",
      DG_sdt: "",
      DG_password: "",
      DG_ngaySinh: "",
      DG_phai: "Nam",
      DG_diaChi: "",
      DG_cccd: ""
    });

    // Reset password states
    const resettingReader = ref(null);
    const newPassword = ref("");

    const openAddModal = () => {
      formLocal.value = {
        DG_id: "",
        DG_hoLot: "",
        DG_ten: "",
        DG_sdt: "",
        DG_password: "",
        DG_ngaySinh: "",
        DG_phai: "Nam",
        DG_diaChi: "",
        DG_cccd: ""
      };
      editMode.value = false;
      showForm.value = true;
    };

    const openEditModal = (reader) => {
      formLocal.value = { ...reader };
      delete formLocal.value.DG_password;
      editMode.value = true;
      showForm.value = true;
    };

    const closeForm = () => {
      showForm.value = false;
    };

    const submitForm = () => {
      emit("save", formLocal.value);
      closeForm();
    };

    // Reset Password Handlers
    const initiateResetPassword = (reader) => {
      resettingReader.value = reader;
      newPassword.value = "";
    };

    const closeResetModal = () => {
      resettingReader.value = null;
    };

    const submitResetPassword = () => {
      const payload = {
        ...resettingReader.value,
        PasswordMoi: newPassword.value,
        isStaffReset: true
      };
      emit("save", payload);
      closeResetModal();
    };

    const getRankName = (rank) => {
      switch (rank) {
        case "Vang": return "Vàng";
        case "Bac": return "Bạc";
        default: return "Đồng";
      }
    };

    const getRankClass = (rank) => {
      switch (rank) {
        case "Vang": return "badge-rank-vang";
        case "Bac": return "badge-rank-bac";
        default: return "badge-rank-dong";
      }
    };

    return {
      searchQuery,
      filteredReaders,
      showForm,
      editMode,
      formLocal,
      resettingReader,
      newPassword,
      openAddModal,
      openEditModal,
      closeForm,
      submitForm,
      initiateResetPassword,
      closeResetModal,
      submitResetPassword,
      getRankName,
      getRankClass
    };
  }
};
</script>

<style scoped>
.bg-dark-glow {
  background: rgba(255, 255, 255, 0.02);
}
.border-glow {
  border: 1px solid var(--border-color);
}
.badge-nam {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}
.badge-nu {
  background: rgba(236, 72, 153, 0.15);
  color: #ec4899;
  border: 1px solid rgba(236, 72, 153, 0.3);
}
.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.action-btn:hover {
  transform: scale(1.1);
}

/* Modal styles */
.modal-backdrop-custom {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 1050;
  padding: 3rem 15px;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.modal-content-custom {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.25rem;
  transition: all 0.2s;
  cursor: pointer;
}
.close-btn:hover {
  color: var(--text-main);
  transform: rotate(90deg);
}
.border-top-glow {
  border-top: 1px solid var(--border-color);
}
</style>
