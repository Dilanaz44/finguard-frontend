import { describe, it, expect, beforeEach } from "vitest";
import router from "../index";

// Bu testler gercek uygulama router'ini (src/router/index.ts) kullanir - amac,
// giris kontrolunun artik her sayfada degil, tek bir yerde (beforeEach guard)
// dogru calistigini dogrulamak.
describe("router beforeEach guard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("token yoksa korumali bir sayfaya gidince /login'e yonlendirmeli", async () => {
    await router.push("/risk-kuyrugu");
    expect(router.currentRoute.value.path).toBe("/login");
  });

  it("token varsa korumali sayfaya gidebilmeli", async () => {
    localStorage.setItem("token", "sahte-token");
    await router.push("/risk-kuyrugu");
    expect(router.currentRoute.value.path).toBe("/risk-kuyrugu");
  });

  it("token olmasa bile giris gerektirmeyen sayfalara (orn. /login) gidebilmeli", async () => {
    await router.push("/login");
    expect(router.currentRoute.value.path).toBe("/login");

    await router.push("/sifremi-unuttum");
    expect(router.currentRoute.value.path).toBe("/sifremi-unuttum");
  });
});
