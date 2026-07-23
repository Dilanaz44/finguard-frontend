<template>
  <div class="login-sayfa">
    <div class="giris-karti">
      <Logo :size="40" style="margin-bottom: 24px;" />

      <h2>Analist Girisi</h2>

      <form @submit.prevent="girisYap">
        <div class="input-grubu">
          <input v-model="email" type="email" placeholder="Email" required />
        </div>
        <div class="input-grubu">
          <input v-model="sifre" :type="sifreGoster ? 'text' : 'password'" placeholder="Sifre" required />
          <span class="goz-ikon" @click="sifreGoster = !sifreGoster">
            <svg v-if="!sifreGoster" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" stroke-width="2">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" stroke-width="2">
              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </span>
        </div>

        <button type="submit" class="giris-butonu">GIRIS YAP</button>
        <p v-if="hata" class="hata-mesaj">{{ hata }}</p>
      </form>
      <router-link to="/sifremi-unuttum" class="unuttum-linki">Sifremi Unuttum</router-link>

      <div class="guven-rozeti">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0d9488" stroke-width="2">
          <path d="M12 2 L20 6 L20 12 Q20 18 12 22 Q4 18 4 12 L4 6 Z" />
          <path d="M8.5 12 L11 14.5 L15.5 9.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Guvenli baglanti, 256-bit sifreleme
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Logo from '../components/Logo.vue';

const email = ref('');
const sifre = ref('');
const hata = ref('');
const sifreGoster = ref(false);
const router = useRouter();

async function girisYap() {
  hata.value = '';
  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, sifre: sifre.value }),
    });

    const veri = await response.json();

    if (!response.ok) {
      hata.value = veri.mesaj || 'Giris basarisiz';
      return;
    }

    localStorage.setItem('token', veri.token);
    localStorage.setItem('rol', veri.rol);
    localStorage.setItem('adSoyad', veri.adSoyad);
    localStorage.setItem('analistId', String(veri.id));
    router.push('/');
  } catch (err) {
    hata.value = 'Sunucuya baglanilamadi';
  }
}
</script>

<style scoped>
.login-sayfa {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: #f7f9fb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-sayfa::before,
.login-sayfa::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  z-index: 0;
}

.login-sayfa::before {
  width: 480px;
  height: 480px;
  background: rgba(13, 148, 136, 0.18);
  top: -120px;
  left: -100px;
}

.login-sayfa::after {
  width: 420px;
  height: 420px;
  background: rgba(30, 64, 175, 0.14);
  bottom: -100px;
  right: -80px;
}

.giris-karti {
  position: relative;
  z-index: 1;
  background: white;
  border: 1px solid #e8ecf0;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
  padding: 44px 40px 36px;
  width: 380px;
}

.giris-karti h2 {
  font-size: 19px;
  margin-bottom: 22px;
  color: #0f172a;
  font-weight: 700;
}

.input-grubu {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  padding: 11px 14px;
  margin-bottom: 14px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input-grubu:focus-within {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
  background: white;
}

.input-grubu input {
  border: none;
  outline: none;
  background: transparent;
  flex: 1;
  font-size: 14px;
  color: #0f172a;
}

.goz-ikon {
  cursor: pointer;
  margin-left: 8px;
  user-select: none;
}

.giris-butonu {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #0d9488, #1e40af);
  color: white;
  border: none;
  border-radius: 9px;
  font-weight: 600;
  letter-spacing: 0.4px;
  cursor: pointer;
  margin-top: 8px;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  box-shadow: 0 8px 20px rgba(13, 148, 136, 0.25);
}

.giris-butonu:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(13, 148, 136, 0.32);
}

.giris-butonu:active {
  transform: translateY(0);
}

.unuttum-linki {
  display: block;
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
  color: #475569;
  text-decoration: none;
}

.unuttum-linki:hover {
  color: #0d9488;
}

.guven-rozeti {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid #f1f5f9;
  font-size: 12px;
  color: #94a3b8;
}
</style>
