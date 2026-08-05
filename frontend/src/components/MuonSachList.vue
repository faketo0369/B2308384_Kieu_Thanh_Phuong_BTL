<template>
  <div class="glass-panel p-4 animate-fade-in">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="m-0 font-weight-bold text-white"><i class="fas fa-clipboard-list mr-2"></i> Hồ Sơ Mượn Sách</h4>
      <div class="d-flex align-items-center">
        <!-- Refresh Button -->
        <button 
          @click="$emit('refresh')" 
          class="btn btn-sm btn-outline-info rounded-pill mr-2 px-3 d-flex align-items-center"
          title="Làm mới danh sách và đồng bộ dữ liệu độc giả"
          style="border-color: rgba(79, 195, 247, 0.4); color: var(--primary-blue);"
        >
          <i class="fas fa-sync-alt mr-1"></i> Đồng bộ & Làm mới
        </button>
        <!-- Status filter -->
        <select class="form-control form-select form-control-sm border-glow rounded-pill text-white mr-2 filter-select" v-model="filterStatus" @change="filterChanged">
          <option value="">Tất cả trạng thái</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
          <option value="Đang mượn">Đang mượn</option>
          <option value="Đã trả">Đã trả</option>
          <option value="Từ chối">Từ chối</option>
        </select>
      </div>
    </div>

    <!-- Search bar for MaPhieu -->
    <div class="row mb-3 mt-2">
      <div class="col-md-4">
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text bg-transparent border-right-0" style="border-color: var(--border-color);">
              <i class="fas fa-search text-muted"></i>
            </span>
          </div>
          <input 
            type="text" 
            class="form-control border-left-0" 
            style="border-color: var(--border-color);"
            v-model="searchQuery" 
            placeholder="Tìm theo mã phiếu (VD: PM0001)..." 
          />
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Mã Phiếu</th>
            <th>Độc Giả</th>
            <th>Sách</th>
            <th>Ngày Mượn</th>
            <th>Hạn Trả / Ngày Trả</th>
            <th>Trạng Thái</th>
            <th class="text-right" v-if="isAdmin">Thao tác duyệt</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="record._id">
            <td>
              <span class="badge badge-info-custom">{{ record.tdms_ma || 'N/A' }}</span>
            </td>
            <td>
              <div class="font-weight-bold text-white">{{ getReaderName(record.DG_id) }}</div>
              <small class="text-secondary">{{ record.DG_id }}</small>
            </td>
            <td>
              <div class="text-white text-truncate" style="max-width: 250px;" :title="getBookTitle(record.S_ma)">
                {{ getBookTitle(record.S_ma) }}
              </div>
              <small class="text-secondary font-weight-bold d-block mt-1">Mã sách: {{ getBookCode(record.S_ma) }}</small>
            </td>
            <td>{{ formatDate(record.tdms_ngayMuon) }}</td>
            <td>{{ formatDate(record.tdms_ngayTra) }}</td>
            <td>
              <span class="badge-status" :class="getStatusClass(record.tdms_trangThai)">
                <i class="fas mr-1" :class="getStatusIcon(record.tdms_trangThai)"></i>
                {{ record.tdms_trangThai }}
              </span>
              <div v-if="record.tdms_trangThai === 'Đã trả' && record.tdms_tinhTrangSach" class="mt-1">
                <small class="font-weight-bold" :class="getConditionClass(record.tdms_tinhTrangSach)">
                  <i class="fas fa-info-circle mr-1"></i>{{ record.tdms_tinhTrangSach }}
                </small>
              </div>
            </td>
            <td class="text-right" v-if="isAdmin">
              <template v-if="record.tdms_trangThai === 'Chờ duyệt'">
                <button 
                  @click="$emit('approve', record.tdms_ma || record._id)" 
                  class="btn btn-sm btn-glass-success mr-2 rounded-pill px-3"
                  title="Duyệt cho mượn"
                >
                  <i class="fas fa-check mr-1"></i> Duyệt
                </button>
                <button 
                  @click="$emit('reject', record.tdms_ma || record._id)" 
                  class="btn btn-sm btn-glass-danger rounded-pill px-3"
                  title="Từ chối yêu cầu"
                >
                  <i class="fas fa-times mr-1"></i> Từ chối
                </button>
              </template>
              <template v-else-if="record.tdms_trangThai === 'Đang mượn'">
                <button 
                  @click="openReturnModal(record)" 
                  class="btn btn-sm btn-glass mr-2 rounded-pill px-3"
                  title="Xác nhận trả sách"
                >
                  <i class="fas fa-undo mr-1"></i> Trả sách
                </button>
              </template>
              <button 
                @click="$emit('delete', record.tdms_ma || record._id)" 
                class="btn btn-sm btn-outline-danger rounded-circle ml-2 action-btn" 
                title="Xóa hồ sơ"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
          <tr v-if="records.length === 0">
            <td :colspan="isAdmin ? 7 : 6" class="text-center text-secondary py-4">
              <i class="fas fa-folder-open fa-2x mb-2 d-block"></i>
              Không tìm thấy hồ sơ mượn sách nào.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Popup Modal chọn tình trạng sách khi trả -->
    <teleport to="body">
      <div v-if="returningRecord" class="modal-backdrop-custom">
        <div class="modal-content-custom glass-panel p-4 animate-fade-in col-11 col-sm-10 col-md-6 col-lg-5 mx-auto">
          <div class="d-flex justify-content-between align-items-start mb-3 pb-2 border-bottom-glow">
            <h4 class="font-weight-bold text-main m-0 text-white"><i class="fas fa-undo-alt mr-2 text-primary"></i>Xác nhận Trả sách</h4>
            <button @click="closeReturnModal" class="close-btn p-0" title="Đóng"><i class="fas fa-times"></i></button>
          </div>
          
          <div class="modal-body p-0">
            <div class="mb-3 text-secondary text-sm">
              Vui lòng xác nhận tình trạng thực tế của quyển sách 
              <strong class="text-dark">"{{ getBookTitle(returningRecord.S_ma) }}"</strong> 
              do độc giả <strong class="text-dark">{{ getReaderName(returningRecord.DG_id) }}</strong> trả.
            </div>
            
            <div class="form-group mb-4">
              <label class="text-main font-weight-bold d-block mb-2">Tình trạng sách khi nhận lại:</label>
              
              <div class="custom-control custom-radio mb-3 p-3 rounded condition-option" :class="{ 'selected': selectedCondition === 'Mới / Bình thường' }" @click="selectedCondition = 'Mới / Bình thường'">
                <input type="radio" id="condNormal" name="bookCondition" class="custom-control-input" value="Mới / Bình thường" v-model="selectedCondition" />
                <label class="custom-control-label font-weight-bold cursor-pointer d-block" for="condNormal">
                  <span class="text-success-custom"><i class="fas fa-check-circle mr-2"></i>Mới / Bình thường</span>
                  <small class="text-secondary d-block mt-1 font-weight-normal">Sách nguyên vẹn. Cộng lại 1 quyển vào số lượng tồn kho khả dụng.</small>
                </label>
              </div>
              
              <div class="custom-control custom-radio mb-3 p-3 rounded condition-option" :class="{ 'selected': selectedCondition === 'Rách / Hư hỏng' }" @click="selectedCondition = 'Rách / Hư hỏng'">
                <input type="radio" id="condDamaged" name="bookCondition" class="custom-control-input" value="Rách / Hư hỏng" v-model="selectedCondition" />
                <label class="custom-control-label font-weight-bold cursor-pointer d-block" for="condDamaged">
                  <span class="text-warning-custom"><i class="fas fa-exclamation-triangle mr-2"></i>Rách / Hư hỏng</span>
                  <small class="text-secondary d-block mt-1 font-weight-normal">Quyển sách bị hỏng nặng. Yêu cầu đóng phạt. Tồn kho giữ nguyên không cộng lại.</small>
                </label>
              </div>
              
              <div class="custom-control custom-radio p-3 rounded condition-option" :class="{ 'selected': selectedCondition === 'Báo mất sách' }" @click="selectedCondition = 'Báo mất sách'">
                <input type="radio" id="condLost" name="bookCondition" class="custom-control-input" value="Báo mất sách" v-model="selectedCondition" />
                <label class="custom-control-label font-weight-bold cursor-pointer d-block" for="condLost">
                  <span class="text-danger-custom"><i class="fas fa-times-circle mr-2"></i>Báo mất sách</span>
                  <small class="text-secondary d-block mt-1 font-weight-normal">Độc giả báo mất sách. Không cộng lại vào tồn kho (trừ vĩnh viễn khỏi thư viện).</small>
                </label>
              </div>
            </div>
          </div>
          
          <div class="mt-4 pt-3 border-top-glow d-flex justify-content-end">
            <button type="button" @click="closeReturnModal" class="btn btn-outline-secondary mr-2 rounded-pill px-4">
              Hủy
            </button>
            <button type="button" @click="submitReturn" class="btn btn-glass success rounded-pill px-4">
              <i class="fas fa-check mr-1"></i> Xác nhận trả
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import { ref, computed } from "vue";

