import { describe, it, expect, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useKlavyeNavigasyonu } from "../useKlavyeNavigasyonu";

interface TestOgesi {
  id: number;
}

function testBileseniOlustur(liste: TestOgesi[]) {
  const acikId = ref<number | null>(null);
  const satiriAc = vi.fn((oge: TestOgesi) => {
    acikId.value = oge.id;
  });
  const kaydet = vi.fn();

  const TestBileseni = defineComponent({
    setup() {
      useKlavyeNavigasyonu({
        liste: ref(liste),
        acikId,
        satiriAc,
        kaydet,
      });
      return {};
    },
    template: "<div />",
  });

  const wrapper = mount(TestBileseni);
  return { wrapper, acikId, satiriAc, kaydet };
}

function tuslaBas(key: string, secenekler: Partial<KeyboardEventInit> = {}) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key, ...secenekler }));
}

describe("useKlavyeNavigasyonu", () => {
  it("ArrowDown ile hicbir satir acik degilken ilk ogeyi acmali", () => {
    const { acikId } = testBileseniOlustur([{ id: 1 }, { id: 2 }, { id: 3 }]);

    tuslaBas("ArrowDown");

    expect(acikId.value).toBe(1);
  });

  it("ArrowDown ile bir sonraki ogeye gecmeli", () => {
    const { acikId } = testBileseniOlustur([{ id: 1 }, { id: 2 }, { id: 3 }]);
    acikId.value = 1;

    tuslaBas("ArrowDown");

    expect(acikId.value).toBe(2);
  });

  it("ArrowDown son ogedeyken siniri asmamali", () => {
    const { acikId } = testBileseniOlustur([{ id: 1 }, { id: 2 }]);
    acikId.value = 2;

    tuslaBas("ArrowDown");

    expect(acikId.value).toBe(2);
  });

  it("ArrowUp ile bir onceki ogeye gecmeli", () => {
    const { acikId } = testBileseniOlustur([{ id: 1 }, { id: 2 }, { id: 3 }]);
    acikId.value = 3;

    tuslaBas("ArrowUp");

    expect(acikId.value).toBe(2);
  });

  it("liste bosken hicbir seyi degistirmemeli", () => {
    const { acikId, satiriAc } = testBileseniOlustur([]);

    tuslaBas("ArrowDown");

    expect(satiriAc).not.toHaveBeenCalled();
    expect(acikId.value).toBeNull();
  });

  it("acik satir varken Enter ile kaydet cagirmali", () => {
    const { acikId, kaydet } = testBileseniOlustur([{ id: 1 }, { id: 2 }]);
    acikId.value = 2;

    tuslaBas("Enter");

    expect(kaydet).toHaveBeenCalledWith({ id: 2 });
  });

  it("Cmd/Ctrl+Enter yazi yazilirken (input icinde) bile kaydet cagirmali", () => {
    const { acikId, kaydet } = testBileseniOlustur([{ id: 1 }]);
    acikId.value = 1;

    const input = document.createElement("input");
    document.body.appendChild(input);
    const olay = new KeyboardEvent("keydown", {
      key: "Enter",
      ctrlKey: true,
    });
    Object.defineProperty(olay, "target", { value: input });
    window.dispatchEvent(olay);
    document.body.removeChild(input);

    expect(kaydet).toHaveBeenCalledWith({ id: 1 });
  });

  it("input icinde yazi yazilirken ArrowDown/Up devre disi kalmali", () => {
    const { acikId, satiriAc } = testBileseniOlustur([{ id: 1 }, { id: 2 }]);
    acikId.value = 1;

    const input = document.createElement("input");
    document.body.appendChild(input);
    const olay = new KeyboardEvent("keydown", { key: "ArrowDown" });
    Object.defineProperty(olay, "target", { value: input });
    window.dispatchEvent(olay);
    document.body.removeChild(input);

    expect(satiriAc).not.toHaveBeenCalled();
    expect(acikId.value).toBe(1);
  });
});
