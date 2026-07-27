// Backend'den (finguard-backend/prisma/schema.prisma) gelen JSON yanitlarinin
// sekli. Decimal/DateTime alanlari JSON'a serialize edilirken string olarak
// gelir (Prisma Decimal ve JS Date, res.json() sirasinda string'e donusur).

export interface Analist {
  id: number;
  adSoyad: string;
  rol?: string;
}

export interface Musteri {
  id: number;
  adSoyad: string;
  email: string;
  olusturmaTarihi: string;
  riskSeviyesi: "dusuk" | "orta" | "yuksek";
  pepMi: boolean;
}

export interface Hesap {
  id: number;
  musteriId: number;
  bakiye: string;
  paraBirimi: string;
  hesapNumarasi: string | null;
  // GET /hesaplar musteri adini da ekliyor, POST /hesaplar eklemiyor.
  musteri?: { adSoyad: string; email?: string };
}

export interface Islem {
  id: number;
  hesapId: number;
  aliciHesapId: number | null;
  tutar: string;
  paraBirimi: string;
  hedefUlke: string;
  riskSkoru: number | null;
  riskli: boolean;
  riskNedenleri: string[] | null;
  olusturmaTarihi: string;
  islemDurumu: "beklemede" | "ilk_onay_verildi" | "tamamlandi" | "reddedildi";
  ilkOnayAnalistId: number | null;
  ilkOnayTarihi: string | null;
  incelemeDurumu: "yeni" | "inceleniyor" | "kapatildi";
  analistNotu: string | null;
  incelemeAnalistId: number | null;
  incelemeTarihi: string | null;
  atananAnalistId: number | null;
  // Bazi uc noktalar (orn. /islemler) iliskili kayitlari da ekliyor - bunlar
  // sadece o uc noktalarda var oldugu icin opsiyonel.
  hesap?: Hesap;
  atananAnalist?: { adSoyad: string } | null;
  incelemeAnalist?: { adSoyad: string } | null;
  ilkOnayAnalist?: { adSoyad: string } | null;
  notlar?: IslemNotu[];
}

export interface IslemNotu {
  id: number;
  islemId: number;
  analistId: number;
  not: string;
  tarih: string;
  analist?: { adSoyad: string };
}

// Backend'deki riskMotoru.ts'deki RiskAyarlari ile ayni sekil.
export interface RiskAyarlari {
  anormalTutarCarpani: number;
  siklikPencereDakika: number;
  siklikEsikAdet: number;
  geceBaslangicSaat: number;
  geceBitisSaat: number;
  riskliEsikPuan: number;
  askiyaAlmaEsikPuan: number;
  kycOrtaRiskPuan: number;
  kycYuksekRiskPuan: number;
  yapilandirmaEsikTutar: number;
  pepRiskPuan: number;
  anomaliZSkoruEsigi: number;
}

export interface AuditKaydi {
  id: number;
  analistId: number;
  eylem: string;
  hedefTip: string | null;
  hedefId: number | null;
  detay: Record<string, unknown> | null;
  tarih: string;
  analist?: { adSoyad: string };
}
