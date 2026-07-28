<template>
  <div class="login-sayfa">
    <div class="giris-karti">
      <h2>Sifremi Unuttum</h2>
      <p class="aciklama-metni">
        Email adresini gir, sifirlama linki gonderelim.
      </p>
      <form @submit.prevent="gonder">
        <div class="input-grubu">
          <label for="email-input" class="sr-only">Email</label>
          <input
            id="email-input"
            v-model="email"
            type="email"
            placeholder="Email"
            required
          />
        </div>
        <button type="submit" class="giris-butonu">LINK GONDER</button>
        <p v-if="mesaj" class="basari-mesaji">
          {{ mesaj }}
        </p>
      </form>
      <router-link to="/login" class="geri-linki"
        >Giris ekranina don</router-link
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { API_URL } from "../api";

const email = ref("");
const mesaj = ref("");

async function gonder() {
  mesaj.value = "";
  try {
    const response = await fetch(`${API_URL}/sifremi-unuttum`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value }),
    });
    const veri = await response.json();
    mesaj.value = veri.mesaj;
  } catch {
    mesaj.value = "Sunucuya baglanilamadi";
  }
}
</script>

<style scoped>
.login-sayfa {
  min-height: 100vh;
  background: var(--color-surface-hover);
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
  color: var(--color-text-heading);
}

.input-grubu {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border-input);
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
  background: linear-gradient(
    135deg,
    var(--color-text-heading),
    var(--color-text)
  );
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.aciklama-metni {
  color: var(--color-text-muted);
  font-size: 14px;
}

.basari-mesaji {
  margin-top: 12px;
  color: var(--color-success-text);
}

.geri-linki {
  display: block;
  margin-top: 16px;
  font-size: 14px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
