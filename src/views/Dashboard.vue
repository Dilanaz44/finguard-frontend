<template>
  <div class="uygulama-govde">
    <Sidebar />
    <main class="ana-icerik">
      <div class="container">
        <div class="sayfa-baslik">
          <h1>Musteriler</h1>
          <p>
            Incelemek istedigin musteriye tikla, islemlerini ve risk skorlarini
            gor
          </p>
        </div>

        <div v-if="yukleniyor" class="yukleniyor-satiri">
          <span class="spinner"></span> Yukleniyor...
        </div>
        <p v-if="hata" class="hata-mesaj">{{ hata }}</p>

        <div v-if="!yukleniyor && musteriler.length > 0" class="kpi-grid">
          <div class="kpi-karti">
            <div class="kpi-sayi">{{ toplamIslemSayisi }}</div>
            <div class="kpi-etiket">Toplam Islem</div>
          </div>
          <div class="kpi-karti">
            <div class="kpi-sayi">{{ bugunkuIslemSayisi }}</div>
            <div class="kpi-etiket">Bugunku Islem</div>
          </div>
          <div class="kpi-karti">
            <div class="kpi-sayi">%{{ riskliOranYuzde }}</div>
            <div class="kpi-etiket">Riskli Islem Orani</div>
          </div>
          <div v-if="toplamBekleyen > 0" class="kpi-karti kpi-uyari">
            <div class="kpi-sayi">{{ toplamBekleyen }}</div>
            <div class="kpi-etiket">Bekleyen Inceleme</div>
          </div>
          <router-link
            v-if="askidaBekleyenSayisi > 0"
            to="/risk-kuyrugu"
            class="kpi-karti kpi-uyari"
          >
            <div class="kpi-sayi">{{ askidaBekleyenSayisi }}</div>
            <div class="kpi-etiket">Askida Bekleyen</div>
          </router-link>
        </div>

        <DashboardGrafikleri
          v-if="!yukleniyor && musteriler.length > 0"
          :islemler="tumIslemler"
        />

        <div v-if="!yukleniyor && toplamBekleyen > 0" class="bekleyen-banner">
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
          <strong>{{ toplamBekleyen }}</strong> bekleyen inceleme var — asagida
          en cok bekleyeni olan musteriler once listeleniyor.
        </div>

        <input
          v-if="!yukleniyor && musteriler.length > 0"
          v-model="globalArama"
          type="text"
          class="global-arama-kutusu"
          placeholder="Musteri adi, email veya #hesap numarasiyla ara..."
        />

        <div
          v-if="!yukleniyor && musteriler.length > 0"
          class="kullanici-listesi"
        >
          <router-link
            v-for="musteri in gorunenMusteriler"
            :key="musteri.id"
            :to="`/musteri/${musteri.id}`"
            class="kullanici-karti"
            :class="{ 'kullanici-karti-uyari': bekleyenSayisi(musteri.id) > 0 }"
          >
            <div class="kullanici-avatar">
              {{ baslangicHarfleri(musteri.adSoyad) }}
            </div>
            <div class="kullanici-bilgi">
              <div class="kullanici-adi">
                {{ musteri.adSoyad }}
                <span
                  v-if="
                    musteri.riskSeviyesi === 'orta' ||
                    musteri.riskSeviyesi === 'yuksek'
                  "
                  class="kyc-rozet-mini"
                  :class="'kyc-rozet-mini-' + musteri.riskSeviyesi"
                >
                  KYC:
                  {{ musteri.riskSeviyesi === "yuksek" ? "Yuksek" : "Orta" }}
                </span>
              </div>
              <div class="kullanici-email">{{ musteri.email }}</div>
            </div>
            <div class="kullanici-istatistik">
              <div
                v-if="bekleyenSayisi(musteri.id) > 0"
                class="mini-istatistik"
              >
                <span class="mini-sayi mini-bekleyen">{{
                  bekleyenSayisi(musteri.id)
                }}</span>
                <span class="mini-etiket">bekleyen</span>
              </div>
              <div class="mini-istatistik">
                <span class="mini-sayi">{{ islemSayisi(musteri.id) }}</span>
                <span class="mini-etiket">islem</span>
              </div>
              <div v-if="riskliSayisi(musteri.id) > 0" class="mini-istatistik">
                <span class="mini-sayi mini-riskli">{{
                  riskliSayisi(musteri.id)
                }}</span>
                <span class="mini-etiket">riskli</span>
              </div>
            </div>
            <svg
              class="ok-ikon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="var(--color-text-faint)"
              stroke-width="2"
            >
              <path
                d="M9 18l6-6-6-6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </router-link>
        </div>

        <p v-if="!yukleniyor && musteriler.length === 0 && !hata">
          Henuz kayitli musteri yok.
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Sidebar from "../components/Sidebar.vue";
import DashboardGrafikleri from "../components/DashboardGrafikleri.vue";
import { useApi } from "../composables/useApi";
import { onayBekliyorMu } from "../utils/islemDurumlari";
import type { Musteri, Islem, Hesap } from "../types";

const { apiFetch } = useApi();
const musteriler = ref<Musteri[]>([]);
const tumIslemler = ref<Islem[]>([]);
const hesapMusteriHaritasi = ref<Record<number, number>>({});
const yukleniyor = ref(true);
const hata = ref("");

function islemSayisi(musteriId: number) {
  return tumIslemler.value.filter((i) => islemMusteriyeAitMi(i, musteriId))
    .length;
}

function riskliSayisi(musteriId: number) {
  return tumIslemler.value.filter(
    (i) => islemMusteriyeAitMi(i, musteriId) && i.riskli,
  ).length;
}

