<template>
  <div class="container-fluid py-4 animate-fade-in">
    <div class="row justify-content-center">
      <div class="col-xl-11">
        <!-- TOP 5 SÁCH NỔI BẬT (GRID 5 CỘT) -->
        <div class="row mb-4" v-if="displayTopBooks.length > 0 && !store.searchQuery">
          <div class="col-12">
            <h4 class="font-weight-bold mb-3" style="color: #ff6f61;">
              <i class="fas fa-fire mr-1 text-danger animate-pulse"></i> 🔥 TOP 5 SÁCH NỔI BẬT NHẤT THƯ VIỆN
            </h4>
            <div class="featured-grid">
              <div 
                v-for="(book, index) in displayTopBooks" 
                :key="book.S_ma" 
                class="featured-book-card glass-panel animate-fade-in" 
                @click="selectBookDirectly(book.S_ma)"
                style="cursor: pointer; display: flex; align-items: center; padding: 8px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-card); transition: all 0.25s ease;"
              >
                <!-- Cover Image -->
                <div style="position: relative; flex-shrink: 0;">
                  <img 
                    :src="book.S_hinhAnh" 
                    @error="handleImageError" 
                    alt="Book cover" 
                    style="height: 110px; width: 75px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);" 
                  />
                  <!-- Hot Ribbon badge -->
                  <span class="badge-hot-tag">Hot #{{ index + 1 }}</span>
                </div>
                
                <!-- Book Info -->
                <div class="ml-2 text-truncate d-flex flex-column justify-content-between" style="height: 110px; flex-grow: 1;">
                  <div>
                    <h6 class="font-weight-bold mb-0 text-main line-clamp-2" :title="book.S_ten" style="font-size: 0.85rem; white-space: normal; line-height: 1.25;">
                      {{ book.S_ten }}
                    </h6>
                    <small class="text-muted-custom d-block text-truncate" style="font-size: 0.72rem; margin-top: 2px;">
                      {{ book.S_tacGia || "Nhiều tác giả" }}
                    </small>
                  </div>
                  <div>
                    <div class="text-primary-custom font-weight-bold" style="font-size: 0.85rem; line-height: 1;">
                      {{ formatCurrency(book.S_donGia || 0) }}
                    </div>
                    <!-- Actual borrow count: show only if book.borrowCount > 0 -->
                    <small v-if="book.borrowCount > 0" class="text-secondary-desc d-block mt-1" style="font-size: 0.7rem; line-height: 1;">
                      <i class="fas fa-chart-line mr-1 text-danger"></i> {{ book.borrowCount }} lượt mượn
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Left Column: Books list & pagination -->
          <div :class="['book-list-section', selectedBook ? 'col-lg-7 col-md-6 mb-4' : 'w-100 mb-4']">
            <div class="col-12 mb-3 d-flex justify-content-between align-items-center p-0">
              <h4 class="text-main font-weight-bold m-0">
                <i class="fas fa-book-open mr-2 text-primary-custom"></i>
                {{ store.searchQuery ? `Kết quả tìm kiếm cho "${store.searchQuery}"` : 'Tất cả đầu sách' }}
              </h4>
              <span class="text-muted-custom font-weight-bold">{{ filteredBooks.length }} cuốn sách</span>
            </div>

            <!-- Filter Toggler and Collapsible Chips -->
            <div class="d-flex align-items-center mb-4" style="gap: 10px; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 5px;">
              <button 
                class="btn btn-filter-toggle" 
                @click="isFilterOpen = !isFilterOpen"
                :class="{ 'active': isFilterOpen }"
                style="flex-shrink: 0;"
              >
                <i class="fas fa-filter mr-1"></i> Lọc thể loại
              </button>

              <div 
                class="filter-chips-wrapper" 
                :class="{ 'open': isFilterOpen }"
                style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;"
              >
                <button 
                  class="btn btn-filter-chip" 
                  :class="{ 'active': selectedCategory === '' }" 
                  @click="selectedCategory = ''"
                >
                  Tất cả
                </button>
                <button 
                  class="btn btn-filter-chip" 
                  :class="{ 'active': selectedCategory === 'Trinh thám' }" 
                  @click="selectedCategory = 'Trinh thám'"
                >
                  🕵️ Trinh thám & Bí ẩn
                </button>
                <button 
                  class="btn btn-filter-chip" 
                  :class="{ 'active': selectedCategory === 'Kỹ năng' }" 
                  @click="selectedCategory = 'Kỹ năng'"
                >
                  🌱 Kỹ năng & Phát triển
                </button>
                <button 
                  class="btn btn-filter-chip" 
                  :class="{ 'active': selectedCategory === 'Văn học Việt Nam' }" 
                  @click="selectedCategory = 'Văn học Việt Nam'"
                >
                  🇻🇳 Văn học Việt
                </button>
                <button 
                  class="btn btn-filter-chip" 
                  :class="{ 'active': selectedCategory === 'Thiếu nhi' }" 
                  @click="selectedCategory = 'Thiếu nhi'"
                >
                  📖 Truyện & Thiếu nhi
                </button>
              </div>
            </div>

            <!-- Horizontal books list -->
            <div class="horizontal-books-list">
              <SachItem 
                v-for="book in paginatedBooks" 
                :key="book.S_ma" 
                :book="book"
                :class="{ 'item-selected': selectedBook && selectedBook.S_ma === book.S_ma }"
                :publisherName="getPublisherName(book.S_nxb)"
                @select="showBookDetails"
              />
            </div>

            <div v-if="filteredBooks.length === 0" class="col-12 text-center py-5 text-muted-custom animate-fade-in">
              <i class="fas fa-book fa-3x mb-3"></i>
              <h5>Không tìm thấy quyển sách nào khớp với tìm kiếm của bạn.</h5>
              <button @click="clearSearch" class="btn btn-glass mt-3 rounded-pill px-4">
                Hiển thị tất cả
              </button>
            </div>

            <!-- Pagination Controls -->
            <div v-if="totalPages > 1" class="d-flex justify-content-center align-items-center mt-4">
              <button 
                @click="prevPage" 
                class="btn btn-sm btn-outline-primary rounded-pill px-3 mr-3"
                :disabled="currentPage === 1"
              >
                <i class="fas fa-chevron-left mr-1"></i> Trước
              </button>
              <span class="text-muted-custom text-sm">Trang {{ currentPage }} / {{ totalPages }}</span>
              <button 
                @click="nextPage" 
                class="btn btn-sm btn-outline-primary rounded-pill px-3 ml-3"
                :disabled="currentPage === totalPages"
              >
                Sau <i class="fas fa-chevron-right ml-1"></i>
              </button>
            </div>
          </div>

          <!-- Right Column: Sticky detail panel (5 cols) -->
          <div class="col-lg-5 col-md-6 mb-4 animate-fade-in" v-if="selectedBook">
            <div class="sticky-detail-panel p-4">
              <div class="h-100 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex justify-content-end mb-2">
                    <button @click="closeDetailsModal" class="close-btn p-0" title="Đóng chi tiết"><i class="fas fa-times"></i></button>
                  </div>

                  <!-- Book Cover Image & Title -->
                  <div class="d-flex flex-column align-items-center mb-4 pb-3 border-bottom-glow">
                    <img :src="selectedBook.S_hinhAnh" @error="handleImageError" alt="Book cover" class="img-fluid rounded-lg shadow mb-3" style="width: 140px; height: 195px; object-fit: cover; border: 1px solid var(--border-color);" />
                    <h4 class="font-weight-bold text-main m-0 text-center" style="font-size: 1.25rem;">{{ selectedBook.S_ten }}</h4>
                  </div>
                  
                  <div class="detail-body">
                    <div class="detail-row"><span class="label">Tác giả:</span> <span class="val font-weight-bold text-main">{{ selectedBook.S_tacGia || "Chưa rõ" }}</span></div>
                    <div class="detail-row"><span class="label">Thể loại:</span> <span class="val font-weight-bold text-main">{{ selectedBook.S_theLoai || "Chưa phân loại" }}</span></div>
                    <div class="detail-row"><span class="label">Nhà xuất bản:</span> <span class="val">{{ getPublisherName(selectedBook.S_nxb) }}</span></div>
                    <div class="detail-row"><span class="label">Năm xuất bản:</span> <span class="val">{{ selectedBook.S_namXB }}</span></div>
                    <div class="detail-row"><span class="label">Đơn giá mượn:</span> <span class="val text-primary-custom font-weight-bold">{{ formatCurrency(selectedBook.S_donGia) }}</span></div>
                    <div class="detail-row"><span class="label">Vị trí kệ sách:</span> <span class="val text-accent-custom font-weight-bold"><i class="fas fa-map-marker-alt mr-1"></i> {{ selectedBook.S_viTri || "Chưa xếp kệ" }}</span></div>
                    <div class="detail-row border-0">
                      <span class="label">Trạng thái kho:</span> 
                      <span class="val badge" :class="selectedBook.S_soQuyen > 0 ? 'badge-success-custom' : 'badge-danger-custom'">
                        {{ selectedBook.S_soQuyen > 0 ? `Còn lại: ${selectedBook.S_soQuyen} quyển` : 'Đã hết sách' }}
                      </span>
                    </div>
                    
                    <div class="mt-3">
                      <h6 class="text-main font-weight-bold mb-1">Tóm tắt sách:</h6>
                      <p class="text-muted-custom text-sm line-height-relaxed text-justify text-summary-scroll">
                        {{ selectedBook.S_tomTat || "Chưa có thông tin tóm tắt sơ lược cho cuốn sách này." }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-top-glow d-flex justify-content-end">
                  <!-- Action Buttons dynamic to Role -->
                  <template v-if="store.userType === 'reader'">
                    <button 
                      @click="initiateBorrow(selectedBook)" 
                      class="btn btn-borrow-custom rounded-pill px-4 btn-block"
                      :disabled="selectedBook.S_soQuyen <= 0"
                    >
                      <i class="fas fa-share-square mr-1"></i> Đặt mượn sách
                    </button>
                  </template>

                  <template v-else-if="store.userType === 'staff'">
                    <button @click="navigateToEditBook(selectedBook)" class="btn btn-outline-info mr-2 rounded-pill px-4 flex-fill">
                      <i class="fas fa-edit mr-1"></i> Chỉnh sửa
                    </button>
                    <button @click="deleteBookFromHome(selectedBook.S_ma || selectedBook._id)" class="btn btn-outline-danger rounded-pill px-4 flex-fill">
                      <i class="fas fa-trash-alt mr-1"></i> Xóa
                    </button>
                  </template>
                  
                  <template v-else>
                    <router-link to="/login" class="btn btn-borrow-custom rounded-pill px-4 btn-block">
                      Đăng nhập để đặt mượn
                    </router-link>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Borrow Confirmation Modal -->
    <teleport to="body">
      <div v-if="borrowingBook" class="modal-backdrop-custom">
        <div class="modal-content-custom glass-panel p-4 p-md-5 animate-fade-in col-11 col-sm-10 col-md-6 col-lg-5 mx-auto">
          <div class="d-flex justify-content-between align-items-start mb-4">
            <h3 class="font-weight-bold text-main m-0">Xác Nhận Mượn Sách</h3>
            <button @click="closeBorrowModal" class="close-btn"><i class="fas fa-times"></i></button>
          </div>
          
          <div v-if="borrowError" class="alert alert-danger-custom mb-3">
            <i class="fas fa-exclamation-circle mr-2"></i> {{ borrowError }}
          </div>
          <div v-if="borrowSuccess" class="alert alert-success-custom mb-3">
            <i class="fas fa-check-circle mr-2"></i> {{ borrowSuccess }}
          </div>

          <form @submit.prevent="submitBorrowRequest">
            <div class="form-group mb-3">
              <label class="text-muted-custom">Tên Sách</label>
              <input type="text" class="form-control" :value="borrowingBook.S_ten" disabled />
            </div>

            <div class="row">
              <div class="col-md-6 form-group">
                <label class="text-main">Ngày Mượn</label>
                <input type="date" class="form-control" v-model="borrowForm.NgayMuon" required />
              </div>
              <div class="col-md-6 form-group">
                <label class="text-main">Hạn Trả</label>
                <input type="date" class="form-control" v-model="borrowForm.NgayTra" required />
              </div>
            </div>

            <div class="mt-4 pt-3 border-top-glow d-flex justify-content-end">
              <button type="button" @click="closeBorrowModal" class="btn btn-outline-secondary mr-2 rounded-pill px-4" :disabled="borrowLoading">
                Hủy
              </button>
              <button type="submit" class="btn btn-primary rounded-pill px-4" :disabled="borrowLoading">
                <span v-if="borrowLoading" class="spinner-border spinner-border-sm mr-2"></span>
                Xác nhận mượn
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import SachItem from "../components/SachItem.vue";
import SachService from "../services/sach.service";
import NhaXuatBanService from "../services/nhaxuatban.service";
import MuonSachService from "../services/muonsach.service";
import DashboardService from "../services/dashboard.service";
import { store } from "../store";

export default {
  name: "TrangHome",
  components: {
    SachItem
  },
  setup() {
    const router = useRouter();
    const books = ref([]);
    const publishers = ref([]);
    const selectedBook = ref(null);
    const topBooks = ref([]);
    const selectedCategory = ref("");
    const isFilterOpen = ref(false);

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = 10;

    // Borrow State
    const borrowingBook = ref(null);
    const borrowForm = ref({ NgayMuon: "", NgayTra: "" });
    const borrowLoading = ref(false);
    const borrowError = ref(null);
    const borrowSuccess = ref(null);

    const retrieveBooks = async () => {
      try {
        books.value = await SachService.getAll();
        if (selectedBook.value) {
          const updated = books.value.find(b => b.S_ma === selectedBook.value.S_ma);
          if (updated) selectedBook.value = updated;
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách sách:", error);
      }
    };

    const retrievePublishers = async () => {
      try {
        publishers.value = await NhaXuatBanService.getAll();
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhà xuất bản:", error);
      }
    };

    const retrieveTopBooks = async () => {
      try {
        topBooks.value = await DashboardService.getTopBooks();
      } catch (error) {
        console.error("Lỗi khi tải top sách hot:", error);
      }
    };

    onMounted(() => {
      retrieveBooks();
      retrievePublishers();
      retrieveTopBooks();
    });

    const getPublisherName = (nxbId) => {
      const pub = publishers.value.find(p => p.nxb_ma === nxbId || p._id === nxbId);
      return pub ? pub.nxb_ten : "Chưa xác định";
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
      }).format(value);
    };

    const clearSearch = () => {
      store.searchQuery = "";
      selectedCategory.value = "";
    };

    const filteredBooks = computed(() => {
      let result = books.value;
      if (selectedCategory.value) {
        result = result.filter(b => b.S_theLoai === selectedCategory.value);
      }
      if (store.searchQuery) {
        result = result.filter(b => 
          b.S_ten.toLowerCase().includes(store.searchQuery.toLowerCase())
        );
      }
      return result;
    });

    const displayTopBooks = computed(() => {
      const list = [];
      const addedIds = new Set();

      // 1. Add top books from API (sorted by borrowCount descending in backend)
      for (const tb of topBooks.value) {
        const original = books.value.find(b => b.S_ma === tb.S_ma || b._id === tb._id);
        if (original) {
          list.push({
            ...original,
            borrowCount: tb.borrowCount
          });
          addedIds.add(original.S_ma);
        }
      }

      // 2. If length < 5, fill with other books from books.value sorted by S_soQuyen descending
      if (list.length < 5) {
        const remainingBooks = [...books.value]
          .filter(b => !addedIds.has(b.S_ma))
          .sort((a, b) => (b.S_soQuyen || 0) - (a.S_soQuyen || 0));

        for (const b of remainingBooks) {
          if (list.length >= 5) break;
          list.push({
            ...b,
            borrowCount: 0 // actual borrow count is 0 (fallback)
          });
          addedIds.add(b.S_ma);
        }
      }

      return list.slice(0, 5);
    });

    watch(filteredBooks, () => {
      currentPage.value = 1;
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredBooks.value.length / itemsPerPage);
    });

    const paginatedBooks = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      return filteredBooks.value.slice(start, start + itemsPerPage);
    });

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const showBookDetails = (bookId) => {
      if (selectedBook.value && (selectedBook.value.S_ma === bookId || selectedBook.value._id === bookId)) {
        selectedBook.value = null;
      } else {
        selectedBook.value = books.value.find(b => b.S_ma === bookId || b._id === bookId);
      }
    };

    const selectBookDirectly = (bookId) => {
      const book = books.value.find(b => b.S_ma === bookId || b._id === bookId);
      if (book) {
        selectedBook.value = book;
      }
    };

    const closeDetailsModal = () => {
      selectedBook.value = null;
    };

    const navigateToEditBook = (book) => {
      closeDetailsModal();
      router.push({ name: "admin-sach" });
    };

    const deleteBookFromHome = async (id) => {
      if (confirm("Bạn có chắc chắn muốn xóa quyển sách này khỏi hệ thống?")) {
        try {
          await SachService.delete(id);
          closeDetailsModal();
          await retrieveBooks();
        } catch (error) {
          console.error("Lỗi khi xóa sách:", error);
          alert("Không thể xóa sách này. Sách đang liên kết với phiếu mượn.");
        }
      }
    };

    const initiateBorrow = (book) => {
      if (!store.user) {
        router.push("/login");
        return;
      }
      
      borrowingBook.value = book;
      const today = new Date();
      const twoWeeksLater = new Date();
      twoWeeksLater.setDate(today.getDate() + 14);

      borrowForm.value = {
        NgayMuon: today.toISOString().split("T")[0],
        NgayTra: twoWeeksLater.toISOString().split("T")[0]
      };
      
      borrowError.value = null;
      borrowSuccess.value = null;
    };

    const closeBorrowModal = () => {
      borrowingBook.value = null;
    };

    const submitBorrowRequest = async () => {
      borrowLoading.value = true;
      borrowError.value = null;
      borrowSuccess.value = null;

      try {
        const payload = {
          DG_id: store.user.DG_id,
          S_ma: borrowingBook.value.S_ma,
          tdms_ngayMuon: borrowForm.value.NgayMuon,
          tdms_ngayTra: borrowForm.value.NgayTra
        };

        await MuonSachService.create(payload);
        borrowSuccess.value = "Yêu cầu mượn sách đã được gửi! Đang chờ thủ thư phê duyệt.";
        
        await retrieveBooks();

        setTimeout(() => {
          closeBorrowModal();
          router.push("/muonsach");
        }, 1800);
      } catch (err) {
        borrowError.value = err.response?.data?.message || "Đã xảy ra lỗi khi tạo phiếu mượn.";
      } finally {
        borrowLoading.value = false;
      }
    };

    const handleImageError = (e) => {
      e.target.src = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400";
    };

    return {
      store,
      books,
      filteredBooks,
      currentPage,
      totalPages,
      paginatedBooks,
      nextPage,
      prevPage,
      selectedBook,
      borrowingBook,
      borrowForm,
      borrowLoading,
      borrowError,
      borrowSuccess,
      getPublisherName,
      formatCurrency,
      clearSearch,
      showBookDetails,
      selectBookDirectly,
      closeDetailsModal,
      navigateToEditBook,
      deleteBookFromHome,
      initiateBorrow,
      closeBorrowModal,
      submitBorrowRequest,
      topBooks,
      selectedCategory,
      handleImageError,
      isFilterOpen,
      displayTopBooks
    };
  }
};
</script>

