<template>
  <div>
    <div class="flex-between mb-16">
      <h1 class="page-title" style="margin: 0">图书管理</h1>
      <button class="btn btn-primary" @click="openCreate">新增图书</button>
    </div>

    <div class="table-wrap card">
      <table class="table">
        <thead>
          <tr>
            <th>书名</th>
            <th>作者</th>
            <th>分类</th>
            <th>售价</th>
            <th>可借</th>
            <th>可售</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in books" :key="b.id">
            <td class="td-title">{{ b.title }}</td>
            <td>{{ b.author }}</td>
            <td>{{ b.category }}</td>
            <td>¥{{ b.price.toFixed(2) }}</td>
            <td>{{ b.borrow_stock }}</td>
            <td>{{ b.sale_stock }}</td>
            <td>
              <span class="badge" :class="b.status === 'on' ? 'badge-success' : 'badge-muted'">
                {{ b.status === 'on' ? '在售' : '下架' }}
              </span>
            </td>
            <td>
              <div class="ops">
                <button class="btn btn-ghost btn-sm" @click="openEdit(b)">编辑</button>
                <button class="btn btn-ghost btn-sm" @click="toggle(b)">
                  {{ b.status === 'on' ? '下架' : '上架' }}
                </button>
                <button class="btn btn-danger btn-sm" @click="remove(b)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="modal-mask" @click.self="showForm = false">
      <div class="modal card">
        <h3>{{ editing ? '编辑图书' : '新增图书' }}</h3>
        <div class="form-grid">
          <div class="field">
            <label>书名</label>
            <input v-model="form.title" class="input" />
          </div>
          <div class="field">
            <label>作者</label>
            <input v-model="form.author" class="input" />
          </div>
          <div class="field">
            <label>分类</label>
            <input v-model="form.category" class="input" placeholder="如：文学小说" />
          </div>
          <div class="field">
            <label>售价（¥）</label>
            <input v-model.number="form.price" class="input" type="number" min="0" step="0.01" />
          </div>
          <div class="field">
            <label>可借库存</label>
            <input v-model.number="form.borrow_stock" class="input" type="number" min="0" />
          </div>
          <div class="field">
            <label>可售库存</label>
            <input v-model.number="form.sale_stock" class="input" type="number" min="0" />
          </div>
          <div class="field">
            <label>出版社</label>
            <input v-model="form.publisher" class="input" />
          </div>
          <div class="field">
            <label>出版年份</label>
            <input v-model="form.published_at" class="input" />
          </div>
          <div class="field full">
            <label>封面图片 URL（可选）</label>
            <input v-model="form.cover" class="input" placeholder="留空则使用自动生成的封面" />
          </div>
          <div class="field full">
            <label>简介</label>
            <textarea v-model="form.description" class="textarea"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showForm = false">取消</button>
          <button class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../../api';
import { useUiStore } from '../../stores/ui';

const uiStore = useUiStore();
const books = ref([]);
const showForm = ref(false);
const editing = ref(null);
const saving = ref(false);

const emptyForm = () => ({
  title: '',
  author: '',
  category: '',
  price: 0,
  borrow_stock: 0,
  sale_stock: 0,
  cover: '',
  description: '',
  isbn: '',
  publisher: '',
  published_at: '',
});
const form = reactive(emptyForm());

async function load() {
  const res = await api.get('/admin/books', { params: { pageSize: 50 } });
  books.value = res.data.rows;
}

function openCreate() {
  editing.value = null;
  Object.assign(form, emptyForm());
  showForm.value = true;
}

function openEdit(b) {
  editing.value = b;
  Object.assign(form, { ...emptyForm(), ...b });
  showForm.value = true;
}

async function save() {
  if (!form.title || !form.author || !form.category) {
    uiStore.error('请填写书名、作者、分类');
    return;
  }
  saving.value = true;
  try {
    if (editing.value) {
      await api.put(`/admin/books/${editing.value.id}`, { ...form });
      uiStore.success('更新成功');
    } else {
      await api.post('/admin/books', { ...form });
      uiStore.success('新增成功');
    }
    showForm.value = false;
    load();
  } catch (e) {
    uiStore.error(e.message);
  } finally {
    saving.value = false;
  }
}

async function toggle(b) {
  const status = b.status === 'on' ? 'off' : 'on';
  try {
    await api.patch(`/admin/books/${b.id}/status`, { status });
    load();
  } catch (e) {
    uiStore.error(e.message);
  }
}

async function remove(b) {
  if (!window.confirm(`确定删除《${b.title}》吗？`)) return;
  try {
    await api.delete(`/admin/books/${b.id}`);
    uiStore.success('删除成功');
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
.td-title {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ops {
  display: flex;
  gap: 6px;
}
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}
.modal {
  width: 560px;
  max-width: 100%;
  max-height: 90dvh;
  overflow-y: auto;
}
.modal h3 {
  font-size: 18px;
  margin-bottom: 16px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}
.field.full {
  grid-column: 1 / -1;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
