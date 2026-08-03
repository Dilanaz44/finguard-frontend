<template>
  <div class="uygulama-govde">
    <Sidebar />
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
              <input
                v-model="mevcutSifre"
                type="password"
                autocomplete="current-password"
                required
              />
            </div>
            <div class="ayar-satiri">
              <label>Yeni sifre</label>
              <input
                v-model="yeniSifre"
                type="password"
                autocomplete="new-password"
                required
              />
              <span class="ayar-aciklama"
                >En az 8 karakter, en az bir harf ve bir rakam icermeli</span
              >
            </div>
            <div class="ayar-satiri">
              <label>Yeni sifre (tekrar)</label>
              <input
                v-model="yeniSifreTekrar"
                type="password"
                autocomplete="new-password"
                required
              />
            </div>

            <p v-if="hata" class="hata-mesaj">{{ hata }}</p>

            <button
              type="submit"
              class="btn btn-kaydet"
              :disabled="kaydediliyor"
            >
              {{ kaydediliyor ? "Kaydediliyor..." : "Sifreyi Degistir" }}
            </button>
            <span v-if="kaydetMesaji" class="kaydet-onay">{{
              kaydetMesaji
            }}</span>
          </form>
        </div>

        <div class="card">
          <h2>Iki Faktorlu Dogrulama (2FA)</h2>

          <div v-if="totpAktif" class="ikifa-durum-acik">
            ✓ 2FA hesabinda etkin
          </div>

          <div v-else-if="kurulumAsamasi === 'kapali'">
            <p class="ayar-aciklama">
              Google Authenticator gibi bir uygulamayla girisde ekstra bir
              guvenlik katmani ekle.
            </p>
            <button
              class="btn btn-kaydet"
              :disabled="ikiFAYukleniyor"
              @click="ikiFAKurBaslat"
            >
              {{ ikiFAYukleniyor ? "Basliyor..." : "2FA'yi Etkinlestir" }}
            </button>
          </div>

          <div v-else class="ikifa-kurulum">
            <p class="ayar-aciklama">
              Authenticator uygulamanla asagidaki QR kodu tara, sonra
              uygulamada gorunen 6 haneli kodu asagiya gir.
            </p>
            <img :src="qrKodu" alt="2FA QR kodu" class="ikifa-qr" />
            <p class="ikifa-manuel">
              QR okutamiyorsan, uygulamaya elle bu anahtari gir:
              <code>{{ manuelAnahtar }}</code>
            </p>
            <div class="ayar-satiri">
              <label>Dogrulama kodu</label>
              <input
                v-model="dogrulamaKodu"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="123456"
              />
            </div>
            <button
              class="btn btn-kaydet"
              :disabled="ikiFAYukleniyor"
              @click="ikiFADogrula"
            >
              {{ ikiFAYukleniyor ? "Dogrulaniyor..." : "Onayla" }}
            </button>
          </div>

          <p v-if="ikiFAHatasi" class="hata-mesaj">{{ ikiFAHatasi }}</p>
          <span v-if="ikiFAMesaji" class="kaydet-onay">{{ ikiFAMesaji }}</span>
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

const { apiFetch } = useApi();

const mevcutSifre = ref("");
const yeniSifre = ref("");
const yeniSifreTekrar = ref("");
const kaydediliyor = ref(false);
const hata = ref("");
const kaydetMesaji = ref("");
const router = useRouter();

// --- Iki Faktorlu Dogrulama (2FA) ---
const totpAktif = ref(false);
const kurulumAsamasi = ref<"kapali" | "qr-goster">("kapali");
const qrKodu = ref("");
const manuelAnahtar = ref("");
const dogrulamaKodu = ref("");
const ikiFAHatasi = ref("");
const ikiFAMesaji = ref("");
const ikiFAYukleniyor = ref(false);

async function profilYukle() {
  try {
    const response = await apiFetch("/profil");
    if (response.ok) {
      const veri = await response.json();
      totpAktif.value = veri.totpAktif;
    }
  } catch {
    // Profil bilgisi yuklenemezse 2FA karti varsayilan (kapali) gorunur -
    // sayfanin geri kalani (sifre degistirme) hala kullanilabilir.
  }
}

async function ikiFAKurBaslat() {
  ikiFAHatasi.value = "";
  ikiFAYukleniyor.value = true;

  try {
    const response = await apiFetch("/2fa/kur", { method: "POST" });

    if (!response.ok) {
      ikiFAHatasi.value = "2FA kurulumu baslatilamadi";
      return;
    }

    const veri = await response.json();
    qrKodu.value = veri.qrKodu;
    manuelAnahtar.value = veri.manuelAnahtar;
    kurulumAsamasi.value = "qr-goster";
  } catch {
    ikiFAHatasi.value = "Sunucuya baglanilamadi";
  } finally {
    ikiFAYukleniyor.value = false;
  }
}

async function ikiFADogrula() {
  ikiFAHatasi.value = "";
  ikiFAYukleniyor.value = true;

  try {
    const response = await apiFetch("/2fa/dogrula", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kod: dogrulamaKodu.value }),
    });

    const govde = await response.json();

    if (!response.ok) {
      ikiFAHatasi.value = govde.mesaj || "Kod hatali";
      return;
    }

    totpAktif.value = true;
    kurulumAsamasi.value = "kapali";
    dogrulamaKodu.value = "";
    ikiFAMesaji.value = "2FA etkinlestirildi ✓";
    setTimeout(() => {
      ikiFAMesaji.value = "";
    }, 3000);
  } catch {
    ikiFAHatasi.value = "Sunucuya baglanilamadi";
  } finally {
    ikiFAYukleniyor.value = false;
  }
}

onMounted(profilYukle);

async function sifreDegistir() {
  hata.value = "";
  kaydetMesaji.value = "";

  if (yeniSifre.value !== yeniSifreTekrar.value) {
    hata.value = "Yeni sifreler birbiriyle eslesmiyor";
    return;
  }

  if (!localStorage.getItem("rol")) {
    router.push("/login");
    return;
  }

  kaydediliyor.value = true;

  try {
    const response = await apiFetch("/sifre-degistir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mevcutSifre: mevcutSifre.value,
        yeniSifre: yeniSifre.value,
      }),
    });

    const govde = await response.json();

    if (!response.ok) {
      hata.value = govde.mesaj || "Sifre degistirilemedi";
      return;
    }

    mevcutSifre.value = "";
    yeniSifre.value = "";
    yeniSifreTekrar.value = "";
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
</script>

<style scoped>
.card h2 {
  font-size: 16px;
  color: var(--color-text);
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

.ikifa-durum-acik {
  display: inline-block;
  background: var(--color-success-bg);
  color: var(--color-success-text);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.ikifa-kurulum {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 360px;
}

.ikifa-qr {
  width: 180px;
  height: 180px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px;
}

.ikifa-manuel {
  font-size: 13px;
  color: var(--color-text-muted);
}

.ikifa-manuel code {
  background: var(--color-surface-hover);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "SF Mono", "Menlo", monospace;
}
</style>
