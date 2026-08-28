<template>
  <div class="container">
    <h1 class="page-title">我的订单</h1>

    <div v-if="orders.length" class="list">
      <div v-for="o in orders" :key="o.id" class="order card">
        <div class="order-head">
          <span class="small muted">订单号：{{ o.order_no }}</span>
          <span class="badge" :class="`badge-${statusMap[o.status]?.type || 'muted'}`">
            {{ statusMap[o.status]?.text || o.status }}
          </span>
        </div>
        <div class="order-body">
          <div v-for="it in o.items" :key="it.id" class="order-item">
            <span class="item-title">{{ it.title }}</span>
            <span class="small muted">× {{ it.quantity }}</span>
            <span>¥{{ (it.price * it.quantity).toFixed(2) }}</span>
          </div>
        </div>
        <div class="order-foot">
          <span class="muted small">下单时间：{{ formatDateTime(o.created_at) }}</span>
          <div class="foot-right">
            <span class="price">合计 ¥{{ o.total_amount.toFixed(2) }}</span>
            <button v-if="o.status === 'pending'" class="btn btn-ghost btn-sm" @click="cancel(o)">取消</button>
            <button v-if="o.status === 'pending'" class="btn btn-primary btn-sm" @click="pay(o)">去支付</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty">暂无订单</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import { formatDateTime, orderStatusMap } from '../utils/format';
import { useUiStore } from '../stores/ui';

const uiStore = useUiStore();
const orders = ref([]);
const statusMap = orderStatusMap;

async function load() {
  const res = await api.get('/orders/my');
  orders.value = res.data;
}

async function pay(o) {
  try {
    await api.post(`/orders/${o.order_no}/pay`);
    uiStore.success('支付成功');
    load();
  } catch (e) {
    uiStore.error(e.message);
  }
}

async function cancel(o) {
  try {
    await api.post(`/orders/${o.order_no}/cancel`);
    uiStore.success('订单已取消');
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
.order-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.order-body {
  padding: 12px 0;
}
.order-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0;
  font-size: 14px;
}
.item-title {
  flex: 1;
}
.order-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.foot-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
