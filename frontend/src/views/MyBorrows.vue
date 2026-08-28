<template>
  <div class="container">
    <h1 class="page-title">我的借阅</h1>

    <div v-if="records.length" class="list">
      <div v-for="r in records" :key="r.id" class="record card">
        <div class="cover" @click="$router.push(`/books/${r.book_id}`)">
          <BookCover :book="{ title: r.title, author: r.author, category: r.category, cover: r.cover }" />
        </div>
        <div class="info">
          <router-link :to="`/books/${r.book_id}`" class="title">{{ r.title }}</router-link>
          <p class="muted small">{{ r.author }}</p>
          <div class="dates small muted">
            <span>借阅：{{ formatDate(r.borrow_date) }}</span>
            <span>应还：{{ formatDate(r.due_date) }}</span>
            <span v-if="r.return_date">归还：{{ formatDate(r.return_date) }}</span>
          </div>
          <div class="tags">
            <span class="badge" :class="statusMap[r.status]?.type ? `badge-${statusMap[r.status].type}` : 'badge-muted'">
              {{ statusMap[r.status]?.text || r.status }}
            </span>
            <span v-if="r.renew_count > 0" class="badge badge-muted">已续借 {{ r.renew_count }} 次</span>
            <span v-if="r.fine > 0" class="badge badge-danger">罚款 ¥{{ r.fine.toFixed(2) }}</span>
          </div>
        </div>
        <div class="actions">
          <button
            v-if="r.status === 'borrowed' && r.renew_count < 1"
            class="btn btn-outline btn-sm"
            @click="renew(r)"
          >
            续借
          </button>
          <button v-if="r.status !== 'returned'" class="btn btn-primary btn-sm" @click="returnBook(r)">归还</button>
        </div>
      </div>
    </div>
    <div v-else class="empty">暂无借阅记录</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import BookCover from '../components/BookCover.vue';
import { formatDate, borrowStatusMap } from '../utils/format';
import { useUiStore } from '../stores/ui';

const uiStore = useUiStore();
const records = ref([]);
const statusMap = borrowStatusMap;

async function load() {
  const res = await api.get('/borrows/my');
  records.value = res.data;
}

async function renew(r) {
  try {
    const res = await api.post(`/borrows/${r.id}/renew`);
    uiStore.success(`续借成功，应还日期延长至 ${formatDate(res.data.due_date)}`);
    load();
  } catch (e) {
    uiStore.error(e.message);
  }
}

async function returnBook(r) {
  try {
    const res = await api.post(`/borrows/${r.id}/return`);
    uiStore.success(res.data.fine > 0 ? `归还成功，逾期罚款 ¥${res.data.fine}` : '归还成功');
    load();
  } catch (e) {
    uiStore.error(e.message);
  }
}

onMounted(load);
</script>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.record {
  display: flex;
  gap: 16px;
  align-items: center;
}
.cover {
  width: 64px;
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
.dates {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
@media (max-width: 768px) {
  .record {
    flex-wrap: wrap;
  }
  .actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
