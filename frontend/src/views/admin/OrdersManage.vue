<template>
  <div>
    <div class="flex-between mb-16">
      <h1 class="page-title" style="margin: 0">订单管理</h1>
      <select v-model="status" class="select" style="width: 150px" @change="load">
        <option value="">全部状态</option>
        <option value="pending">待支付</option>
        <option value="paid">已支付</option>
        <option value="shipped">已发货</option>
        <option value="completed">已完成</option>
        <option value="cancelled">已取消</option>
      </select>
    </div>

    <div class="table-wrap card">
      <table class="table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>用户</th>
            <th>商品</th>
            <th>金额</th>
            <th>状态</th>
            <th>下单时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.id">
            <td class="small">{{ o.order_no }}</td>
            <td>{{ o.user_name }}</td>
            <td class="td-items">{{ o.items.map((i) => i.title).join('、') }}</td>
            <td>¥{{ o.total_amount.toFixed(2) }}</td>
            <td>
              <span class="badge" :class="`badge-${statusMap[o.status]?.type || 'muted'}`">
                {{ statusMap[o.status]?.text || o.status }}
              </span>
            </td>
            <td class="small">{{ formatDateTime(o.created_at) }}</td>
            <td>
              <div class="ops">
                <button v-if="o.status === 'paid'" class="btn btn-primary btn-sm" @click="ship(o)">发货</button>
                <button v-if="o.status === 'shipped'" class="btn btn-outline btn-sm" @click="complete(o)">完成</button>
                <span v-if="['pending', 'cancelled', 'completed'].includes(o.status)" class="small muted">-</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api';
import { formatDateTime, orderStatusMap } from '../../utils/format';
import { useUiStore } from '../../stores/ui';

const uiStore = useUiStore();
const orders = ref([]);
const status = ref('');
const statusMap = orderStatusMap;

async function load() {
  const res = await api.get('/admin/orders', { params: { status: status.value } });
  orders.value = res.data;
}

async function ship(o) {
  try {
    await api.post(`/admin/orders/${o.order_no}/ship`);
    uiStore.success('已发货');
    load();
  } catch (e) {
    uiStore.error(e.message);
  }
}

async function complete(o) {
  try {
    await api.post(`/admin/orders/${o.order_no}/complete`);
    uiStore.success('订单已完成');
    load();
  } catch (e) {
    uiStore.error(e.message);
  }
}

onMounted(load);
</script>

<style scoped>
.table-wrap {
  padding: 0;
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.table th,
.table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.table th {
  background: var(--surface-2);
  color: var(--text-secondary);
  font-weight: 500;
}
.td-items {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ops {
  display: flex;
  gap: 6px;
}
</style>
