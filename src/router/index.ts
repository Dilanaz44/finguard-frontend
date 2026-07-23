import RiskKuyrugu from '../views/RiskKuyrugu.vue';
import BaglantiGrafi from '../views/BaglantiGrafi.vue';
import RiskAyarlari from '../views/RiskAyarlari.vue';
import { createRouter, createWebHistory } from 'vue-router';
import AuditLog from '../views/AuditLog.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import KullaniciDetay from '../views/KullaniciDetay.vue';
import SifremiUnuttum from '../views/SifremiUnuttum.vue';
import SifreSifirla from '../views/SifreSifirla.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/audit-log', component: AuditLog },
    { path: '/risk-kuyrugu', component: RiskKuyrugu },
    { path: '/baglanti-grafi', component: BaglantiGrafi },
    { path: '/risk-ayarlari', component: RiskAyarlari },
    { path: '/login', component: Login },
    { path: '/sifremi-unuttum', component: SifremiUnuttum },
    { path: '/sifre-sifirla', component: SifreSifirla },
    { path: '/musteri/:id', component: KullaniciDetay },
    { path: '/', component: Dashboard },
  ],
});

export default router;