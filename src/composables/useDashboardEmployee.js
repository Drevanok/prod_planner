import { ref } from 'vue'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'

export function useDashboardEmployee() {
  const supabase = useSupabase()
  const { user } = useAuth()

  const loading = ref(false)
  const error = ref(null)
  const summary = ref({
    full_name: '',
    position: '',
    total_courses: 0,
    units_worked: [],
    lines_worked: []
  })

  const loadEmployeeSummary = async () => {
    if (!user.value) return

    loading.value = true
    error.value = null

    try {
      const employeeId = user.value.id

      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('position, profiles(full_name)')
        .eq('user_id', employeeId)
        .single()
      if (empError) throw empError

      const { count: totalCourses, error: courseError } = await supabase
        .from('employee_courses')
        .select('id', { count: 'exact', head: true })
        .eq('employee_id', employeeId)
      if (courseError) throw courseError

      const { data: assignments, error: assignError } = await supabase
        .from('employee_assignments')
        .select(`
          schedule(unit_id, name),
          lines(name)
        `)
        .eq('employee_id', employeeId)
      if (assignError) throw assignError

      const unitsSet = new Set()
      const linesSet = new Set()
      assignments?.forEach(a => {
        if (a.schedule?.name) unitsSet.add(a.schedule.name)
        if (a.lines?.name) linesSet.add(a.lines.name)
      })

      summary.value = {
        full_name: empData?.profiles?.full_name || '',
        position: empData?.position || '',
        total_courses: totalCourses || 0,
        units_worked: Array.from(unitsSet),
        lines_worked: Array.from(linesSet)
      }

    } catch (err) {
      console.error(err)
      error.value = 'No se pudo cargar el resumen del empleado.'
    } finally {
      loading.value = false
    }
  }

  return { summary, loading, error, loadEmployeeSummary }
}
