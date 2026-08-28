<template>
  <div v-if="total > pageSize" class="pagination">
    <button class="page-btn" :disabled="page <= 1" @click="$emit('change', page - 1)">上一页</button>
    <span v-for="p in pages" :key="p" class="page-num" :class="{ active: p === page }" @click="p !== page && $emit('change', p)">
      {{ p }}
    </span>
    <button class="page-btn" :disabled="page >= totalPages" @click="$emit('change', page + 1)">下一页</button>
    <span class="small muted">共 {{ total }} 条</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 12 },
  total: { type: Number, default: 0 },
});
defineEmits(['change']);

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));

const pages = computed(() => {
  const n = totalPages.value;
  const current = props.page;
  const set = new Set([1, n, current, current - 1, current + 1]);
  const arr = [...set].filter((p) => p >= 1 && p <= n).sort((a, b) => a - b);
  return arr;
});
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 28px;
  flex-wrap: wrap;
}
.page-btn {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-num {
  min-width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  color: var(--text-secondary);
}
.page-num:hover {
  background: var(--primary-light);
}
.page-num.active {
  background: var(--primary);
  color: #fff;
}
</style>
