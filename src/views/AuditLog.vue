<template>
  <div class="uygulama-govde">
    <aside class="kenar-menu" :class="{ 'kenar-menu-daraltilmis': daraltilmis }">
      <div class="kenar-menu-baslik-satiri">
        <Logo :size="26" :altbaslik="false" :icon-only="daraltilmis" />
        <button
          class="kenar-menu-daralt-buton"
          @click="daraltilmis = !daraltilmis"
          :aria-label="daraltilmis ? 'Menuyu ac' : 'Menuyu kapat'"
        >
          <svg v-if="!daraltilmis" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <div v-if="!daraltilmis" class="kenar-menu-etiket">Menu</div>
      <nav class="kenar-menu-nav">
        <router-link to="/" class="kenar-menu-link" :title="daraltilmis ? 'Musteriler' : undefined">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <path d="M9 22V12h6v10" />
          </svg>
          <span v-if="!daraltilmis">Musteriler</span>
        </router-link>
        <router-link
          to="/audit-log"
          class="kenar-menu-link kenar-menu-link-aktif"
          :title="daraltilmis ? 'Denetim Izi' : undefined"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          <span v-if="!daraltilmis">Denetim Izi</span>
        </router-link>
      </nav>
      <div class="kenar-menu-spacer"></div>
      <div class="kenar-menu-kullanici">
        <div class="kenar-menu-avatar">{{ baslangicHarfleri(adSoyad) }}</div>
        <div v-if="!daraltilmis">
          <div class="kenar-menu-isim">{{ adSoyad }}</div>
          <div class="kenar-menu-rol">{{ rolEtiketi }}</div>
        </div>
      </div>
      <button class="btn btn-cikis kenar-menu-cikis" @click="cikisYap" :title="daraltilmis ? 'Cikis Yap' : undefined">
        <span v-if="!daraltilmis">Cikis Yap</span>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      </button>
    </aside>
    <main class="ana-icerik">
    <div class="container">
      <div class="sayfa-baslik">
        <h1>Denetim Izi</h1>
        <p>Analistlerin yaptigi onemli eylemlerin kaydi.</p>
      </div>

      <div class="card">
        <div v-if="yukleniyor" class="yukleniyor-satiri"><span class="spinner"></span> Yukleniyor...</div>
        <p v-if="hata" class="hata-mesaj">{{ hata }}</p>
        <p v-if="!yukleniyor && kayitlar.length === 0 && !hata">Henuz kayit yok.</p>

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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Logo from '../components/Logo.vue';

const kayitlar = ref<any[]>([]);
const yukleniyor = ref(true);
const hata = ref('');
const router = useRouter();
const rol = localStorage.getItem('rol');
const adSoyad = localStorage.getItem('adSoyad') || '';
const rolEtiketi = computed(() => (rol === 'kidemli_analist' ? 'Kidemli Analist' : 'Analist'));
const daraltilmis = ref(localStorage.getItem('kenarMenuDaraltilmis') === 'true');
watch(daraltilmis, (deger) => {
  localStorage.setItem('kenarMenuDaraltilmis', String(deger));
});

function baslangicHarfleri(ad: string) {
  if (!ad) return '?';
  return ad
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function cikisYap() {
  localStorage.removeItem('token');
  localStorage.removeItem('rol');
  localStorage.removeItem('adSoyad');
  router.push('/login');
}

function formatTarih(tarih: string) {
  return new Date(tarih).toLocaleString('tr-TR');
}

onMounted(async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    router.push('/login');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/audit-log', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      hata.value = 'Kayitlar yuklenemedi';
      return;
    }

    kayitlar.value = await response.json();
  } catch (err) {
    hata.value = 'Sunucuya baglanilamadi';
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
  color: #0f172a;
  margin: 0 0 4px;
}

.sayfa-baslik p {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.yukleniyor-satiri {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #cbd5e1;
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: spinner-donme 0.7s linear infinite;
}

@keyframes spinner-donme {
  to {
    transform: rotate(360deg);
  }
}
</style>
