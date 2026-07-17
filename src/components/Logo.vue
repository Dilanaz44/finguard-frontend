<template>
  <div class="fg-logo">
    <svg viewBox="0 0 100 100" :width="size" :height="size">
      <defs>
        <linearGradient id="fgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2dd4bf" />
          <stop offset="100%" stop-color="#1e40af" />
        </linearGradient>
      </defs>
      <path
        d="M50 4 L92 18 L92 48 Q92 82 50 97 Q8 82 8 48 L8 18 Z"
        fill="#1e1b4b"
        stroke="url(#fgGrad)"
        stroke-width="4"
      />
      <text x="50" y="60" text-anchor="middle" font-size="34" font-weight="800" fill="url(#fgGrad)" font-family="-apple-system, sans-serif">FG</text>
    </svg>
    <div v-if="!iconOnly" class="fg-logo-text">
      <span class="fg-logo-baslik">FinGuard</span>
      <template v-if="altbaslik">
        <span class="fg-logo-ayrac">|</span>
        <span class="fg-logo-altbaslik">Dolandiricilik Tespit Sistemi</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number; iconOnly?: boolean; altbaslik?: boolean }>(), {
  size: 36,
  iconOnly: false,
  altbaslik: true,
});
</script>

<style scoped>
.fg-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fg-logo-text {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.fg-logo-baslik {
  font-size: 19px;
  font-weight: 800;
  color: inherit;
}

.fg-logo-ayrac {
  color: inherit;
  opacity: 0.3;
  font-weight: 300;
}

.fg-logo-altbaslik {
  font-size: 13px;
  opacity: 0.6;
  color: inherit;
}
</style>
