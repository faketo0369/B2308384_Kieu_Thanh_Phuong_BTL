<template>
  <div class="glass-panel p-4 animate-fade-in">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="m-0 font-weight-bold text-white"><i class="fas fa-book mr-2"></i> Danh sách Sách</h4>
      <button @click="$emit('add')" class="btn btn-glass rounded-pill btn-sm px-3">
        <i class="fas fa-plus mr-1"></i> Thêm sách mới
      </button>
    </div>

    <div class="table-responsive">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Tên Sách</th>
            <th>Tác Giả</th>
            <th>Nhà Xuất Bản</th>
            <th>Đơn Giá</th>
            <th>Số Quyển</th>
            <th>Năm XB</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book.S_ma">
            <td class="font-weight-bold text-white">{{ book.S_ten }}</td>
            <td>{{ book.S_tacGia }}</td>
            <td>{{ getPublisherName(book.S_nxb) }}</td>
            <td>{{ formatCurrency(book.S_donGia) }}</td>
            <td>
              <span class="badge" :class="book.S_soQuyen > 0 ? 'badge-success-custom' : 'badge-danger-custom'">
                {{ book.S_soQuyen }} Quyển
              </span>
            </td>
            <td>{{ book.S_namXB }}</td>
            <td class="text-right">
              <button @click="$emit('edit', book)" class="btn btn-sm btn-outline-info mr-2 rounded-circle action-btn" title="Sửa">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="$emit('delete', book.S_ma || book._id)" class="btn btn-sm btn-outline-danger rounded-circle action-btn" title="Xóa">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
          <tr v-if="books.length === 0">
            <td colspan="7" class="text-center text-secondary py-4">
              <i class="fas fa-folder-open fa-2x mb-2 d-block"></i>
              Không tìm thấy quyển sách nào.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "SachList",
  props: {
    books: {
      type: Array,
      required: true
    },
    publishers: {
      type: Array,
      required: true
    }
  },
  emits: ["add", "edit", "delete"],
  setup(props) {
    const getPublisherName = (nxbId) => {
      const pub = props.publishers.find(p => p.nxb_ma === nxbId || p._id === nxbId);
      return pub ? pub.nxb_ten : "Chưa xác định";
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
      }).format(value);
    };

    return {
      getPublisherName,
      formatCurrency
    };
  }
};
</script>

<style scoped>
.badge-success-custom {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-danger-custom {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
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
