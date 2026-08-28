<template>
  <div class="store">
    <NavBar />
    <main class="store-main">
      <router-view />
    </main>
    <footer class="footer">
      <div class="container footer-inner">
        <span>墨香书坊 · 图书借阅与购买一体化平台</span>
        <span class="muted small">仅作学习演示用途</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import NavBar from './NavBar.vue';
</script>

<style scoped>
.store {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
.store-main {
  flex: 1;
  padding-bottom: 40px;
}
.footer {
  border-top: 1px solid var(--border);
  background: var(--surface);
  padding: 18px 0;
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
