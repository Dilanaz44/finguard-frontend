<template>
  <div style="max-width: 300px; margin: 100px auto; font-family: sans-serif;">
    <h2>FinGuard Giris</h2>
    <form @submit.prevent="girisYap">
      <div>
        <label>Email</label><br />
        <input v-model="email" type="email" required style="width: 100%; padding: 8px;" />
      </div>
      <div style="margin-top: 10px;">
        <label>Sifre</label><br />
        <input v-model="sifre" type="password" required style="width: 100%; padding: 8px;" />
      </div>
      <button type="submit" style="margin-top: 15px; padding: 8px 16px;">Giris Yap</button>
      <p v-if="hata" style="color: red;">{{ hata }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const sifre = ref('');
const hata = ref('');
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