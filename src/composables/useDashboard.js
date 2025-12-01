// src/composables/useDashboard.js
import { ref } from 'vue'
import { useSupabase } from './useSupabase'

export function useDashboard() {
  const supabase = useSupabase()

  const totals = ref({
    employees: 0,
    units: 0,
    lines: 0,
    courses: 0,
    assignmentsToday: 0
  })

  const upcomingSchedules = ref([])
  const topCourses = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ---------------------------------------------------------
  // 1) TOTALS
  // ---------------------------------------------------------
  const loadTotals = async () => {
    loading.value = true
    error.value = null

    try {
      const [
        { count: empCount },
        { count: unitCount },
        { count: lineCount },
        { count: courseCount }
      ] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact' }),
        supabase.from('units').select('id', { count: 'exact' }),
        supabase.from('lines').select('id', { count: 'exact' }),
        supabase.from('courses').select('id', { count: 'exact' })
      ])

      totals.value.employees = empCount ?? 0
      totals.value.units = unitCount ?? 0
      totals.value.lines = lineCount ?? 0
      totals.value.courses = courseCount ?? 0

      // Asignaciones de hoy
      const today = new Date().toISOString().slice(0, 10)
      const { data: schedulesToday } = await supabase
        .from('schedule')
        .select('id')
        .eq('date', today)

      if (schedulesToday?.length) {
        const scheduleIds = schedulesToday.map(s => s.id)
        const { count: assignCount } = await supabase
          .from('employee_assignments')
          .select('id', { count: 'exact' })
          .in('schedule_id', scheduleIds)

        totals.value.assignmentsToday = assignCount ?? 0
      } else {
        totals.value.assignmentsToday = 0
      }

    } catch (err) {
      console.error('useDashboard.loadTotals', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // ---------------------------------------------------------
  // 2) Próximos schedules
  // ---------------------------------------------------------
  const loadUpcomingSchedules = async (days = 7) => {
    loading.value = true
    error.value = null

    try {
      const today = new Date()
      const end = new Date()
      end.setDate(today.getDate() + days)

      const startDate = today.toISOString().slice(0, 10)
      const endDate = end.toISOString().slice(0, 10)

      // JOIN con líneas y unidades (solo columnas existentes)
      const { data, error: schErr } = await supabase
        .from('schedule')
        .select(`
          id,
          date,
          week,
          created_by,
          created_at,
          units ( id, name ),
          lines ( id, name )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (schErr) throw schErr
      upcomingSchedules.value = data || []

    } catch (err) {
      console.error('useDashboard.loadUpcomingSchedules', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // ---------------------------------------------------------
  // 3) TOP COURSES
  // ---------------------------------------------------------
  const loadTopCourses = async (limit = 5) => {
    loading.value = true
    error.value = null

    try {
      const { data: courses, error: cErr } = await supabase
        .from('courses')
        .select('id, name, category')

      if (cErr) throw cErr

      const { data: empCourses, error: ecErr } = await supabase
        .from('employee_courses')
        .select('course_id')

      if (ecErr) throw ecErr

      // Contar empleados por curso
      const counts = {}
      empCourses?.forEach(row => {
        counts[row.course_id] = (counts[row.course_id] || 0) + 1
      })

      const merged = courses.map(c => ({
        id: c.id,
        name: c.name,
        category: c.category,
        count: counts[c.id] || 0
      }))

      merged.sort((a, b) => b.count - a.count)
      topCourses.value = merged.slice(0, limit)

    } catch (err) {
      console.error('useDashboard.loadTopCourses', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // ---------------------------------------------------------
  // 4) Load All
  // ---------------------------------------------------------
  const loadAll = async () => {
    await Promise.all([
      loadTotals(),
      loadUpcomingSchedules(),
      loadTopCourses()
    ])
  }

  return {
    totals,
    upcomingSchedules,
    topCourses,
    loading,
    error,
    loadTotals,
    loadUpcomingSchedules,
    loadTopCourses,
    loadAll
  }
}
