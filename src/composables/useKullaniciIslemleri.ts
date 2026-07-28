import { ref, onMounted, watch, type Ref } from "vue";
import { useRouter } from "vue-router";
import { useApi } from "./useApi";
import type { Islem, Musteri, Hesap, Analist } from "../types";

// Musteri detay sayfasinin sunucuyla senkron tum verisini ve mutasyonlarini
// yonetir: islem listesi + sayfalama, musteri/hesap/analist verisi, inceleme
// kaydi, not ekleme, atama guncelleme, SAR/CSV indirme. musteriId degistiginde
// (route degisince) veriler otomatik yeniden yuklenir.
export function useKullaniciIslemleri(musteriId: Ref<string>) {
  const { apiFetch } = useApi();
  const router = useRouter();

  const islemler = ref<Islem[]>([]);
  const sayfa = ref(1);
  const toplamSayfa = ref(1);
  const toplamKayit = ref(0);
  const musteri = ref<Musteri | null>(null);
  const analistler = ref<Analist[]>([]);
  const hesapHaritasi = ref<Record<number, Hesap>>({});
  const yukleniyor = ref(true);
  const hata = ref("");

  const acikNedenId = ref<number | null>(null);
  const duzenlemeDurum = ref("yeni");
  const duzenlemeNot = ref("");
  const kaydediliyor = ref(false);
  const kaydetMesaji = ref<Record<number, string>>({});
  const yeniNotMetni = ref<Record<number, string>>({});
  const notEkleniyor = ref<Record<number, boolean>>({});

  // Oturum kapanmis/rol bilgisi silinmisse islemi durdurup girise yonlendirir.
  function girisGerekliMi(): boolean {
    if (!localStorage.getItem("rol")) {
      router.push("/login");
      return true;
    }
    return false;
  }

  async function verileriYukle() {
    yukleniyor.value = true;
    hata.value = "";

    try {
      const [musterilerRes, islemlerRes, hesaplarRes, analistlerRes] =
        await Promise.all([
          apiFetch("/musteriler"),
          apiFetch(
            `/islemler?musteriId=${musteriId.value}&sayfa=${sayfa.value}&limit=20`,
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
        (m: Musteri) => String(m.id) === String(musteriId.value),
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

  function satiriAc(islem: Islem) {
    acikNedenId.value = islem.id;
    duzenlemeDurum.value = islem.incelemeDurumu || "yeni";
    duzenlemeNot.value = islem.analistNotu || "";
  }

  function detayAcKapa(islem: Islem) {
    if (acikNedenId.value === islem.id) {
      acikNedenId.value = null;
      return;
    }
    satiriAc(islem);
  }

  async function atamaGuncelle(islem: Islem, secilenDeger: string) {
    if (girisGerekliMi()) return;

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
        islemler.value[index] = {
          ...islemler.value[index],
          ...guncellenenIslem,
        };
      }
    } catch {
      hata.value = "Sunucuya baglanilamadi";
    }
  }

  async function notEkle(islem: Islem) {
    const metin = (yeniNotMetni.value[islem.id] || "").trim();
    if (!metin) return;

    if (girisGerekliMi()) return;

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
        const guncelNotlar = [
          yeniNot,
          ...(islemler.value[index]!.notlar || []),
        ];
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

  async function notKaydet(islem: Islem) {
    if (girisGerekliMi()) return;

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
        islemler.value[index] = {
          ...islemler.value[index],
          ...guncellenenIslem,
        };
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
    try {
      const response = await apiFetch(
        `/islemler/export?musteriId=${musteriId.value}`,
      );

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `islemler-${musteriId.value}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      hata.value = "CSV indirilemedi";
    }
  }

  onMounted(verileriYukle);
  watch(musteriId, () => {
    sayfa.value = 1;
    verileriYukle();
  });

  return {
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
    verileriYukle,
    oncekiSayfa,
    sonrakiSayfa,
    satiriAc,
    detayAcKapa,
    atamaGuncelle,
    notEkle,
    notKaydet,
    sarTaslagiIndir,
    csvIndir,
  };
}
