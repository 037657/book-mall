<template>
  <div class="cover" :style="{ background: gradient }">
    <img v-if="book.cover && !imgFailed" :src="book.cover" :alt="book.title" @error="imgFailed = true" />
    <div v-else class="placeholder">
      <span class="title">{{ book.title }}</span>
      <span class="author">{{ book.author }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  book: { type: Object, required: true },
});

const palettes = [
  ['#8b5a2b', '#c9a06c'],
  ['#a0522d', '#d9b38c'],
  ['#6b4f32', '#b08d5f'],
  ['#7c5c3e', '#c1a078'],
  ['#5d4037', '#a47860'],
  ['#4e342e', '#8d6e63'],
  ['#3e2723', '#795548'],
];

const imgFailed = ref(false);

const gradient = computed(() => {
  const str = props.book.category || props.book.title || 'x';
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 997;
  const [c1, c2] = palettes[h % palettes.length];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
});
</script>

<style scoped>
.cover {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
}
.placeholder::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.35);
}
.title {
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.author {
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  margin-top: 8px;
}
</style>
