<template>
  <div class="uygulama-govde">
    <Sidebar />
    <main class="ana-icerik">
      <div class="container">
        <div class="sayfa-baslik">
          <h1>Risk Kuyrugu</h1>
          <p>Yuksek riskli, onay bekleyen islemler. En riskli en ustte.</p>
        </div>

        <div class="card">
          <div v-if="yukleniyor" class="yukleniyor-satiri">
            <span class="spinner"></span> Yukleniyor...
          </div>
          <p v-if="hata" class="hata-mesaj">{{ hata }}</p>
          <p v-if="!yukleniyor && bekleyenIslemler.length === 0 && !hata">
            Bekleyen islem yok.
          </p>

          <table v-if="!yukleniyor && bekleyenIslemler.length > 0">
            <thead>
              <tr>
                <th>Gonderen</th>
                <th>Alici</th>
                <th>Tutar</th>
                <th>Hedef</th>
                <th>Risk Skoru</th>
                <th>Durum</th>
                <th>Atanan</th>
                <th>Tarih</th>
                <th>Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="islem in bekleyenIslemler" :key="islem.id">
                <tr :class="{ riskli: islem.riskli }">
                  <td class="hesap-no-hucre">{{ gonderenGoster(islem) }}</td>
                  <td class="hesap-no-hucre">{{ aliciGoster(islem) }}</td>
                  <td class="tutar-hucre">
                    {{ formatTutar(islem.tutar) }} {{ islem.paraBirimi }}
                  </td>
                  <td>
                    <span
                      class="hedef-etiket"
                      :class="
                        islem.hedefUlke === 'yurt_disi'
                          ? 'hedef-disi'
                          : 'hedef-ici'
                      "
                    >
                      {{
                        islem.hedefUlke === "yurt_disi"
                          ? "Yurt Disi"
                          : "Yurt Ici"
                      }}
                    </span>
                  </td>
                  <td>
                    <div class="risk-cubugu">
                      <div
                        class="risk-dolgu risk-yuksek"
                        :style="{ width: islem.riskSkoru + '%' }"
                      ></div>
                    </div>
                    <span class="risk-sayi">{{ islem.riskSkoru }}</span>
                  </td>
                  <td>
                    <span
                      v-if="islem.islemDurumu === 'ilk_onay_verildi'"
                      class="ilk-onay-rozeti"
                    >
                      1/2 onay —
                      {{ islem.ilkOnayAnalist?.adSoyad || "bilinmiyor" }}
                    </span>
                    <span v-else class="ilk-onay-rozeti ilk-onay-yok"
                      >Onay bekliyor</span
                    >
                  </td>
                  <td>{{ islem.atananAnalist?.adSoyad || "-" }}</td>
                  <td>{{ formatTarih(islem.olusturmaTarihi) }}</td>
                  <td>
                    <div
                      v-if="rol === 'kidemli_analist'"
                      class="aksiyon-butonlari"
                    >
                      <div
                        v-if="kendiIlkOnayiMi(islem)"
                        class="onay-bekliyor-notu"
                      >
                        Kendi onayinizi siz tamamlayamazsiniz
                      </div>
                      <template v-else>
                        <button
                          class="btn btn-onayla"
                          :disabled="!!islemAksiyonDurumu[islem.id]"
                          @click="islemiGuncelle(islem, 'onayla')"
                        >
                          {{
                            islemAksiyonDurumu[islem.id] === "onayliyor"
                              ? "Onaylaniyor..."
                              : islem.islemDurumu === "ilk_onay_verildi"
                                ? "Ikinci Onay Ver"
                                : "Onayla"
                          }}
                        </button>
                        <button
                          class="btn btn-reddet"
                          :disabled="!!islemAksiyonDurumu[islem.id]"
                          @click="islemiGuncelle(islem, 'reddet')"
                        >
                          {{
                            islemAksiyonDurumu[islem.id] === "reddediyor"
                              ? "Reddediliyor..."
                              : "Reddet"
                          }}
                        </button>
                      </template>
                    </div>
                    <span v-else class="onay-bekliyor-notu"
                      >Kidemli analist onayi bekleniyor</span
                    >
                  </td>
                </tr>
                <tr
                  v-if="islem.riskNedenleri && islem.riskNedenleri.length"
                  class="neden-satiri"
                >
                  <td colspan="9">
                    <strong>Risk skoruna sebep olan kurallar:</strong>
                    <ul>
                      <li v-for="(neden, i) in islem.riskNedenleri" :key="i">
                        {{ neden }}
                      </li>
                    </ul>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Sidebar from "../components/Sidebar.vue";
import { useApi } from "../composables/useApi";
import type { Islem, Hesap } from "../types";

const { apiFetch } = useApi();
const islemler = ref<Islem[]>([]);
const hesapHaritasi = ref<Record<number, Hesap>>({});
const yukleniyor = ref(true);
const hata = ref("");
const router = useRouter();
const rol = localStorage.getItem("rol");
const analistId = Number(localStorage.getItem("analistId"));

