<template>
  <div v-if="visible" class="phuc-loi-overlay" @click.self="$emit('close')">
    <div class="phuc-loi-modal animate-fade-in">
      <!-- Header -->
      <div class="modal-head d-flex justify-content-between align-items-center">
        <h4 class="font-weight-bold m-0">
          🏆 Quyền Lợi Hạng Thành Viên
        </h4>
        <button class="btn-close-modal" @click="$emit('close')" title="Đóng">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Progress (Reader only) -->
      <div v-if="isReader" class="progress-section">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="font-weight-bold" style="color: var(--text-main);">
            <i class="fas fa-star mr-1" :style="{ color: rankColor }"></i>
            Hạng hiện tại: <span :style="{ color: rankColor }">{{ rankDisplayName }}</span>
          </span>
          <span class="points-badge" :style="{ background: rankColor + '18', color: rankColor, border: '1px solid ' + rankColor + '40' }">
            {{ currentPoints }} điểm
          </span>
        </div>
        <div class="pbar-track">
          <div class="pbar-fill" :style="{ width: progressPercent + '%', background: progressGradient }"></div>
          <div class="pbar-marker" :style="{ left: (50/120)*100 + '%' }"><span class="pbar-marker-label">50đ</span></div>
          <div class="pbar-marker" :style="{ left: (100/120)*100 + '%' }"><span class="pbar-marker-label">100đ</span></div>
        </div>
        <p v-if="nextRank" class="text-center mt-2 mb-0" style="font-size: 0.85rem; color: var(--text-secondary);">
          🎯 Còn <strong style="color: var(--text-main);">{{ nextRank.need }} điểm</strong> nữa để lên
          <strong :style="{ color: nextRank.color }">Hạng {{ nextRank.name }}</strong>
        </p>
        <p v-else class="text-center mt-2 mb-0" style="font-size: 0.85rem; color: #f9a825;">
          🏆 Chúc mừng! Bạn đã đạt hạng cao nhất!
        </p>
      </div>
      <div v-else class="progress-section text-center">
        <p class="mb-0 text-muted"><i class="fas fa-info-circle mr-1"></i> Đăng nhập bằng tài khoản Độc giả để xem điểm uy tín của bạn.</p>
      </div>

      <!-- Benefits Cards -->
      <div class="benefits-grid">
        <div class="benefit-card" :class="{ 'benefit-active': isReader && currentRank === 'Dong' }" style="--accent: #cd7f32;">
          <div v-if="isReader && currentRank === 'Dong'" class="active-tag">✔ Đang áp dụng</div>
          <div class="b-icon">🥉</div>
          <h5 class="b-title" style="color: #cd7f32;">Hạng Đồng</h5>
          <p class="b-range">0 – 49 điểm</p>
          <ul class="b-list">
            <li><i class="fas fa-book"></i> Mượn tối đa <strong>2 cuốn / lần</strong></li>
            <li><i class="fas fa-calendar-alt"></i> Thời hạn <strong>7 ngày</strong></li>
            <li class="text-muted"><i class="fas fa-minus"></i> Quyền lợi cơ bản</li>
          </ul>
        </div>

        <div class="benefit-card" :class="{ 'benefit-active': isReader && currentRank === 'Bac' }" style="--accent: #8e9aaf;">
          <div v-if="isReader && currentRank === 'Bac'" class="active-tag">✔ Đang áp dụng</div>
          <div class="b-icon">🥈</div>
          <h5 class="b-title" style="color: #8e9aaf;">Hạng Bạc</h5>
          <p class="b-range">50 – 99 điểm</p>
          <ul class="b-list">
            <li><i class="fas fa-book"></i> Mượn tối đa <strong>4 cuốn / lần</strong></li>
            <li><i class="fas fa-calendar-alt"></i> Thời hạn <strong>14 ngày</strong></li>
            <li><i class="fas fa-bolt" style="color:#f9a825;"></i> <strong>Ưu tiên duyệt</strong> phiếu mượn</li>
          </ul>
        </div>

        <div class="benefit-card" :class="{ 'benefit-active': isReader && currentRank === 'Vang' }" style="--accent: #f9a825;">
          <div v-if="isReader && currentRank === 'Vang'" class="active-tag">✔ Đang áp dụng</div>
          <div class="b-icon">🥇</div>
          <h5 class="b-title" style="color: #f9a825;">Hạng Vàng</h5>
          <p class="b-range">≥ 100 điểm</p>
          <ul class="b-list">
            <li><i class="fas fa-book"></i> Mượn tối đa <strong>6 cuốn / lần</strong></li>
            <li><i class="fas fa-calendar-alt"></i> Thời hạn <strong>30 ngày</strong></li>
            <li><i class="fas fa-fire" style="color:#e53935;"></i> <strong>Giữ sách hot</strong> + Miễn cọc</li>
          </ul>
        </div>
      </div>

      <!-- Point Rules -->
      <div class="rules-section">
        <h6 class="font-weight-bold mb-2" style="color: var(--text-main);"><i class="fas fa-info-circle mr-1" style="color: var(--primary-blue);"></i> Quy tắc tính điểm Uy Tín</h6>
        <div class="rules-chips">
          <span class="r-chip r-pos"><i class="fas fa-arrow-up mr-1"></i> +10 điểm – Trả sách đúng hạn & nguyên vẹn</span>
          <span class="r-chip r-neg"><i class="fas fa-arrow-down mr-1"></i> −15 điểm – Trả sách trễ hạn / làm hỏng</span>
          <span class="r-chip r-info"><i class="fas fa-shield-alt mr-1"></i> Điểm không bao giờ xuống dưới 0</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { store } from "../store";

