<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Mis Cursos</h1>

    <div v-if="courses.length === 0" class="text-gray-600">No estás inscrito en ningún curso.</div>

    <ul v-else class="space-y-2">
      <li v-for="c in courses" :key="c.course_id" class="bg-white p-3 rounded shadow">
        <p><strong>Curso:</strong> {{ c.course_name }}</p>
        <p><strong>Nivel:</strong> {{ c.level }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const supabase = useSupabase()
const courses = ref([])
let employeeId = null

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: emp } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!emp) return
  employeeId = emp.id

  const { data } = await supabase
    .from('employee_courses')
    .select(`
      employee_id,
      course_id,
      level,
      courses(name) 
    `)
    .eq('employee_id', employeeId)

  courses.value = data.map(c => ({
    course_id: c.course_id,
    course_name: c.courses?.name || 'Curso desconocido',
    level: c.level
  }))
})
</script>
