import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

import StoreLayout from '../components/StoreLayout.vue';
import AdminLayout from '../views/admin/AdminLayout.vue';

import Home from '../views/Home.vue';
import BookList from '../views/BookList.vue';
import BookDetail from '../views/BookDetail.vue';
import Cart from '../views/Cart.vue';
import Checkout from '../views/Checkout.vue';
import MyBorrows from '../views/MyBorrows.vue';
import MyOrders from '../views/MyOrders.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

import Dashboard from '../views/admin/Dashboard.vue';
import BooksManage from '../views/admin/BooksManage.vue';
import BorrowsManage from '../views/admin/BorrowsManage.vue';
import OrdersManage from '../views/admin/OrdersManage.vue';

const routes = [
  {
    path: '/',
    component: StoreLayout,
    children: [
      { path: '', name: 'home', component: Home },
      { path: 'books', name: 'books', component: BookList },
      { path: 'books/:id', name: 'book-detail', component: BookDetail },
      { path: 'cart', name: 'cart', component: Cart, meta: { requiresAuth: true } },
      { path: 'checkout', name: 'checkout', component: Checkout, meta: { requiresAuth: true } },
      { path: 'my-borrows', name: 'my-borrows', component: MyBorrows, meta: { requiresAuth: true } },
      { path: 'my-orders', name: 'my-orders', component: MyOrders, meta: { requiresAuth: true } },
      { path: 'login', name: 'login', component: Login },
      { path: 'register', name: 'register', component: Register },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'admin-dashboard', component: Dashboard },
      { path: 'books', name: 'admin-books', component: BooksManage },
      { path: 'borrows', name: 'admin-borrows', component: BorrowsManage },
      { path: 'orders', name: 'admin-orders', component: OrdersManage },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const userStore = useUserStore();
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return { path: '/' };
  }
  return true;
});

export default router;
