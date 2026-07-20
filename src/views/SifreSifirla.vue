<template>
  <div class="login-sayfa">
    <div class="giris-karti">
      <h2>Sifre Sifirla</h2>
      <form @submit.prevent="sifirla">
        <div class="input-grubu">
          <input v-model="yeniSifre" type="password" placeholder="Yeni Sifre" required />
        </div>
        <button type="submit" class="giris-butonu">SIFREYI GUNCELLE</button>
        <p v-if="mesaj" style="margin-top: 12px; color: #166534;">{{ mesaj }}</p>
        <p v-if="hata" class="hata-mesaj" style="margin-top: 12px;">{{ hata }}</p>
      </form>
      <router-link to="/login" style="display: block; margin-top: 16px; font-size: 14px;">Giris ekranina don</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const yeniSifre = ref('');
const mesaj = ref('');
const hata = ref('');
const route = useRoute();
const router = useRouter();

async function sifirla() {
  mesaj.value = '';
  hata.value = '';

  const token = route.query.token;

  if (typeof token !== 'string') {
    hata.value = 'Gecersiz link, token bulunamadi';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/sifre-sifirla', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, yeniSifre: yeniSifre.value }),
    });

    const veri = await response.json();

    if (!response.ok) {
      hata.value = veri.mesaj || 'Bir hata olustu';
      return;
    }

    mesaj.value = veri.mesaj + ' Giris sayfasina yonlendiriliyorsun...';
    setTimeout(() => router.push('/login'), 2000);
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

.giris-karti h2 {
  font-size: 18px;
  margin-bottom: 16px;
  color: #1e293b;
}

.input-grubu {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
}

.input-grubu input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
}

.giris-butonu {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.hata-mesaj {
  color: #b91c1c;
}
</style>
