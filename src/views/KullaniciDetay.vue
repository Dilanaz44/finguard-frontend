<template>
  <div>
    <div class="navbar">
      <Logo :size="32" :altbaslik="false" style="color: white;" />
      <div>
        <button class="btn btn-cikis" @click="cikisYap">Cikis Yap</button>
      </div>
    </div>
    <div class="container">
      <router-link to="/" class="geri-linki">&larr; Musterilere don</router-link>

      <div class="sayfa-baslik">
        <h1>{{ musteri?.adSoyad || 'Musteri' }}</h1>
        <p>{{ musteri?.email || '' }}</p>
      </div>

      <div v-if="!yukleniyor && islemler.length > 0" class="istatistik-grid">
        <div class="istatistik-karti">
          <div class="istatistik-ikon ikon-mavi">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3v18h18" />
              <path d="M7 14l4-4 3 3 5-6" />
            </svg>
          </div>
          <div class="istatistik-sayi">{{ toplamIslem }}</div>
          <div class="istatistik-etiket">Toplam Islem</div>
        </div>

        <div class="istatistik-karti">
          <div class="istatistik-ikon ikon-kirmizi">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v4" />
              <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
              <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
          </div>
          <div class="istatistik-sayi">{{ riskliSayisi }}</div>
          <div class="istatistik-etiket">Riskli Islem</div>
        </div>

        <div class="istatistik-karti">
          <div class="istatistik-ikon ikon-turuncu">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
              <path d="M12 7v5l3 3" />
            </svg>
          </div>
          <div class="istatistik-sayi">%{{ riskOrani }}</div>
          <div class="istatistik-etiket">Risk Orani</div>
        </div>

        <div class="istatistik-karti">
          <div class="istatistik-ikon ikon-yesil">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2 L20 6 L20 12 Q20 18 12 22 Q4 18 4 12 L4 6 Z" />
            </svg>
          </div>
          <div class="istatistik-sayi">{{ ortalamaRisk }}</div>
          <div class="istatistik-etiket">Ortalama Risk Skoru</div>
        </div>
      </div>

      <div class="card">
        <h2>Islemler</h2>
        <p v-if="yukleniyor">Yukleniyor...</p>
        <p v-if="hata" class="hata-mesaj">{{ hata }}</p>
        <p v-if="!yukleniyor && islemler.length === 0 && !hata">Bu musterinin henuz islemi yok.</p>
        <table v-if="!yukleniyor && islemler.length > 0">
          <thead>
            <tr>
              <th>Hesap ID</th>
              <th>Tutar</th>
              <th>Para Birimi</th>
              <th>Hedef</th>
              <th>Risk Skoru</th>
              <th>Riskli mi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="islem in islemler" :key="islem.id" :class="{ riskli: islem.riskli }">
              <td>#{{ islem.hesapId }}</td>
              <td class="tutar-hucre">{{ formatTutar(islem.tutar) }}</td>
              <td>{{ islem.paraBirimi }}</td>
              <td>
                <span class="hedef-etiket" :class="islem.hedefUlke === 'yurt_disi' ? 'hedef-disi' : 'hedef-ici'">
                  {{ islem.hedefUlke === 'yurt_disi' ? 'Yurt Disi' : 'Yurt Ici' }}
                </span>
              </td>
              <td>
                <div class="risk-cubugu">
                  <div class="risk-dolgu" :style="{ width: islem.riskSkoru + '%' }" :class="{ 'risk-yuksek': islem.riskli }"></div>
                </div>
                <span class="risk-sayi">{{ islem.riskSkoru }}</span>
              </td>
              <td>
                <span class="badge" :class="islem.riskli ? 'badge-riskli' : 'badge-normal'">
                  {{ islem.riskli ? 'Evet' : 'Hayir' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Logo from '../components/Logo.vue';

const islemler = ref<any[]>([]);
const musteri = ref<any>(null);
const yukleniyor = ref(true);
const hata = ref('');
const route = useRoute();
const router = useRouter();

const toplamIslem = computed(() => islemler.value.length);
const riskliSayisi = computed(() => islemler.value.filter((i) => i.riskli).length);
const riskOrani = computed(() => {
  if (toplamIslem.value === 0) return '0';
  return ((riskliSayisi.value / toplamIslem.value) * 100).toFixed(1);
});
const ortalamaRisk = computed(() => {
  if (toplamIslem.value === 0) return '0';
  const toplam = islemler.value.reduce((acc, i) => acc + Number(i.riskSkoru || 0), 0);
  return (toplam / toplamIslem.value).toFixed(1);
});

function formatTutar(tutar: number) {
  return Number(tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function cikisYap() {
  localStorage.removeItem('token');
  router.push('/login');
}

async function verileriYukle() {
  yukleniyor.value = true;
  hata.value = '';

  const token = localStorage.getItem('token');

  if (!token) {
    router.push('/login');
    return;
  }

  const musteriId = route.params.id;

  try {
    const [musterilerRes, islemlerRes] = await Promise.all([
      fetch('http://localhost:3000/musteriler', { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`http://localhost:3000/islemler?musteriId=${musteriId}`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (!musterilerRes.ok || !islemlerRes.ok) {
      hata.value = 'Veriler yuklenemedi';
      yukleniyor.value = false;
      return;
    }

    const musteriler = await musterilerRes.json();
    musteri.value = musteriler.find((m: any) => String(m.id) === String(musteriId));

    islemler.value = await islemlerRes.json();
  } catch (err) {
    hata.value = 'Sunucuya baglanilamadi';
  } finally {
    yukleniyor.value = false;
  }
}

onMounted(verileriYukle);
watch(() => route.params.id, verileriYukle);
</script>

<style scoped>
.geri-linki {
  display: inline-block;
  margin-bottom: 16px;
  font-size: 14px;
  color: #0d9488;
  text-decoration: none;
}

.geri-linki:hover {
  text-decoration: underline;
}

.sayfa-baslik {
  margin-bottom: 22px;
}

.sayfa-baslik h1 {
  font-size: 24px;
  color: #0f172a;
  margin: 0 0 4px;
}

.sayfa-baslik p {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.istatistik-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.istatistik-karti {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.istatistik-ikon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.ikon-mavi {
  background: #dbeafe;
  color: #1e40af;
}

.ikon-kirmizi {
  background: #fee2e2;
  color: #991b1b;
}

.ikon-turuncu {
  background: #ffedd5;
  color: #9a3412;
}

.ikon-yesil {
  background: #ccfbf1;
  color: #0d9488;
}

.istatistik-sayi {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.1;
}

.istatistik-etiket {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.tutar-hucre {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.hedef-etiket {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 500;
}

.hedef-ici {
  background: #f1f5f9;
  color: #475569;
}

.hedef-disi {
  background: #e0f2fe;
  color: #075985;
}

.risk-cubugu {
  display: inline-block;
  width: 60px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  vertical-align: middle;
  margin-right: 8px;
}

.risk-dolgu {
  height: 100%;
  background: #0d9488;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.risk-dolgu.risk-yuksek {
  background: #dc2626;
}

.risk-sayi {
  font-size: 13px;
  color: #475569;
  vertical-align: middle;
}

@media (max-width: 800px) {
  .istatistik-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
