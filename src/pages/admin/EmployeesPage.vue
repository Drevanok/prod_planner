<template>
  <div class="p-6 max-w-6xl mx-auto space-y-6">
    <h1 class="text-3xl font-bold mb-4">Empleados Activos</h1>

    <div v-if="loading" class="text-blue-600 font-semibold">Cargando empleados...</div>
    <div v-if="error" class="text-red-600 font-semibold">{{ error.message || error }}</div>

    <table v-if="employees.length" class="w-full border-collapse bg-white shadow rounded">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="p-2 border">#</th>
          <th class="p-2 border">Nombre</th>
          <th class="p-2 border">Código</th>
          <th class="p-2 border">Posición</th>
          <th class="p-2 border">Rol</th>
          <th class="p-2 border">Cursos</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(emp, idx) in employees" :key="emp.id" class="border-t">
          <td class="p-2 border text-center">{{ idx + 1 }}</td>
          <td class="p-2 border">{{ emp.profiles?.full_name ?? '-' }}</td>
          <td class="p-2 border text-center">{{ emp.employee_code ?? '-' }}</td>
          <td class="p-2 border">{{ emp.position ?? '-' }}</td>
          <td class="p-2 border">{{ emp.profiles?.role ?? '-' }}</td>
          <td class="p-2 border">
            <ul class="list-disc list-inside space-y-1">
              <li v-for="ec in emp.employee_courses" :key="ec.id">
                {{ ec.courses?.name ?? '-' }} (Nivel: {{ ec.level ?? 'N/A' }})
              </li>
              <li v-if="!emp.employee_courses.length" class="text-gray-500 text-sm">Sin cursos</li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="text-gray-500 text-center">No hay empleados activos</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEmployees } from '@/composables/useEmployees'

const { employees, loadEmployees } = useEmployees()
const loading = ref(false)
const error = ref(null)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    await loadEmployees()
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
})
</script>

