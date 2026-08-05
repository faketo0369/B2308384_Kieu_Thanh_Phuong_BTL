<template>
  <div class="input-group search-container">
    <div class="input-group-prepend">
      <span class="input-group-text search-icon">
        <i class="fas fa-search"></i>
      </span>
    </div>
    <input
      type="text"
      class="form-control search-input"
      placeholder="Nhập tên sách cần tìm kiếm..."
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @keyup.enter="$emit('submit')"
    />
    <div class="input-group-append">
      <button class="btn btn-primary search-btn" type="button" @click="$emit('submit')">
        Tìm kiếm
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "InputSearch",
  props: {
    modelValue: {
      type: String,
      default: ""
    }
  },
  emits: ["update:modelValue", "submit"]
};
</script>

<style scoped>
.search-container {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.search-icon {
  background-color: rgba(255, 255, 255, 0.03);
  border: none;
  color: var(--text-secondary);
  padding-left: 18px;
}

.search-input {
  border: none;
  background-color: rgba(255, 255, 255, 0.03);
  padding: 14px 10px;
  font-size: 1rem;
}

.search-input:focus {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: none;
}

.search-btn {
  background-color: var(--accent-color);
  border: none;
  padding: 0 24px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.search-btn:hover {
  background-color: var(--accent-hover);
}
</style>
