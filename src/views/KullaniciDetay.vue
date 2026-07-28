<template>
  <div class="uygulama-govde">
    <Sidebar />
    <main class="ana-icerik">
      <div class="container">
        <router-link to="/" class="geri-linki"
          >&larr; Musterilere don</router-link
        >

        <MusteriBasligi v-model:musteri="musteri" @hata="hata = $event">
          <template #aksiyon>
            <button
              v-if="!yukleniyor && islemler.length > 0"
              class="btn"
              @click="csvIndir"
            >
              CSV Indir
            </button>
          </template>
        </MusteriBasligi>

        <IslemIstatistikleri
          :goster="!yukleniyor && islemler.length > 0"
          :toplam-islem="toplamIslem"
          :riskli-sayisi="riskliSayisi"
          :risk-orani="riskOrani"
          :ortalama-risk="ortalamaRisk"
        />

        <div class="card">
          <h2>Islemler</h2>
          <div v-if="yukleniyor" class="yukleniyor-satiri">
            <span class="spinner"></span> Yukleniyor...
          </div>
          <p v-if="hata" class="hata-mesaj">{{ hata }}</p>
          <p v-if="!yukleniyor && islemler.length === 0 && !hata">
            Bu musterinin henuz islemi yok.
          </p>

          <div
            v-if="!yukleniyor && islemler.length > 0"
            class="kuyruk-sekmeler"
          >
            <button
              v-for="sekme in kuyrukSekmeleri"
              :key="sekme.deger"
              type="button"
              class="kuyruk-sekme"
              :class="{ 'kuyruk-sekme-aktif': durumFiltre === sekme.deger }"
              @click="durumFiltre = sekme.deger"
            >
              {{ sekme.etiket }} ({{ sekme.sayi }})
            </button>
          </div>

          <div v-if="!yukleniyor && islemler.length > 0" class="filtre-cubugu">
            <input
              v-model="aramaMetni"
              type="text"
              class="arama-kutusu"
              placeholder="Tutar ara (orn: 500) veya #5678 ile hesap numarasinin son haneleriyle ara"
            />
            <select v-model="riskliFiltre">
              <option value="hepsi">Riskli mi: Hepsi</option>
              <option value="evet">Sadece riskli</option>
              <option value="hayir">Sadece riskli olmayan</option>
            </select>
            <select v-model="hedefFiltre">
              <option value="hepsi">Hedef: Hepsi</option>
              <option value="yurt_ici">Yurt Ici</option>
              <option value="yurt_disi">Yurt Disi</option>
            </select>
            <select v-model="siralama">
              <option value="tarih-yeni">Sirala: En yeni</option>
              <option value="risk-yuksek">
                Sirala: Risk skoru (yuksek -> dusuk)
              </option>
              <option value="tutar-yuksek">
                Sirala: Tutar (yuksek -> dusuk)
              </option>
            </select>
          </div>

          <p v-if="!yukleniyor && islemler.length > 0" class="kisayol-ipucu">
            Ipucu: <kbd>↓</kbd> / <kbd>↑</kbd> ile islemler arasinda gezin,
            <kbd>Enter</kbd> ile kaydet (not yazarken
            <kbd>⌘/Ctrl+Enter</kbd> kullan).
          </p>

          <p
            v-if="
              !yukleniyor && islemler.length > 0 && siraliIslemler.length === 0
            "
            class="filtre-sonuc-yok"
          >
            Filtreye uyan islem bulunamadi.
          </p>

          <table v-if="!yukleniyor && siraliIslemler.length > 0">
            <thead>
              <tr>
                <th>Gonderen</th>
                <th>Alici</th>
                <th>Tutar</th>
                <th>Para Birimi</th>
                <th>Hedef</th>
                <th>Risk Skoru</th>
                <th>Riskli mi</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="islem in siraliIslemler" :key="islem.id">
                <tr
                  class="tiklanabilir"
                  :class="{ riskli: islem.riskli }"
                  @click="detayAcKapa(islem)"
                >
                  <td class="hesap-no-hucre">{{ gonderenGoster(islem) }}</td>
                  <td class="hesap-no-hucre">{{ aliciGoster(islem) }}</td>
                  <td class="tutar-hucre">{{ formatTutar(islem.tutar) }}</td>
                  <td>{{ islem.paraBirimi }}</td>
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
                        class="risk-dolgu"
                        :style="{ width: islem.riskSkoru + '%' }"
                        :class="{ 'risk-yuksek': islem.riskli }"
                      ></div>
                    </div>
                    <span class="risk-sayi">
                      {{ islem.riskSkoru }}
                      <span
                        v-if="islem.riskNedenleri && islem.riskNedenleri.length"
                        class="risk-bilgi-ikon"
                        >ⓘ</span
                      >
                    </span>
                  </td>
                  <td>
                    <span
                      class="badge"
                      :class="islem.riskli ? 'badge-riskli' : 'badge-normal'"
                    >
                      {{ islem.riskli ? "Evet" : "Hayir" }}
                    </span>
                  </td>
                  <td>
                    <span
                      v-if="islem.islemDurumu === 'ilk_onay_verildi'"
                      class="durum-etiket durum-beklemede"
                      >1/2 Onay</span
                    >
                    <span
                      v-else-if="islem.islemDurumu === 'beklemede'"
                      class="durum-etiket durum-beklemede"
                      >Onay Bekliyor</span
                    >
                    <span
                      v-else
                      class="durum-etiket"
                      :class="'durum-' + islem.incelemeDurumu"
                      >{{ durumEtiketMetni(islem.incelemeDurumu) }}</span
                    >
                  </td>
                </tr>
                <tr v-if="acikNedenId === islem.id" class="neden-satiri">
                  <td colspan="8">
                    <div
                      v-if="islem.riskNedenleri && islem.riskNedenleri.length"
                    >
                      <strong>Risk skoruna sebep olan kurallar:</strong>
                      <ul>
                        <li v-for="(neden, i) in islem.riskNedenleri" :key="i">
                          {{ neden }}
                        </li>
                      </ul>
                    </div>
                    <div v-else>
                      Bu islem icin hicbir risk kurali tetiklenmedi.
                    </div>

                    <div class="inceleme-formu">
                      <strong>Inceleme</strong>
                      <div class="inceleme-satiri">
                        <label>Durum:</label>
                        <select v-model="duzenlemeDurum">
                          <option value="yeni">Yeni</option>
                          <option value="inceleniyor">Inceleniyor</option>
                          <option value="kapatildi">Kapatildi</option>
                        </select>
                      </div>
                      <div class="inceleme-satiri">
                        <label>Atanan:</label>
                        <select
                          :value="islem.atananAnalistId || ''"
                          @change="
                            atamaGuncelle(
                              islem,
                              ($event.target as HTMLSelectElement).value,
                            )
                          "
                        >
                          <option value="">Atanmadi</option>
                          <option
                            v-for="a in analistler"
                            :key="a.id"
                            :value="a.id"
                          >
                            {{ a.adSoyad }}
                          </option>
                        </select>
                      </div>
                      <textarea
                        v-model="duzenlemeNot"
                        placeholder="Analist notu ekle..."
                        rows="3"
                      ></textarea>
                      <button
                        class="btn btn-kaydet"
                        :disabled="kaydediliyor"
                        @click.stop="notKaydet(islem)"
                      >
                        {{ kaydediliyor ? "Kaydediliyor..." : "Kaydet" }}
                      </button>
                      <button
                        class="btn btn-kaydet"
                        @click.stop="sarTaslagiIndir(islem)"
                      >
                        SAR Taslagi Indir
                      </button>
                      <span v-if="kaydetMesaji[islem.id]" class="kaydet-onay">{{
                        kaydetMesaji[islem.id]
                      }}</span>
                      <p v-if="islem.incelemeAnalist" class="inceleme-bilgi">
                        Son inceleme: {{ islem.incelemeAnalist.adSoyad }} ({{
                          formatTarih(islem.incelemeTarihi)
                        }})
                      </p>

                      <div class="not-timeline">
                        <strong>Not Gecmisi</strong>
                        <ul v-if="islem.notlar && islem.notlar.length">
                          <li v-for="not in islem.notlar" :key="not.id">
                            <span class="not-meta"
                              >{{ not.analist?.adSoyad }} ·
                              {{ formatTarih(not.tarih) }}</span
                            >
                            <p>{{ not.not }}</p>
                          </li>
                        </ul>
                        <p v-else class="not-yok">Henuz not eklenmemis.</p>
                        <textarea
                          v-model="yeniNotMetni[islem.id]"
                          placeholder="Yeni not ekle..."
                          rows="2"
                        ></textarea>
                        <button
                          class="btn btn-kaydet"
                          :disabled="notEkleniyor[islem.id]"
                          @click.stop="notEkle(islem)"
                        >
                          {{
                            notEkleniyor[islem.id] ? "Ekleniyor..." : "Not Ekle"
                          }}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>

          <div v-if="!yukleniyor && toplamSayfa > 1" class="sayfalama">
            <button class="btn" :disabled="sayfa <= 1" @click="oncekiSayfa">
              &larr; Onceki
            </button>
            <span class="sayfalama-bilgi"
              >Sayfa {{ sayfa }} / {{ toplamSayfa }}</span
            >
            <button
              class="btn"
              :disabled="sayfa >= toplamSayfa"
              @click="sonrakiSayfa"
            >
              Sonraki &rarr;
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Sidebar from "../components/Sidebar.vue";
import MusteriBasligi from "../components/MusteriBasligi.vue";
import IslemIstatistikleri from "../components/IslemIstatistikleri.vue";
import { useApi } from "../composables/useApi";
import type { Islem, Musteri, Hesap, Analist } from "../types";

