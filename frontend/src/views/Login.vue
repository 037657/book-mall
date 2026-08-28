<template>
  <div class="auth-wrap">
    <div class="auth card">
      <h1 class="auth-title">登录</h1>
      <form @submit.prevent="submit">
        <div class="field">
          <label>邮箱</label>
          <input v-model="form.email" class="input" type="email" placeholder="请输入邮箱" />
        </div>
        <div class="field">
          <label>密码</label>
          <input v-model="form.password" class="input" type="password" placeholder="请输入密码" />
        </div>
        <button class="btn btn-primary btn-block btn-lg" type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <p class="switch small">还没有账号？<router-link to="/register" class="link">立即注册</router-link></p>
      <div class="demo small">
        <p class="muted">演示账号</p>
        <p>管理员：admin@test.com / admin123</p>
        <p>普通用户：user@test.com / user123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useUiStore } from '../stores/ui';
import { useCartStore } from '../stores/cart';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const uiStore = useUiStore();
const cartStore = useCartStore();

const form = reactive({ email: '', password: '' });
const loading = ref(false);

async function submit() {
  if (!form.email || !form.password) {
    uiStore.error('请输入邮箱和密码');
    return;
  }
  loading.value = true;
  try {
    const user = await userStore.login(form.email, form.password);
    await cartStore.fetch().catch(() => {});
    uiStore.success(`欢迎回来，${user.name}`);
    router.push(route.query.redirect || '/');
  } catch (e) {
    uiStore.error(e.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-wrap {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}
.auth {
  width: 380px;
  max-width: 100%;
}
.auth-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
}
.switch {
  text-align: center;
  margin-top: 14px;
}
.link {
  color: var(--primary);
}
.demo {
  margin-top: 18px;
  padding: 12px;
  background: var(--surface-2);
  border-radius: 8px;
  line-height: 1.8;
}
</style>
