<template>
  <aside class="kenar-menu" :class="{ 'kenar-menu-daraltilmis': daraltilmis }">
    <div class="kenar-menu-baslik-satiri">
      <Logo :size="26" :altbaslik="false" :icon-only="daraltilmis" />
      <button
        class="kenar-menu-daralt-buton"
        :aria-label="daraltilmis ? 'Menuyu ac' : 'Menuyu kapat'"
        @click="daraltilmis = !daraltilmis"
      >
        <svg
          v-if="!daraltilmis"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M15 6l-6 6 6 6" />
        </svg>
        <svg
          v-else
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
    <div v-if="!daraltilmis" class="kenar-menu-etiket">Menu</div>
    <nav class="kenar-menu-nav">
      <router-link
        to="/"
        class="kenar-menu-link"
        :class="{ 'kenar-menu-link-aktif': musterilerAktifMi }"
        :title="daraltilmis ? 'Musteriler' : undefined"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
        <span v-if="!daraltilmis">Musteriler</span>
      </router-link>
      <router-link
        to="/risk-kuyrugu"
        class="kenar-menu-link"
        :class="{ 'kenar-menu-link-aktif': route.path === '/risk-kuyrugu' }"
        :title="daraltilmis ? 'Risk Kuyrugu' : undefined"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
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
        <span v-if="!daraltilmis">Risk Kuyrugu</span>
      </router-link>
      <router-link
        to="/baglanti-grafi"
        class="kenar-menu-link"
        :class="{ 'kenar-menu-link-aktif': route.path === '/baglanti-grafi' }"
        :title="daraltilmis ? 'Baglanti Grafigi' : undefined"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
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
        :class="{ 'kenar-menu-link-aktif': route.path === '/audit-log' }"
        :title="daraltilmis ? 'Denetim Izi' : undefined"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="9" />
        </svg>
        <span v-if="!daraltilmis">Denetim Izi</span>
      </router-link>
      <router-link
        v-if="rol === 'kidemli_analist'"
        to="/risk-ayarlari"
        class="kenar-menu-link"
        :class="{ 'kenar-menu-link-aktif': route.path === '/risk-ayarlari' }"
        :title="daraltilmis ? 'Risk Ayarlari' : undefined"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          />
        </svg>
        <span v-if="!daraltilmis">Risk Ayarlari</span>
      </router-link>
    </nav>
    <div class="kenar-menu-spacer"></div>
    <router-link
      to="/profil"
      class="kenar-menu-kullanici kenar-menu-kullanici-link"
    >
      <div class="kenar-menu-avatar">{{ baslangicHarfleri(adSoyad) }}</div>
      <div v-if="!daraltilmis">
        <div class="kenar-menu-isim">{{ adSoyad }}</div>
        <div class="kenar-menu-rol">{{ rolEtiketi }}</div>
      </div>
    </router-link>
    <button
      class="btn btn-cikis kenar-menu-cikis"
      :title="daraltilmis ? 'Cikis Yap' : undefined"
      @click="cikisYap"
    >
      <span v-if="!daraltilmis">Cikis Yap</span>
      <svg
        v-else
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Logo from "./Logo.vue";
import { useApi } from "../composables/useApi";

const route = useRoute();
const router = useRouter();
const { apiFetch } = useApi();

const rol = localStorage.getItem("rol");
const adSoyad = localStorage.getItem("adSoyad") || "";
const rolEtiketi = computed(() =>
  rol === "kidemli_analist" ? "Kidemli Analist" : "Analist",
);

const daraltilmis = ref(localStorage.getItem("kenarMenuDaraltilmis") === "true");
watch(daraltilmis, (deger) => {
  localStorage.setItem("kenarMenuDaraltilmis", String(deger));
});

// Musteri detay sayfasi (/musteri/:id) da kavramsal olarak "Musteriler"in
// altinda sayilir, o yuzden orada da bu link aktif gorunmeli.
const musterilerAktifMi = computed(
  () => route.path === "/" || route.path.startsWith("/musteri/"),
);

function baslangicHarfleri(ad: string) {
  if (!ad) return "?";
  return ad
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

async function cikisYap() {
  // Token httpOnly cookie'de oldugu icin JS onu silemez - backend'e istek
  // atip cookie'yi orada temizletmemiz gerekiyor.
  try {
    await apiFetch("/logout", { method: "POST" });
  } catch {
    // Sunucuya ulasilamasa bile yerel oturumu temizleyip cikis yapmaya devam et.
  }
  localStorage.removeItem("rol");
  localStorage.removeItem("adSoyad");
  localStorage.removeItem("analistId");
  router.push("/login");
}
</script>
