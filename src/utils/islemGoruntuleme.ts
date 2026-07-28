import type { Hesap, Islem } from "../types";

export function formatTarih(tarih: string | null): string {
  if (!tarih) return "";
  return new Date(tarih).toLocaleString("tr-TR");
}

export function formatTutar(tutar: string | number): string {
  return Number(tutar).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// TR330006400000112345678901 -> TR33 **** **** **** 8901
export function numarayiMaskele(
  numara: string | null | undefined,
  yedekId: number,
): string {
  if (!numara) {
    // Eski hesap (hesap numarasi ozelligi eklenmeden once acilmis), eski gosterime don.
    return `#${yedekId}`;
  }
  const basi = numara.slice(0, 4);
  const sonu = numara.slice(-4);
  return `${basi} **** **** **** ${sonu}`;
}

export function gonderenGoster(islem: Islem): string {
  const ad = islem.hesap?.musteri?.adSoyad || "Bilinmiyor";
  const numara = numarayiMaskele(islem.hesap?.hesapNumarasi, islem.hesapId);
  return `${ad} (${numara})`;
}

export function aliciGoster(
  islem: Islem,
  hesapHaritasi: Record<number, Hesap>,
): string {
  if (!islem.aliciHesapId) return "-";

  const aliciHesap = hesapHaritasi[islem.aliciHesapId];
  if (!aliciHesap) return `#${islem.aliciHesapId}`;

  const ad = aliciHesap.musteri?.adSoyad || "Bilinmiyor";
  const numara = numarayiMaskele(aliciHesap.hesapNumarasi, islem.aliciHesapId);
  return `${ad} (${numara})`;
}
