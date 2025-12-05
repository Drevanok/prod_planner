<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">

      <h2 class="text-2xl font-bold text-center text-gray-800">Iniciar Sesión</h2>
      <p v-if="errorMsg" class="text-red-600 text-sm text-center">{{ errorMsg }}</p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Correo</label>
          <input v-model="email" type="email" class="w-full px-4 py-2 border rounded-lg"/>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Contraseña</label>
          <input v-model="password" type="password" class="w-full px-4 py-2 border rounded-lg"/>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <span v-if="!loading">Ingresar</span>
          <span v-else>Cargando...</span>
        </button>
      </form>

      <div class="pt-2 text-sm text-center space-y-2">
        <router-link to="/recovery-password" class="text-blue-600 hover:underline block">¿Olvidaste tu contraseña?</router-link>
        <router-link to="/register" class="text-gray-700 hover:underline block">Crear una cuenta nueva</router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'


const email = ref('')
const password = ref('')

const router = useRouter()
const { login, errorMsg, loading, user } = useAuth()

async function handleLogin() {
  const ok = await login({
    email: email.value,
    password: password.value
  })

  if (!ok) return

  if (user.value?.role === 'admin') router.replace('/admin')
  else router.replace('/employee')
}
</script>
