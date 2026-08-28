<template>
  <div>
    <div class="flex-between mb-16">
      <h1 class="page-title" style="margin: 0">借阅管理</h1>
      <select v-model="status" class="select" style="width: 150px" @change="load">
        <option value="">全部状态</option>
        <option value="borrowed">借阅中</option>
        <option value="overdue">已逾期</option>
        <option value="returned">已归还</option>
      </select>
    </div>

    <div class="table-wrap card">
      <table class="table">
        <thead>
          <tr>
            <th>用户</th>
            <th>图书</th>
            <th>借阅日期</th>
            <th>应还日期</th>
            <th>状态</th>
            <th>罚款</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in records" :key="r.id" :class="{ overdue: r.status === 'overdue' }">
            <td>{{ r.user_name }}<br /><span class="small muted">{{ r.email }}</span></td>
            <td>{{ r.title }}</td>
            <td>{{ formatDate(r.borrow_date) }}</td>
            <td>{{ formatDate(r.due_date) }}</td>
            <td>
              <span class="badge" :class="`badge-${statusMap[r.status]?.type || 'muted'}`">
                {{ statusMap[r.status]?.text || r.status }}
              </span>
            </td>
            <td>{{ r.fine > 0 ? '¥' + r.fine.toFixed(2) : '-' }}</td>
            <td>
              <button v-if="r.status !== 'returned'" class="btn btn-primary btn-sm" @click="doReturn(r)">
                办理归还
              </button>
              <span v-else class="small muted">-</span>
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
import { formatDate, borrowStatusMap } from '../../utils/format';
import { useUiStore } from '../../stores/ui';

const uiStore = useUiStore();
const records = ref([]);
const status = ref('');
const statusMap = borrowStatusMap;

async function load() {
  const res = await api.get('/admin/borrows', { params: { status: status.value } });
  records.value = res.data;
}

async function doReturn(r) {
  try {
    const res = await api.post(`/admin/borrows/${r.id}/return`);
    uiStore.success(res.data.fine > 0 ? `已归还，罚款 ¥${res.data.fine}` : '已办理归还');
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
tr.overdue td {
  background: var(--danger-bg);
}
</style>
