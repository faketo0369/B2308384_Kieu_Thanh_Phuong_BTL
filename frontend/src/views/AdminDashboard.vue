<template>
  <div class="container py-4 animate-fade-in dashboard-light-pastel">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="font-weight-bold mb-2 dashboard-title">Dashboard Quản Trị</h2>
        <p class="text-secondary-desc">Chào mừng bạn trở lại, {{ store.user?.nv_hoTen }} ({{ store.user?.nv_chucVu }}). Dưới đây là thống kê hoạt động của thư viện.</p>
      </div>
    </div>

    <!-- Hàng 1 (Thống kê nhanh - Stat Cards in Pastel Colors) -->
    <div class="row mb-4">
      <!-- Total Books (📚) -->
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card-pastel card-pastel-blue p-4 d-flex align-items-center">
          <div class="stat-icon-pastel mr-3">
            <i class="fas fa-book fa-2x"></i>
          </div>
          <div>
            <h6 class="mb-1 text-uppercase text-xs font-weight-bold">Tổng số sách</h6>
            <h3 class="font-weight-bold mb-0">{{ stats.totalBooks }}</h3>
            <small class="opacity-75">({{ stats.totalCopies }} bản sao)</small>
          </div>
        </div>
      </div>

      <!-- Pending Borrows (⌛) -->
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card-pastel card-pastel-orange p-4 d-flex align-items-center">
          <div class="stat-icon-pastel mr-3">
            <i class="fas fa-hourglass-half fa-2x"></i>
          </div>
          <div>
            <h6 class="mb-1 text-uppercase text-xs font-weight-bold">Phiếu chờ duyệt</h6>
            <h3 class="font-weight-bold mb-0">{{ stats.totalBorrowPending }}</h3>
            <small class="opacity-75">Yêu cầu mượn</small>
          </div>
        </div>
      </div>

      <!-- Active Borrows (📖) -->
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card-pastel card-pastel-green p-4 d-flex align-items-center">
          <div class="stat-icon-pastel mr-3">
            <i class="fas fa-book-reader fa-2x"></i>
          </div>
          <div>
            <h6 class="mb-1 text-uppercase text-xs font-weight-bold">Phiếu đang mượn</h6>
            <h3 class="font-weight-bold mb-0">{{ stats.totalBorrowing }}</h3>
            <small class="opacity-75">Sách lưu hành</small>
          </div>
        </div>
      </div>

      <!-- Overdue Borrows (⚠️) -->
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card-pastel card-pastel-red p-4 d-flex align-items-center">
          <div class="stat-icon-pastel mr-3">
            <i class="fas fa-exclamation-triangle fa-2x"></i>
          </div>
          <div>
            <h6 class="mb-1 text-uppercase text-xs font-weight-bold">Phiếu quá hạn</h6>
            <h3 class="font-weight-bold mb-0 text-danger-pastel">{{ stats.totalOverdue }}</h3>
            <small class="opacity-75 text-danger-pastel">Cần xử lý gấp</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Hàng 2 (Biểu đồ trực quan - Charts) -->
    <div class="row mb-4">
      <!-- Doughnut Chart (Biểu đồ Tỉ trọng Trạng thái Phiếu mượn) -->
      <div class="col-lg-6 mb-4">
        <div class="dashboard-panel p-4 h-100">
          <h5 class="font-weight-bold mb-4 panel-title">
            <i class="fas fa-chart-pie mr-2 text-primary"></i> Tỉ Trọng Trạng Thái Phiếu Mượn
          </h5>
          <div class="d-flex align-items-center justify-content-around flex-wrap" style="min-height: 200px;">
            <!-- SVG Doughnut -->
            <div style="position: relative; width: 140px; height: 140px;">
              <svg width="140" height="140" viewBox="0 0 120 120" style="transform: rotate(-90deg);">
                <!-- Background Circle -->
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--dashboard-border)" stroke-width="12"></circle>
                <!-- Segments -->
                <circle 
                  v-for="segment in doughnutData" 
                  :key="segment.key"
                  cx="60" 
                  cy="60" 
                  r="50" 
                  fill="none" 
                  :stroke="segment.color" 
                  stroke-width="12"
                  :stroke-dasharray="314.15"
                  :stroke-dashoffset="segment.dashOffset"
                  :style="{ transform: 'rotate(' + (segment.startOffset * 360 / 314.15) + 'deg)', transformOrigin: '50% 50%' }"
                  style="transition: stroke-dashoffset 0.8s ease-in-out; stroke-linecap: round;"
                ></circle>
              </svg>
              <!-- Center Text -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 1.4rem; font-weight: bold; color: var(--dashboard-text);">
                  {{ totalBorrowsCount }}
                </span>
                <span style="font-size: 0.65rem; color: var(--dashboard-text-muted);">Phiếu mượn</span>
              </div>
            </div>

            <!-- Legend -->
            <div class="d-flex flex-column gap-2 mt-3 mt-sm-0">
              <div v-for="segment in doughnutData" :key="segment.key" class="d-flex align-items-center mb-1" style="font-size: 0.85rem;">
                <span class="mr-2" :style="{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: segment.color }"></span>
                <span class="mr-2" style="color: var(--dashboard-text-muted);">{{ segment.label }}:</span>
                <span class="font-weight-bold" style="color: var(--dashboard-text);">{{ segment.count }} ({{ segment.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Horizontal Bar Chart (Top 5 Sách mượn nhiều nhất) -->
      <div class="col-lg-6 mb-4">
        <div class="dashboard-panel p-4 h-100">
          <h5 class="font-weight-bold mb-4 panel-title">
            <i class="fas fa-trophy mr-2 text-warning"></i> Top 5 Sách Mượn Nhiều Nhất
          </h5>
          <div class="d-flex flex-column justify-content-center h-100" style="min-height: 200px;">
            <div v-for="(book, index) in topBooks" :key="book.S_ma || book._id" class="mb-3">
              <div class="d-flex justify-content-between mb-1" style="font-size: 0.85rem;">
                <span class="text-truncate font-weight-bold mr-2" style="max-width: 75%; color: var(--dashboard-text);" :title="book.S_ten">
                  {{ index + 1 }}. {{ book.S_ten }}
                </span>
                <span style="color: var(--dashboard-text-muted); font-size: 0.8rem; min-width: 80px; text-align: right;">
                  {{ book.borrowCount }} lượt mượn
                </span>
              </div>
              <div class="progress" style="height: 10px; background-color: var(--dashboard-border); border-radius: 5px; overflow: hidden;">
                <div 
                  class="progress-bar-pastel" 
                  :style="{ 
                    width: (book.borrowCount / maxBorrowCount * 100) + '%',
                    backgroundColor: getPastelColorForIndex(index)
                  }" 
                  style="height: 100%; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); border-radius: 5px;"
                ></div>
              </div>
            </div>
            <div v-if="topBooks.length === 0" class="text-center text-muted py-4">
              Không có dữ liệu mượn sách.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hàng 3 (Bảng cảnh báo) -->
    <div class="row">
      <!-- Bảng "Sách sắp hết kho cần nhập thêm" -->
      <div class="col-lg-6 mb-4">
        <div class="dashboard-panel p-4 h-100 d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="font-weight-bold m-0 panel-title">
              <i class="fas fa-boxes mr-2 text-info"></i> Sách Sắp Hết Kho (≤ 2 quyển)
            </h5>
            <router-link to="/admin/sach" class="btn btn-xs btn-outline-info rounded-pill px-3 py-1 font-weight-bold" style="font-size: 0.75rem;">
              <i class="fas fa-cog mr-1"></i> Quản lý sách
            </router-link>
          </div>
          
          <div class="table-responsive flex-fill">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th style="width: 25%;">Mã sách</th>
                  <th style="width: 45%;">Tên sách</th>
                  <th style="width: 30%; text-align: right;">Số quyển còn</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in lowStockBooks" :key="book.S_ma || book._id">
                  <td class="font-weight-bold" style="color: var(--dashboard-text-muted);">{{ book.S_ma }}</td>
                  <td class="text-truncate font-weight-bold" style="max-width: 180px; color: var(--dashboard-text);" :title="book.S_ten">{{ book.S_ten }}</td>
                  <td style="text-align: right;">
                    <span class="badge badge-warning-pastel px-2 py-1 font-weight-bold">
                      {{ book.S_soQuyen }} quyển
                    </span>
                  </td>
                </tr>
                <tr v-if="lowStockBooks.length === 0">
                  <td colspan="3" class="text-center text-muted py-4">
                    <i class="fas fa-check-circle text-success mr-1"></i> Không có sách sắp hết kho.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Bảng "Danh sách Độc giả nợ sách quá hạn" -->
      <div class="col-lg-6 mb-4">
        <div class="dashboard-panel p-4 h-100 d-flex flex-column">
          <h5 class="font-weight-bold mb-4 panel-title">
            <i class="fas fa-user-clock mr-2 text-danger"></i> Danh Sách Nợ Sách Quá Hạn
          </h5>
          
          <div class="table-responsive flex-fill">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th style="width: 30%;">Mã phiếu</th>
                  <th style="width: 40%;">Độc giả</th>
                  <th style="width: 30%; text-align: right;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="reader in overdueReaders" :key="reader.tdms_ma || reader._id">
                  <td class="font-weight-bold" style="color: var(--dashboard-text-muted);">{{ reader.tdms_ma }}</td>
                  <td>
                    <div class="font-weight-bold" style="color: var(--dashboard-text);">{{ reader.DG_hoTen }}</div>
                    <div style="font-size: 0.75rem; color: var(--dashboard-text-muted);">SĐT: {{ reader.DG_sdt }}</div>
                    <div style="font-size: 0.72rem; color: #ef4444;" class="font-weight-bold">Hạn trả: {{ formatDate(reader.tdms_ngayTra) }}</div>
                  </td>
                  <td style="text-align: right;">
                    <button @click="remindReader(reader)" class="btn btn-xs btn-outline-danger rounded-pill px-3 py-1 font-weight-bold" style="font-size: 0.75rem;">
                      <i class="fas fa-bell mr-1"></i> Nhắc nhở
                    </button>
                  </td>
                </tr>
                <tr v-if="overdueReaders.length === 0">
                  <td colspan="3" class="text-center text-muted py-4">
                    <i class="fas fa-check-circle text-success mr-1"></i> Không có độc giả quá hạn.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { store } from "../store";
import DashboardService from "../services/dashboard.service";

export default {
  name: "AdminDashboard",
  setup() {
    const stats = ref({
      totalBooks: 0,
      totalCopies: 0,
      totalBorrowPending: 0,
      totalBorrowing: 0,
      totalOverdue: 0,
      totalBorrowReturned: 0,
      totalBorrowRejected: 0
    });
    const topBooks = ref([]);
    const lowStockBooks = ref([]);
    const overdueReaders = ref([]);

    const fetchDashboardData = async () => {
      try {
        stats.value = await DashboardService.getSummary();
        topBooks.value = await DashboardService.getTopBooks();
        lowStockBooks.value = await DashboardService.getLowStock();
        overdueReaders.value = await DashboardService.getOverdueReaders();
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu dashboard:", err);
      }
    };

    onMounted(() => {
      fetchDashboardData();
    });

    const maxBorrowCount = computed(() => {
      if (topBooks.value.length === 0) return 1;
      return Math.max(...topBooks.value.map(b => b.borrowCount), 1);
    });

    const totalBorrowsCount = computed(() => {
      return (
        stats.value.totalBorrowPending +
        stats.value.totalBorrowing +
        stats.value.totalBorrowReturned +
        stats.value.totalBorrowRejected
      );
    });

    const doughnutData = computed(() => {
      const total = totalBorrowsCount.value || 1;
      const items = [
        { key: "pending", label: "Chờ duyệt", count: stats.value.totalBorrowPending, color: "#f59e0b" },
        { key: "active", label: "Đang mượn", count: stats.value.totalBorrowing, color: "#10b981" },
        { key: "returned", label: "Đã trả", count: stats.value.totalBorrowReturned, color: "#3b82f6" },
        { key: "rejected", label: "Từ chối", count: stats.value.totalBorrowRejected, color: "#ef4444" }
      ];

      let currentOffset = 0;
      const dashArray = 314.15; // 2 * PI * R where R = 50

      return items.map(item => {
        const percentage = (item.count / total) * 100;
        const dashOffset = dashArray - (dashArray * percentage) / 100;
        const startOffset = currentOffset;
        currentOffset += (dashArray * percentage) / 100;

        return {
          ...item,
          percentage: percentage.toFixed(1),
          dashOffset,
          startOffset
        };
      });
    });

    const getPastelColorForIndex = (index) => {
      const colors = ["#60a5fa", "#34d399", "#fb7185", "#fbbf24", "#a78bfa"];
      return colors[index % colors.length];
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN");
    };

    const remindReader = (reader) => {
      alert(`Đã gửi thông báo nhắc trả sách thành công tới độc giả ${reader.DG_hoTen} (${reader.DG_sdt})!\nNội dung: Vui lòng trả cuốn sách "${reader.S_ten}" đã quá hạn cho thư viện.`);
    };

    return {
      store,
      stats,
      topBooks,
      lowStockBooks,
      overdueReaders,
      maxBorrowCount,
      totalBorrowsCount,
      doughnutData,
      getPastelColorForIndex,
      formatDate,
      remindReader
    };
  }
};
</script>

<style scoped>
/* Theme Adaptation Variables */
.dashboard-light-pastel {
  --dashboard-bg-card: #ffffff;
  --dashboard-text: #374151;
  --dashboard-text-muted: #6b7280;
  --dashboard-border: #f3f4f6;
  --dashboard-title: #1f2937;
}

@media (prefers-color-scheme: dark) {
  .dashboard-light-pastel {
    --dashboard-bg-card: #1f2028;
    --dashboard-text: #e5e7eb;
    --dashboard-text-muted: #9ca3af;
    --dashboard-border: #2e303a;
    --dashboard-title: #f3f4f6;
  }
}

.dashboard-title {
  color: var(--dashboard-title);
}

.text-secondary-desc {
  color: var(--dashboard-text-muted);
}

/* Stat Cards in Pastel Colors */
.card-pastel {
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-pastel:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
}

.card-pastel-blue {
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.card-pastel-orange {
  background-color: #ffedd5;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.card-pastel-green {
  background-color: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.card-pastel-red {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.text-danger-pastel {
  color: #b91c1c !important;
}

.stat-icon-pastel {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

/* Panels */
.dashboard-panel {
  background-color: var(--dashboard-bg-card);
  border: 1px solid var(--dashboard-border);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

.panel-title {
  color: var(--dashboard-title);
}

/* Tables */
.dashboard-table {
  width: 100%;
  border-collapse: collapse;
}

.dashboard-table th {
  padding: 12px;
  border-bottom: 2px solid var(--dashboard-border);
  color: var(--dashboard-text-muted);
  font-weight: bold;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dashboard-table td {
  padding: 12px;
  border-bottom: 1px solid var(--dashboard-border);
  color: var(--dashboard-text);
  font-size: 0.85rem;
  vertical-align: middle;
}

/* Badges and Progress Bars */
.badge-warning-pastel {
  background-color: #ffedd5;
  color: #c2410c;
  border: 1px solid #fed7aa;
  border-radius: 6px;
}

.progress-bar-pastel {
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2);
}

.gap-2 {
  gap: 10px;
}

.btn-xs {
  padding: 4px 10px;
  font-size: 0.75rem;
}
</style>
