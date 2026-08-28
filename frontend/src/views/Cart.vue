<template>
  <div class="container">
    <h1 class="page-title">购物车</h1>

    <div v-if="cartStore.items.length" class="cart-layout">
      <div class="list">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <div class="cover" @click="$router.push(`/books/${item.book_id}`)">
            <BookCover :book="item" />
          </div>
          <div class="info">
            <router-link :to="`/books/${item.book_id}`" class="title">{{ item.title }}</router-link>
            <p class="muted small">{{ item.author }}</p>
            <p class="price">¥{{ (item.price * item.quantity).toFixed(2) }}</p>
          </div>
          <div class="right">
            <div class="qty">
              <button class="qty-btn" @click="changeQty(item, item.quantity - 1)">-</button>
              <span class="qty-num">{{ item.quantity }}</span>
              <button class="qty-btn" @click="changeQty(item, item.quantity + 1)">+</button>
            </div>
            <button class="remove" @click="remove(item)">删除</button>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="clearAll">清空购物车</button>
      </div>

      <div class="summary card">
        <h3>订单摘要</h3>
        <div class="row"><span>商品件数</span><span>{{ cartStore.count }} 件</span></div>
        <div class="row"><span>商品金额</span><span>¥{{ cartStore.total.toFixed(2) }}</span></div>
        <div class="row total"><span>应付总额</span><span class="price">¥{{ cartStore.total.toFixed(2) }}</span></div>
        <router-link to="/checkout" class="btn btn-primary btn-block btn-lg mt-16">去结算</router-link>
      </div>
    </div>

    <div v-else class="empty">
      <p>购物车还是空的</p>
      <router-link to="/books" class="btn btn-primary mt-16">去逛逛</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import BookCover from '../components/BookCover.vue';
import { useCartStore } from '../stores/cart';
import { useUiStore } from '../stores/ui';

const cartStore = useCartStore();
const uiStore = useUiStore();

async function changeQty(item, qty) {
  if (qty < 1) return;
  try {
    await cartStore.updateQty(item.book_id, qty);
  } catch (e) {
    uiStore.error(e.message);
  }
}

async function remove(item) {
  try {
    await cartStore.remove(item.book_id);
  } catch (e) {
    uiStore.error(e.message);
  }
}

async function clearAll() {
  await cartStore.clear();
}

onMounted(() => cartStore.fetch().catch(() => {}));
</script>

<style scoped>
.cart-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cart-item {
  display: flex;
  gap: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px;
}
.cover {
  width: 80px;
  flex-shrink: 0;
  cursor: pointer;
}
.info {
  flex: 1;
}
.title {
  font-weight: 600;
  font-size: 15px;
}
.price {
  color: var(--danger);
  font-weight: 600;
  margin-top: 6px;
}
.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}
.qty {
  display: flex;
  align-items: center;
  gap: 4px;
}
.qty-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 6px;
  font-size: 16px;
}
.qty-num {
  min-width: 32px;
  text-align: center;
}
.remove {
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 13px;
}
.remove:hover {
  color: var(--danger);
}
.summary h3 {
  font-size: 16px;
  margin-bottom: 14px;
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
}
.row.total {
  border-top: 1px solid var(--border);
  color: var(--text);
  font-weight: 600;
  margin-top: 6px;
}
@media (max-width: 768px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}
</style>
