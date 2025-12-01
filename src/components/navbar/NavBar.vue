<!-- NavBar.vue -->
<template>
  <nav class="navbar">
    <h1 v-if="role === 'admin'">Panel Administrador</h1>
    <h1 v-else-if="role === 'employee'">Panel Empleado</h1>

    <ul v-if="role">
      <!-- MENU ADMIN -->
      <template v-if="role === 'admin'">
        <li><router-link to="/admin">Inicio</router-link></li>
        <li><router-link to="/admin/dashboard">Dashboard</router-link></li>
        <li><router-link to="/admin/employees">Empleados</router-link></li>
        <li><router-link to="/admin/lines">Líneas</router-link></li>
        <li><router-link to="/admin/units">Unidades</router-link></li>
        <li><router-link to="/admin/schedule">Horarios</router-link></li>
        <li><router-link to="/admin/courses">Cursos</router-link></li>
      </template>

      <!-- MENU EMPLEADO -->
      <template v-else-if="role === 'employee'">
        <li><router-link to="/employee">Inicio</router-link></li>
        <li><router-link to="/employee/myskills">Mis Cursos</router-link></li>
        <li><router-link to="/employee/myschedule">Mi Horario</router-link></li>
      </template>


      <!-- BOTÓN LOGOUT -->
      <li>
        <button @click="handleLogout"
          class="text-gray-200 hover:text-white px-3 py-1 rounded bg-red-600 hover:bg-red-700 transition">
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
const supabase = useSupabase() // ← AQUÍ ESTABA EL ERROR

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

<style scoped>
.navbar {
  width: 100%;
  padding: 20px;
  background: #222;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

ul {
  display: flex;
  gap: 15px;
  list-style: none;
  align-items: center;
}

button {
  cursor: pointer;
  border: none;
}
</style>
