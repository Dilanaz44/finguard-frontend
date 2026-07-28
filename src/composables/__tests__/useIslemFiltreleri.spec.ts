import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useIslemFiltreleri } from "../useIslemFiltreleri";
import type { Islem } from "../../types";

function ornekIslem(overrides: Partial<Islem>): Islem {
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
    olusturmaTarihi: "2026-01-01T00:00:00.000Z",
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

describe("useIslemFiltreleri", () => {
  it("varsayilan filtrelerle tum islemleri gostermeli", () => {
    const islemler = ref<Islem[]>([
      ornekIslem({ id: 1 }),
      ornekIslem({ id: 2 }),
    ]);
    const { siraliIslemler } = useIslemFiltreleri(islemler);

    expect(siraliIslemler.value).toHaveLength(2);
  });

  it("riskliFiltre 'evet' iken sadece riskli islemleri gostermeli", () => {
    const islemler = ref<Islem[]>([
      ornekIslem({ id: 1, riskli: true }),
      ornekIslem({ id: 2, riskli: false }),
    ]);
    const { riskliFiltre, siraliIslemler } = useIslemFiltreleri(islemler);

    riskliFiltre.value = "evet";

    expect(siraliIslemler.value).toHaveLength(1);
    expect(siraliIslemler.value[0]?.id).toBe(1);
  });

  it("hedefFiltre ile sadece secili hedefteki islemleri gostermeli", () => {
    const islemler = ref<Islem[]>([
      ornekIslem({ id: 1, hedefUlke: "yurt_disi" }),
      ornekIslem({ id: 2, hedefUlke: "yurt_ici" }),
    ]);
    const { hedefFiltre, siraliIslemler } = useIslemFiltreleri(islemler);

    hedefFiltre.value = "yurt_disi";

    expect(siraliIslemler.value).toHaveLength(1);
    expect(siraliIslemler.value[0]?.id).toBe(1);
  });

  it("# ile baslayan aramada hesap numarasinin son haneleriyle eslesmeli", () => {
    const islemler = ref<Islem[]>([
      ornekIslem({
        id: 1,
        hesapId: 5,
        hesap: {
          id: 5,
          musteriId: 1,
          bakiye: "0",
          paraBirimi: "TRY",
          hesapNumarasi: "TR330006400000112345678901",
        },
      }),
      ornekIslem({ id: 2, hesapId: 6 }),
    ]);
    const { aramaMetni, siraliIslemler } = useIslemFiltreleri(islemler);

    aramaMetni.value = "#8901";

    expect(siraliIslemler.value).toHaveLength(1);
    expect(siraliIslemler.value[0]?.id).toBe(1);
  });

  it("duz sayi aramasi sadece tutarda eslesmeli", () => {
    const islemler = ref<Islem[]>([
      ornekIslem({ id: 1, tutar: "500" }),
      ornekIslem({ id: 2, tutar: "100" }),
    ]);
    const { aramaMetni, siraliIslemler } = useIslemFiltreleri(islemler);

    aramaMetni.value = "500";

    expect(siraliIslemler.value).toHaveLength(1);
    expect(siraliIslemler.value[0]?.id).toBe(1);
  });

  it("siralama 'risk-yuksek' iken risk skoruna gore azalan sirada dizmeli", () => {
    const islemler = ref<Islem[]>([
      ornekIslem({ id: 1, riskSkoru: 30 }),
      ornekIslem({ id: 2, riskSkoru: 90 }),
      ornekIslem({ id: 3, riskSkoru: 60 }),
    ]);
    const { siralama, siraliIslemler } = useIslemFiltreleri(islemler);

    siralama.value = "risk-yuksek";

    expect(siraliIslemler.value.map((i) => i.id)).toEqual([2, 3, 1]);
  });

  it("kuyrukSekmeleri her incelemeDurumu icin dogru sayimi vermeli", () => {
    const islemler = ref<Islem[]>([
      ornekIslem({ id: 1, incelemeDurumu: "yeni" }),
      ornekIslem({ id: 2, incelemeDurumu: "yeni" }),
      ornekIslem({ id: 3, incelemeDurumu: "inceleniyor" }),
      ornekIslem({ id: 4, incelemeDurumu: "kapatildi" }),
    ]);
    const { kuyrukSekmeleri } = useIslemFiltreleri(islemler);

    const sayilar = Object.fromEntries(
      kuyrukSekmeleri.value.map((s) => [s.deger, s.sayi]),
    );

    expect(sayilar).toEqual({
      hepsi: 4,
      yeni: 2,
      inceleniyor: 1,
      kapatildi: 1,
    });
  });
});
