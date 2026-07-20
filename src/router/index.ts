import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import KullaniciDetay from '../views/KullaniciDetay.vue';
import SifremiUnuttum from '../views/SifremiUnuttum.vue';
import SifreSifirla from '../views/SifreSifirla.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login },
    { path: '/sifremi-unuttum', component: SifremiUnuttum },
    { path: '/sifre-sifirla', component: SifreSifirla },
    { path: '/kullanici/:id', component: KullaniciDetay },
    { path: '/', component: Dashboard },
  ],
});

export default router;