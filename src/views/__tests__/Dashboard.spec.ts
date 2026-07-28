import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import Dashboard from "../Dashboard.vue";

function routerOlustur() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: Dashboard },
      { path: "/login", component: { template: "<div>Login</div>" } },
      { path: "/musteri/:id", component: { template: "<div />" } },
      { path: "/risk-kuyrugu", component: { template: "<div />" } },
      { path: "/baglanti-grafi", component: { template: "<div />" } },
      { path: "/audit-log", component: { template: "<div />" } },
      { path: "/risk-ayarlari", component: { template: "<div />" } },
      { path: "/profil", component: { template: "<div />" } },
    ],
  });
}

// DashboardGrafikleri, Chart.js ile canvas'a ciziyor - jsdom'da canvas 2d
// context'i olmadigi icin bu bilesen testte stub'lanip atlaniyor. Test
// amaci grafik degil, musteri listesi/KPI mantigi.
const mountSecenekleri = {
  global: { stubs: { DashboardGrafikleri: true } },
};

describe("Dashboard.vue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("musteri listesi ve KPI'lar basariyla yuklenince gosterilmeli", async () => {
    localStorage.setItem("token", "sahte-token");

    globalThis.fetch = vi.fn(async (url) => {
      const yol = String(url);
      if (yol.includes("/musteriler")) {
        return {
          ok: true,
          json: async () => [
            {
              id: 1,
              adSoyad: "Ayse Yilmaz",
              email: "ayse@example.com",
              riskSeviyesi: "dusuk",
              pepMi: false,
              olusturmaTarihi: new Date().toISOString(),
            },
          ],
        };
      }
      if (yol.includes("/islemler")) {
        return {
          ok: true,
          json: async () => ({ veri: [], toplamKayit: 0, toplamSayfa: 1 }),
        };
      }
      if (yol.includes("/hesaplar")) {
        return { ok: true, json: async () => [] };
      }
      return { ok: false, json: async () => ({}) };
    }) as unknown as typeof fetch;

    const router = routerOlustur();
    router.push("/");
    await router.isReady();

    const wrapper = mount(Dashboard, {
      global: { ...mountSecenekleri.global, plugins: [router] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Ayse Yilmaz");
    expect(wrapper.find(".kpi-grid").exists()).toBe(true);
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("veri yuklenemezse hata mesaji gostermeli", async () => {
    localStorage.setItem("token", "sahte-token");

    globalThis.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        json: async () => ({}),
      }) as unknown as typeof fetch;

    const router = routerOlustur();
    router.push("/");
    await router.isReady();

    const wrapper = mount(Dashboard, {
      global: { ...mountSecenekleri.global, plugins: [router] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Veriler yuklenemedi");
  });
});
