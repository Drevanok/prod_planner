<template>
  <nav class="w-full px-6 py-4 bg-gray-900 text-white flex items-center justify-between shadow">

    <h1 class="text-xl font-semibold">
      <template v-if="role === 'admin'">Panel Administrador</template>
      <template v-else-if="role === 'employee'">Panel Empleado</template>
    </h1>

    <ul
      v-if="role"
      class="flex items-center gap-6 text-gray-300"
    >
 
      <template v-if="role === 'admin'">
        <li><router-link class="hover:text-white transition" to="/admin/dashboard">Dashboard</router-link></li>
        <li><router-link class="hover:text-white transition" to="/admin/employees">Empleados</router-link></li>
        <li><router-link class="hover:text-white transition" to="/admin/lines">Líneas</router-link></li>
        <li><router-link class="hover:text-white transition" to="/admin/units">Unidades</router-link></li>
        <li><router-link class="hover:text-white transition" to="/admin/schedule">Horarios</router-link></li>
        <li><router-link class="hover:text-white transition" to="/admin/courses">Cursos</router-link></li>
      </template>

      <template v-else-if="role === 'employee'">
        <li><router-link class="hover:text-white transition" to="/employee">Dashboard</router-link></li>
        <li><router-link class="hover:text-white transition" to="/employee/myskills">Mis Cursos</router-link></li>
        <li><router-link class="hover:text-white transition" to="/employee/myschedule">Mi Horario</router-link></li>
      </template>

      <li>
        <button
          @click="handleLogout"
          class="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition"
        >
          Cerrar sesión
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'

const router = useRouter()
const { logout } = useAuth()
const supabase = useSupabase() 

const role = ref(null)

onMounted(async () => {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    router.replace("/login")
    return
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (data) role.value = data.role
})

const handleLogout = async () => {
  await logout()
  router.replace('/login')
}
</script>
