<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">

      <h2 class="text-2xl font-bold text-center text-gray-800">
        Restablecer Contraseña
      </h2>

      <p
        v-if="message"
        :class="[
          'text-sm text-center font-medium',
          messageType === 'error' ? 'text-red-600' : 'text-green-600'
        ]"
      >
        {{ message }}
      </p>

      <form @submit.prevent="resetPassword" class="space-y-4">

        <div>
          <label class="block text-sm font-medium mb-1">Nueva contraseña</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Ingrese su nueva contraseña"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Confirmar contraseña</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Confirme su nueva contraseña"
          />
        </div>

        <button
          type="submit"
          class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Actualizar contraseña
        </button>
      </form>

      <div class="pt-2 text-center">
        <router-link
          to="/login"
          class="text-blue-600 text-sm hover:underline"
        >
          Volver al inicio de sesión
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupabase } from '../../composables/useSupabase'
const supabase = useSupabase()

const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const messageType = ref('')

const token = ref('')

onMounted(() => {
  token.value = route.query.token || ''
})

const resetPassword = async () => {
  if (password.value !== confirmPassword.value) {
    message.value = 'Las contraseñas no coinciden'
    messageType.value = 'error'
    return
  }

  const { error } = await supabase.auth.updateUser({
    accessToken: token.value,
    password: password.value
  })

  if (error) {
    message.value = error.message
    messageType.value = 'error'
  } else {
    message.value = 'Contraseña actualizada correctamente'
    messageType.value = 'success'

    setTimeout(() => router.push('/login'), 2000)
  }
}
</script>