const { apiFetch } = useApi();
const islemler = ref<Islem[]>([]);
const sayfa = ref(1);
const toplamSayfa = ref(1);
const toplamKayit = ref(0);
const musteri = ref<Musteri | null>(null);
const analistler = ref<Analist[]>([]);
const yeniNotMetni = ref<Record<number, string>>({});
const notEkleniyor = ref<Record<number, boolean>>({});
const hesapHaritasi = ref<Record<number, Hesap>>({});
const yukleniyor = ref(true);
const hata = ref("");
const acikNedenId = ref<number | null>(null);
const duzenlemeDurum = ref("yeni");
const duzenlemeNot = ref("");
const kaydediliyor = ref(false);
const aramaMetni = ref("");
const riskliFiltre = ref("hepsi");
const hedefFiltre = ref("hepsi");
const durumFiltre = ref("hepsi");
const siralama = ref("tarih-yeni");
const kaydetMesaji = ref<Record<number, string>>({});
const route = useRoute();
const router = useRouter();
const kuyrukSekmeleri = computed(() => {
  const sayilar = { yeni: 0, inceleniyor: 0, kapatildi: 0 };
  islemler.value.forEach((islem) => {
    const durum = islem.incelemeDurumu || "yeni";
    if (durum in sayilar) {
      sayilar[durum as keyof typeof sayilar]++;
    }
  });

  return [
    { deger: "hepsi", etiket: "Tumu", sayi: islemler.value.length },
    { deger: "yeni", etiket: "Bekleyen", sayi: sayilar.yeni },
    { deger: "inceleniyor", etiket: "Inceleniyor", sayi: sayilar.inceleniyor },
    { deger: "kapatildi", etiket: "Kapatildi", sayi: sayilar.kapatildi },
  ];
});

