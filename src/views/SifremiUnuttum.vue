<template>
  <div class="login-sayfa">
    <div class="giris-karti">
      <h2>Sifremi Unuttum</h2>
      <p style="color: #64748b; font-size: 14px;">Email adresini gir, sifirlama linki gonderelim.</p>
      <form @submit.prevent="gonder">
        <div class="input-grubu">
          <input v-model="email" type="email" placeholder="Email" required />
        </div>
        <button type="submit" class="giris-butonu">LINK GONDER</button>
        <p v-if="mesaj" style="margin-top: 12px; color: #166534;">{{ mesaj }}</p>
      </form>
      <router-link to="/login" style="display: block; margin-top: 16px; font-size: 14px;">Giris ekranina don</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { API_URL } from '../api';

const email = ref('');
const mesaj = ref('');

async function gonder() {
  mesaj.value = '';
  try {
    const response = await fetch(`${API_URL}/sifremi-unuttum`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    });
    const veri = await response.json();
    mesaj.value = veri.mesaj;
  } catch (err) {
    mesaj.value = 'Sunucuya baglanilamadi';
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
  margin-bottom: 8px;
  color: #1e293b;
}

.input-grubu {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 14px;
  margin: 16px 0;
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
</style>
