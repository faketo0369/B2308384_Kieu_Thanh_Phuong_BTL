import { createWebHistory, createRouter } from "vue-router";
import TrangHome from "../views/TrangHome.vue";
import { store } from "../store";
import MainLayout from "../layouts/MainLayout.vue";

const routes = [
    {
        path: "/",
        component: MainLayout,
        children: [
            {
                path: "",
                name: "home",
                component: TrangHome,
            },
            {
                path: "admin/dashboard",
                name: "admin-dashboard",
                component: () => import("../views/AdminDashboard.vue"),
                meta: { requiresStaff: true }
            },
            {
                path: "muonsach",
                name: "muonsach",
                component: () => import("../views/TrangMuonSach.vue"),
                meta: { requiresAuth: true }
            },
            {
                path: "admin/muonsach",
                name: "admin-muonsach",
                component: () => import("../views/TrangMuonSach.vue"),
                meta: { requiresStaff: true }
            },
            {
                path: "admin/sach",
                name: "admin-sach",
                component: () => import("../views/TrangSach.vue"),
                meta: { requiresStaff: true }
            },
            {
                path: "admin/nxb",
                name: "admin-nxb",
                component: () => import("../views/TrangNXB.vue"),
                meta: { requiresStaff: true }
            },
            {
                path: "admin/docgia",
                name: "admin-docgia",
                component: () => import("../views/TrangDocGia.vue"),
                meta: { requiresStaff: true }
            },
            {
                path: "admin/nhanvien",
                name: "admin-nhanvien",
                component: () => import("../views/TrangNhanVien.vue"),
                meta: { requiresManager: true }
            },
            {
                path: "profile",
                name: "profile",
                component: () => import("../views/TrangProfile.vue"),
                meta: { requiresAuth: true }
            }
        ]
    },
    {
        path: "/login",
        name: "login",
        component: () => import("../views/Login.vue"),
    },
    {
        path: "/register",
        name: "register",
        component: () => import("../views/Register.vue"),
    },
    {
        path: "/admin/login",
        redirect: "/login"
    },
    {
        path: "/:pathMatch(.*)*",
        name: "notfound",
        component: () => import("../views/NotFound.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// Guard routes based on roles
router.beforeEach((to, from, next) => {
    // 1. Manager role restriction
    if (to.meta.requiresManager) {
        if (store.userType === "staff" && store.user?.nv_chucVu === "Quản lý") {
            next();
        } else {
            next({ name: "login" });
        }
    }
    // 2. Staff role restriction
    else if (to.meta.requiresStaff) {
        if (store.userType === "staff") {
            next();
        } else {
            next({ name: "login" });
        }
    }
    // 3. Simple logged in check (DocGia or NhanVien)
    else if (to.meta.requiresAuth) {
        if (store.user) {
            next();
        } else {
            next({ name: "login" });
        }
    }
    else {
        next();
    }
});

export default router;