const filtrelenmisIslemler = computed(() => {
  return islemler.value.filter((islem) => {
    if (riskliFiltre.value === "evet" && !islem.riskli) return false;
    if (riskliFiltre.value === "hayir" && islem.riskli) return false;
    if (hedefFiltre.value !== "hepsi" && islem.hedefUlke !== hedefFiltre.value)
      return false;
    if (
      durumFiltre.value !== "hepsi" &&
      islem.incelemeDurumu !== durumFiltre.value
    )
      return false;

    const arama = aramaMetni.value.trim().toLowerCase();
    if (arama) {
      if (arama.startsWith("#")) {
        // Basinda # varsa hesap numarasinin son hanelerinde ara (ekranda gorunen kisim).
        const aranilan = arama.slice(1);
        const hesapNo = islem.hesap?.hesapNumarasi || String(islem.hesapId);
        if (!hesapNo.toLowerCase().includes(aranilan)) return false;
      } else {
        // Duz sayi yazildiysa sadece tutarda ara.
        if (!String(islem.tutar).includes(arama)) return false;
      }
    }

    return true;
  });
});

const siraliIslemler = computed(() => {
  const liste = [...filtrelenmisIslemler.value];

  if (siralama.value === "risk-yuksek") {
    liste.sort((a, b) => (b.riskSkoru || 0) - (a.riskSkoru || 0));
  } else if (siralama.value === "tutar-yuksek") {
    liste.sort((a, b) => Number(b.tutar) - Number(a.tutar));
  } else {
    liste.sort(
      (a, b) =>
        new Date(b.olusturmaTarihi).getTime() -
        new Date(a.olusturmaTarihi).getTime(),
    );
  }

  return liste;
});

