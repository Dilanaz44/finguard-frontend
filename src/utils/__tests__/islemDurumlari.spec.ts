import { describe, it, expect } from "vitest";
import { onayBekliyorMu } from "../islemDurumlari";
import type { Islem } from "../../types";

function ornekIslem(islemDurumu: Islem["islemDurumu"]): Islem {
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
    islemDurumu,
    ilkOnayAnalistId: null,
    ilkOnayTarihi: null,
    incelemeDurumu: "yeni",
    analistNotu: null,
    incelemeAnalistId: null,
    incelemeTarihi: null,
    atananAnalistId: null,
  };
}

describe("onayBekliyorMu", () => {
  it("beklemede durumundaki islem icin true donmeli", () => {
    expect(onayBekliyorMu(ornekIslem("beklemede"))).toBe(true);
  });

  it("ilk_onay_verildi durumundaki islem icin true donmeli", () => {
    expect(onayBekliyorMu(ornekIslem("ilk_onay_verildi"))).toBe(true);
  });

  it("tamamlandi durumundaki islem icin false donmeli", () => {
    expect(onayBekliyorMu(ornekIslem("tamamlandi"))).toBe(false);
  });

  it("reddedildi durumundaki islem icin false donmeli", () => {
    expect(onayBekliyorMu(ornekIslem("reddedildi"))).toBe(false);
  });
});
