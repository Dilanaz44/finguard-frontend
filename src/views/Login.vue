<template>
  <div class="login-sayfa">
    <div class="giris-karti">
      <div class="logo-satiri">
        <svg viewBox="0 0 100 100" width="32" height="32">
          <path d="M50 5 L90 20 L90 50 Q90 80 50 95 Q10 80 10 50 L10 20 Z" fill="#1e293b"/>
          <text x="50" y="58" text-anchor="middle" font-size="28" font-weight="bold" fill="white">FG</text>
        </svg>
        <span class="logo-baslik">FinGuard</span>
        <span class="logo-altbaslik">Dolandiricilik Tespit Sistemi</span>
      </div>

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
      <router-link to="/sifremi-unuttum" style="display: block; margin-top: 16px; font-size: 14px; text-align: center;">Sifremi mi unuttunuz?</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

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
    router.push('/');
  } catch (err) {
    hata.value = 'Sunucuya baglanilamadi';
  }
}
</script>

<style scoped>
.login-sayfa {
  min-height: 100vh;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.giris-karti {
  background: white;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 360px;
}

.logo-satiri {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.logo-baslik {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.logo-altbaslik {
  font-size: 12px;
  color: #94a3b8;
  width: 100%;
  margin-left: 42px;
}

.giris-karti h2 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #1e293b;
}

.input-grubu {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 14px;
}

.input-grubu input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
}

.goz-ikon {
  cursor: pointer;
  margin-left: 8px;
  user-select: none;
}

.giris-butonu {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  margin-top: 6px;
}

.giris-butonu:hover {
  opacity: 0.9;
}
</style>