export default {
  name: "PhucLoiModal",
  props: {
    visible: { type: Boolean, default: false }
  },
  emits: ["close"],
  setup() {
    const isReader = computed(() => store.userType === "reader" && !!store.user);
    const currentPoints = computed(() => store.user?.DG_diemUyTin || 0);
    const currentRank = computed(() => store.user?.DG_hangThanhVien || "Dong");

    const rankDisplayName = computed(() => {
      switch (currentRank.value) {
        case "Vang": return "Vàng";
        case "Bac": return "Bạc";
        default: return "Đồng";
      }
    });

    const rankColor = computed(() => {
      switch (currentRank.value) {
        case "Vang": return "#f9a825";
        case "Bac": return "#8e9aaf";
        default: return "#cd7f32";
      }
    });

    const RANK_MAX = 120;
    const progressPercent = computed(() => Math.min(100, (currentPoints.value / RANK_MAX) * 100));
    const progressGradient = computed(() => {
      if (currentRank.value === "Vang") return "linear-gradient(90deg, #cd7f32, #8e9aaf, #f9a825)";
      if (currentRank.value === "Bac") return "linear-gradient(90deg, #cd7f32, #8e9aaf)";
      return "linear-gradient(90deg, #cd7f32, #d4956b)";
    });

    const nextRank = computed(() => {
      const pts = currentPoints.value;
      if (pts < 50) return { name: "Bạc", need: 50 - pts, color: "#8e9aaf" };
      if (pts < 100) return { name: "Vàng", need: 100 - pts, color: "#f9a825" };
      return null;
    });

    return { store, isReader, currentPoints, currentRank, rankDisplayName, rankColor, progressPercent, progressGradient, nextRank };
  }
};
</script>

<style scoped>
/* ===== OVERLAY ===== */
.phuc-loi-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
}

.phuc-loi-modal {
  background: var(--bg-card, #fff);
  border-radius: 20px;
  width: 720px;
  max-width: 94vw;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color, #e5e7eb);
  padding: 28px 32px;
}

/* ===== HEADER ===== */
.modal-head {
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.modal-head h4 {
  color: var(--text-main, #1e293b);
  font-size: 1.2rem;
}

.btn-close-modal {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-secondary, #f8fafc);
  color: var(--text-secondary, #64748b);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.btn-close-modal:hover {
  background: #ffebee;
  color: #c62828;
  border-color: #ffcdd2;
}

/* ===== PROGRESS ===== */
.progress-section {
  background: var(--bg-secondary, #f8fafc);
  border-radius: 14px;
  padding: 18px 22px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color, #e5e7eb);
}

.points-badge {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 20px;
}

.pbar-track {
  position: relative;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: visible;
  margin-top: 24px;
  margin-bottom: 8px;
}

.pbar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.pbar-marker {
  position: absolute;
  top: -3px;
  width: 3px;
  height: 18px;
  background: #9e9e9e;
  border-radius: 2px;
  transform: translateX(-50%);
}

.pbar-marker-label {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--text-secondary, #64748b);
  font-weight: 600;
  white-space: nowrap;
}

/* ===== BENEFITS GRID ===== */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.benefit-card {
  position: relative;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 16px;
  padding: 22px 16px 18px;
  text-align: center;
  border: 2px solid var(--border-color, #e5e7eb);
  transition: all 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.benefit-active {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent),
              0 4px 16px rgba(0, 0, 0, 0.08);
}

.active-tag {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 12px;
  border-radius: 20px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.b-icon { font-size: 2.2rem; margin-bottom: 6px; }
.b-title { font-weight: 700; margin-bottom: 2px; font-size: 1rem; }
.b-range { font-size: 0.75rem; color: var(--text-secondary, #64748b); margin-bottom: 12px; font-weight: 500; }

.b-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.b-list li {
  padding: 5px 0;
  font-size: 0.82rem;
  color: var(--text-main, #1e293b);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.b-list li:last-child { border-bottom: none; }
.b-list li i { width: 16px; text-align: center; margin-right: 6px; color: var(--text-secondary, #64748b); }

/* ===== RULES ===== */
.rules-section {
  background: var(--bg-secondary, #f8fafc);
  border-radius: 14px;
  padding: 16px 20px;
  border: 1px solid var(--border-color, #e5e7eb);
}

.rules-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.r-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}

.r-pos { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
.r-neg { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
.r-info { background: #e3f2fd; color: #1565c0; border: 1px solid #bbdefb; }

/* ===== RESPONSIVE ===== */
@media (max-width: 640px) {
  .phuc-loi-modal { padding: 20px 16px; }
  .benefits-grid { grid-template-columns: 1fr; }
}

/* ===== ANIMATION ===== */
.animate-fade-in {
  animation: fadeInModal 0.25s ease;
}

@keyframes fadeInModal {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
