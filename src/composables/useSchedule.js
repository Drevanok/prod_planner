// useSchedule.js
import { ref } from "vue"
import { useSupabase } from "./useSupabase"

export function useSchedule() {
  const supabase = useSupabase()
  const scheduleList = ref([])

  const getSchedules = async () => {
    const { data } = await supabase
      .from("schedule")
      .select("*, units(*), lines(*)")
      .order("date")

    scheduleList.value = data || []
  }

  const createSchedule = async ({ line_id, unit_id, date }) => {
    const { data, error } = await supabase
      .from("schedule")
      .insert([{ line_id, unit_id, date, week: 1 }])
      .select()
      .single()

    if (error) throw error
    getSchedules()
    return data
  }

  const assignEmployees = async (scheduleId) => {
    // obtener el schedule
    const { data: schedule } = await supabase
      .from("schedule")
      .select("*, units(*)")
      .eq("id", scheduleId)
      .single()

    const unit = schedule.units

    // obtener empleados activos
    const { data: employees } = await supabase
      .from("employees")
      .select(`
        *,
        profiles(full_name),
        employee_courses(level, course_id)
      `)
      .eq("is_active", true)

    // EMPAREJAR POR HABILIDADES
    const required = {
      assembly: unit.req_assembly,
      electronics: unit.req_electronics,
      testing: unit.req_testing
    }

    const selected = []

    employees.forEach(emp => {
      let score = 0

      emp.employee_courses.forEach(skill => {
        if (skill.course_id === 1) score += skill.level // ensamblado
        if (skill.course_id === 2) score += skill.level // electrónica
        if (skill.course_id === 3) score += skill.level // pruebas
      })

      // si cumple al menos una habilidad requerida
      if (score > 0) selected.push({ emp, score })
    })

    // ordenar por mejor skill
    selected.sort((a, b) => b.score - a.score)

    // seleccionar los primeros requeridos
    const final = selected.slice(0, required.assembly)

    // insertar asignaciones
    for (const sel of final) {
      await supabase.from("employee_assignments").insert({
        employee_id: sel.emp.id,
        schedule_id: scheduleId,
        station_number: 1,
        task_number: 1
      })
    }
  }

  return {
    scheduleList,
    getSchedules,
    createSchedule,
    assignEmployees,
  }
}
