import { defineStore } from 'pinia';
import api from '../api';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  getters: {
    count: (s) => s.items.reduce((sum, i) => sum + i.quantity, 0),
    total: (s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  },
  actions: {
    async fetch() {
      const res = await api.get('/cart');
      this.items = res.data;
    },
    async add(bookId, quantity = 1) {
      await api.post('/cart', { bookId, quantity });
      await this.fetch();
    },
    async updateQty(bookId, quantity) {
      await api.put(`/cart/${bookId}`, { quantity });
      await this.fetch();
    },
    async remove(bookId) {
      await api.delete(`/cart/${bookId}`);
      await this.fetch();
    },
    async clear() {
      await api.delete('/cart');
      this.items = [];
    },
  },
});
