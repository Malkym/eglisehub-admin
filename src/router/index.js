import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  // Auth
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/LoginView.vue"),
    meta: { guest: true },
  },

  // App (protégées)
  {
    path: "/",
    component: () => import("@/components/layout/AppLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/dashboard" },
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/DashboardView.vue"),
      },
      {
        path: "pages",
        name: "Pages",
        component: () => import("@/views/pages/PagesView.vue"),
      },
      {
        path: "pages/new",
        name: "PageNew",
        component: () => import("@/views/pages/PageFormView.vue"),
      },
      {
        path: "pages/:id",
        name: "PageEdit",
        component: () => import("@/views/pages/PageFormView.vue"),
      },
      {
        path: "articles",
        name: "Articles",
        component: () => import("@/views/articles/ArticlesView.vue"),
      },
      {
        path: "articles/new",
        name: "ArticleNew",
        component: () => import("@/views/articles/ArticleFormView.vue"),
      },
      {
        path: "articles/:id",
        name: "ArticleEdit",
        component: () => import("@/views/articles/ArticleFormView.vue"),
      },
      {
        path: "events",
        name: "Events",
        component: () => import("@/views/events/EventsView.vue"),
      },
      {
        path: "events/new",
        name: "EventNew",
        component: () => import("@/views/events/EventFormView.vue"),
      },
      {
        path: "events/:id",
        name: "EventEdit",
        component: () => import("@/views/events/EventFormView.vue"),
      },
      {
        path: "media",
        name: "Media",
        component: () => import("@/views/media/MediaView.vue"),
      },
      {
        path: "messages",
        name: "Messages",
        component: () => import("@/views/messages/MessagesView.vue"),
      },
      {
        path: "faq",
        name: "Faq",
        component: () => import("@/views/settings/FaqView.vue"),
      },
      {
        path: "sliders",
        name: "Sliders",
        component: () => import("@/views/settings/SlidersView.vue"),
      },
      {
        path: "settings",
        name: "Settings",
        component: () => import("@/views/settings/SettingsView.vue"),
      },
      {
        path: "users",
        name: "Users",
        component: () => import("@/views/users/UsersView.vue"),
      },
      //   Super admin
      {
        path: "admin/ministeres",
        name: "Ministeres",
        component: () => import("@/views/dashboard/MinisteresView.vue"),
        meta: { superAdmin: true },
      },
    ],
  },

  { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard global
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next("/login");
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return next("/dashboard");
  }

  if (to.meta.superAdmin && !auth.isSuperAdmin) {
    return next("/dashboard");
  }

  next();
});

export default router;
