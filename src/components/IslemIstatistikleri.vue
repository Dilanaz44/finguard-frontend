<template>
  <div v-if="goster" class="istatistik-grid">
    <div class="istatistik-karti">
      <div class="istatistik-ikon ikon-mavi">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 3v18h18" />
          <path d="M7 14l4-4 3 3 5-6" />
        </svg>
      </div>
      <div class="istatistik-sayi">{{ toplamIslem }}</div>
      <div class="istatistik-etiket">Toplam Islem</div>
    </div>

    <div class="istatistik-karti">
      <div class="istatistik-ikon ikon-kirmizi">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 9v4" />
          <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
          <path
            d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
          />
        </svg>
      </div>
      <div class="istatistik-sayi">{{ riskliSayisi }}</div>
      <div class="istatistik-etiket">Riskli Islem (bu sayfa)</div>
    </div>

    <div class="istatistik-karti">
      <div class="istatistik-ikon ikon-turuncu">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
          <path d="M12 7v5l3 3" />
        </svg>
      </div>
      <div class="istatistik-sayi">%{{ riskOrani }}</div>
      <div class="istatistik-etiket">Risk Orani (bu sayfa)</div>
    </div>

    <div class="istatistik-karti">
      <div class="istatistik-ikon ikon-yesil">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 2 L20 6 L20 12 Q20 18 12 22 Q4 18 4 12 L4 6 Z" />
        </svg>
      </div>
      <div class="istatistik-sayi">{{ ortalamaRisk }}</div>
      <div class="istatistik-etiket">Ortalama Risk Skoru (bu sayfa)</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  goster: boolean;
  toplamIslem: number;
  riskliSayisi: number;
  riskOrani: string;
  ortalamaRisk: string;
}>();
</script>
