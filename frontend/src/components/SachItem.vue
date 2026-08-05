<template>
  <div class="sach-item-horizontal glass-panel mb-2 py-2 px-3 d-flex align-items-center justify-content-between" @click="$emit('select', book.S_ma)">
    <div class="d-flex align-items-center">
      <div class="book-cover-thumbnail mr-3">
        <img :src="book.S_hinhAnh" @error="handleImageError" alt="Book cover" class="rounded shadow-sm" style="width: 45px; height: 60px; object-fit: cover; border: 1px solid var(--border-color);" />
      </div>
      <div>
        <h5 class="book-title font-weight-bold m-0 text-main-custom" style="font-size: 0.95rem;">{{ book.S_ten }}</h5>
        <span class="book-publisher text-muted-custom" style="font-size: 0.78rem;">Nhà xuất bản: {{ publisherName }}</span>
      </div>
    </div>
    <div class="action-hint">
      <span class="text-primary-custom text-sm mr-2 d-none d-sm-inline">Xem chi tiết</span>
      <i class="fas fa-chevron-right text-muted-custom"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: "SachItem",
  props: {
    book: {
      type: Object,
      required: true
    },
    publisherName: {
      type: String,
      default: "Chưa xác định"
    }
  },
  emits: ["select"],
  setup() {
    const handleImageError = (e) => {
      e.target.src = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200";
    };
    return {
      handleImageError
    };
  }
};
</script>

<style scoped>
.sach-item-horizontal {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.sach-item-horizontal:hover {
  border-color: var(--primary-blue);
  background: var(--bg-card);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.15);
}

.book-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
}

.text-primary-custom {
  color: var(--primary-blue);
}

.text-main-custom {
  color: var(--text-main);
}

.text-muted-custom {
  color: var(--text-muted);
}

.book-title {
  font-size: 1.05rem;
}

.book-publisher {
  font-size: 0.82rem;
}

.action-hint {
  display: flex;
  align-items: center;
}
</style>