<style scoped>
.horizontal-books-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.sticky-detail-panel {
  position: sticky;
  top: 85px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.item-selected {
  border-color: var(--primary-blue) !important;
  background: var(--bg-secondary) !important;
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.15) !important;
  transform: translateX(4px);
}

.text-summary-scroll {
  max-height: 120px;
  overflow-y: auto;
  padding-right: 6px;
}

/* Custom scrollbar for text summary */
.text-summary-scroll::-webkit-scrollbar {
  width: 4px;
}
.text-summary-scroll::-webkit-scrollbar-thumb {
  background: var(--text-muted);
  border-radius: 10px;
}

.line-height-relaxed {
  line-height: 1.6;
}

.badge-success-custom {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.badge-danger-custom {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.border-top-glow {
  border-top: 1px solid var(--border-color);
}

.border-bottom-glow {
  border-bottom: 1px solid var(--border-color);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.detail-row .label {
  color: var(--text-muted);
}

.detail-row .val {
  color: var(--text-main);
}

.text-justify {
  text-align: justify;
}

.text-primary-custom {
  color: var(--primary-blue);
}

.text-accent-custom {
  color: var(--accent-pink-hover);
}

.text-main {
  color: var(--text-main);
}

.text-muted-custom {
  color: var(--text-muted);
}

/* Borrow button custom gradient */
.btn-borrow-custom {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-pink) 100%);
  color: white !important;
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(255, 128, 171, 0.3);
}

.btn-borrow-custom:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 128, 171, 0.45);
}

