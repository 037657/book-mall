<template>
  <div class="toasts">
    <transition-group name="toast">
      <div v-for="t in uiStore.toasts" :key="t.id" class="toast" :class="t.type">
        {{ t.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useUiStore } from '../stores/ui';
const uiStore = useUiStore();
</script>

<style scoped>
.toasts {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}
.toast {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  box-shadow: var(--shadow-hover);
  color: #fff;
  background: #444;
}
.toast.success {
  background: var(--success);
}
.toast.error {
  background: var(--danger);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
