import { describe, it, expect } from "vitest";
import {
  formatTarih,
  formatTutar,
  numarayiMaskele,
  gonderenGoster,
  aliciGoster,
} from "../islemGoruntuleme";
import type { Islem, Hesap } from "../../types";

describe("formatTarih", () => {
  it("null verilince bos string donmeli", () => {
    expect(formatTarih(null)).toBe("");
  });

  it("gecerli bir tarihi tr-TR formatinda donmeli", () => {
    const sonuc = formatTarih("2026-01-15T10:30:00.000Z");
    expect(sonuc).not.toBe("");
    expect(sonuc).toContain("2026");
  });
});

describe("formatTutar", () => {
  it("sayiyi iki ondalik basamakla tr-TR formatinda gostermeli", () => {
    expect(formatTutar(1500)).toBe("1.500,00");
  });

  it("string tutari da dogru formatlamali", () => {
    expect(formatTutar("99.5")).toBe("99,50");
  });
});

describe("numarayiMaskele", () => {
  it("hesap numarasi yoksa yedek id ile # gostermeli", () => {
    expect(numarayiMaskele(null, 42)).toBe("#42");
    expect(numarayiMaskele(undefined, 7)).toBe("#7");
  });

  it("hesap numarasinin bas ve son 4 hanesini gosterip ortasini maskelemeli", () => {
    expect(numarayiMaskele("TR330006400000112345678901", 1)).toBe(
      "TR33 **** **** **** 8901",
    );
  });
});

function ornekIslem(overrides: Partial<Islem> = {}): Islem {
  return {
    id: 1,
    hesapId: 10,
    aliciHesapId: null,
    tutar: "100",
    paraBirimi: "TRY",
    hedefUlke: "yurt_ici",
    riskSkoru: 0,
    riskli: false,
    riskNedenleri: null,
    olusturmaTarihi: new Date().toISOString(),
    islemDurumu: "tamamlandi",
    ilkOnayAnalistId: null,
    ilkOnayTarihi: null,
    incelemeDurumu: "yeni",
    analistNotu: null,
    incelemeAnalistId: null,
    incelemeTarihi: null,
    atananAnalistId: null,
    ...overrides,
  };
}

describe("gonderenGoster", () => {
  it("hesap bilgisi yoksa 'Bilinmiyor' ve yedek id gostermeli", () => {
    const islem = ornekIslem({ hesapId: 5 });
    expect(gonderenGoster(islem)).toBe("Bilinmiyor (#5)");
  });

  it("musteri adini ve maskelenmis hesap numarasini birlikte gostermeli", () => {
    const islem = ornekIslem({
      hesapId: 5,
      hesap: {
        id: 5,
        musteriId: 1,
        bakiye: "0",
        paraBirimi: "TRY",
        hesapNumarasi: "TR330006400000112345678901",
        musteri: { adSoyad: "Ayse Yilmaz" },
      },
    });
    expect(gonderenGoster(islem)).toBe(
      "Ayse Yilmaz (TR33 **** **** **** 8901)",
    );
  });
});

describe("aliciGoster", () => {
  it("aliciHesapId yoksa tire gostermeli (para yatirma islemi)", () => {
    const islem = ornekIslem({ aliciHesapId: null });
    expect(aliciGoster(islem, {})).toBe("-");
  });

  it("hesap haritasinda bulunamayan alici icin yedek id gostermeli", () => {
    const islem = ornekIslem({ aliciHesapId: 99 });
    expect(aliciGoster(islem, {})).toBe("#99");
  });

  it("hesap haritasindan musteri adini ve maskelenmis numarayi gostermeli", () => {
    const islem = ornekIslem({ aliciHesapId: 7 });
    const hesapHaritasi: Record<number, Hesap> = {
      7: {
        id: 7,
        musteriId: 2,
        bakiye: "0",
        paraBirimi: "TRY",
        hesapNumarasi: "TR440006400000198765432109",
        musteri: { adSoyad: "Mehmet Demir" },
      },
    };
    expect(aliciGoster(islem, hesapHaritasi)).toBe(
      "Mehmet Demir (TR44 **** **** **** 2109)",
    );
  });
});
