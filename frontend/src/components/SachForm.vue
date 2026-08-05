<template>
  <Form @submit="submitBook" :validation-schema="bookFormSchema" v-slot="{ errors }">
    <div class="row">
      <!-- Book Name -->
      <div class="col-md-6 form-group">
        <label for="S_ten"><i class="fas fa-bookmark mr-1"></i> Tên sách</label>
        <Field
          name="S_ten"
          type="text"
          class="form-control"
          v-model="bookLocal.S_ten"
          placeholder="Nhập tên sách..."
        />
        <ErrorMessage name="S_ten" class="form-error" />
      </div>

      <!-- Author -->
      <div class="col-md-6 form-group">
        <label for="S_tacGia"><i class="fas fa-user-nib mr-1"></i> Tác giả</label>
        <Field
          name="S_tacGia"
          type="text"
          class="form-control"
          v-model="bookLocal.S_tacGia"
          placeholder="Nhập tên tác giả..."
        />
        <ErrorMessage name="S_tacGia" class="form-error" />
      </div>
    </div>

    <div class="row mt-3">
      <!-- Price -->
      <div class="col-md-4 form-group">
        <label for="S_donGia"><i class="fas fa-tags mr-1"></i> Đơn giá (VND)</label>
        <Field
          name="S_donGia"
          type="number"
          class="form-control"
          v-model="bookLocal.S_donGia"
          placeholder="Ví dụ: 50000"
        />
        <ErrorMessage name="S_donGia" class="form-error" />
      </div>

      <!-- Copies Stock -->
      <div class="col-md-4 form-group">
        <label for="S_soQuyen"><i class="fas fa-cubes mr-1"></i> Số quyển</label>
        <Field
          name="S_soQuyen"
          type="number"
          class="form-control"
          v-model="bookLocal.S_soQuyen"
          placeholder="Ví dụ: 10"
        />
        <ErrorMessage name="S_soQuyen" class="form-error" />
      </div>

      <!-- Publication Year -->
      <div class="col-md-4 form-group">
        <label for="S_namXB"><i class="fas fa-calendar-alt mr-1"></i> Năm xuất bản</label>
        <Field
          name="S_namXB"
          type="number"
          class="form-control"
          v-model="bookLocal.S_namXB"
          placeholder="Ví dụ: 2022"
        />
        <ErrorMessage name="S_namXB" class="form-error" />
      </div>
    </div>

    <div class="row mt-3">
      <!-- Publisher -->
      <div class="col-md-6 form-group">
        <label for="S_nxb"><i class="fas fa-building mr-1"></i> Nhà xuất bản</label>
        <Field
          name="S_nxb"
          as="select"
          class="form-control form-select"
          v-model="bookLocal.S_nxb"
        >
          <option value="" disabled>-- Chọn Nhà Xuất Bản --</option>
          <option v-for="nxb in publishers" :key="nxb.nxb_ma || nxb._id" :value="nxb.nxb_ma || nxb._id">
            {{ nxb.nxb_ten }} - {{ nxb.nxb_diaChi }}
          </option>
        </Field>
        <ErrorMessage name="S_nxb" class="form-error" />
      </div>

      <!-- Location in Library -->
      <div class="col-md-6 form-group">
        <label for="S_viTri"><i class="fas fa-map-marker-alt mr-1"></i> Vị trí kệ sách</label>
        <Field
          name="S_viTri"
          as="select"
          class="form-control form-select"
          v-model="bookLocal.S_viTri"
        >
          <option value="" disabled>-- Chọn Kệ Sách --</option>
          <option value="Kệ A">Kệ A - Sách Bí ẩn khoa học</option>
          <option value="Kệ B">Kệ B - Sách Văn học Nguyễn Nhật Ánh</option>
          <option value="Kệ C">Kệ C - Sách Thiếu nhi & Phiêu lưu</option>
          <option value="Kệ D">Kệ D - Sách Kỹ năng & Nước ngoài</option>
          <option value="Kệ E">Kệ E - Sách Hiện thực Việt Nam</option>
          <option value="Kệ F">Kệ F - Sách Cách mạng & Kịch nghệ</option>
        </Field>
        <ErrorMessage name="S_viTri" class="form-error" />
      </div>
    </div>

    <div class="row mt-3">
      <!-- Category (Thể loại) -->
      <div class="col-md-6 form-group">
        <label for="S_theLoai"><i class="fas fa-tags mr-1"></i> Thể loại</label>
        <Field
          name="S_theLoai"
          as="select"
          class="form-control form-select"
          v-model="bookLocal.S_theLoai"
        >
          <option value="" disabled>-- Chọn Thể Loại --</option>
          <option value="Trinh thám">🕵️ Trinh thám & Bí ẩn</option>
          <option value="Kỹ năng">🌱 Kỹ năng & Phát triển</option>
          <option value="Văn học Việt Nam">🇻🇳 Văn học Việt</option>
          <option value="Thiếu nhi">📖 Truyện & Thiếu nhi</option>
        </Field>
        <ErrorMessage name="S_theLoai" class="form-error" />
      </div>

      <!-- Image URL (S_hinhAnh) -->
      <div class="col-md-6 form-group">
        <label for="S_hinhAnh"><i class="fas fa-image mr-1"></i> Link hình ảnh sách (URL)</label>
        <Field
          name="S_hinhAnh"
          type="text"
          class="form-control"
          v-model="bookLocal.S_hinhAnh"
          placeholder="Dán đường dẫn URL hình ảnh bìa sách vào đây..."
        />
        <ErrorMessage name="S_hinhAnh" class="form-error" />
        
        <!-- Preview image -->
        <div v-if="bookLocal.S_hinhAnh" class="mt-2">
          <img 
            :src="bookLocal.S_hinhAnh" 
            @error="handleImageError" 
            alt="Preview" 
            style="width: 80px; height: 110px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-color);" 
          />
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="row mt-3">
      <div class="col-md-12 form-group">
        <label for="S_tomTat"><i class="fas fa-file-alt mr-1"></i> Tóm tắt sách</label>
        <Field
          name="S_tomTat"
          as="textarea"
          rows="3"
          class="form-control"
          v-model="bookLocal.S_tomTat"
          placeholder="Nhập tóm tắt sơ lược..."
        />
        <ErrorMessage name="S_tomTat" class="form-error" />
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-4 pt-3 border-top-glow d-flex justify-content-end">
      <button type="button" @click="$emit('cancel')" class="btn btn-outline-light mr-2 rounded-pill px-4">
        Hủy bỏ
      </button>
      <button type="submit" class="btn btn-glass rounded-pill px-4">
        <i class="fas fa-save mr-1"></i> Lưu thông tin
      </button>
    </div>
  </Form>
