import { ref, onMounted, onUnmounted } from "vue";
import api from "@/services/api";
import { useAuthStore } from "@/stores/auth";

export function useNotifications() {
  const auth = useAuthStore();
  const unreadCount = ref(0);
  const notifications = ref([]);
  let pollTimer = null;

  async function fetchUnread() {
    try {
      const { data } = await api.get("/notifications/unread-count");
      unreadCount.value = data.data?.count || 0;
    } catch {}
  }

  async function fetchAll() {
    try {
      const { data } = await api.get("/notifications", {
        params: { per_page: 5, lu: 0 },
      });
      notifications.value = data.data?.data || [];
    } catch {}
  }

  function startPolling() {
    fetchUnread();
    fetchAll();
    pollTimer = setInterval(() => {
      fetchUnread();
      fetchAll();
    }, 30000); // toutes les 30 secondes
  }

  function stopPolling() {
    clearInterval(pollTimer);
  }

  onMounted(() => startPolling());
  onUnmounted(() => stopPolling());

  return { unreadCount, notifications, fetchUnread, fetchAll };
}
