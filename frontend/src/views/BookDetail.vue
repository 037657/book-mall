<template>
  <div class="container" v-if="book">
    <div class="detail">
      <div class="cover-wrap">
        <BookCover :book="book" />
      </div>

      <div class="info">
        <h1 class="title">{{ book.title }}</h1>
        <p class="author">{{ book.author }} · {{ book.category }}</p>

        <div class="price-row">
          <span class="price">¥{{ formatPrice(book.price) }}</span>
          <span v-if="book.borrow_stock > 0" class="badge badge-info">可借阅 {{ book.borrow_stock }} 本</span>
          <span v-else class="badge badge-muted">暂不可借</span>
        </div>

        <div class="stock muted small">
          <span>可售库存：{{ book.sale_stock }} 件</span>
          <span v-if="book.publisher">· {{ book.publisher }}</span>
          <span v-if="book.published_at">· {{ book.published_at }}</span>
        </div>

        <div class="desc">
          <h3>内容简介</h3>
          <p>{{ book.description || '暂无简介' }}</p>
        </div>

        <div class="actions">
          <button class="btn btn-primary btn-lg" :disabled="book.borrow_stock <= 0" @click="borrow">
            借阅
          </button>
          <button class="btn btn-outline btn-lg" @click="addToCart">加入购物车</button>
          <button class="btn btn-ghost btn-lg" @click="buyNow">立即购买</button>
        </div>

        <p class="hint muted small">借阅规则：每人最多同时借 3 本，借期 14 天，可续借 1 次（+7 天），逾期每天 ¥0.5。</p>
      </div>
    </div>
  </div>
  <div v-else-if="notFound" class="empty">图书不存在或已下架</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api';
import BookCover from '../components/BookCover.vue';
import { useUserStore } from '../stores/user';
import { useCartStore } from '../stores/cart';
import { useUiStore } from '../stores/ui';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();
const uiStore = useUiStore();

const book = ref(null);
const notFound = ref(false);

function formatPrice(n) {
  return Number(n).toFixed(2);
}

function requireLogin() {
  if (!userStore.isLoggedIn) {
    uiStore.error('请先登录');
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return false;
  }
  return true;
}

async function borrow() {
  if (!requireLogin()) return;
  try {
    const res = await api.post(`/borrows/${book.value.id}`);
    const d = new Date(res.data.due_date).toLocaleDateString('zh-CN');
    uiStore.success(`借阅成功，请于 ${d} 前归还`);
  } catch (e) {
    uiStore.error(e.message);
  }
}

async function addToCart() {
  if (!requireLogin()) return;
  try {
    await cartStore.add(book.value.id, 1);
    uiStore.success('已加入购物车');
  } catch (e) {
    uiStore.error(e.message);
  }
}

async function buyNow() {
  if (!requireLogin()) return;
  try {
    await cartStore.add(book.value.id, 1);
    router.push('/checkout');
  } catch (e) {
    uiStore.error(e.message);
  }
}

onMounted(async () => {
  try {
    const res = await api.get(`/books/${route.params.id}`);
    book.value = res.data;
  } catch (e) {
    notFound.value = true;
  }
});
</script>

<style scoped>
.detail {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 36px;
  padding: 24px 0;
}
.cover-wrap {
  max-width: 280px;
}
.title {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.35;
}
.author {
  color: var(--text-secondary);
  margin: 8px 0 16px;
}
.price-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}
.price {
  font-size: 28px;
  color: var(--danger);
  font-weight: 600;
}
.stock {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.desc {
  margin-bottom: 24px;
}
.desc h3 {
  font-size: 15px;
  margin-bottom: 8px;
}
.desc p {
  color: var(--text-secondary);
  line-height: 1.8;
}
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.hint {
  color: var(--text-muted);
}
@media (max-width: 768px) {
  .detail {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .cover-wrap {
    max-width: 200px;
  }
}
</style>
