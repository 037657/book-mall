<template>
  <div class="book-card" @click="$router.push(`/books/${book.id}`)">
    <BookCover :book="book" />
    <div class="info">
      <h3 class="title">{{ book.title }}</h3>
      <p class="author">{{ book.author }}</p>
      <div class="meta">
        <span class="price">¥{{ formatPrice(book.price) }}</span>
        <span v-if="book.borrow_stock > 0" class="badge badge-info">可借阅</span>
        <span v-else class="badge badge-muted">仅售</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import BookCover from './BookCover.vue';

defineProps({ book: { type: Object, required: true } });

function formatPrice(n) {
  return Number(n).toFixed(2);
}
</script>

<style scoped>
.book-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.book-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}
.info {
  padding: 12px 14px;
}
.title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.author {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 4px 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.price {
  color: var(--danger);
  font-weight: 600;
  font-size: 15px;
}
</style>
