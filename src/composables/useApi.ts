import { API_URL } from "../api";

// Token artik JavaScript'in erisemedigi bir httpOnly cookie'de (bkz. backend
// routes/auth.ts) - bu yuzden burada Authorization basligi eklemiyoruz,
// sadece credentials: 'include' diyoruz ki tarayici cookie'yi otomatik
// gondersin. response.ok kontrolu, hata mesaji gibi geri kalan mantik her
// cagride farkli oldugu icin view'larda kaldi.
export function useApi() {
  function apiFetch(yol: string, secenekler: RequestInit = {}): Promise<Response> {
    return fetch(`${API_URL}${yol}`, {
      ...secenekler,
      credentials: "include",
    });
  }

  return { apiFetch };
}
