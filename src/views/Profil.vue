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
          to="/risk-kuyrugu"
          class="kenar-menu-link"
          :title="daraltilmis ? 'Risk Kuyrugu' : undefined"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 9v4" />
            <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
            <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </svg>
          <span v-if="!daraltilmis">Risk Kuyrugu</span>
        </router-link>
        <router-link
          to="/baglanti-grafi"
          class="kenar-menu-link"
          :title="daraltilmis ? 'Baglanti Grafigi' : undefined"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="18" cy="6" r="2.5" />
            <circle cx="12" cy="18" r="2.5" />
            <path d="M8 7.5L10.5 16M16 7.5L13.5 16M8.5 6h7" />
          </svg>
          <span v-if="!daraltilmis">Baglanti Grafigi</span>
        </router-link>
        <router-link
          v-if="rol === 'kidemli_analist'"
          to="/audit-log"
          class="kenar-menu-link"
          :title="daraltilmis ? 'Denetim Izi' : undefined"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          <span v-if="!daraltilmis">Denetim Izi</span>
        </router-link>
        <router-link
          v-if="rol === 'kidemli_analist'"
          to="/risk-ayarlari"
          class="kenar-menu-link"
          :title="daraltilmis ? 'Risk Ayarlari' : undefined"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span v-if="!daraltilmis">Risk Ayarlari</span>
        </router-link>
      </nav>
      <div class="kenar-menu-spacer"></div>
      <router-link to="/profil" class="kenar-menu-kullanici kenar-menu-kullanici-link kenar-menu-link-aktif">
        <div class="kenar-menu-avatar">{{ baslangicHarfleri(adSoyad) }}</div>
        <div v-if="!daraltilmis">
          <div class="kenar-menu-isim">{{ adSoyad }}</div>
          <div class="kenar-menu-rol">{{ rolEtiketi }}</div>
        </div>
      </router-link>
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
        <h1>Profil</h1>
        <p>Hesap bilgilerin ve sifre degistirme.</p>
      </div>

      <div class="card">
        <h2>Sifre Degistir</h2>
        <form class="ayar-formu" @submit.prevent="sifreDegistir">
          <div class="ayar-satiri">
            <label>Mevcut sifre</label>
            <input type="password" v-model="mevcutSifre" autocomplete="current-password" required />
          </div>
          <div class="ayar-satiri">
            <label>Yeni sifre</label>
            <input type="password" v-model="yeniSifre" autocomplete="new-password" required />
            <span class="ayar-aciklama">En az 8 karakter, en az bir harf ve bir rakam icermeli</span>
          </div>
          <div class="ayar-satiri">
            <label>Yeni sifre (tekrar)</label>
            <input type="password" v-model="yeniSifreTekrar" autocomplete="new-password" required />
          </div>

          <p v-if="hata" class="hata-mesaj">{{ hata }}</p>

          <button type="submit" class="btn btn-kaydet" :disabled="kaydediliyor">
            {{ kaydediliyor ? 'Kaydediliyor...' : 'Sifreyi Degistir' }}
          </button>
          <span v-if="kaydetMesaji" class="kaydet-onay">{{ kaydetMesaji }}</span>
        </form>
      </div>
    </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Logo from '../components/Logo.vue';
import { API_URL } from '../api';

const mevcutSifre = ref('');
const yeniSifre = ref('');
const yeniSifreTekrar = ref('');
const kaydediliyor = ref(false);
const hata = ref('');
const kaydetMesaji = ref('');
const router = useRouter();
const rol = localStorage.getItem('rol');
const adSoyad = localStorage.getItem('adSoyad') || '';
const rolEtiketi = computed(() => (rol === 'kidemli_analist' ? 'Kidemli Analist' : 'Analist'));
const daraltilmis = ref(localStorage.getItem('kenarMenuDaraltilmis') === 'true');

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

async function sifreDegistir() {
  hata.value = '';
  kaydetMesaji.value = '';

  if (yeniSifre.value !== yeniSifreTekrar.value) {
    hata.value = 'Yeni sifreler birbiriyle eslesmiyor';
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
  }

  kaydediliyor.value = true;

  try {
    const response = await fetch(`${API_URL}/sifre-degistir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mevcutSifre: mevcutSifre.value, yeniSifre: yeniSifre.value }),
    });

    const govde = await response.json();

    if (!response.ok) {
      hata.value = govde.mesaj || 'Sifre degistirilemedi';
      return;
    }

    mevcutSifre.value = '';
    yeniSifre.value = '';
    yeniSifreTekrar.value = '';
    kaydetMesaji.value = 'Kaydedildi ✓';
    setTimeout(() => {
      kaydetMesaji.value = '';
    }, 3000);
  } catch (err) {
    hata.value = 'Sunucuya baglanilamadi';
  } finally {
    kaydediliyor.value = false;
  }
}
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

.card h2 {
  font-size: 16px;
  color: #0f172a;
  margin: 0 0 16px;
}

.ayar-formu {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 360px;
}

.ayar-satiri {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ayar-satiri label {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.ayar-satiri input {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
}

.ayar-aciklama {
  font-size: 12px;
  color: #94a3b8;
}

.btn-kaydet {
  align-self: flex-start;
  margin-top: 4px;
}

.kaydet-onay {
  color: #0d9488;
  font-size: 13px;
  font-weight: 500;
}
</style>
