<template>
  <div class="grafik-grid">
    <div class="card grafik-karti">
      <h2>Gunluk Islem Hacmi (Son 14 Gun)</h2>
      <canvas ref="hacimCanvas"></canvas>
    </div>
    <div class="card grafik-karti">
      <h2>Risk Skoru Dagilimi</h2>
      <canvas ref="riskCanvas"></canvas>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { Islem } from "../types";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
);

const props = defineProps<{ islemler: Islem[] }>();
const gunlukHacim = computed(() => {
  const gunSayisi = 14;
  const etiketler: string[] = [];
  const veriler: number[] = [];

  for (let i = gunSayisi - 1; i >= 0; i--) {
    const gun = new Date();
    gun.setDate(gun.getDate() - i);
    const gunMetni = gun.toDateString();

    etiketler.push(
      gun.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }),
    );
    veriler.push(
      props.islemler.filter(
        (islem) => new Date(islem.olusturmaTarihi).toDateString() === gunMetni,
      ).length,
    );
  }

  return { etiketler, veriler };
});
const riskDagilimi = computed(() => {
  const bantlar = [
    { etiket: "0-20", min: 0, max: 20 },
    { etiket: "20-40", min: 20, max: 40 },
    { etiket: "40-60", min: 40, max: 60 },
    { etiket: "60-80", min: 60, max: 80 },
    { etiket: "80-100", min: 80, max: 101 },
  ];

  const etiketler = bantlar.map((b) => b.etiket);
  const veriler = bantlar.map((bant) => {
    return props.islemler.filter((islem) => {
      const skor = islem.riskSkoru ?? 0;
      return skor >= bant.min && skor < bant.max;
    }).length;
  });

  return { etiketler, veriler };
});
const hacimCanvas = ref<HTMLCanvasElement | null>(null);
const riskCanvas = ref<HTMLCanvasElement | null>(null);

let hacimChart: Chart | null = null;
let riskChart: Chart | null = null;

function grafikleriCiz() {
  hacimChart?.destroy();
  riskChart?.destroy();

  if (hacimCanvas.value) {
    hacimChart = new Chart(hacimCanvas.value, {
      type: "line",
      data: {
        labels: gunlukHacim.value.etiketler,
        datasets: [
          {
            label: "Islem Sayisi",
            data: gunlukHacim.value.veriler,
            borderColor: "#0d9488",
            backgroundColor: "rgba(13, 148, 136, 0.1)",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
  }

  if (riskCanvas.value) {
    riskChart = new Chart(riskCanvas.value, {
      type: "bar",
      data: {
        labels: riskDagilimi.value.etiketler,
        datasets: [
          {
            label: "Islem Sayisi",
            data: riskDagilimi.value.veriler,
            backgroundColor: "#1e40af",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
  }
}

onMounted(grafikleriCiz);
watch(() => props.islemler, grafikleriCiz);
onUnmounted(() => {
  hacimChart?.destroy();
  riskChart?.destroy();
});
</script>
<style scoped>
.grafik-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.grafik-karti h2 {
  font-size: 15px;
  margin: 0 0 14px;
}

@media (max-width: 800px) {
  .grafik-grid {
    grid-template-columns: 1fr;
  }
}
</style>
