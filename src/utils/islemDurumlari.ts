import type { Islem } from "../types";

// Henuz tamamlanmamis/reddedilmemis, analist onayi bekleyen islem durumlari.
const ONAY_BEKLEYEN_DURUMLAR: Islem["islemDurumu"][] = [
  "beklemede",
  "ilk_onay_verildi",
];

export function onayBekliyorMu(islem: Islem): boolean {
  return ONAY_BEKLEYEN_DURUMLAR.includes(islem.islemDurumu);
}
