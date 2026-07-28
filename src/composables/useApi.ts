import { API_URL } from "../api";

// Her authenticated istek ayni iki seyi tekrarliyordu: URL'in basina API_URL
// eklemek ve Authorization: Bearer <token> basligini eklemek. Bu composable
// sadece o ikisini merkezi hale getiriyor - response.ok kontrolu, hata mesaji
// gibi geri kalan mantik her cagride farkli oldugu icin view'larda kaldi.
export function useApi() {
  function apiFetch(yol: string, secenekler: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem("token");
    return fetch(`${API_URL}${yol}`, {
      ...secenekler,
      headers: {
        ...(secenekler.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return { apiFetch };
}
