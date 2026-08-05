<template>
  <div class="glass-panel p-4 animate-fade-in">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="m-0 font-weight-bold text-white"><i class="fas fa-user-shield mr-2"></i> Danh sách Nhân Viên</h4>
      <button @click="openAddModal" class="btn btn-glass rounded-pill btn-sm px-3">
        <i class="fas fa-plus mr-1"></i> Thêm nhân viên mới
      </button>
    </div>

    <!-- Inline Add/Edit Form -->
    <div v-if="showForm" class="p-4 mb-4 rounded-lg bg-dark-glow border-glow">
      <h5 class="text-white mb-3">{{ editMode ? 'Cập nhật' : 'Thêm' }} Nhân Viên</h5>
      <form @submit.prevent="submitForm">
        <div class="row">
          <div class="col-md-3 form-group">
            <label>Họ tên nhân viên</label>
            <input type="text" class="form-control" v-model="formLocal.nv_hoTen" required placeholder="Họ tên nhân viên..." />
          </div>
          <div class="col-md-3 form-group">
            <label>Số điện thoại</label>
            <input type="text" class="form-control" v-model="formLocal.nv_sdt" required placeholder="Số điện thoại..." />
          </div>
          <div class="col-md-3 form-group">
            <label>Chức vụ</label>
            <select class="form-control form-select" v-model="formLocal.nv_chucVu" required>
              <option value="Thủ thư">Thủ thư</option>
              <option value="Quản lý">Quản lý</option>
            </select>
          </div>
          <div class="col-md-3 form-group" v-if="!editMode">
            <label>Mật khẩu</label>
            <input type="password" class="form-control" v-model="formLocal.nv_password" required placeholder="Mật khẩu..." />
          </div>
        </div>
        <div class="row mt-2">
          <div class="col-md-9 form-group">
            <label>Địa chỉ</label>
            <input type="text" class="form-control" v-model="formLocal.nv_diaChi" required placeholder="Địa chỉ..." />
          </div>
          <div class="col-md-3 d-flex align-items-end form-group">
            <button type="submit" class="btn btn-primary btn-block rounded-pill">
              Lưu nhân viên
            </button>
            <button type="button" @click="closeForm" class="btn btn-outline-light ml-2 rounded-circle">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </form>
    </div>

    <div class="table-responsive">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Mã Số NV</th>
            <th>Họ & Tên</th>
            <th>Điện Thoại</th>
            <th>Chức Vụ</th>
            <th>Địa Chỉ</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="staff in staffList" :key="staff.nv_ma || staff._id">
            <td class="font-weight-bold text-warning">{{ staff.nv_ma }}</td>
            <td class="text-white">{{ staff.nv_hoTen }}</td>
            <td>{{ staff.nv_sdt }}</td>
            <td>
              <span class="badge" :class="staff.nv_chucVu === 'Quản lý' ? 'badge-manager' : 'badge-staff'">
                {{ staff.nv_chucVu }}
              </span>
            </td>
            <td>{{ staff.nv_diaChi }}</td>
            <td class="text-right">
              <button @click="openEditModal(staff)" class="btn btn-sm btn-outline-info mr-2 rounded-circle action-btn" title="Sửa">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="$emit('delete', staff.nv_ma || staff._id)" class="btn btn-sm btn-outline-danger rounded-circle action-btn" title="Xóa" :disabled="staff.nv_ma === 'NV0001'">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
          <tr v-if="staffList.length === 0">
            <td colspan="6" class="text-center text-secondary py-4">
              <i class="fas fa-folder-open fa-2x mb-2 d-block"></i>
              Không tìm thấy nhân viên nào.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "NhanVienList",
  props: {
    staffList: {
      type: Array,
      required: true
    }
  },
  emits: ["save", "delete"],
  setup(props, { emit }) {
    const showForm = ref(false);
    const editMode = ref(false);
    const formLocal = ref({
      nv_ma: "",
      nv_hoTen: "",
      nv_sdt: "",
      nv_chucVu: "Thủ thư",
      nv_password: "",
      nv_diaChi: ""
    });

    const openAddModal = () => {
      formLocal.value = {
        nv_ma: "",
        nv_hoTen: "",
        nv_sdt: "",
        nv_chucVu: "Thủ thư",
        nv_password: "",
        nv_diaChi: ""
      };
      editMode.value = false;
      showForm.value = true;
    };

    const openEditModal = (staff) => {
      formLocal.value = { ...staff };
      delete formLocal.value.nv_password;
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

    return {
      showForm,
      editMode,
      formLocal,
      openAddModal,
      openEditModal,
      closeForm,
      submitForm
    };
  }
};
</script>

<style scoped>
.bg-dark-glow {
  background: rgba(255, 255, 255, 0.02);
}
.border-glow {
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.badge-manager {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.badge-staff {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
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
</style>
