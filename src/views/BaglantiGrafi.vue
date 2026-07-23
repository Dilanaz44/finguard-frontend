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
          class="kenar-menu-link kenar-menu-link-aktif"
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
        <h1>Baglanti Grafigi</h1>
        <p>Hesaplar arasi transfer iliskileri. Olasi dairesel akislar (halkalar) kirmizi vurgulanir.</p>
      </div>

      <div v-if="yukleniyor" class="yukleniyor-satiri"><span class="spinner"></span> Yukleniyor...</div>
      <p v-if="hata" class="hata-mesaj">{{ hata }}</p>

      <div v-if="!yukleniyor && olasiHalkalar.length > 0" class="halka-uyarisi">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 9v4" />
          <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
          <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        </svg>
        <strong>{{ olasiHalkalar.length }}</strong> olasi dairesel akis (halka) tespit edildi — kirmizi vurgulanan hesaplara bak.
      </div>

      <p v-if="!yukleniyor && dugumler.length === 0 && !hata">Henuz hesaplar arasi transfer yok.</p>

      <div v-if="!yukleniyor && dugumler.length > 0" class="card grafik-kart">
        <svg :viewBox="`0 0 ${GENISLIK} ${YUKSEKLIK}`" class="baglanti-svg">
          <line
            v-for="kenar in kenarlar"
            :key="kenar.kaynak + '-' + kenar.hedef"
            :x1="dugumHaritasi[kenar.kaynak].x"
            :y1="dugumHaritasi[kenar.kaynak].y"
            :x2="dugumHaritasi[kenar.hedef].x"
            :y2="dugumHaritasi[kenar.hedef].y"
            :stroke-width="Math.min(1 + kenar.sayi, 6)"
            class="kenar-cizgisi"
            :class="{ 'kenar-halka': kenar.halkaMi, 'kenar-soluk': seciliDugum !== null && kenar.kaynak !== seciliDugum && kenar.hedef !== seciliDugum }"
          />
          <g
            v-for="dugum in dugumler"
            :key="dugum.id"
            class="dugum-grubu"
            :class="{ 'dugum-soluk': seciliDugum !== null && seciliDugum !== dugum.id && !komsuMu(dugum.id) }"
            @click="seciliDugum = seciliDugum === dugum.id ? null : dugum.id"
          >
            <circle
              :cx="dugum.x"
              :cy="dugum.y"
              :r="10 + dugum.derece * 2"
              class="dugum-cember"
              :class="{ 'dugum-halka': dugum.halkaMi }"
            />
            <text :x="dugum.x" :y="dugum.y - 14 - dugum.derece * 2" class="dugum-etiket" text-anchor="middle">{{ dugum.etiket }}</text>
          </g>
        </svg>
      </div>
    </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Logo from '../components/Logo.vue';

const islemler = ref<any[]>([]);
const hesaplar = ref<any[]>([]);
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

const seciliDugum = ref<number | null>(null);

const GENISLIK = 640;
const YUKSEKLIK = 520;
const MERKEZ_X = GENISLIK / 2;
const MERKEZ_Y = YUKSEKLIK / 2;
const YARICAP = 170;

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

function hesapEtiketi(hesapId: number) {
  const hesap = hesaplar.value.find((h) => h.id === hesapId);
  if (!hesap) return `#${hesapId}`;
  return `${hesap.musteri?.adSoyad || 'Bilinmiyor'} (#${hesapId})`;
}

// Transferi olan (aliciHesapId dolu) islemlerden benzersiz hesap kimliklerini cikar.
const dugumKimlikleri = computed(() => {
  const kimlikler = new Set<number>();
  islemler.value.forEach((i) => {
    if (i.aliciHesapId) {
      kimlikler.add(i.hesapId);
      kimlikler.add(i.aliciHesapId);
    }
  });
  return Array.from(kimlikler);
});

