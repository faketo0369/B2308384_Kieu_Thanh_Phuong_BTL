<template>
  <div class="glass-panel p-4 animate-fade-in">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="m-0 font-weight-bold text-white"><i class="fas fa-building mr-2"></i> Danh sách Nhà Xuất Bản</h4>
      <button @click="openAddModal" class="btn btn-glass rounded-pill btn-sm px-3">
        <i class="fas fa-plus mr-1"></i> Thêm NXB mới
      </button>
    </div>

    <!-- Add/Edit form inline overlay/card if active -->
    <div v-if="showForm" class="p-3 mb-4 rounded-lg bg-dark-glow border-glow">
      <h5 class="text-white mb-3">{{ editMode ? 'Cập nhật' : 'Thêm' }} Nhà Xuất Bản</h5>
      <form @submit.prevent="submitForm">
        <div class="row">
          <div class="col-md-5 form-group">
            <label>Tên NXB</label>
            <input type="text" class="form-control" v-model="formLocal.nxb_ten" required placeholder="Nhập tên nhà xuất bản..." />
          </div>
          <div class="col-md-5 form-group">
            <label>Địa chỉ</label>
            <input type="text" class="form-control" v-model="formLocal.nxb_diaChi" required placeholder="Nhập địa chỉ..." />
          </div>
          <div class="col-md-2 d-flex align-items-end form-group">
            <button type="submit" class="btn btn-primary btn-block rounded-pill">
              Lưu
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
            <th>Mã NXB</th>
            <th>Tên Nhà Xuất Bản</th>
            <th>Địa Chỉ</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="nxb in publishers" :key="nxb.nxb_ma || nxb._id">
            <td><span class="badge badge-info-custom">{{ nxb.nxb_ma || 'N/A' }}</span></td>
            <td class="font-weight-bold text-white">{{ nxb.nxb_ten }}</td>
            <td>{{ nxb.nxb_diaChi }}</td>
            <td class="text-right">
              <button @click="openEditModal(nxb)" class="btn btn-sm btn-outline-info mr-2 rounded-circle action-btn" title="Sửa">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="$emit('delete', nxb.nxb_ma || nxb._id)" class="btn btn-sm btn-outline-danger rounded-circle action-btn" title="Xóa">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
          <tr v-if="publishers.length === 0">
            <td colspan="4" class="text-center text-secondary py-4">
              <i class="fas fa-folder-open fa-2x mb-2 d-block"></i>
              Không tìm thấy nhà xuất bản nào.
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
  name: "NXBList",
  props: {
    publishers: {
      type: Array,
      required: true
    }
  },
  emits: ["save", "delete"],
  setup(props, { emit }) {
    const showForm = ref(false);
    const editMode = ref(false);
    const formLocal = ref({ nxb_ma: "", nxb_ten: "", nxb_diaChi: "" });

    const openAddModal = () => {
      formLocal.value = { nxb_ma: "", nxb_ten: "", nxb_diaChi: "" };
      editMode.value = false;
      showForm.value = true;
    };

    const openEditModal = (pub) => {
      formLocal.value = { ...pub };
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
