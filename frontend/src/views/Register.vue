<template>
  <div class="auth-wrap">
    <div class="auth card">
      <h1 class="auth-title">注册</h1>
      <form @submit.prevent="submit">
        <div class="field">
          <label>昵称</label>
          <input v-model="form.name" class="input" placeholder="请输入昵称" />
        </div>
        <div class="field">
          <label>邮箱</label>
          <input v-model="form.email" class="input" type="email" placeholder="请输入邮箱" />
        </div>
        <div class="field">
          <label>密码</label>
          <input v-model="form.password" class="input" type="password" placeholder="至少 6 位" />
        </div>
        <div class="field">
          <label>确认密码</label>
          <input v-model="form.confirm" class="input" type="password" placeholder="再次输入密码" />
        </div>
        <button class="btn btn-primary btn-block btn-lg" type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
      <p class="switch small">已有账号？<router-link to="/login" class="link">去登录</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useUiStore } from '../stores/ui';

const router = useRouter();
const userStore = useUserStore();
const uiStore = useUiStore();

const form = reactive({ name: '', email: '', password: '', confirm: '' });
const loading = ref(false);

async function submit() {
  if (!form.name || !form.email || !form.password) {
    uiStore.error('请填写完整信息');
    return;
  }
  if (form.password !== form.confirm) {
    uiStore.error('两次输入的密码不一致');
    return;
  }
  loading.value = true;
  try {
    await userStore.register({ name: form.name, email: form.email, password: form.password });
    uiStore.success('注册成功，请登录');
    router.push('/login');
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
</style>
