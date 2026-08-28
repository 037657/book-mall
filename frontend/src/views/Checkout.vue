<template>
  <div class="container">
    <h1 class="page-title">结算</h1>

    <div v-if="cartStore.items.length" class="checkout-layout">
      <div class="form card">
        <h3>收货信息</h3>
        <div class="field">
          <label>收货地址</label>
          <input v-model="address" class="input" placeholder="请输入收货地址（模拟）" />
        </div>

        <h3>商品清单</h3>
        <div v-for="item in cartStore.items" :key="item.id" class="line">
          <span class="line-title">{{ item.title }} × {{ item.quantity }}</span>
          <span>¥{{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
      </div>

      <div class="summary card">
        <div class="row"><span>商品件数</span><span>{{ cartStore.count }} 件</span></div>
        <div class="row total"><span>应付总额</span><span class="price">¥{{ cartStore.total.toFixed(2) }}</span></div>
        <button class="btn btn-primary btn-block btn-lg mt-16" :disabled="submitting" @click="submitOrder">
          {{ submitting ? '提交中...' : '提交订单' }}
        </button>
      </div>
    </div>

    <div v-else class="empty">
      <p>没有待结算的商品</p>
      <router-link to="/books" class="btn btn-primary mt-16">去逛逛</router-link>
    </div>

    <!-- 模拟支付弹窗 -->
    <div v-if="payOrder" class="modal-mask" @click.self="cancelOrder">
      <div class="modal">
        <h3>模拟支付</h3>
        <p class="muted small">订单号：{{ payOrder.order_no }}</p>
        <div class="pay-amount">¥{{ payOrder.total_amount.toFixed(2) }}</div>
        <p class="muted small">这是模拟支付页面，点击确认即支付成功（可替换为支付宝/微信支付）。</p>
        <div class="pay-actions">
          <button class="btn btn-ghost" :disabled="paying" @click="cancelOrder">取消订单</button>
          <button class="btn btn-primary" :disabled="paying" @click="confirmPay">{{ paying ? '支付中...' : '确认支付' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import { useCartStore } from '../stores/cart';
import { useUiStore } from '../stores/ui';

const router = useRouter();
const cartStore = useCartStore();
const uiStore = useUiStore();

const address = ref('');
const submitting = ref(false);
const paying = ref(false);
const payOrder = ref(null);

async function submitOrder() {
  submitting.value = true;
  try {
    const items = cartStore.items.map((i) => ({ bookId: i.book_id, quantity: i.quantity }));
    const res = await api.post('/orders', { items, address: address.value });
    payOrder.value = res.data;
  } catch (e) {
    uiStore.error(e.message);
  } finally {
    submitting.value = false;
  }
}

async function confirmPay() {
  paying.value = true;
  try {
    await api.post(`/orders/${payOrder.value.order_no}/pay`);
    await cartStore.clear();
    uiStore.success('支付成功');
    router.push('/my-orders');
  } catch (e) {
    uiStore.error(e.message);
    paying.value = false;
  }
}

async function cancelOrder() {
  try {
    await api.post(`/orders/${payOrder.value.order_no}/cancel`);
    payOrder.value = null;
    uiStore.success('订单已取消');
  } catch (e) {
    uiStore.error(e.message);
  }
}

onMounted(() => cartStore.fetch().catch(() => {}));
</script>

<style scoped>
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}
.form h3 {
  font-size: 16px;
  margin-bottom: 14px;
}
.line {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: var(--text-secondary);
  border-bottom: 1px dashed var(--border);
}
.line-title {
  flex: 1;
  margin-right: 12px;
}
.summary h3 {
  font-size: 16px;
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
}
.row.total {
  border-top: 1px solid var(--border);
  color: var(--text);
  font-weight: 600;
  margin-top: 6px;
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
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 28px;
  width: 360px;
  max-width: 100%;
  text-align: center;
}
.modal h3 {
  font-size: 18px;
  margin-bottom: 10px;
}
.pay-amount {
  font-size: 32px;
  font-weight: 600;
  color: var(--danger);
  margin: 14px 0;
}
.pay-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}
@media (max-width: 768px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}
</style>