function detayAcKapa(islem: Islem) {
  if (acikNedenId.value === islem.id) {
    acikNedenId.value = null;
    return;
  }
  satiriAc(islem);
}

function satiriAc(islem: Islem) {
  acikNedenId.value = islem.id;
  duzenlemeDurum.value = islem.incelemeDurumu || "yeni";
  duzenlemeNot.value = islem.analistNotu || "";
}

// Klavye kisayollari: asagi/yukari ok tuslariyla islemler arasinda gezinme.
// Analist fareyle tek tek tiklamak yerine listede hizlica ilerleyebilir.
function klavyeDinleyici(e: KeyboardEvent) {
  const hedef = e.target as HTMLElement;
  const yaziYaziliyor = ["INPUT", "TEXTAREA", "SELECT"].includes(hedef.tagName);

  // Cmd/Ctrl+Enter: not yazarken (textarea icindeyken) bile calissin, hizlica kaydetsin.
  if (
    e.key === "Enter" &&
    (e.metaKey || e.ctrlKey) &&
    acikNedenId.value !== null
  ) {
    e.preventDefault();
    const acikIslem = siraliIslemler.value.find(
      (i) => i.id === acikNedenId.value,
    );
    if (acikIslem) notKaydet(acikIslem);
    return;
  }

  if (yaziYaziliyor) return; // arama kutusunda/notta yazarken diger kisayollari devre disi birak

  const liste = siraliIslemler.value;
  if (liste.length === 0) return;

  const suankiIndex = liste.findIndex((i) => i.id === acikNedenId.value);

  if (e.key === "ArrowDown") {
    e.preventDefault();
    const sonrakiIndex =
      suankiIndex === -1 ? 0 : Math.min(suankiIndex + 1, liste.length - 1);
    satiriAc(liste[sonrakiIndex]!);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const oncekiIndex = suankiIndex === -1 ? 0 : Math.max(suankiIndex - 1, 0);
    satiriAc(liste[oncekiIndex]!);
  } else if (e.key === "Enter" && acikNedenId.value !== null) {
    e.preventDefault();
    const acikIslem = liste.find((i) => i.id === acikNedenId.value);
    if (acikIslem) notKaydet(acikIslem);
  }
}

onMounted(() => {
  window.addEventListener("keydown", klavyeDinleyici);
});

onUnmounted(() => {
  window.removeEventListener("keydown", klavyeDinleyici);
});

function durumEtiketMetni(durum: string) {
  if (durum === "inceleniyor") return "Inceleniyor";
  if (durum === "kapatildi") return "Kapatildi";
  return "Yeni";
}

async function atamaGuncelle(islem: Islem, secilenDeger: string) {
  if (!localStorage.getItem("rol")) {
    router.push("/login");
    return;
  }

  const analistId = secilenDeger === "" ? null : Number(secilenDeger);

  try {
    const response = await apiFetch(`/islemler/${islem.id}/ata`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analistId }),
    });

    if (!response.ok) {
      hata.value = "Atama guncellenemedi";
      return;
    }

    const guncellenenIslem = await response.json();
    const index = islemler.value.findIndex((i) => i.id === islem.id);
    if (index !== -1) {
      islemler.value[index] = { ...islemler.value[index], ...guncellenenIslem };
    }
  } catch {
    hata.value = "Sunucuya baglanilamadi";
  }
}

