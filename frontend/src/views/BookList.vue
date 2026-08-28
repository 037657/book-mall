<template>
  <div class="container">
    <h1 class="page-title">全部图书</h1>

    <div class="toolbar">
      <div class="categories">
        <button class="chip" :class="{ active: !filters.category }" @click="setCategory('')">全部</button>
        <button
          v-for="c in categories"
          :key="c.category"
          class="chip"
          :class="{ active: filters.category === c.category }"
          @click="setCategory(c.category)"
        >
          {{ c.category }}
        </button>
      </div>

      <div class="controls">
        <input
          v-model="filters.keyword"
          class="input search"
          type="search"
          placeholder="搜索书名 / 作者"
          @keyup.enter="applySearch"
        />
        <select v-model="filters.sort" class="select sort" @change="applySearch">
          <option value="newest">最新上架</option>
          <option value="price_asc">价格从低到高</option>
          <option value="price_desc">价格从高到低</option>
          <option value="hot">销量优先</option>
        </select>
      </div>
    </div>

    <div v-if="books.length" class="grid">
      <BookCard v-for="b in books" :key="b.id" :book="b" />
    </div>
    <div v-else-if="!loading" class="empty">没有找到相关图书</div>

    <Pagination :page="page" :page-size="pageSize" :total="total" @change="changePage" />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api';
import BookCard from '../components/BookCard.vue';
import Pagination from '../components/Pagination.vue';

const route = useRoute();
const router = useRouter();

const categories = ref([]);
const books = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = 12;
const loading = ref(false);

const filters = reactive({
  category: route.query.category || '',
  keyword: route.query.keyword || '',
  sort: route.query.sort || 'newest',
});

async function load() {
  loading.value = true;
  try {
    const res = await api.get('/books', {
      params: {
        category: filters.category || undefined,
        keyword: filters.keyword || undefined,
        sort: filters.sort,
        page: page.value,
        pageSize,
      },
    });
    books.value = res.data.rows;
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
}

function setCategory(cat) {
  filters.category = cat;
  page.value = 1;
  syncQuery();
  load();
}

function applySearch() {
  page.value = 1;
  syncQuery();
  load();
}

function changePage(p) {
  page.value = p;
  syncQuery();
  load();
}

function syncQuery() {
  router.replace({
    path: '/books',
    query: {
      category: filters.category || undefined,
      keyword: filters.keyword || undefined,
      sort: filters.sort || undefined,
    },
  });
}

// 响应 NavBar 搜索跳转过来的 query 变化
watch(
  () => route.query,
  (q) => {
    filters.category = q.category || '';
    filters.keyword = q.keyword || '';
    filters.sort = q.sort || 'newest';
    page.value = 1;
    load();
  }
);

onMounted(async () => {
  const res = await api.get('/books/categories');
  categories.value = res.data;
  load();
});
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.chip {
  padding: 7px 16px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 13px;
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
.controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.search {
  flex: 1;
  min-width: 200px;
}
.sort {
  width: 160px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: 18px;
}
@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}
</style>
