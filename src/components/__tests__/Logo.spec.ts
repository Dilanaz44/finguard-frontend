import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Logo from "../Logo.vue";

describe("Logo.vue", () => {
  it("varsayilan proplarla basligi ve alt basligi gostermeli", () => {
    const wrapper = mount(Logo);

    expect(wrapper.text()).toContain("FinGuard");
    expect(wrapper.text()).toContain("Dolandiricilik Tespit Sistemi");
  });

  it("iconOnly true iken metni gizlemeli", () => {
    const wrapper = mount(Logo, { props: { iconOnly: true } });

    expect(wrapper.text()).not.toContain("FinGuard");
  });

  it("altbaslik false iken sadece basligi gostermeli", () => {
    const wrapper = mount(Logo, { props: { altbaslik: false } });

    expect(wrapper.text()).toContain("FinGuard");
    expect(wrapper.text()).not.toContain("Dolandiricilik Tespit Sistemi");
  });
});