async function notEkle(islem: Islem) {
  const metin = (yeniNotMetni.value[islem.id] || "").trim();
  if (!metin) return;

  if (!localStorage.getItem("rol")) {
    router.push("/login");
    return;
  }

  notEkleniyor.value[islem.id] = true;

  try {
    const response = await apiFetch(`/islemler/${islem.id}/notlar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ not: metin }),
    });

    if (!response.ok) {
      hata.value = "Not eklenemedi";
      return;
    }

    const yeniNot = await response.json();
    const index = islemler.value.findIndex((i) => i.id === islem.id);
    if (index !== -1) {
      const guncelNotlar = [yeniNot, ...(islemler.value[index]!.notlar || [])];
      islemler.value[index] = {
        ...islemler.value[index]!,
        notlar: guncelNotlar,
      };
    }
    yeniNotMetni.value[islem.id] = "";
  } catch {
    hata.value = "Sunucuya baglanilamadi";
  } finally {
    delete notEkleniyor.value[islem.id];
  }
}

function formatTarih(tarih: string | null) {
  if (!tarih) return "";
  return new Date(tarih).toLocaleString("tr-TR");
}

async function notKaydet(islem: Islem) {
  if (!localStorage.getItem("rol")) {
    router.push("/login");
    return;
  }

  kaydediliyor.value = true;

  try {
    const response = await apiFetch(`/islemler/${islem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incelemeDurumu: duzenlemeDurum.value,
        analistNotu: duzenlemeNot.value,
      }),
    });

    if (!response.ok) {
      hata.value = "Inceleme kaydedilemedi";
      return;
    }

    const guncellenenIslem = await response.json();

    const index = islemler.value.findIndex((i) => i.id === islem.id);
    if (index !== -1) {
      islemler.value[index] = { ...islemler.value[index], ...guncellenenIslem };
    }

    kaydetMesaji.value[islem.id] = "Kaydedildi ✓";
    setTimeout(() => {
      delete kaydetMesaji.value[islem.id];
    }, 3000);
  } catch {
    hata.value = "Sunucuya baglanilamadi";
  } finally {
    kaydediliyor.value = false;
  }
}

// Gercek toplam (tum sayfalar) - API'nin toplamKayit alanindan. Diger 3 istatistik
// ise sadece o an ekranda goruntulenen sayfaya gore hesaplaniyor (asagida
// "(bu sayfa)" notuyla belirtiliyor) - tumunu dogru hesaplamak icin backend'in
// ayrica aggregate sorgusu dondurmesi gerekir, bu kapsam disi birakildi.
const toplamIslem = computed(() => toplamKayit.value);
const sayfadakiIslemSayisi = computed(() => islemler.value.length);
const riskliSayisi = computed(
  () => islemler.value.filter((i) => i.riskli).length,
);
const riskOrani = computed(() => {
  if (sayfadakiIslemSayisi.value === 0) return "0";
  return ((riskliSayisi.value / sayfadakiIslemSayisi.value) * 100).toFixed(1);
});
const ortalamaRisk = computed(() => {
  if (sayfadakiIslemSayisi.value === 0) return "0";
  const toplam = islemler.value.reduce(
    (acc, i) => acc + Number(i.riskSkoru || 0),
    0,
  );
  return (toplam / sayfadakiIslemSayisi.value).toFixed(1);
});

