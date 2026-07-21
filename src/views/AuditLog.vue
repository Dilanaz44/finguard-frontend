<template>
  <div>
    <div class="navbar">
      <Logo :size="32" :altbaslik="false" style="color: white;" />
      <div>
        <router-link to="/" class="btn btn-cikis" style="text-decoration: none; margin-right: 10px;">Musterilere Don</router-link>
        <button class="btn btn-cikis" @click="cikisYap">Cikis Yap</button>
      </div>
    </div>
    <div class="container">
      <div class="sayfa-baslik">
        <h1>Denetim Izi</h1>
        <p>Analistlerin yaptigi onemli eylemlerin kaydi.</p>
      </div>

      <div class="card">
        <div v-if="yukleniyor" class="yukleniyor-satiri"><span class="spinner"></span> Yukleniyor...</div>
        <p v-if="hata" class="hata-mesaj">{{ hata }}</p>
        <p v-if="!yukleniyor && kayitlar.length === 0 && !hata">Henuz kayit yok.</p>

        <table v-if="!yukleniyor && kayitlar.length > 0">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Analist</th>
              <th>Eylem</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="kayit in kayitlar" :key="kayit.id">
              <td>{{ formatTarih(kayit.tarih) }}</td>
              <td>{{ kayit.analist?.adSoyad }}</td>
              <td>{{ kayit.eylem }}</td>
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

const kayitlar = ref<any[]>([]);
const yukleniyor = ref(true);
const hata = ref('');
const router = useRouter();

function cikisYap() {
  localStorage.removeItem('token');
  localStorage.removeItem('rol');
  router.push('/login');
}

function formatTarih(tarih: string) {
  return new Date(tarih).toLocaleString('tr-TR');
}

onMounted(async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    router.push('/login');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/audit-log', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      hata.value = 'Kayitlar yuklenemedi';
      return;
    }

    kayitlar.value = await response.json();
  } catch (err) {
    hata.value = 'Sunucuya baglanilamadi';
  } finally {
    yukleniyor.value = false;
  }
});
</script>
