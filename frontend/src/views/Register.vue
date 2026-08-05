<template>
  <div class="container py-5 d-flex justify-content-center align-items-center">
    <div class="card glass-panel p-5 register-card animate-fade-in col-md-8 col-lg-7">
      <div class="text-center mb-4">
        <i class="fas fa-user-plus fa-3x text-primary mb-3"></i>
        <h3 class="font-weight-bold text-white">Đăng Ký Tài Khoản Độc Giả</h3>
        <p class="text-secondary text-sm">Điền thông tin của bạn để bắt đầu mượn sách trực tuyến.</p>
      </div>

      <div v-if="success" class="alert alert-success-custom text-sm mb-3">
        <i class="fas fa-check-circle mr-2"></i> {{ success }}
      </div>
      <div v-if="error" class="alert alert-danger-custom text-sm mb-3">
        <i class="fas fa-exclamation-circle mr-2"></i> {{ error }}
      </div>

      <Form @submit="handleRegister" :validation-schema="registerSchema" v-slot="{ errors }">
        <div class="row">
          <div class="col-md-6 form-group">
            <label for="DG_hoLot">Họ lót</label>
            <Field name="DG_hoLot" type="text" class="form-control" placeholder="Ví dụ: Nguyễn Văn" />
            <ErrorMessage name="DG_hoLot" class="form-error" />
          </div>

          <div class="col-md-6 form-group">
            <label for="DG_ten">Tên</label>
            <Field name="DG_ten" type="text" class="form-control" placeholder="Ví dụ: An" />
            <ErrorMessage name="DG_ten" class="form-error" />
          </div>
        </div>

        <div class="row mt-2">
          <div class="col-md-4 form-group">
            <label for="DG_sdt">Số điện thoại</label>
            <Field name="DG_sdt" type="text" class="form-control" placeholder="Nhập số điện thoại..." />
            <ErrorMessage name="DG_sdt" class="form-error" />
          </div>

          <div class="col-md-4 form-group">
            <label for="DG_cccd">Số CCCD</label>
            <Field name="DG_cccd" type="text" class="form-control" placeholder="Nhập 12 số CCCD..." />
            <ErrorMessage name="DG_cccd" class="form-error" />
          </div>

          <div class="col-md-4 form-group">
            <label for="DG_ngaySinh">Ngày sinh</label>
            <Field name="DG_ngaySinh" type="date" class="form-control" />
            <ErrorMessage name="DG_ngaySinh" class="form-error" />
          </div>
        </div>

        <div class="row mt-2">
          <div class="col-md-6 form-group">
            <label for="DG_phai">Phái</label>
            <Field name="DG_phai" as="select" class="form-control form-select">
              <option value="" disabled>-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </Field>
            <ErrorMessage name="DG_phai" class="form-error" />
          </div>

          <div class="col-md-6 form-group">
            <label for="DG_diaChi">Địa chỉ</label>
            <Field name="DG_diaChi" type="text" class="form-control" placeholder="Nhập địa chỉ..." />
            <ErrorMessage name="DG_diaChi" class="form-error" />
          </div>
        </div>

        <div class="row mt-2">
          <div class="col-md-6 form-group">
            <label for="DG_password">Mật khẩu</label>
            <Field name="DG_password" type="password" class="form-control" placeholder="Nhập mật khẩu..." />
            <ErrorMessage name="DG_password" class="form-error" />
          </div>

          <div class="col-md-6 form-group">
            <label for="ConfirmPassword">Xác nhận mật khẩu</label>
            <Field name="ConfirmPassword" type="password" class="form-control" placeholder="Nhập lại mật khẩu..." />
            <ErrorMessage name="ConfirmPassword" class="form-error" />
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-block mt-4 rounded-pill py-2 font-weight-bold" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
          Đăng Ký Ngay
        </button>
      </Form>

      <div class="text-center mt-4">
        <span class="text-secondary">Đã có tài khoản? </span>
        <router-link to="/login" class="login-link font-weight-bold">Đăng nhập tại đây</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import DocGiaService from "../services/docgia.service";

export default {
  name: "Register",
  components: {
    Form,
    Field,
    ErrorMessage
  },
  setup() {
    const router = useRouter();
    const error = ref(null);
    const success = ref(null);
    const loading = ref(false);

    const registerSchema = yup.object().shape({
      DG_hoLot: yup.string().required("Họ lót là bắt buộc."),
      DG_ten: yup.string().required("Tên là bắt buộc."),
      DG_sdt: yup
        .string()
        .required("Số điện thoại là bắt buộc.")
        .matches(/^[0-9]{10}$/, "Số điện thoại phải gồm 10 số."),
      DG_cccd: yup
        .string()
        .required("Số CCCD là bắt buộc.")
        .matches(/^[0-9]{12}$/, "Số CCCD phải gồm 12 số."),
      DG_ngaySinh: yup.string().required("Ngày sinh là bắt buộc."),
      DG_phai: yup.string().required("Giới tính là bắt buộc."),
      DG_diaChi: yup.string().required("Địa chỉ là bắt buộc."),
      DG_password: yup
        .string()
        .required("Mật khẩu là bắt buộc.")
        .min(6, "Mật khẩu phải từ 6 ký tự trở lên."),
      ConfirmPassword: yup
        .string()
        .oneOf([yup.ref("DG_password"), null], "Mật khẩu xác nhận không khớp.")
        .required("Vui lòng xác nhận mật khẩu.")
    });

    const handleRegister = async (values) => {
      loading.value = true;
      error.value = null;
      success.value = null;
      try {
        const { ConfirmPassword, ...data } = values;
        await DocGiaService.register(data);
        success.value = "Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...";
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } catch (err) {
        error.value = err.response?.data?.message || "Đăng ký không thành công. Số điện thoại có thể đã tồn tại.";
      } finally {
        loading.value = false;
      }
    };

    return {
      error,
      success,
      loading,
      registerSchema,
      handleRegister
    };
  }
};
</script>

<style scoped>
.register-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.alert-success-custom {
  background: rgba(16, 185, 129, 0.12);
  color: #a7f3d0;
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
}
.alert-danger-custom {
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
}
.login-link {
  color: var(--accent-color);
  transition: all 0.25s ease;
}
.login-link:hover {
  color: var(--accent-hover);
  text-decoration: none;
}
</style>
