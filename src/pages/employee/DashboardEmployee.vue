<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold mb-4">Hola, {{ summary.full_name || 'Empleado' }}</h1>
    <p class="mb-6">Posición: {{ summary.position || 'N/A' }}</p>

    <div v-if="loading" class="text-gray-500">Cargando resumen...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      <div class="bg-blue-100 p-6 rounded-lg shadow hover:shadow-lg transition">
        <h2 class="text-lg font-semibold mb-2">Total de cursos</h2>
        <p class="text-2xl font-bold">{{ summary.total_courses }}</p>
      </div>

      <div class="bg-green-100 p-6 rounded-lg shadow hover:shadow-lg transition">
        <h2 class="text-lg font-semibold mb-2">Líneas trabajadas</h2>
        <ul class="list-disc list-inside">
          <li v-for="line in summary.lines_worked" :key="line">{{ line }}</li>
          <li v-if="summary.lines_worked.length === 0">Ninguna</li>
        </ul>
      </div>

      <div class="bg-yellow-100 p-6 rounded-lg shadow hover:shadow-lg transition">
        <h2 class="text-lg font-semibold mb-2">Unidades trabajadas</h2>
        <ul class="list-disc list-inside">
          <li v-for="unit in summary.units_worked" :key="unit">{{ unit }}</li>
          <li v-if="summary.units_worked.length === 0">Ninguna</li>
        </ul>
      </div>

      <div v-if="summary.recent_schedules?.length" class="col-span-full bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
        <h2 class="text-lg font-semibold mb-2">Próximos horarios asignados</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="s in summary.recent_schedules" :key="s.id" class="border p-4 rounded">
            <p><strong>Fecha:</strong> {{ s.date }}</p>
            <p><strong>Línea:</strong> {{ s.line_name }}</p>
            <p><strong>Área:</strong> {{ s.area_name }}</p>
            <p><strong>Unidad:</strong> {{ s.unit_name }}</p>
            <p v-if="s.station_number"><strong>Estación:</strong> {{ s.station_number }}</p>
            <p v-if="s.task_number"><strong>Tarea:</strong> {{ s.task_number }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const supabase = useSupabase()

const loading = ref(true)
const error = ref('')
const summary = ref({
  full_name: '',
  position: '',
  total_courses: 0,
  lines_worked: [],
  units_worked: [],
  recent_schedules: []
})

async function loadEmployeeSummary() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: emp } = await supabase
      .from('employees')
      .select('id, position, user_id')
      .eq('user_id', user.id)
      .single()
    if (!emp) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', emp.user_id)
      .single()
    summary.value.full_name = profile?.full_name || 'Empleado'
    summary.value.position = emp.position || 'N/A'

    const { data: courses } = await supabase
      .from('employee_courses')
      .select('id')
      .eq('employee_id', emp.id)
    summary.value.total_courses = courses?.length || 0

    const { data: assignments } = await supabase
      .from('employee_assignments')
      .select(`
        schedule (
          id,
          line_id,
          unit_id,
          date,
          line:lines(name, area_id, area:areas(name)),
          unit:units(name)
        ),
        station_number,
        task_number
      `)
      .eq('employee_id', emp.id)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const linesSet = new Set()
    const unitsSet = new Set()

    const futureSchedules = assignments?.filter(a => {
      const scheduleDate = new Date(a.schedule?.date)
      return scheduleDate >= today
    })

    const recent_schedules = []

    futureSchedules?.forEach(a => {
      if (a.schedule?.line?.name) linesSet.add(a.schedule.line.name)
      if (a.schedule?.unit?.name) unitsSet.add(a.schedule.unit.name)

      recent_schedules.push({
        id: a.schedule?.id,
        date: a.schedule?.date,
        line_name: a.schedule?.line?.name || 'N/A',
        area_name: a.schedule?.line?.area?.name || 'N/A',
        unit_name: a.schedule?.unit?.name || 'N/A',
        station_number: a.station_number,
        task_number: a.task_number
      })
    })

    summary.value.lines_worked = Array.from(linesSet)
    summary.value.units_worked = Array.from(unitsSet)

    summary.value.recent_schedules = recent_schedules
      .sort((a,b) => new Date(a.date) - new Date(b.date))

  } catch (err) {
    console.error(err)
    error.value = 'Error cargando el resumen.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEmployeeSummary()
})
</script>

<style scoped>
div > .shadow {
  transition: all 0.2s ease;
}
div > .shadow:hover {
  transform: translateY(-3px);
}
</style>
