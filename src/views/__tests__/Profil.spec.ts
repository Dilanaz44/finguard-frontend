import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import Profil from "../Profil.vue";

function routerOlustur() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/login", component: { template: "<div />" } },
      { path: "/profil", component: Profil },
    ],
  });
}

function fetchMock(secenekler: {
  totpAktif?: boolean;
  ikiFaKurBasarili?: boolean;
  ikiFaDogrulaBasarili?: boolean;
}) {
  const {
    totpAktif = false,
    ikiFaKurBasarili = true,
    ikiFaDogrulaBasarili = true,
  } = secenekler;

  return vi.fn((url: string) => {
    const yol = String(url);

    if (yol.includes("/profil")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ id: 1, adSoyad: "Test Analist", totpAktif }),
      });
    }
    if (yol.includes("/2fa/kur")) {
      return Promise.resolve({
        ok: ikiFaKurBasarili,
        json: async () => ({
          qrKodu: "data:image/png;base64,xxx",
          manuelAnahtar: "ABCDEFGHIJKLMNOP",
        }),
      });
    }
    if (yol.includes("/2fa/dogrula")) {
      return Promise.resolve({
        ok: ikiFaDogrulaBasarili,
        json: async () =>
          ikiFaDogrulaBasarili ? {} : { mesaj: "Kod hatali" },
      });
    }
    return Promise.resolve({ ok: false, json: async () => ({}) });
  }) as unknown as typeof fetch;
}

// Sayfada birden fazla "kaydet" butonu (Sifre Degistir + 2FA) ayni class'i
// paylastigi icin, testte butonu metnine gore buluyoruz - bu, sadece test
// icin production koduna ekstra bir class/id eklemekten kaciniyor.
function butonuBul(wrapper: VueWrapper, metin: string) {
  const buton = wrapper
    .findAll("button")
    .find((b) => b.text().includes(metin));
  if (!buton) throw new Error(`"${metin}" iceren buton bulunamadi`);
  return buton;
}

describe("Profil.vue - Iki Faktorlu Dogrulama", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("rol", "analist");
    vi.restoreAllMocks();
  });

  it("2FA kapaliyken 'Etkinlestir' butonunu gostermeli", async () => {
    globalThis.fetch = fetchMock({ totpAktif: false });

    const router = routerOlustur();
    router.push("/profil");
    await router.isReady();

    const wrapper = mount(Profil, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.text()).toContain("2FA'yi Etkinlestir");
    expect(wrapper.text()).not.toContain("2FA hesabinda etkin");
  });

  it("2FA acikken durum mesajini gostermeli, kurulum butonunu gostermemeli", async () => {
    globalThis.fetch = fetchMock({ totpAktif: true });

    const router = routerOlustur();
    router.push("/profil");
    await router.isReady();

    const wrapper = mount(Profil, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.text()).toContain("2FA hesabinda etkin");
    expect(wrapper.text()).not.toContain("2FA'yi Etkinlestir");
  });

  it("kurulum baslatilinca QR kodu ve manuel anahtari gostermeli", async () => {
    globalThis.fetch = fetchMock({ totpAktif: false });

    const router = routerOlustur();
    router.push("/profil");
    await router.isReady();

    const wrapper = mount(Profil, { global: { plugins: [router] } });
    await flushPromises();

    await butonuBul(wrapper, "Etkinlestir").trigger("click");
    await flushPromises();

    expect(wrapper.find("img.ikifa-qr").exists()).toBe(true);
    expect(wrapper.text()).toContain("ABCDEFGHIJKLMNOP");
  });

  it("dogru kodla onaylayinca 2FA'yi etkin durumuna gecirmeli", async () => {
    globalThis.fetch = fetchMock({ totpAktif: false });

    const router = routerOlustur();
    router.push("/profil");
    await router.isReady();

    const wrapper = mount(Profil, { global: { plugins: [router] } });
    await flushPromises();

    await butonuBul(wrapper, "Etkinlestir").trigger("click");
    await flushPromises();

    await wrapper.find('input[type="text"]').setValue("123456");
    await butonuBul(wrapper, "Onayla").trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("2FA hesabinda etkin");
    expect(wrapper.find("img.ikifa-qr").exists()).toBe(false);
  });

  it("yanlis kodla hata gostermeli, kurulum ekraninda kalmali", async () => {
    globalThis.fetch = fetchMock({
      totpAktif: false,
      ikiFaDogrulaBasarili: false,
    });

    const router = routerOlustur();
    router.push("/profil");
    await router.isReady();

    const wrapper = mount(Profil, { global: { plugins: [router] } });
    await flushPromises();

    await butonuBul(wrapper, "Etkinlestir").trigger("click");
    await flushPromises();

    await wrapper.find('input[type="text"]').setValue("000000");
    await butonuBul(wrapper, "Onayla").trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Kod hatali");
    expect(wrapper.find("img.ikifa-qr").exists()).toBe(true);
  });
});