function formatTutar(tutar: string | number) {
  return Number(tutar).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function numarayiMaskele(numara: string | null | undefined, yedekId: number) {
  if (!numara) {
    // Eski hesap (hesap numarasi ozelligi eklenmeden once acilmis), eski gosterime don.
    return `#${yedekId}`;
  }
  // TR330006400000112345678901 -> TR33 **** **** **** 8901
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

async function sarTaslagiIndir(islem: Islem) {
  try {
    const response = await apiFetch(`/islemler/${islem.id}/sar-taslagi`);

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sar-taslak-${islem.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    hata.value = "SAR taslagi indirilemedi";
  }
}
async function csvIndir() {
  const musteriId = route.params.id;

  try {
    const response = await apiFetch(
      `/islemler/export?musteriId=${musteriId}`,
    );

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `islemler-${musteriId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    hata.value = "CSV indirilemedi";
  }
}

async function verileriYukle() {
  yukleniyor.value = true;
  hata.value = "";

  const musteriId = route.params.id;

  try {
    const [musterilerRes, islemlerRes, hesaplarRes, analistlerRes] =
      await Promise.all([
        apiFetch("/musteriler"),
        apiFetch(
          `/islemler?musteriId=${musteriId}&sayfa=${sayfa.value}&limit=20`,
        ),
        apiFetch("/hesaplar"),
        apiFetch("/analistler"),
      ]);

    if (
      !musterilerRes.ok ||
      !islemlerRes.ok ||
      !hesaplarRes.ok ||
      !analistlerRes.ok
    ) {
      hata.value = "Veriler yuklenemedi";
      yukleniyor.value = false;
      return;
    }

    const musteriler = await musterilerRes.json();
    musteri.value = musteriler.find(
      (m: Musteri) => String(m.id) === String(musteriId),
    );

    const islemlerYaniti = await islemlerRes.json();
    islemler.value = islemlerYaniti.veri;
    toplamSayfa.value = islemlerYaniti.toplamSayfa;
    toplamKayit.value = islemlerYaniti.toplamKayit;

    const hesaplar = await hesaplarRes.json();
    const harita: Record<number, Hesap> = {};
    hesaplar.forEach((h: Hesap) => {
      harita[h.id] = h;
    });
    hesapHaritasi.value = harita;

    analistler.value = await analistlerRes.json();
  } catch {
    hata.value = "Sunucuya baglanilamadi";
  } finally {
    yukleniyor.value = false;
  }
}

function oncekiSayfa() {
  if (sayfa.value <= 1) return;
  sayfa.value -= 1;
  verileriYukle();
}

function sonrakiSayfa() {
  if (sayfa.value >= toplamSayfa.value) return;
  sayfa.value += 1;
  verileriYukle();
}

onMounted(verileriYukle);
watch(
  () => route.params.id,
  () => {
    sayfa.value = 1;
    verileriYukle();
  },
);
</script>

<style scoped>
.geri-linki {
  display: inline-block;
  margin-bottom: 16px;
  font-size: 14px;
  color: #0d9488;
  text-decoration: none;
}

.geri-linki:hover {
  text-decoration: underline;
}

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

.istatistik-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.istatistik-karti {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.istatistik-ikon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.ikon-mavi {
  background: #dbeafe;
  color: #1e40af;
}

.ikon-kirmizi {
  background: #fee2e2;
  color: #991b1b;
}

.ikon-turuncu {
  background: #ffedd5;
  color: #9a3412;
}

.ikon-yesil {
  background: #ccfbf1;
  color: #0d9488;
}

.istatistik-sayi {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.1;
}

.istatistik-etiket {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.tutar-hucre {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.hesap-no-hucre {
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 12px;
  letter-spacing: 0.3px;
  color: #475569;
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
  background: #0d9488;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.risk-dolgu.risk-yuksek {
  background: #dc2626;
}

.risk-sayi {
  font-size: 13px;
  color: #475569;
  vertical-align: middle;
}

.risk-bilgi-ikon {
  color: #94a3b8;
  font-size: 12px;
}

tr.tiklanabilir {
  cursor: pointer;
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

.durum-etiket {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 500;
  background: #f1f5f9;
  color: #475569;
}

.durum-inceleniyor {
  background: #fef3c7;
  color: #92400e;
}

.durum-beklemede {
  background: #fee2e2;
  color: #991b1b;
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
  background: #f1f5f9;
  color: #475569;
}

.pep-checkbox-etiket {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
}

.kyc-orta {
  background: #fef3c7;
  color: #92400e;
}

.kyc-yuksek {
  background: #fee2e2;
  color: #991b1b;
}

.kuyruk-sekmeler {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.kuyruk-sekme {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
}

.kuyruk-sekme:hover {
  color: #0f172a;
}

.kuyruk-sekme-aktif {
  color: #0d9488;
  border-bottom-color: #0d9488;
}

.filtre-cubugu {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.sayfalama {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 0 4px;
}

.sayfalama-bilgi {
  font-size: 13px;
  color: #64748b;
}

.arama-kutusu {
  flex: 1;
  min-width: 200px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
}

.filtre-cubugu select {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  background: white;
}

.filtre-sonuc-yok {
  color: #64748b;
  font-size: 14px;
  padding: 12px 0;
}

.kisayol-ipucu {
  color: #94a3b8;
  font-size: 12px;
  margin: 0 0 12px;
}

.kisayol-ipucu kbd {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 1px 6px;
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 11px;
}

.durum-kapatildi {
  background: #dcfce7;
  color: #166534;
}

.inceleme-formu {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #e2e8f0;
}

.inceleme-satiri {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.inceleme-satiri select {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 8px;
}

.not-timeline {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #e2e8f0;
}

.not-timeline ul {
  list-style: none;
  margin: 8px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.not-timeline li {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
}

.not-meta {
  font-size: 11px;
  color: #94a3b8;
}

.not-timeline li p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #334155;
}

.not-yok {
  font-size: 13px;
  color: #94a3b8;
  margin: 8px 0;
}

.not-timeline textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
  margin-bottom: 8px;
}

.inceleme-formu textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
}

.btn-kaydet {
  margin-top: 8px;
  background: #0d9488;
}

.btn-kaydet:hover {
  background: #0f766e;
}

.btn-kaydet:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.kaydet-onay {
  margin-left: 10px;
  color: #166534;
  font-size: 13px;
  font-weight: 600;
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

.inceleme-bilgi {
  margin: 8px 0 0;
  font-size: 12px;
  color: #94a3b8;
}

@media (max-width: 800px) {
  .istatistik-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
