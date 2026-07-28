import RiskKuyrugu from "../views/RiskKuyrugu.vue";
import BaglantiGrafi from "../views/BaglantiGrafi.vue";
import RiskAyarlari from "../views/RiskAyarlari.vue";
import Profil from "../views/Profil.vue";
import { createRouter, createWebHistory } from "vue-router";
import AuditLog from "../views/AuditLog.vue";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import KullaniciDetay from "../views/KullaniciDetay.vue";
import SifremiUnuttum from "../views/SifremiUnuttum.vue";
import SifreSifirla from "../views/SifreSifirla.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/audit-log", component: AuditLog },
    { path: "/risk-kuyrugu", component: RiskKuyrugu },
    { path: "/baglanti-grafi", component: BaglantiGrafi },
    { path: "/risk-ayarlari", component: RiskAyarlari },
    { path: "/profil", component: Profil },
    { path: "/login", component: Login },
    { path: "/sifremi-unuttum", component: SifremiUnuttum },
    { path: "/sifre-sifirla", component: SifreSifirla },
    { path: "/musteri/:id", component: KullaniciDetay },
    { path: "/", component: Dashboard },
  ],
});

// Girisi gerektirmeyen tek sayfalar bunlar - geri kalan her route icin giris
// zorunlu. Onceden her view kendi onMounted'inda ayni kontrolu tekrarliyordu;
// artik navigasyon tamamlanmadan once merkezi olarak burada yapiliyor.
//
// Not: token artik httpOnly bir cookie'de (JS erisemiyor), o yuzden "giris
// yapilmis mi" kontrolunu token'in kendisiyle degil, login sirasinda ayrica
// sakladigimiz (hassas olmayan) 'rol' bilgisinin varligiyla yapiyoruz. Gercek
// yetkilendirme zaten her istekte backend'de (tokenDogrula) kontrol ediliyor -
// burasi sadece SPA'nin "hangi sayfayi gostereyim" kararini hizlandiriyor.
const GIRIS_GEREKTIRMEYEN_ROTALAR = ["/login", "/sifremi-unuttum", "/sifre-sifirla"];

router.beforeEach((to) => {
  const girisYapilmis = !!localStorage.getItem("rol");
  if (!girisYapilmis && !GIRIS_GEREKTIRMEYEN_ROTALAR.includes(to.path)) {
    return "/login";
  }
});

export default router;
