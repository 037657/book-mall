<template>
  <div>
    <h1 class="page-title">数据看板</h1>

    <div class="stats">
      <div class="stat card">
        <span class="stat-label">图书总数</span>
        <span class="stat-value">{{ stats.bookCount }}</span>
      </div>
      <div class="stat card">
        <span class="stat-label">注册用户</span>
        <span class="stat-value">{{ stats.userCount }}</span>
      </div>
      <div class="stat card">
        <span class="stat-label">在借中</span>
        <span class="stat-value">{{ stats.activeBorrows }}</span>
      </div>
      <div class="stat card highlight">
        <span class="stat-label">逾期数</span>
        <span class="stat-value">{{ stats.overdueCount }}</span>
      </div>
      <div class="stat card">
        <span class="stat-label">累计借阅</span>
        <span class="stat-value">{{ stats.totalBorrows }}</span>
      </div>
      <div class="stat card">
        <span class="stat-label">订单总数</span>
        <span class="stat-value">{{ stats.orderCount }}</span>
      </div>
      <div class="stat card">
        <span class="stat-label">待支付订单</span>
        <span class="stat-value">{{ stats.pendingOrders }}</span>
      </div>
      <div class="stat card">
        <span class="stat-label">销售额（¥）</span>
        <span class="stat-value">{{ stats.revenue.toFixed(2) }}</span>
      </div>
      <div class="stat card">
        <span class="stat-label">售出数量</span>
        <span class="stat-value">{{ stats.totalSales }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import api from '../../api';

const stats = reactive({
  bookCount: 0,
  userCount: 0,
  activeBorrows: 0,
  overdueCount: 0,
  totalBorrows: 0,
  orderCount: 0,
  pendingOrders: 0,
  revenue: 0,
  totalSales: 0,
});

onMounted(async () => {
  const res = await api.get('/admin/stats');
  Object.assign(stats, res.data);
});
</script>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}
.stat-value {
  font-size: 28px;
  font-weight: 600;
}
.stat.highlight .stat-value {
  color: var(--danger);
}
</style>
