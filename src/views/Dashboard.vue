<template>
  <div>
    <div class="navbar">
      <Logo :size="32" :altbaslik="false" style="color: white;" />
      <div>
        <button class="btn btn-cikis" @click="cikisYap">Cikis Yap</button>
      </div>
    </div>
    <div class="container">
      <div class="card">
        <h2>Islemler</h2>
        <p v-if="yukleniyor">Yukleniyor...</p>
        <p v-if="hata" class="hata-mesaj">{{ hata }}</p>
        <table v-if="!yukleniyor && islemler.length > 0">
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
            <tr v-for="islem in islemler" :key="islem.id" :class="{ riskli: islem.riskli }">
              <td>{{ islem.hesapId }}</td>
              <td>{{ islem.tutar }}</td>
              <td>{{ islem.paraBirimi }}</td>
              <td>{{ islem.hedefUlke }}</td>
              <td>{{ islem.riskSkoru }}</td>
              <td>
                <span class="badge" :class="islem.riskli ? 'badge-riskli' : 'badge-normal'">
                  {{ islem.riskli ? 'Evet' : 'Hayir' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Logo from '../components/Logo.vue';

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