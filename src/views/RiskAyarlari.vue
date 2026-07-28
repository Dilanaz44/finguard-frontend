<template>
  <div class="uygulama-govde">
    <Sidebar />
    <main class="ana-icerik">
      <div class="container">
        <div class="sayfa-baslik">
          <h1>Risk Ayarlari</h1>
          <p>
            Risk motorunun esik degerlerini panelden yapilandir. Degisiklikler
            bir sonraki islemden itibaren gecerli olur.
          </p>
        </div>

        <div v-if="rol !== 'kidemli_analist'" class="card">
          <p>Bu sayfaya sadece kidemli analistler erisebilir.</p>
        </div>

        <div v-else class="card">
          <div v-if="yukleniyor" class="yukleniyor-satiri">
            <span class="spinner"></span> Yukleniyor...
          </div>
          <p v-if="hata" class="hata-mesaj">{{ hata }}</p>

          <form
            v-if="!yukleniyor && ayarlar"
            class="ayar-formu"
            @submit.prevent="kaydet"
          >
            <div class="ayar-satiri">
              <label>Anormal tutar carpani</label>
              <input
                v-model.number="ayarlar.anormalTutarCarpani"
                type="number"
                step="0.1"
                min="0.1"
              />
              <span class="ayar-aciklama"
                >Islem tutari gecmis ortalamanin kac katini gecerse anormal
                sayilir</span
              >
            </div>
            <div class="ayar-satiri">
              <label>Siklik penceresi (dakika)</label>
              <input
                v-model.number="ayarlar.siklikPencereDakika"
                type="number"
                min="1"
              />
              <span class="ayar-aciklama">Son kac dakika kontrol edilecek</span>
            </div>
            <div class="ayar-satiri">
              <label>Siklik esigi (adet)</label>
              <input
                v-model.number="ayarlar.siklikEsikAdet"
                type="number"
                min="1"
              />
              <span class="ayar-aciklama"
                >O surede kac islem olursa supheli</span
              >
            </div>
            <div class="ayar-satiri">
              <label>Gece baslangic saati</label>
              <input
                v-model.number="ayarlar.geceBaslangicSaat"
                type="number"
                min="0"
                max="23"
              />
            </div>
            <div class="ayar-satiri">
              <label>Gece bitis saati</label>
              <input
                v-model.number="ayarlar.geceBitisSaat"
                type="number"
                min="0"
                max="23"
              />
            </div>
            <div class="ayar-satiri">
              <label>Riskli esik puani</label>
              <input
                v-model.number="ayarlar.riskliEsikPuan"
                type="number"
                min="1"
                max="100"
              />
              <span class="ayar-aciklama"
                >Toplam puan bunun ustundeyse islem riskli sayilir</span
              >
            </div>
            <div class="ayar-satiri">
              <label>Askiya alma esik puani</label>
              <input
                v-model.number="ayarlar.askiyaAlmaEsikPuan"
                type="number"
                min="1"
                max="100"
              />
              <span class="ayar-aciklama"
                >Toplam puan bunun ustundeyse islem onaya birakilir</span
              >
            </div>
            <div class="ayar-satiri">
              <label>KYC orta risk puani</label>
              <input
                v-model.number="ayarlar.kycOrtaRiskPuan"
                type="number"
                min="0"
              />
            </div>
            <div class="ayar-satiri">
              <label>KYC yuksek risk puani</label>
              <input
                v-model.number="ayarlar.kycYuksekRiskPuan"
                type="number"
                min="0"
              />
            </div>
            <div class="ayar-satiri">
              <label>Yapilandirma (structuring) esik tutari</label>
              <input
                v-model.number="ayarlar.yapilandirmaEsikTutar"
                type="number"
                min="1"
              />
              <span class="ayar-aciklama"
                >Ayni musterinin siklik penceresi icindeki islemlerinin toplami
                bu tutari gecerse supheli sayilir</span
              >
            </div>
            <div class="ayar-satiri">
              <label>PEP risk puani</label>
              <input
                v-model.number="ayarlar.pepRiskPuan"
                type="number"
                min="0"
              />
              <span class="ayar-aciklama"
                >Hesap sahibi PEP (siyasi nufuz sahibi kisi) olarak isaretliyse
                eklenecek puan</span
              >
            </div>
            <div class="ayar-satiri">
              <label>Anomali z-skoru esigi</label>
              <input
                v-model.number="ayarlar.anomaliZSkoruEsigi"
                type="number"
                step="0.1"
                min="0.1"
              />
              <span class="ayar-aciklama"
                >Islem tutari, musterinin ortalamasindan kac standart sapma
                uzaklastiginda supheli sayilir</span
              >
            </div>

            <button
              type="submit"
              class="btn btn-kaydet"
              :disabled="kaydediliyor"
            >
              {{ kaydediliyor ? "Kaydediliyor..." : "Kaydet" }}
            </button>
            <span v-if="kaydetMesaji" class="kaydet-onay">{{
              kaydetMesaji
            }}</span>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Sidebar from "../components/Sidebar.vue";
import { useApi } from "../composables/useApi";
import type { RiskAyarlari } from "../types";

const { apiFetch } = useApi();
const router = useRouter();
const ayarlar = ref<RiskAyarlari | null>(null);
const yukleniyor = ref(true);
const kaydediliyor = ref(false);
const hata = ref("");
const kaydetMesaji = ref("");
const rol = localStorage.getItem("rol");

async function kaydet() {
  if (!ayarlar.value) return;

  if (!localStorage.getItem("rol")) {
    router.push("/login");
    return;
  }

  kaydediliyor.value = true;
  hata.value = "";

  try {
    const response = await apiFetch("/risk-ayarlari", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ayarlar.value),
    });

    const govde = await response.json();

    if (!response.ok) {
      hata.value = govde.mesaj || "Ayarlar kaydedilemedi";
      return;
    }

    ayarlar.value = govde;
    kaydetMesaji.value = "Kaydedildi ✓";
    setTimeout(() => {
      kaydetMesaji.value = "";
    }, 3000);
  } catch {
    hata.value = "Sunucuya baglanilamadi";
  } finally {
    kaydediliyor.value = false;
  }
}

onMounted(async () => {
  if (rol !== "kidemli_analist") {
    yukleniyor.value = false;
    return;
  }

  try {
    const response = await apiFetch("/risk-ayarlari");

    if (!response.ok) {
      hata.value = "Ayarlar yuklenemedi";
      return;
    }

    ayarlar.value = await response.json();
  } catch {
    hata.value = "Sunucuya baglanilamadi";
  } finally {
    yukleniyor.value = false;
  }
});
</script>

<style scoped>
.ayar-formu {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
}

.ayar-satiri {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ayar-satiri label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.ayar-satiri input {
  border: 1px solid var(--color-border-input);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
}

.ayar-aciklama {
  font-size: 12px;
  color: var(--color-text-faint);
}

.btn-kaydet {
  align-self: flex-start;
  margin-top: 4px;
}

.kaydet-onay {
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
}
</style>