/* Modal Confirmation Custom Styles */
.modal-backdrop-custom {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
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
  animation: modalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalSlide {
  from { opacity: 0; transform: scale(0.95) translateY(-20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
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

.alert-danger-custom {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  padding: 10px 14px;
}

.alert-success-custom {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  padding: 10px 14px;
}

.book-list-section {
  transition: all 0.3s ease-in-out;
}

/* Top 5 Hot Books Style */
.badge-hot-tag {
  position: absolute;
  top: 4px;
  left: 4px;
  background: linear-gradient(135deg, #fbbf24 0%, #ff6f61 100%);
  color: white;
  font-size: 0.65rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.featured-book-card:hover {
  transform: translateY(-3px);
  border-color: #ff6f61 !important;
  box-shadow: 0 6px 15px rgba(255, 111, 97, 0.15);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-secondary-desc {
  color: var(--text-muted);
}

/* Filter Toggler Button */
.btn-filter-toggle {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
  cursor: pointer;
}

.btn-filter-toggle:hover, .btn-filter-toggle.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--bg-secondary);
}

/* Collapsible Filter Chips Wrapper */
.filter-chips-wrapper {
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  white-space: nowrap;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
}

.filter-chips-wrapper.open {
  max-width: 1000px;
  opacity: 1;
}

/* Filter Chips */
.btn-filter-chip {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.88rem;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-filter-chip:hover {
  background: var(--bg-secondary);
  color: var(--text-main);
  transform: translateY(-1px);
}

.btn-filter-chip.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
  box-shadow: 0 4px 10px var(--accent-bg);
}

/* Featured Books Grid */
.featured-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  width: 100%;
}

@media (max-width: 1199px) {
  .featured-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .featured-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .featured-grid {
    grid-template-columns: 1fr;
  }
}
</style>