</template>

<script>
import { ref, onMounted } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import NhaXuatBanService from "../services/nhaxuatban.service";

export default {
  name: "SachForm",
  components: {
    Form,
    Field,
    ErrorMessage
  },
  props: {
    book: {
      type: Object,
      default: () => ({
        S_ten: "",
        S_tacGia: "",
        S_donGia: 0,
        S_soQuyen: 0,
        S_namXB: new Date().getFullYear(),
        S_nxb: "",
        S_tomTat: "",
        S_viTri: "",
        S_theLoai: "",
        S_hinhAnh: ""
      })
    }
  },
  emits: ["submit", "cancel"],
  setup(props, { emit }) {
    const bookLocal = ref({ ...props.book });
    const publishers = ref([]);

    const bookFormSchema = yup.object().shape({
      S_ten: yup.string().required("Tên sách là bắt buộc."),
      S_tacGia: yup.string().required("Tên tác giả là bắt buộc."),
      S_donGia: yup
        .number()
        .typeError("Đơn giá phải là số.")
        .required("Đơn giá là bắt buộc.")
        .positive("Đơn giá phải lớn hơn 0."),
      S_soQuyen: yup
        .number()
        .typeError("Số lượng phải là số.")
        .required("Số quyển là bắt buộc.")
        .min(0, "Số quyển không được nhỏ hơn 0."),
      S_namXB: yup
        .number()
        .typeError("Năm xuất bản phải là số.")
        .required("Năm xuất bản là bắt buộc.")
        .min(1900, "Năm xuất bản không hợp lệ.")
        .max(new Date().getFullYear() + 1, "Năm xuất bản không hợp lệ."),
      S_nxb: yup.string().required("Vui lòng chọn nhà xuất bản."),
      S_viTri: yup.string().required("Vui lòng nhập vị trí kệ sách."),
      S_tomTat: yup.string().required("Vui lòng nhập tóm tắt sách."),
      S_theLoai: yup.string().required("Vui lòng chọn thể loại sách."),
      S_hinhAnh: yup.string().url("Link ảnh phải là URL hợp lệ.").nullable()
    });

    onMounted(async () => {
      try {
        publishers.value = await NhaXuatBanService.getAll();
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhà xuất bản:", error);
      }
    });

    const submitBook = () => {
      emit("submit", bookLocal.value);
    };

    const handleImageError = (e) => {
      e.target.src = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400";
    };

    return {
      bookLocal,
      publishers,
      bookFormSchema,
      submitBook,
      handleImageError
    };
  }
};
</script>

<style scoped>
.border-top-glow {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
