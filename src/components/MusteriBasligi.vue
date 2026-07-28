<template>
  <div
    class="sayfa-baslik"
    style="
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    "
  >
    <div>
      <h1>{{ musteri?.adSoyad || "Musteri" }}</h1>
      <p>{{ musteri?.email || "" }}</p>
      <div v-if="musteri" class="kyc-satiri">
        <span class="kyc-rozet" :class="'kyc-' + musteri.riskSeviyesi"
          >KYC: {{ kycEtiketMetni(musteri.riskSeviyesi) }}</span
        >
        <select
          v-model="kycSecimi"
          :disabled="kycGuncelleniyor"
          @change="kycGuncelle"
        >
          <option value="dusuk">Dusuk</option>
          <option value="orta">Orta</option>
          <option value="yuksek">Yuksek</option>
        </select>
        <span v-if="kycMesaj" class="kaydet-onay">{{ kycMesaj }}</span>
      </div>
      <div v-if="musteri" class="kyc-satiri">
        <span class="kyc-rozet" :class="{ 'kyc-yuksek': musteri.pepMi }"
          >PEP: {{ musteri.pepMi ? "Evet" : "Hayir" }}</span
        >
        <label class="pep-checkbox-etiket">
          <input
            v-model="pepSecimi"
            type="checkbox"
            :disabled="pepGuncelleniyor"
            @change="pepGuncelle"
          />
          Siyasi nufuz sahibi kisi
        </label>
        <span v-if="pepMesaj" class="kaydet-onay">{{ pepMesaj }}</span>
      </div>
    </div>
    <slot name="aksiyon" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useApi } from "../composables/useApi";
import type { Musteri } from "../types";

const musteri = defineModel<Musteri | null>("musteri", { required: true });
const emit = defineEmits<{ hata: [mesaj: string] }>();

const { apiFetch } = useApi();
const router = useRouter();

const kycSecimi = ref("dusuk");
const pepSecimi = ref(false);
const kycGuncelleniyor = ref(false);
const pepGuncelleniyor = ref(false);
const kycMesaj = ref("");
const pepMesaj = ref("");

// Musteri disaridan (verileriYukle) yuklendiginde/degistiginde secim
// kutularini onun mevcut degerleriyle senkron tut.
watch(
  musteri,
  (yeni) => {
    kycSecimi.value = yeni?.riskSeviyesi || "dusuk";
    pepSecimi.value = yeni?.pepMi || false;
  },
  { immediate: true },
);

function kycEtiketMetni(seviye: string) {
  if (seviye === "orta") return "Orta";
  if (seviye === "yuksek") return "Yuksek";
  return "Dusuk";
}

async function kycGuncelle() {
  if (!musteri.value) return;
  if (!localStorage.getItem("rol")) {
    router.push("/login");
    return;
  }

  kycGuncelleniyor.value = true;

  try {
    const response = await apiFetch(
      `/musteriler/${musteri.value.id}/risk-seviyesi`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskSeviyesi: kycSecimi.value }),
      },
    );

    if (!response.ok) {
      emit("hata", "KYC risk seviyesi guncellenemedi");
      return;
    }

    const guncellenenMusteri = await response.json();
    musteri.value = {
      ...musteri.value,
      riskSeviyesi: guncellenenMusteri.riskSeviyesi,
    };
    kycMesaj.value = "Kaydedildi ✓";
    setTimeout(() => {
      kycMesaj.value = "";
    }, 3000);
  } catch {
    emit("hata", "Sunucuya baglanilamadi");
  } finally {
    kycGuncelleniyor.value = false;
  }
}

async function pepGuncelle() {
  if (!musteri.value) return;
  if (!localStorage.getItem("rol")) {
    router.push("/login");
    return;
  }

  pepGuncelleniyor.value = true;

  try {
    const response = await apiFetch(`/musteriler/${musteri.value.id}/pep`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pepMi: pepSecimi.value }),
    });

    if (!response.ok) {
      emit("hata", "PEP durumu guncellenemedi");
      return;
    }

    const guncellenenMusteri = await response.json();
    musteri.value = { ...musteri.value, pepMi: guncellenenMusteri.pepMi };
    pepMesaj.value = "Kaydedildi ✓";
    setTimeout(() => {
      pepMesaj.value = "";
    }, 3000);
  } catch {
    emit("hata", "Sunucuya baglanilamadi");
  } finally {
    pepGuncelleniyor.value = false;
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

.kyc-satiri {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.kyc-rozet {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 500;
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.pep-checkbox-etiket {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.kyc-orta {
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.kyc-yuksek {
  background: var(--color-danger-bg);
  color: var(--color-danger-text);
}

.kaydet-onay {
  margin-left: 10px;
  color: var(--color-success-text);
  font-size: 13px;
  font-weight: 600;
}
</style>
