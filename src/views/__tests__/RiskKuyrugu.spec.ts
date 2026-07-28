import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import RiskKuyrugu from "../RiskKuyrugu.vue";

function routerOlustur() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/login", component: { template: "<div>Login</div>" } },
      { path: "/risk-kuyrugu", component: RiskKuyrugu },
      { path: "/baglanti-grafi", component: { template: "<div />" } },
      { path: "/audit-log", component: { template: "<div />" } },
      { path: "/risk-ayarlari", component: { template: "<div />" } },
      { path: "/profil", component: { template: "<div />" } },
    ],
  });
}

function fetchMock(islemler: unknown[], hesaplar: unknown[] = []) {
  return vi.fn(async (url) => {
    const yol = String(url);
    if (yol.includes("/islemler")) {
      return { ok: true, json: async () => ({ veri: islemler }) };
    }
    if (yol.includes("/hesaplar")) {
      return { ok: true, json: async () => hesaplar };
    }
    return { ok: false, json: async () => ({}) };
  }) as unknown as typeof fetch;
}

describe("RiskKuyrugu.vue", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("token", "sahte-token");
    vi.restoreAllMocks();
  });

  it("bekleyen islem yoksa 'Bekleyen islem yok' mesajini gostermeli", async () => {
    globalThis.fetch = fetchMock([]);

    const router = routerOlustur();
    router.push("/risk-kuyrugu");
    await router.isReady();

    const wrapper = mount(RiskKuyrugu, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.text()).toContain("Bekleyen islem yok.");
  });

  it("sadece beklemede/ilk_onay_verildi durumundaki islemleri, risk skoruna gore siralayip gostermeli", async () => {
    globalThis.fetch = fetchMock([
      {
        id: 1,
        hesapId: 10,
        aliciHesapId: null,
        tutar: "100",
        paraBirimi: "TRY",
        hedefUlke: "yurt_ici",
        riskSkoru: 40,
        riskli: true,
        islemDurumu: "beklemede",
        olusturmaTarihi: new Date().toISOString(),
        hesap: {
          musteriId: 1,
          hesapNumarasi: null,
          musteri: { adSoyad: "Dusuk Riskli" },
        },
      },
      {
        id: 2,
        hesapId: 11,
        aliciHesapId: null,
        tutar: "500",
        paraBirimi: "TRY",
        hedefUlke: "yurt_ici",
        riskSkoru: 90,
        riskli: true,
        islemDurumu: "ilk_onay_verildi",
        olusturmaTarihi: new Date().toISOString(),
        hesap: {
          musteriId: 2,
          hesapNumarasi: null,
          musteri: { adSoyad: "Yuksek Riskli" },
        },
      },
      {
        id: 3,
        hesapId: 12,
        aliciHesapId: null,
        tutar: "50",
        paraBirimi: "TRY",
        hedefUlke: "yurt_ici",
        riskSkoru: 10,
        riskli: false,
        islemDurumu: "tamamlandi",
        olusturmaTarihi: new Date().toISOString(),
        hesap: {
          musteriId: 3,
          hesapNumarasi: null,
          musteri: { adSoyad: "Tamamlanmis" },
        },
      },
    ]);

    const router = routerOlustur();
    router.push("/risk-kuyrugu");
    await router.isReady();

    const wrapper = mount(RiskKuyrugu, { global: { plugins: [router] } });
    await flushPromises();

    // "tamamlandi" durumundaki islem risk kuyrugunda hic gorunmemeli.
    expect(wrapper.text()).not.toContain("Tamamlanmis");

    const satirlar = wrapper.findAll("tbody tr");
    expect(satirlar).toHaveLength(2);
    // En yuksek risk skoru (90) ilk satirda olmali.
    expect(satirlar[0]?.text()).toContain("Yuksek Riskli");
    expect(satirlar[1]?.text()).toContain("Dusuk Riskli");
  });
});
