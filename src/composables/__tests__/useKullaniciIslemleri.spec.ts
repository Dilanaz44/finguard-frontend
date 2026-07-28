import { describe, it, expect, vi, beforeEach } from "vitest";
import { defineComponent, computed } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { useKullaniciIslemleri } from "../useKullaniciIslemleri";

function routerOlustur() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/login", component: { template: "<div>Login</div>" } },
      { path: "/musteri/:id", component: { template: "<div />" } },
    ],
  });
}

function fetchMock(secenekler: {
  islemler?: unknown[];
  musteriler?: unknown[];
  hesaplar?: unknown[];
  analistler?: unknown[];
}) {
  const {
    islemler = [],
    musteriler = [],
    hesaplar = [],
    analistler = [],
  } = secenekler;

  return vi.fn(async (url: string, init?: RequestInit) => {
    const yol = String(url);
    const method = init?.method || "GET";

    if (yol.includes("/islemler/") && yol.includes("/ata")) {
      return { ok: true, json: async () => ({ id: 1, atananAnalistId: 3 }) };
    }
    if (yol.includes("/islemler/") && yol.includes("/notlar")) {
      return {
        ok: true,
        json: async () => ({
          id: 99,
          not: "yeni not",
          tarih: new Date().toISOString(),
        }),
      };
    }
    if (yol.match(/\/islemler\/\d+$/) && method === "PATCH") {
      return {
        ok: true,
        json: async () => ({ id: 1, incelemeDurumu: "inceleniyor" }),
      };
    }
    if (yol.includes("/islemler?")) {
      return {
        ok: true,
        json: async () => ({
          veri: islemler,
          toplamSayfa: 1,
          toplamKayit: islemler.length,
        }),
      };
    }
    if (yol.includes("/musteriler")) {
      return { ok: true, json: async () => musteriler };
    }
    if (yol.includes("/hesaplar")) {
      return { ok: true, json: async () => hesaplar };
    }
    if (yol.includes("/analistler")) {
      return { ok: true, json: async () => analistler };
    }
    return { ok: false, json: async () => ({}) };
  }) as unknown as typeof fetch;
}

function testBileseniOlustur(musteriIdDeger: string, router = routerOlustur()) {
  let disari: ReturnType<typeof useKullaniciIslemleri>;

  const TestBileseni = defineComponent({
    setup() {
      const musteriId = computed(() => musteriIdDeger);
      disari = useKullaniciIslemleri(musteriId);
      return {};
    },
    template: "<div />",
  });

  const wrapper = mount(TestBileseni, { global: { plugins: [router] } });
  return {
    wrapper,
    get disari() {
      return disari;
    },
    router,
  };
}

