import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
  }),
  actions: {
    toast(message, type = 'info') {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 3000);
    },
    success(m) {
      this.toast(m, 'success');
    },
    error(m) {
      this.toast(m, 'error');
    },
  },
});
