import { computed, ref, type Ref } from "vue";
import type { Islem } from "../types";

// Islem listesi uzerinde durum sekmesi, arama, riskli/hedef filtresi ve
// siralamayi yonetir - saf client-side turetme, API'ye dokunmaz.
export function useIslemFiltreleri(islemler: Ref<Islem[]>) {
  const aramaMetni = ref("");
  const riskliFiltre = ref("hepsi");
  const hedefFiltre = ref("hepsi");
  const durumFiltre = ref("hepsi");
  const siralama = ref("tarih-yeni");

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
      {
        deger: "inceleniyor",
        etiket: "Inceleniyor",
        sayi: sayilar.inceleniyor,
      },
      { deger: "kapatildi", etiket: "Kapatildi", sayi: sayilar.kapatildi },
    ];
  });

  const filtrelenmisIslemler = computed(() => {
    return islemler.value.filter((islem) => {
      if (riskliFiltre.value === "evet" && !islem.riskli) return false;
      if (riskliFiltre.value === "hayir" && islem.riskli) return false;
      if (
        hedefFiltre.value !== "hepsi" &&
        islem.hedefUlke !== hedefFiltre.value
      )
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

  return {
    aramaMetni,
    riskliFiltre,
    hedefFiltre,
    durumFiltre,
    siralama,
    kuyrukSekmeleri,
    filtrelenmisIslemler,
    siraliIslemler,
  };
}