// Bekleyen inceleme: riskli olup henuz "yeni" durumunda kalan (analistin hic
// bakmadigi) islemler. Analistin ilk once bakmasi gereken yer burasi.
function bekleyenSayisi(musteriId: number) {
  return tumIslemler.value.filter(
    (i) =>
      islemMusteriyeAitMi(i, musteriId) &&
      i.riskli &&
      (i.incelemeDurumu || "yeni") === "yeni",
  ).length;
}

const toplamBekleyen = computed(() => {
  return musteriler.value.reduce((acc, m) => acc + bekleyenSayisi(m.id), 0);
});

const askidaBekleyenSayisi = computed(() => {
  return tumIslemler.value.filter(onayBekliyorMu).length;
});

const toplamIslemSayisi = computed(() => tumIslemler.value.length);

const bugunkuIslemSayisi = computed(() => {
  const bugun = new Date().toDateString();
  return tumIslemler.value.filter(
    (i) => new Date(i.olusturmaTarihi).toDateString() === bugun,
  ).length;
});

const riskliOranYuzde = computed(() => {
  if (tumIslemler.value.length === 0) return "0";
  const riskliToplam = tumIslemler.value.filter((i) => i.riskli).length;
  return ((riskliToplam / tumIslemler.value.length) * 100).toFixed(1);
});

// En cok bekleyen inceleme olan musteri en üstte olacak sekilde sirala.
const siraliMusteriler = computed(() => {
  return [...musteriler.value].sort(
    (a, b) => bekleyenSayisi(b.id) - bekleyenSayisi(a.id),
  );
});

const globalArama = ref("");
const musteriHesapNumaralari = ref<Record<number, string[]>>({});

const gorunenMusteriler = computed(() => {
  const arama = globalArama.value.trim().toLowerCase();
  if (!arama) return siraliMusteriler.value;

  return siraliMusteriler.value.filter((m) => {
    if (arama.startsWith("#")) {
      const aranilan = arama.slice(1);
      const numaralar = musteriHesapNumaralari.value[m.id] || [];
      return numaralar.some((n) => n.toLowerCase().includes(aranilan));
    }
    return (
      m.adSoyad.toLowerCase().includes(arama) ||
      m.email.toLowerCase().includes(arama)
    );
  });
});

function islemMusteriyeAitMi(islem: Islem, musteriId: number) {
  const gonderenMusteriId = islem.hesap?.musteriId;
  const aliciMusteriId = islem.aliciHesapId
    ? hesapMusteriHaritasi.value[islem.aliciHesapId]
    : null;
  return gonderenMusteriId === musteriId || aliciMusteriId === musteriId;
}

function baslangicHarfleri(adSoyad: string) {
  if (!adSoyad) return "?";
  return adSoyad
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

onMounted(async () => {
  try {
    const [musterilerRes, islemlerRes, hesaplarRes] = await Promise.all([
      apiFetch("/musteriler"),
      apiFetch("/islemler?limit=10000"),
      apiFetch("/hesaplar"),
    ]);

    if (!musterilerRes.ok || !islemlerRes.ok || !hesaplarRes.ok) {
      hata.value = "Veriler yuklenemedi";
      yukleniyor.value = false;
      return;
    }

    musteriler.value = await musterilerRes.json();
    tumIslemler.value = (await islemlerRes.json()).veri;

    const hesaplar = await hesaplarRes.json();
    const harita: Record<number, number> = {};
    const hesapNumaralariHaritasi: Record<number, string[]> = {};
    hesaplar.forEach((h: Hesap) => {
      harita[h.id] = h.musteriId;
      if (h.hesapNumarasi) {
        const mevcutListe = hesapNumaralariHaritasi[h.musteriId] || [];
        mevcutListe.push(h.hesapNumarasi);
        hesapNumaralariHaritasi[h.musteriId] = mevcutListe;
      }
    });
    hesapMusteriHaritasi.value = harita;
    musteriHesapNumaralari.value = hesapNumaralariHaritasi;
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
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px 20px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.1s ease;
}

.kullanici-karti:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.12);
  transform: translateY(-1px);
}

.kullanici-karti-uyari {
  border-left: 4px solid var(--color-danger);
}

.mini-sayi.mini-bekleyen {
  color: var(--color-danger);
}

.bekleyen-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-danger-bg-subtle);
  border: 1px solid var(--color-danger-badge-bg);
  color: var(--color-danger-text);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 14px;
}

.bekleyen-banner svg {
  flex-shrink: 0;
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

.kullanici-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-secondary)
  );
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
  color: var(--color-text);
}

.kyc-rozet-mini {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  margin-left: 6px;
  vertical-align: middle;
}

.kyc-rozet-mini-orta {
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.kyc-rozet-mini-yuksek {
  background: var(--color-danger-bg);
  color: var(--color-danger-text);
}

.kullanici-email {
  font-size: 13px;
  color: var(--color-text-faint);
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
  color: var(--color-text);
}

.mini-sayi.mini-riskli {
  color: var(--color-danger);
}

.mini-etiket {
  font-size: 11px;
  color: var(--color-text-faint);
}

.ok-ikon {
  flex-shrink: 0;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.kpi-karti {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: block;
  text-decoration: none;
  color: inherit;
}

.kpi-karti.kpi-uyari {
  border-color: var(--color-danger-badge-bg);
  background: var(--color-danger-bg-subtle);
}

.kpi-sayi {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
}

.kpi-uyari .kpi-sayi {
  color: var(--color-danger);
}

.kpi-etiket {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.global-arama-kutusu {
  width: 100%;
  border: 1px solid var(--color-border-input);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  margin-bottom: 16px;
}

@media (max-width: 700px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