describe("useKullaniciIslemleri", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("rol", "analist");
    vi.restoreAllMocks();
  });

  it("mount edildiginde musteri/islem/hesap/analist verilerini yuklemeli", async () => {
    globalThis.fetch = fetchMock({
      musteriler: [{ id: 5, adSoyad: "Test Musteri" }],
      islemler: [{ id: 1, hesapId: 10, notlar: [] }],
      hesaplar: [{ id: 10 }],
      analistler: [{ id: 3, adSoyad: "Bir Analist" }],
    });

    const { disari } = testBileseniOlustur("5");
    await flushPromises();

    expect(disari.yukleniyor.value).toBe(false);
    expect(disari.musteri.value).toEqual({ id: 5, adSoyad: "Test Musteri" });
    expect(disari.islemler.value).toHaveLength(1);
    expect(disari.analistler.value).toHaveLength(1);
  });

  it("bir API cagrisi basarisiz olursa hata mesaji gostermeli", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    const { disari } = testBileseniOlustur("5");
    await flushPromises();

    expect(disari.hata.value).toBe("Veriler yuklenemedi");
    expect(disari.yukleniyor.value).toBe(false);
  });

  it("satiriAc secilen islemin durum/not alanlarini duzenleme formuna doldurmali", async () => {
    globalThis.fetch = fetchMock({
      islemler: [
        {
          id: 1,
          hesapId: 10,
          notlar: [],
          incelemeDurumu: "inceleniyor",
          analistNotu: "eski not",
        },
      ],
    });

    const { disari } = testBileseniOlustur("5");
    await flushPromises();

    disari.satiriAc(disari.islemler.value[0]!);

    expect(disari.acikNedenId.value).toBe(1);
    expect(disari.duzenlemeDurum.value).toBe("inceleniyor");
    expect(disari.duzenlemeNot.value).toBe("eski not");
  });

  it("detayAcKapa acik olan satiri tekrar tiklayinca kapatmali", async () => {
    globalThis.fetch = fetchMock({
      islemler: [{ id: 1, hesapId: 10, notlar: [] }],
    });

    const { disari } = testBileseniOlustur("5");
    await flushPromises();

    const islem = disari.islemler.value[0]!;
    disari.detayAcKapa(islem);
    expect(disari.acikNedenId.value).toBe(1);

    disari.detayAcKapa(islem);
    expect(disari.acikNedenId.value).toBeNull();
  });

  it("oturum yoksa notKaydet API'yi cagirmadan /login'e yonlendirmeli", async () => {
    globalThis.fetch = fetchMock({
      islemler: [{ id: 1, hesapId: 10, notlar: [] }],
    });

    const router = routerOlustur();
    const pushSpy = vi.spyOn(router, "push");
    const { disari } = testBileseniOlustur("5", router);
    await flushPromises();

    localStorage.removeItem("rol");
    const fetchCagriSayisi = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls.length;

    await disari.notKaydet(disari.islemler.value[0]!);

    expect(pushSpy).toHaveBeenCalledWith("/login");
    expect(
      (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(fetchCagriSayisi);
  });

  it("notKaydet basarili olunca islemi gunceller ve kaydet mesaji gostermeli", async () => {
    globalThis.fetch = fetchMock({
      islemler: [{ id: 1, hesapId: 10, notlar: [], incelemeDurumu: "yeni" }],
    });

    const { disari } = testBileseniOlustur("5");
    await flushPromises();

    await disari.notKaydet(disari.islemler.value[0]!);

    expect(disari.islemler.value[0]?.incelemeDurumu).toBe("inceleniyor");
    expect(disari.kaydetMesaji.value[1]).toBe("Kaydedildi ✓");
    expect(disari.kaydediliyor.value).toBe(false);
  });

  it("bos not metniyle notEkle API'yi hic cagirmamali", async () => {
    globalThis.fetch = fetchMock({
      islemler: [{ id: 1, hesapId: 10, notlar: [] }],
    });

    const { disari } = testBileseniOlustur("5");
    await flushPromises();

    const cagriSayisi = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls.length;
    await disari.notEkle(disari.islemler.value[0]!);

    expect(
      (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(cagriSayisi);
  });

  it("notEkle basarili olunca yeni notu listenin basina eklemeli", async () => {
    globalThis.fetch = fetchMock({
      islemler: [{ id: 1, hesapId: 10, notlar: [] }],
    });

    const { disari } = testBileseniOlustur("5");
    await flushPromises();

    disari.yeniNotMetni.value[1] = "merhaba";
    await disari.notEkle(disari.islemler.value[0]!);

    expect(disari.islemler.value[0]?.notlar).toHaveLength(1);
    expect(disari.yeniNotMetni.value[1]).toBe("");
  });

  it("sonrakiSayfa/oncekiSayfa toplamSayfa siniri disina cikmamali", async () => {
    globalThis.fetch = fetchMock({ islemler: [] });

    const { disari } = testBileseniOlustur("5");
    await flushPromises();

    expect(disari.sayfa.value).toBe(1);
    disari.oncekiSayfa();
    expect(disari.sayfa.value).toBe(1);

    disari.sonrakiSayfa();
    // toplamSayfa mock'ta 1 oldugu icin ileri gitmemeli.
    expect(disari.sayfa.value).toBe(1);
  });
});
