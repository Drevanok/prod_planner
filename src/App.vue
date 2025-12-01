<template>
  <router-view />
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
