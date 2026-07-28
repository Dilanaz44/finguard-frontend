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
import {
  formatTarih,
  formatTutar,
  gonderenGoster,
  aliciGoster as aliciGosterBase,
} from "../utils/islemGoruntuleme";
import { onayBekliyorMu } from "../utils/islemDurumlari";
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

function aliciGoster(islem: Islem) {
  return aliciGosterBase(islem, hesapHaritasi.value);
}

const bekleyenIslemler = computed(() => {
  return islemler.value
    .filter(onayBekliyorMu)
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
  if (!localStorage.getItem("rol")) {
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
.hesap-no-hucre {
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 12px;
  letter-spacing: 0.3px;
  color: var(--color-text-secondary);
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
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.hedef-disi {
  background: var(--color-info-bg);
  color: var(--color-info-text);
}

.risk-cubugu {
  display: inline-block;
  width: 60px;
  height: 6px;
  background: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
  vertical-align: middle;
  margin-right: 8px;
}

.risk-dolgu {
  height: 100%;
  background: var(--color-danger);
  border-radius: 999px;
}

.risk-sayi {
  font-size: 13px;
  color: var(--color-text-secondary);
  vertical-align: middle;
}

tr.neden-satiri td {
  background: var(--color-surface-subtle);
  padding: 12px 14px 14px 14px;
  font-size: 13px;
  color: var(--color-text-strong);
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
  background: var(--color-primary);
  color: white;
  border: none;
}

.btn-onayla:hover {
  background: var(--color-primary-hover);
}

.btn-reddet {
  background: white;
  color: var(--color-danger);
  border: 1px solid var(--color-danger-badge-bg);
}

.btn-reddet:hover {
  background: var(--color-danger-bg-subtle);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.onay-bekliyor-notu {
  font-size: 12px;
  color: var(--color-warning-text);
  font-style: italic;
}

.ilk-onay-rozeti {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 500;
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
  white-space: nowrap;
}

.ilk-onay-rozeti.ilk-onay-yok {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}
</style>
