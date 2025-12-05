<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold mb-4">Mi Horario</h1>

    <div v-if="loading" class="text-gray-500">Cargando horarios...</div>
    <div v-else-if="schedules.length === 0 && pastSchedules.length === 0" class="text-gray-600">
      No tienes horarios asignados.
    </div>

    <div v-else>
      <h2 class="text-xl font-semibold mb-2">Horarios Actuales</h2>
      <div v-if="schedules.length === 0" class="text-gray-500 mb-4">No hay horarios para hoy o el futuro cercano.</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div v-for="s in schedules" :key="s.id" class="bg-white p-4 rounded shadow">
          <p><strong>Fecha:</strong> {{ s.date }}</p>
          <p><strong>Línea:</strong> {{ s.line_name }}</p>
          <p><strong>Área:</strong> {{ s.area_name }}</p>
          <p><strong>Unidad:</strong> {{ s.unit_name }}</p>
          <p v-if="s.station_number"><strong>Estación:</strong> {{ s.station_number }}</p>
          <p v-if="s.task_number"><strong>Tarea:</strong> {{ s.task_number }}</p>
        </div>
      </div>

      <div v-if="pastSchedules.length > 0">
        <button 
          @click="showPast = !showPast"
          class="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          {{ showPast ? 'Ocultar horarios pasados' : 'Ver horarios pasados' }}
        </button>

        <div v-if="showPast" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="s in pastSchedules" :key="s.id" class="bg-gray-100 p-4 rounded shadow">
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
const schedules = ref([])
const pastSchedules = ref([])
const loading = ref(true)
const showPast = ref(false)

onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    
    const { data: emp } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!emp) return

    const { data: assignments, error } = await supabase
      .from('employee_assignments')
      .select(`
        id,
        station_number,
        task_number,
        schedule (
          id,
          date,
          unit_id,
          line_id,
          line:lines (
            name,
            area_id,
            area:areas (
              name
            )
          ),
          unit:units (
            name
          )
        )
      `)
      .eq('employee_id', emp.id)

    if (error) throw error

    const today = new Date()
    schedules.value = []
    pastSchedules.value = []

    assignments
      .filter(a => a.schedule) 
      .forEach(a => {
        const item = {
          id: a.id,
          date: a.schedule.date,
          line_name: a.schedule.line?.name || 'N/A',
          area_name: a.schedule.line?.area?.name || 'N/A',
          unit_name: a.schedule.unit?.name || 'N/A',
          station_number: a.station_number,
          task_number: a.task_number
        }
        const scheduleDate = new Date(a.schedule.date)
        if (scheduleDate >= today.setHours(0,0,0,0)) {
          schedules.value.push(item) 
        } else {
          pastSchedules.value.push(item) 
        }
      })

  } catch (err) {
    console.error('Error cargando horarios:', err)
  } finally {
    loading.value = false
  }
})
</script>