// Ayni gonderen->alici ciftindeki transferleri tek bir kenarda topla.
const kenarlarHam = computed(() => {
  const harita = new Map<string, { kaynak: number; hedef: number; sayi: number; toplamTutar: number }>();
  islemler.value.forEach((i) => {
    if (!i.aliciHesapId) return;
    const anahtar = `${i.hesapId}-${i.aliciHesapId}`;
    const mevcut = harita.get(anahtar) || { kaynak: i.hesapId, hedef: i.aliciHesapId, sayi: 0, toplamTutar: 0 };
    mevcut.sayi += 1;
    mevcut.toplamTutar += Number(i.tutar);
    harita.set(anahtar, mevcut);
  });
  return Array.from(harita.values());
});

// Basit 3'lu dongu taramasi: A->B, B->C, C->A varsa bu ucluyu "halka" olarak isaretle.
const olasiHalkalar = computed(() => {
  const kenarSeti = new Set(kenarlarHam.value.map((k) => `${k.kaynak}-${k.hedef}`));
  const bulunanlar: number[][] = [];

  kenarlarHam.value.forEach((ab) => {
    kenarlarHam.value.forEach((bc) => {
      if (bc.kaynak !== ab.hedef || bc.hedef === ab.kaynak) return;
      if (kenarSeti.has(`${bc.hedef}-${ab.kaynak}`)) {
        const ucgen = [ab.kaynak, ab.hedef, bc.hedef].sort((a, b) => a - b);
        if (!bulunanlar.some((u) => u[0] === ucgen[0] && u[1] === ucgen[1] && u[2] === ucgen[2])) {
          bulunanlar.push(ucgen);
        }
      }
    });
  });

  return bulunanlar;
});

const halkadakiHesaplar = computed(() => new Set(olasiHalkalar.value.flat()));

const dugumler = computed(() => {
  const n = dugumKimlikleri.value.length;
  return dugumKimlikleri.value.map((id, i) => {
    const aci = (2 * Math.PI * i) / n - Math.PI / 2;
    const derece = kenarlarHam.value.filter((k) => k.kaynak === id || k.hedef === id).length;
    return {
      id,
      etiket: hesapEtiketi(id),
      derece,
      halkaMi: halkadakiHesaplar.value.has(id),
      x: MERKEZ_X + YARICAP * Math.cos(aci),
      y: MERKEZ_Y + YARICAP * Math.sin(aci),
    };
  });
});

const dugumHaritasi = computed(() => {
  const harita: Record<number, any> = {};
  dugumler.value.forEach((d) => {
    harita[d.id] = d;
  });
  return harita;
});

const kenarlar = computed(() => {
  return kenarlarHam.value.map((k) => ({
    ...k,
    halkaMi: olasiHalkalar.value.some((u) => u.includes(k.kaynak) && u.includes(k.hedef)),
  }));
});

function komsuMu(dugumId: number) {
  if (seciliDugum.value === null) return false;
  return kenarlarHam.value.some(
    (k) => (k.kaynak === seciliDugum.value && k.hedef === dugumId) || (k.hedef === seciliDugum.value && k.kaynak === dugumId)
  );
}

onMounted(async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    router.push('/login');
    return;
  }

  try {
    const [islemlerRes, hesaplarRes] = await Promise.all([
      fetch('http://localhost:3000/islemler?limit=10000', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:3000/hesaplar', { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (!islemlerRes.ok || !hesaplarRes.ok) {
      hata.value = 'Veriler yuklenemedi';
      return;
    }

    islemler.value = (await islemlerRes.json()).veri;
    hesaplar.value = await hesaplarRes.json();
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

.halka-uyarisi {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 14px;
}

.halka-uyarisi svg {
  flex-shrink: 0;
}

.grafik-kart {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.baglanti-svg {
  width: 100%;
  height: auto;
  display: block;
}

.kenar-cizgisi {
  stroke: #cbd5e1;
  transition: opacity 0.15s ease;
}

.kenar-cizgisi.kenar-halka {
  stroke: #dc2626;
}

.kenar-cizgisi.kenar-soluk {
  opacity: 0.15;
}

.dugum-grubu {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.dugum-grubu.dugum-soluk {
  opacity: 0.25;
}

.dugum-cember {
  fill: #0d9488;
  stroke: white;
  stroke-width: 2;
}

.dugum-cember.dugum-halka {
  fill: #dc2626;
}

.dugum-etiket {
  font-size: 11px;
  fill: #334155;
  font-weight: 500;
}
</style>
