<template>
  <div class="max-w-md mx-auto mt-6 p-6 bg-white rounded shadow">

    <!-- MENSAJES -->
    <p v-if="msg" class="text-green-600 text-center mb-4 text-lg font-semibold">
      {{ msg }}
    </p>

    <p v-if="errorMsg" class="text-red-600 text-center mb-4 text-lg font-semibold">
      {{ errorMsg }}
    </p>

    <!-- ======================= -->
    <!-- FORMULARIO (solo si no se ha enviado) -->
    <!-- ======================= -->
    <form
      v-if="!sent"
      @submit.prevent="sendLink"
      class="space-y-4"
    >
      <div>
        <label class="font-semibold">Correo</label>
        <input
          v-model="email"
          type="email"
          class="w-full px-4 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded"
      >
        Enviar enlace de recuperación
      </button>

      <!-- Botón regresar al login -->
      <button
        type="button"
        class="w-full bg-gray-200 py-2 rounded mt-3"
        @click="goLogin"
      >
        ← Volver al login
      </button>
    </form>

    <!-- ======================= -->
    <!-- VISTA DE “EMAIL ENVIADO” -->
    <!-- ======================= -->
    <div v-else class="space-y-4 text-center">

      <p class="text-lg text-green-700 font-medium">
        Email enviado correctamente.
      </p>

      <p class="text-gray-600">
        Revisa tu bandeja de entrada y sigue el enlace para restablecer tu contraseña.
      </p>

      <button
        class="w-full bg-blue-600 text-white py-2 rounded"
        @click="resend"
      >
        Reenviar correo
      </button>

      <!-- Botón regresar al login -->
      <button
        type="button"
        class="w-full bg-gray-200 py-2 rounded"
        @click="goLogin"
      >
        ← Volver al login
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref } from "vue"
import { useSupabase } from "@/composables/useSupabase"
import { useRouter } from "vue-router"

const email = ref("")
const msg = ref("")
const errorMsg = ref("")
const sent = ref(false) // controla si se muestra el formulario o el mensaje

const supabase = useSupabase()
const router = useRouter()

// enviar enlace
const sendLink = async () => {
  msg.value = ""
  errorMsg.value = ""

  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: window.location.origin + "/reset-password",
  })

  if (error) {
    errorMsg.value = error.message
    return
  }

  msg.value = "Hemos enviado un enlace a tu correo."
  sent.value = true
}

// reenviar email
const resend = () => {
  msg.value = ""
  sent.value = false
}

// regresar al login
const goLogin = () => {
  router.push("/login")
}
</script>
