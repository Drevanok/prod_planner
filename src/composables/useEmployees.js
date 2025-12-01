// src/composables/useEmployees.js
import { ref } from 'vue'
import { useSupabase } from './useSupabase'

export function useEmployees() {
  const supabase = useSupabase()
  const employees = ref([])

  // carga empleados activos con su perfil y cursos
  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        id,
        user_id,
        employee_code,
        position,
        is_active,
        created_at,
        profiles(id, full_name, role),
        employee_courses(id, course_id, level, acquired_at, courses(id, name, category))
      `)
      .eq('is_active', true)

    if (error) throw error
    employees.value = data || []
    return employees.value
  }

  // obtener un empleado por id (con cursos)
  const getEmployeeById = async (id) => {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        id,
        user_id,
        employee_code,
        position,
        is_active,
        created_at,
        profiles(id, full_name, role),
        employee_courses(id, course_id, level, acquired_at, courses(id, name, category))
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  return {
    employees,
    loadEmployees,
    getEmployeeById
  }
}
