import { onMounted, onUnmounted, type Ref } from "vue";

interface KlavyeNavigasyonuSecenekleri<T extends { id: number }> {
  liste: Ref<T[]>;
  acikId: Ref<number | null>;
  satiriAc: (oge: T) => void;
  kaydet: (oge: T) => void;
}

// Bir liste uzerinde asagi/yukari ok tuslariyla gezinme ve Enter/Cmd+Enter
// ile kaydetme kisayollarini saglar. Analist fareyle tek tek tiklamak
// yerine listede hizlica ilerleyebilir.
export function useKlavyeNavigasyonu<T extends { id: number }>(
  secenekler: KlavyeNavigasyonuSecenekleri<T>,
) {
  const { liste, acikId, satiriAc, kaydet } = secenekler;

  function klavyeDinleyici(e: KeyboardEvent) {
    const hedef = e.target as HTMLElement;
    const yaziYaziliyor = ["INPUT", "TEXTAREA", "SELECT"].includes(
      hedef.tagName,
    );

    // Cmd/Ctrl+Enter: not yazarken (textarea icindeyken) bile calissin, hizlica kaydetsin.
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && acikId.value !== null) {
      e.preventDefault();
      const acikOge = liste.value.find((i) => i.id === acikId.value);
      if (acikOge) kaydet(acikOge);
      return;
    }

    if (yaziYaziliyor) return; // arama kutusunda/notta yazarken diger kisayollari devre disi birak

    if (liste.value.length === 0) return;

    const suankiIndex = liste.value.findIndex((i) => i.id === acikId.value);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const sonrakiIndex =
        suankiIndex === -1 ? 0 : Math.min(suankiIndex + 1, liste.value.length - 1);
      satiriAc(liste.value[sonrakiIndex]!);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const oncekiIndex = suankiIndex === -1 ? 0 : Math.max(suankiIndex - 1, 0);
      satiriAc(liste.value[oncekiIndex]!);
    } else if (e.key === "Enter" && acikId.value !== null) {
      e.preventDefault();
      const acikOge = liste.value.find((i) => i.id === acikId.value);
      if (acikOge) kaydet(acikOge);
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", klavyeDinleyici);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", klavyeDinleyici);
  });
}
