import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import Login from "../Login.vue";

function routerOlustur() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div>Ana Sayfa</div>" } },
      { path: "/login", component: Login },
      { path: "/sifremi-unuttum", component: { template: "<div />" } },
    ],
  });
  return router;
}

describe("Login.vue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("basarili giriste rol/adSoyad localStorage'a kaydedilip ana sayfaya yonlendirmeli", async () => {
    // Token artik JSON govdesinde donmuyor - httpOnly cookie olarak set
    // ediliyor (bkz. backend routes/auth.ts), bu yuzden mock cevapta yok.
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        rol: "analist",
        adSoyad: "Test Kullanici",
        id: 1,
      }),
    }) as unknown as typeof fetch;

    const router = routerOlustur();
    router.push("/login");
    await router.isReady();

    const wrapper = mount(Login, { global: { plugins: [router] } });

    await wrapper.find('input[type="email"]').setValue("test@example.com");
    await wrapper.find('input[type="password"]').setValue("sifre123");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(localStorage.getItem("rol")).toBe("analist");
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("basarisiz giriste hata mesajini gostermeli, yonlendirmemeli", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ mesaj: "Email veya sifre hatali" }),
    }) as unknown as typeof fetch;

    const router = routerOlustur();
    router.push("/login");
    await router.isReady();

    const wrapper = mount(Login, { global: { plugins: [router] } });

    await wrapper.find('input[type="email"]').setValue("test@example.com");
    await wrapper.find('input[type="password"]').setValue("yanlis-sifre");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(wrapper.text()).toContain("Email veya sifre hatali");
    expect(localStorage.getItem("rol")).toBeNull();
    expect(router.currentRoute.value.path).toBe("/login");
  });
});
