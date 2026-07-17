<template>
  <div style="max-width: 900px; margin: 40px auto; font-family: sans-serif;">
    <h2>FinGuard - Islemler</h2>
    <button @click="cikisYap" style="margin-bottom: 15px;">Cikis Yap</button>
    <p v-if="yukleniyor">Yukleniyor...</p>
    <p v-if="hata" style="color: red;">{{ hata }}</p>
    <table v-if="!yukleniyor && islemler.length > 0" border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th>Hesap ID</th>
          <th>Tutar</th>
          <th>Para Birimi</th>
          <th>Hedef</th>
          <th>Risk Skoru</th>
          <th>Riskli mi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="islem in islemler" :key="islem.id" :style="islem.riskli ? 'background-color: #ffcccc;' : ''">
          <td>{{ islem.hesapId }}</td>
          <td>{{ islem.tutar }}</td>
          <td>{{ islem.paraBirimi }}</td>
          <td>{{ islem.hedefUlke }}</td>
          <td>{{ islem.riskSkoru }}</td>
          <td>{{ islem.riskli ? 'Evet' : 'Hayir' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const islemler = ref<any[]>([]);
const yukleniyor = ref(true);
const hata = ref('');
const router = useRouter();

function cikisYap() {
  localStorage.removeItem('token');
  router.push('/login');
}

onMounted(async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    router.push('/login');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/islemler', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      hata.value = 'Islemler yuklenemedi';
      yukleniyor.value = false;
      return;
    }

    islemler.value = await response.json();
  } catch (err) {
    hata.value = 'Sunucuya baglanilamadi';
  } finally {
    yukleniyor.value = false;
  }
});
</script>