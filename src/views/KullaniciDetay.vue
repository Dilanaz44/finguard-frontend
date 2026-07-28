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
                  <td class="hesap-no-hucre">
                    {{ aliciGoster(islem, hesapHaritasi) }}
                  </td>
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
import { computed } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "../components/Sidebar.vue";
import MusteriBasligi from "../components/MusteriBasligi.vue";
import IslemIstatistikleri from "../components/IslemIstatistikleri.vue";
import { useKullaniciIslemleri } from "../composables/useKullaniciIslemleri";
import { useIslemFiltreleri } from "../composables/useIslemFiltreleri";
import { useKlavyeNavigasyonu } from "../composables/useKlavyeNavigasyonu";
import {
  formatTarih,
  formatTutar,
  gonderenGoster,
  aliciGoster,
} from "../utils/islemGoruntuleme";

const route = useRoute();
const musteriId = computed(() => String(route.params.id));

const {
  islemler,
  sayfa,
  toplamSayfa,
  toplamKayit,
  musteri,
  analistler,
  hesapHaritasi,
  yukleniyor,
  hata,
  acikNedenId,
  duzenlemeDurum,
  duzenlemeNot,
  kaydediliyor,
  kaydetMesaji,
  yeniNotMetni,
  notEkleniyor,
  oncekiSayfa,
  sonrakiSayfa,
  satiriAc,
  detayAcKapa,
  atamaGuncelle,
  notEkle,
  notKaydet,
  sarTaslagiIndir,
  csvIndir,
} = useKullaniciIslemleri(musteriId);

const {
  aramaMetni,
  riskliFiltre,
  hedefFiltre,
  durumFiltre,
  siralama,
  kuyrukSekmeleri,
  siraliIslemler,
} = useIslemFiltreleri(islemler);

useKlavyeNavigasyonu({
  liste: siraliIslemler,
  acikId: acikNedenId,
  satiriAc,
  kaydet: notKaydet,
});

function durumEtiketMetni(durum: string) {
  if (durum === "inceleniyor") return "Inceleniyor";
  if (durum === "kapatildi") return "Kapatildi";
  return "Yeni";
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
</script>

<style scoped>
.geri-linki {
  display: inline-block;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--color-primary);
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
  color: var(--color-text);
  margin: 0 0 4px;
}

.sayfa-baslik p {
  color: var(--color-text-muted);
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
  border: 1px solid var(--color-border);
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
  color: var(--color-secondary);
}

.ikon-kirmizi {
  background: var(--color-danger-bg);
  color: var(--color-danger-text);
}

.ikon-turuncu {
  background: #ffedd5;
  color: #9a3412;
}

.ikon-yesil {
  background: #ccfbf1;
  color: var(--color-primary);
}

.istatistik-sayi {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.1;
}

.istatistik-etiket {
  font-size: 13px;
  color: var(--color-text-muted);
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
  color: var(--color-text-secondary);
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
  background: var(--color-primary);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.risk-dolgu.risk-yuksek {
  background: var(--color-danger);
}

.risk-sayi {
  font-size: 13px;
  color: var(--color-text-secondary);
  vertical-align: middle;
}

.risk-bilgi-ikon {
  color: var(--color-text-faint);
  font-size: 12px;
}

tr.tiklanabilir {
  cursor: pointer;
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

.durum-etiket {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 500;
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.durum-inceleniyor {
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.durum-beklemede {
  background: var(--color-danger-bg);
  color: var(--color-danger-text);
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

.kuyruk-sekmeler {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}

.kuyruk-sekme {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
}

.kuyruk-sekme:hover {
  color: var(--color-text);
}

.kuyruk-sekme-aktif {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
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
  color: var(--color-text-muted);
}

.arama-kutusu {
  flex: 1;
  min-width: 200px;
  border: 1px solid var(--color-border-input);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
}

.filtre-cubugu select {
  border: 1px solid var(--color-border-input);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  background: white;
}

.filtre-sonuc-yok {
  color: var(--color-text-muted);
  font-size: 14px;
  padding: 12px 0;
}

.kisayol-ipucu {
  color: var(--color-text-faint);
  font-size: 12px;
  margin: 0 0 12px;
}

.kisayol-ipucu kbd {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border-input);
  border-radius: 4px;
  padding: 1px 6px;
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 11px;
}

.durum-kapatildi {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}

.inceleme-formu {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.inceleme-satiri {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.inceleme-satiri select {
  border: 1px solid var(--color-border-input);
  border-radius: 6px;
  padding: 6px 8px;
}

.not-timeline {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
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
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 10px;
}

.not-meta {
  font-size: 11px;
  color: var(--color-text-faint);
}

.not-timeline li p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-text-strong);
}

.not-yok {
  font-size: 13px;
  color: var(--color-text-faint);
  margin: 8px 0;
}

.not-timeline textarea {
  width: 100%;
  border: 1px solid var(--color-border-input);
  border-radius: 6px;
  padding: 8px;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
  margin-bottom: 8px;
}

.inceleme-formu textarea {
  width: 100%;
  border: 1px solid var(--color-border-input);
  border-radius: 6px;
  padding: 8px;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
}

.btn-kaydet {
  margin-top: 8px;
  background: var(--color-primary);
}

.btn-kaydet:hover {
  background: var(--color-primary-hover);
}

.btn-kaydet:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.kaydet-onay {
  margin-left: 10px;
  color: var(--color-success-text);
  font-size: 13px;
  font-weight: 600;
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

.inceleme-bilgi {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--color-text-faint);
}

@media (max-width: 800px) {
  .istatistik-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
