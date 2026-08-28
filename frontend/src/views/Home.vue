<template>
  <div class="container">
    <section class="hero">
      <div class="hero-text">
        <h1>墨香书坊</h1>
        <p>借阅 · 购买 · 一站式图书服务，让好书触手可及</p>
        <div class="hero-actions">
          <router-link to="/books" class="btn btn-primary btn-lg">开始浏览</router-link>
          <router-link to="/books?sort=newest" class="btn btn-outline btn-lg">新书上架</router-link>
        </div>
      </div>
      <div class="hero-deco">
        <div class="deco-book b1">书</div>
        <div class="deco-book b2">卷</div>
        <div class="deco-book b3">香</div>
      </div>
    </section>

    <section>
      <h2 class="section-title">分类浏览</h2>
      <div class="categories">
        <button class="chip" :class="{ active: !currentCategory }" @click="goCategory('')">全部</button>
        <button
          v-for="c in categories"
          :key="c.category"
          class="chip"
          :class="{ active: currentCategory === c.category }"
          @click="goCategory(c.category)"
        >
          {{ c.category }}
        </button>
      </div>
    </section>

    <section>
      <h2 class="section-title">
        新书上架
        <router-link class="more" to="/books?sort=newest">更多 ›</router-link>
      </h2>
      <div v-if="newBooks.length" class="grid">
        <BookCard v-for="b in newBooks" :key="b.id" :book="b" />
      </div>
      <div v-else class="empty">暂无图书</div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import BookCard from '../components/BookCard.vue';

const router = useRouter();
const categories = ref([]);
const newBooks = ref([]);
const currentCategory = ref('');

async function load() {
  const [catRes, bookRes] = await Promise.all([
    api.get('/books/categories'),
    api.get('/books', { params: { pageSize: 10, sort: 'newest' } }),
  ]);
  categories.value = catRes.data;
  newBooks.value = bookRes.data.rows;
}

function goCategory(cat) {
  currentCategory.value = cat;
  router.push({ path: '/books', query: cat ? { category: cat } : {} });
}

onMounted(load);
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin: 24px 0 32px;
  padding: 40px;
  background: linear-gradient(120deg, #8b5a2b, #b8865a);
  border-radius: var(--radius-lg);
  color: #fff;
  overflow: hidden;
}
.hero-text h1 {
  font-size: 34px;
  font-weight: 600;
  margin-bottom: 10px;
}
.hero-text p {
  font-size: 16px;
  opacity: 0.92;
  margin-bottom: 22px;
}
.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.hero .btn-outline {
  border-color: #fff;
  color: #fff;
}
.hero .btn-outline:hover {
  background: rgba(255, 255, 255, 0.15);
}
.hero-deco {
  display: flex;
  gap: 14px;
}
.deco-book {
  width: 72px;
  height: 96px;
  border-radius: 6px 12px 12px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: #fff;
  box-shadow: inset -6px 0 0 rgba(0, 0, 0, 0.15);
}
.b1 {
  background: #a0522d;
  transform: rotate(-6deg);
}
.b2 {
  background: #6f4720;
  transform: translateY(8px);
}
.b3 {
  background: #8d6e63;
  transform: rotate(6deg);
}
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.chip {
  padding: 8px 18px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 14px;
  transition: all 0.15s;
}
.chip:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: 18px;
}

@media (max-width: 768px) {
  .hero {
    padding: 28px 22px;
  }
  .hero-text h1 {
    font-size: 26px;
  }
  .hero-deco {
    display: none;
  }
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}
</style>
