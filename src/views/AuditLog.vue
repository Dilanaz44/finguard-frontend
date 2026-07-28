<template>
  <div class="uygulama-govde">
    <Sidebar />
    <main class="ana-icerik">
      <div class="container">
        <div class="sayfa-baslik">
          <h1>Denetim Izi</h1>
          <p>Analistlerin yaptigi onemli eylemlerin kaydi.</p>
        </div>

        <div class="card">
          <div v-if="yukleniyor" class="yukleniyor-satiri">
            <span class="spinner"></span> Yukleniyor...
          </div>
          <p v-if="hata" class="hata-mesaj">{{ hata }}</p>
          <p v-if="!yukleniyor && kayitlar.length === 0 && !hata">
            Henuz kayit yok.
          </p>

          <table v-if="!yukleniyor && kayitlar.length > 0">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Analist</th>
                <th>Eylem</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="kayit in kayitlar" :key="kayit.id">
                <td>{{ formatTarih(kayit.tarih) }}</td>
                <td>{{ kayit.analist?.adSoyad }}</td>
                <td>{{ kayit.eylem }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Sidebar from "../components/Sidebar.vue";
import { useApi } from "../composables/useApi";
import { formatTarih } from "../utils/islemGoruntuleme";
import type { AuditKaydi } from "../types";

const { apiFetch } = useApi();
const kayitlar = ref<AuditKaydi[]>([]);
const yukleniyor = ref(true);
const hata = ref("");

onMounted(async () => {
  try {
    const response = await apiFetch("/audit-log");

    if (!response.ok) {
      hata.value = "Kayitlar yuklenemedi";
      return;
    }

    kayitlar.value = await response.json();
  } catch {
    hata.value = "Sunucuya baglanilamadi";
  } finally {
    yukleniyor.value = false;
  }
});
</script>

<style scoped>
.sayfa-baslik {
  margin-bottom: 22px;
}

.sayfa-baslik h1 {
  font-size: 24px;
  color: var(--color-text);
  margin: 0 0 4px;
}

.sayfa-baslik p {
  color: var(--color-text-muted);
  margin: 0;
  font-size: 14px;
}

.yukleniyor-satiri {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-border-input);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spinner-donme 0.7s linear infinite;
}

@keyframes spinner-donme {
  to {
    transform: rotate(360deg);
  }
}
</style>
