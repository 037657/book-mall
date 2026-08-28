<template>
  <header class="nav">
    <div class="container nav-inner">
      <router-link to="/" class="brand">
        <span class="brand-mark">墨</span>
        <span class="brand-name">墨香书坊</span>
      </router-link>

      <nav class="links">
        <router-link to="/" class="link" exact-active-class="active">首页</router-link>
        <router-link to="/books" class="link" active-class="active">图书</router-link>
        <router-link to="/my-borrows" class="link" active-class="active">我的借阅</router-link>
        <router-link to="/my-orders" class="link" active-class="active">我的订单</router-link>
      </nav>

      <div class="search">
        <input
          v-model="keyword"
          class="search-input"
          type="search"
          placeholder="搜索书名 / 作者"
          @keyup.enter="doSearch"
        />
      </div>

      <div class="actions">
        <router-link to="/cart" class="cart">
          <span class="cart-icon">购物车</span>
          <span v-if="cartStore.count > 0" class="cart-count">{{ cartStore.count }}</span>
        </router-link>

        <template v-if="userStore.isLoggedIn">
          <div class="user">
            <span class="user-name">{{ userStore.user?.name }}</span>
            <div class="user-menu">
              <router-link v-if="userStore.isAdmin" to="/admin/dashboard" class="menu-item">后台管理</router-link>
              <router-link to="/my-borrows" class="menu-item">我的借阅</router-link>
              <router-link to="/my-orders" class="menu-item">我的订单</router-link>
              <button class="menu-item logout" @click="logout">退出登录</button>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="btn btn-ghost btn-sm">登录</router-link>
          <router-link to="/register" class="btn btn-primary btn-sm">注册</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useCartStore } from '../stores/cart';

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();
const keyword = ref('');

onMounted(() => {
  if (userStore.isLoggedIn) {
    cartStore.fetch().catch(() => {});
  }
});

function doSearch() {
  router.push({ path: '/books', query: { keyword: keyword.value || undefined } });
}
function logout() {
  userStore.logout();
  cartStore.items = [];
  router.push('/');
}
</script>

<style scoped>
.nav {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}
.nav-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 60px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 18px;
  color: var(--primary-dark);
}
.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  font-size: 16px;
}
.links {
  display: flex;
  gap: 4px;
}
.link {
  padding: 6px 12px;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: all 0.15s;
}
.link:hover,
.link.active {
  color: var(--primary);
  background: var(--primary-light);
}
.search {
  flex: 1;
  max-width: 260px;
  margin-left: auto;
}
.search-input {
  width: 100%;
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-2);
}
.search-input:focus {
  outline: none;
  border-color: var(--primary);
}
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cart {
  position: relative;
  color: var(--text-secondary);
  font-size: 14px;
}
.cart-count {
  position: absolute;
  top: -8px;
  right: -10px;
  background: var(--danger);
  color: #fff;
  font-size: 11px;
  border-radius: 999px;
  padding: 0 5px;
  line-height: 16px;
  min-width: 16px;
  text-align: center;
}
.user {
  position: relative;
  cursor: pointer;
}
.user-name {
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}
.user-menu {
  display: none;
  position: absolute;
  right: 0;
  top: 130%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow-hover);
  min-width: 130px;
  padding: 6px;
  z-index: 60;
}
.user:hover .user-menu {
  display: block;
}
.menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: none;
  color: var(--text);
  font-size: 14px;
  border-radius: 6px;
}
.menu-item:hover {
  background: var(--primary-light);
}
.menu-item.logout {
  color: var(--danger);
}

@media (max-width: 768px) {
  .nav-inner {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 14px;
    gap: 10px;
  }
  .search {
    order: 3;
    flex-basis: 100%;
    max-width: none;
    margin-left: 0;
  }
  .links {
    order: 4;
    flex-basis: 100%;
    overflow-x: auto;
  }
  .link {
    white-space: nowrap;
  }
}
</style>
