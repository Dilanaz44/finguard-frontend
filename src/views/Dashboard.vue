<template>
  <div>
    <div class="navbar">
      <Logo :size="32" :altbaslik="false" style="color: white;" />
      <div>
        <button class="btn btn-cikis" @click="cikisYap">Cikis Yap</button>
      </div>
    </div>
    <div class="container">
      <div class="sayfa-baslik">
        <h1>Kullanicilar</h1>
        <p>Incelemek istedigin kullaniciya tikla, islemlerini ve risk skorlarini gor</p>
      </div>

      <p v-if="yukleniyor">Yukleniyor...</p>
      <p v-if="hata" class="hata-mesaj">{{ hata }}</p>

      <div v-if="!yukleniyor && kullanicilar.length > 0" class="kullanici-listesi">
        <router-link
          v-for="kullanici in kullanicilar"
          :key="kullanici.id"
          :to="`/kullanici/${kullanici.id}`"
          class="kullanici-karti"
        >
          <div class="kullanici-avatar">{{ baslangicHarfleri(kullanici.adSoyad) }}</div>
          <div class="kullanici-bilgi">
            <div class="kullanici-adi">{{ kullanici.adSoyad }}</div>
            <div class="kullanici-email">{{ kullanici.email }}</div>
          </div>
          <div class="kullanici-istatistik">
            <div class="mini-istatistik">
              <span class="mini-sayi">{{ islemSayisi(kullanici.id) }}</span>
              <span class="mini-etiket">islem</span>
            </div>
            <div class="mini-istatistik" v-if="riskliSayisi(kullanici.id) > 0">
              <span class="mini-sayi mini-riskli">{{ riskliSayisi(kullanici.id) }}</span>
              <span class="mini-etiket">riskli</span>
            </div>
          </div>
          <svg class="ok-ikon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#94a3b8" stroke-width="2">
            <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </router-link>
      </div>

      <p v-if="!yukleniyor && kullanicilar.length === 0 && !hata">Henuz kayitli kullanici yok.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Logo from '../components/Logo.vue';

const kullanicilar = ref<any[]>([]);
const tumIslemler = ref<any[]>([]);
const hesapKullaniciHaritasi = ref<Record<number, number>>({});
const yukleniyor = ref(true);
const hata = ref('');
const router = useRouter();

function islemSayisi(kullaniciId: number) {
  return tumIslemler.value.filter((i) => islemKullaniciyaAitMi(i, kullaniciId)).length;
}

function riskliSayisi(kullaniciId: number) {
  return tumIslemler.value.filter((i) => islemKullaniciyaAitMi(i, kullaniciId) && i.riskli).length;
}

function islemKullaniciyaAitMi(islem: any, kullaniciId: number) {
  const gonderenKullaniciId = islem.hesap?.kullaniciId;
  const aliciKullaniciId = islem.aliciHesapId ? hesapKullaniciHaritasi.value[islem.aliciHesapId] : null;
  return gonderenKullaniciId === kullaniciId || aliciKullaniciId === kullaniciId;
}

function baslangicHarfleri(adSoyad: string) {
  if (!adSoyad) return '?';
  return adSoyad
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function cikisYap() {
  localStorage.removeItem('token');
  router.push('/login');
}

onMounted(async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    router.push('/login');
    return;
  }

  try {
    const [kullanicilarRes, islemlerRes, hesaplarRes] = await Promise.all([
      fetch('http://localhost:3000/kullanicilar', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:3000/islemler', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:3000/hesaplar', { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (!kullanicilarRes.ok || !islemlerRes.ok || !hesaplarRes.ok) {
      hata.value = 'Veriler yuklenemedi';
      yukleniyor.value = false;
      return;
    }

    kullanicilar.value = await kullanicilarRes.json();
    tumIslemler.value = await islemlerRes.json();

    const hesaplar = await hesaplarRes.json();
    const harita: Record<number, number> = {};
    hesaplar.forEach((h: any) => {
      harita[h.id] = h.kullaniciId;
    });
    hesapKullaniciHaritasi.value = harita;
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

.kullanici-listesi {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.kullanici-karti {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
}

.kullanici-karti:hover {
  border-color: #0d9488;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.12);
  transform: translateY(-1px);
}

.kullanici-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0d9488, #1e40af);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.kullanici-bilgi {
  flex: 1;
  min-width: 0;
}

.kullanici-adi {
  font-weight: 600;
  color: #0f172a;
}

.kullanici-email {
  font-size: 13px;
  color: #94a3b8;
}

.kullanici-istatistik {
  display: flex;
  gap: 20px;
}

.mini-istatistik {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 44px;
}

.mini-sayi {
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
}

.mini-sayi.mini-riskli {
  color: #dc2626;
}

.mini-etiket {
  font-size: 11px;
  color: #94a3b8;
}

.ok-ikon {
  flex-shrink: 0;
}
</style>
