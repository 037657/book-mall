<template>
  <div class="admin">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">墨</span>
        <span>书坊后台</span>
      </div>
      <nav class="menu">
        <router-link to="/admin/dashboard" class="menu-link" active-class="active">数据看板</router-link>
        <router-link to="/admin/books" class="menu-link" active-class="active">图书管理</router-link>
        <router-link to="/admin/borrows" class="menu-link" active-class="active">借阅管理</router-link>
        <router-link to="/admin/orders" class="menu-link" active-class="active">订单管理</router-link>
      </nav>
    </aside>

    <div class="main">
      <header class="topbar">
        <span class="muted small">管理员：{{ userStore.user?.name }}</span>
        <div class="topbar-actions">
          <router-link to="/" class="btn btn-ghost btn-sm">返回前台</router-link>
          <button class="btn btn-ghost btn-sm" @click="logout">退出</button>
        </div>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';

const router = useRouter();
const userStore = useUserStore();

function logout() {
  userStore.logout();
  router.push('/');
}
</script>

<style scoped>
.admin {
  display: flex;
  min-height: 100dvh;
  background: var(--bg);
}
.sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #3a2c1e;
  color: #e8dcc8;
  display: flex;
  flex-direction: column;
  padding: 18px 12px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  padding: 0 8px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
}
.menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 14px;
}
.menu-link {
  padding: 10px 14px;
  border-radius: 8px;
  color: #d8cbb5;
  font-size: 14px;
  transition: all 0.15s;
}
.menu-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.menu-link.active {
  background: var(--primary);
  color: #fff;
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.topbar {
  height: 56px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}
.topbar-actions {
  display: flex;
  gap: 8px;
}
.content {
  padding: 24px;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .admin {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
    padding: 10px 12px;
    overflow-x: auto;
  }
  .brand {
    border-bottom: none;
    padding: 0 12px 0 0;
    flex-shrink: 0;
  }
  .menu {
    flex-direction: row;
    margin-top: 0;
  }
  .menu-link {
    white-space: nowrap;
  }
  .content {
    padding: 16px;
  }
}
</style>