const islemAksiyonDurumu = ref<Record<number, string>>({});

function formatTarih(tarih: string) {
  return new Date(tarih).toLocaleString("tr-TR");
}

function formatTutar(tutar: string | number) {
  return Number(tutar).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function numarayiMaskele(numara: string | null | undefined, yedekId: number) {
  if (!numara) return `#${yedekId}`;
  const basi = numara.slice(0, 4);
  const sonu = numara.slice(-4);
  return `${basi} **** **** **** ${sonu}`;
}

function gonderenGoster(islem: Islem) {
  const ad = islem.hesap?.musteri?.adSoyad || "Bilinmiyor";
  const numara = numarayiMaskele(islem.hesap?.hesapNumarasi, islem.hesapId);
  return `${ad} (${numara})`;
}

function aliciGoster(islem: Islem) {
  if (!islem.aliciHesapId) return "-";
  const aliciHesap = hesapHaritasi.value[islem.aliciHesapId];
  if (!aliciHesap) return `#${islem.aliciHesapId}`;
  const ad = aliciHesap.musteri?.adSoyad || "Bilinmiyor";
  const numara = numarayiMaskele(aliciHesap.hesapNumarasi, islem.aliciHesapId);
  return `${ad} (${numara})`;
}

const bekleyenIslemler = computed(() => {
  return islemler.value
    .filter((i) => ["beklemede", "ilk_onay_verildi"].includes(i.islemDurumu))
    .sort((a, b) => (b.riskSkoru || 0) - (a.riskSkoru || 0));
});

// Four-eyes: ilk onayi veren analist, kendi onayini ikinci onayla tamamlayamaz.
function kendiIlkOnayiMi(islem: Islem) {
  return (
    islem.islemDurumu === "ilk_onay_verildi" &&
    islem.ilkOnayAnalistId === analistId
  );
}

async function islemiGuncelle(islem: Islem, aksiyon: "onayla" | "reddet") {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }

  islemAksiyonDurumu.value[islem.id] =
    aksiyon === "onayla" ? "onayliyor" : "reddediyor";

  try {
    const response = await apiFetch(`/islemler/${islem.id}/${aksiyon}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const govde = await response.json().catch(() => ({}));
      hata.value = govde.mesaj || "Islem guncellenemedi";
      return;
    }

    const guncellenenIslem = await response.json();
    // Ilk onaydan sonra islem hala kuyrukta kalmali (ikinci onay bekliyor);
    // sadece tamamlandi/reddedildi olunca bekleyenIslemler filtresi otomatik dusurur.
    const index = islemler.value.findIndex((i) => i.id === islem.id);
    if (index !== -1) {
      islemler.value[index] = { ...islemler.value[index], ...guncellenenIslem };
    }
  } catch {
    hata.value = "Sunucuya baglanilamadi";
  } finally {
    delete islemAksiyonDurumu.value[islem.id];
  }
}

onMounted(async () => {
  try {
    const [islemlerRes, hesaplarRes] = await Promise.all([
      apiFetch("/islemler?limit=10000"),
      apiFetch("/hesaplar"),
    ]);

    if (!islemlerRes.ok || !hesaplarRes.ok) {
      hata.value = "Veriler yuklenemedi";
      return;
    }

    islemler.value = (await islemlerRes.json()).veri;

    const hesaplar = await hesaplarRes.json();
    const harita: Record<number, Hesap> = {};
    hesaplar.forEach((h: Hesap) => {
      harita[h.id] = h;
    });
    hesapHaritasi.value = harita;
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

.hesap-no-hucre {
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 12px;
  letter-spacing: 0.3px;
  color: #475569;
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
  background: #dc2626;
  border-radius: 999px;
}

.risk-sayi {
  font-size: 13px;
  color: #475569;
  vertical-align: middle;
}

tr.neden-satiri td {
  background: #f8fafc;
  padding: 12px 14px 14px 14px;
  font-size: 13px;
  color: #334155;
}

tr.neden-satiri ul {
  margin: 6px 0 0;
  padding-left: 18px;
}

tr.neden-satiri li {
  margin-bottom: 4px;
}

.aksiyon-butonlari {
  display: flex;
  gap: 6px;
}

.btn-onayla {
  background: #0d9488;
  color: white;
  border: none;
}

.btn-onayla:hover {
  background: #0f766e;
}

.btn-reddet {
  background: white;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.btn-reddet:hover {
  background: #fef2f2;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.onay-bekliyor-notu {
  font-size: 12px;
  color: #92400e;
  font-style: italic;
}

.ilk-onay-rozeti {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 500;
  background: #fef3c7;
  color: #92400e;
  white-space: nowrap;
}

.ilk-onay-rozeti.ilk-onay-yok {
  background: #f1f5f9;
  color: #475569;
}
</style>
