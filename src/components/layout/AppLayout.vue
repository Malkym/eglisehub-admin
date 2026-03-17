<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="page-container">
      <AppTopbar />
      <main class="page-content">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import { RouterView } from 'vue-router'
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #F8FAFC;
  width: 100%;
}

/* 🔥 STYLES MANQUANTS À AJOUTER */
.page-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;  /* Important pour éviter les débordements */
  width: 100%;
  background: #F8FAFC;
}

.page-content {
  flex: 1;
  padding: 24px 32px;
  width: 100%;
  max-width: none !important;  /* Supprime toute limite */
  box-sizing: border-box;
  overflow-x: auto;
}

/* Ajustement pour les très grands écrans */
@media (min-width: 1920px) {
  .page-content {
    padding: 28px 40px;
  }
}

/* Responsive */
@media (max-width: 1280px) {
  .page-content {
    padding: 20px 24px;
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 16px 20px;
  }
}

/* Transition */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>