export default {
  name: "MuonSachList",
  props: {
    records: {
      type: Array,
      required: true
    },
    books: {
      type: Array,
      required: true
    },
    readers: {
      type: Array,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  emits: ["approve", "reject", "return", "delete", "filter-status", "refresh"],
  setup(props, { emit }) {
    const filterStatus = ref("");
    const searchQuery = ref("");

    const filteredRecords = computed(() => {
      if (!searchQuery.value.trim()) return props.records;
      const q = searchQuery.value.trim().toLowerCase();
      return props.records.filter(r => 
        (r.tdms_ma || "").toLowerCase().includes(q)
      );
    });
    
    // Popup states
    const returningRecord = ref(null);
    const selectedCondition = ref("Mới / Bình thường");

    const getReaderName = (maDocGia) => {
      const reader = props.readers.find(r => r.DG_id === maDocGia || r._id === maDocGia);
      return reader ? `${reader.DG_hoLot} ${reader.DG_ten}` : "Độc giả không rõ";
    };

    const getBookTitle = (bookId) => {
      const book = props.books.find(b => b.S_ma === bookId || b._id === bookId);
      return book ? book.S_ten : "Sách không rõ";
    };

    const getBookCode = (bookId) => {
      const book = props.books.find(b => b.S_ma === bookId || b._id === bookId);
      return book ? book.S_ma : "Chưa rõ";
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const getStatusClass = (status) => {
      switch (status) {
        case "Chờ duyệt": return "pending";
        case "Đang mượn": return "active";
        case "Đã trả": return "returned";
        case "Từ chối": return "rejected";
        default: return "";
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case "Chờ duyệt": return "fa-clock";
        case "Đang mượn": return "fa-book-reader";
        case "Đã trả": return "fa-check-circle";
        case "Từ chối": return "fa-times-circle";
        default: return "fa-info-circle";
      }
    };

    const getConditionClass = (condition) => {
      switch (condition) {
        case "Mới / Bình thường": return "text-success";
        case "Rách / Hư hỏng": return "text-warning";
        case "Báo mất sách": return "text-danger";
        default: return "text-secondary";
      }
    };

    const filterChanged = () => {
      emit("filter-status", filterStatus.value);
    };

    // Return actions modal
    const openReturnModal = (record) => {
      returningRecord.value = record;
      selectedCondition.value = "Mới / Bình thường";
    };

    const closeReturnModal = () => {
      returningRecord.value = null;
    };

    const submitReturn = () => {
      if (returningRecord.value) {
        emit("return", returningRecord.value._id, selectedCondition.value);
        closeReturnModal();
      }
    };

    return {
      filterStatus,
      searchQuery,
      filteredRecords,
      returningRecord,
      selectedCondition,
      getReaderName,
      getBookTitle,
      getBookCode,
      formatDate,
      getStatusClass,
      getStatusIcon,
      getConditionClass,
      filterChanged,
      openReturnModal,
      closeReturnModal,
      submitReturn
    };
  }
};
</script>

<style scoped>
.filter-select {
  background-color: var(--bg-card);
  max-width: 180px;
  color: var(--text-main) !important;
  height: auto !important;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  line-height: 1.5 !important;
}
.filter-select option {
  background-color: var(--bg-card);
  color: var(--text-main);
}
.border-glow {
  border: 1px solid var(--border-color);
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

.badge-info-custom {
  background-color: rgba(79, 195, 247, 0.15);
  color: #0288d1;
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.85rem;
}

/* Modal styles overrides/custom */
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
  animation: modalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes modalSlide {
  from { opacity: 0; transform: scale(0.95) translateY(-20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.border-bottom-glow {
  border-bottom: 1px solid var(--border-color);
}
.border-top-glow {
  border-top: 1px solid var(--border-color);
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

.condition-option {
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  cursor: pointer;
  background: #fafafa;
}
.condition-option:hover {
  background-color: rgba(79, 195, 247, 0.05);
  border-color: rgba(79, 195, 247, 0.3);
}
.condition-option.selected {
  background-color: rgba(79, 195, 247, 0.08);
  border-color: var(--primary-blue);
  box-shadow: 0 2px 8px rgba(79, 195, 247, 0.15);
}

.text-success-custom {
  color: #2e7d32;
}
.text-warning-custom {
  color: #ef6c00;
}
.text-danger-custom {
  color: #c62828;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
