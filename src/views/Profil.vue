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
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
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
</style>
