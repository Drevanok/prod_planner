import { ref } from 'vue'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'

export function useSchedule() {
  const supabase = useSupabase()
  const { user, isAuthReady, init: initAuth } = useAuth()


  const loading = ref(false)
  const error = ref('')

  const lines = ref([])
  const units = ref([])
  const employees = ref([])

  const scheduleSlots = ref([])
  const schedulesCreated = ref([])

  function isoWeekNumber(dateString) {
    const d = new Date(dateString + 'T00:00:00')
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 4 - (d.getDay() || 7))
    const yearStart = new Date(d.getFullYear(), 0, 1)
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  }

  initAuth()

  const loadLines = async () => {
    const { data, error: e } = await supabase.from('lines').select('id, name').order('name')

    if (e) console.error('loadLines', e)
    lines.value = data ?? []
  }

  const loadUnits = async () => {
    const { data, error: e } = await supabase.from('units').select('id, name').order('name')

    if (e) console.error('loadUnits', e)
    units.value = data ?? []
  }

  const loadEmployees = async () => {
    loading.value = true

    const { data, error: e } = await supabase
      .from('employees')
      .select(
        `
        id,
        user_id,
        employee_code,
        position,
        is_active,
        profiles:profiles ( full_name ),
        employee_courses ( course_id, level, courses(id, name) )
      `,
      )
      .eq('is_active', true)
      .order('id')

    loading.value = false

    if (e) {
      console.error('loadEmployees', e)
      employees.value = []
      return
    }

    employees.value = (data ?? []).map((r) => ({
      id: r.id,
      user_id: r.user_id,
      name: r.profiles?.full_name ?? `#${r.id}`,
      employee_code: r.employee_code,
      position: r.position,
      courses: (r.employee_courses ?? []).map((c) => ({
        course_id: c.course_id,
        level: c.level,
        course_name: c.courses?.name ?? '???',
      })),
    }))
  }

  const loadAll = async () => {
    loading.value = true
    await Promise.all([loadLines(), loadUnits(), loadEmployees()])
    loading.value = false
  }

  const addSlot = () => {
    scheduleSlots.value.push({
      date: null,
      line_id: null,
      unit_id: null,
      employees: [],
      requiredCourses: [], 
    })
  }

  const removeSlot = (i) => scheduleSlots.value.splice(i, 1)


  const getRequiredCoursesForUnit = async (unit_id) => {
    if (!unit_id) return []

    const { data, error: e } = await supabase
      .from('unit_courses')
      .select(
        `
        course_id,
        required_level,
        courses ( id, name )
      `,
      )
      .eq('unit_id', unit_id)

    if (e) {
      console.error('getRequiredCoursesForUnit', e)
      return []
    }

    console.log('📘 Cursos requeridos para unidad', unit_id, data)

    return (data ?? []).map((r) => ({
      id: r.courses?.id,
      name: r.courses?.name,
      course_id: r.course_id,
      required_level: r.required_level ?? 1,
    }))
  }

  const getAssignedEmployeeIdsForDate = async (date) => {
    const local = scheduleSlots.value.filter((s) => s.date === date).flatMap((s) => s.employees)

    const { data, error } = await supabase
      .from('employee_assignments')
      .select('employee_id')
      .eq('date', date)

    if (error) {
      console.error('getAssignedEmployeeIdsForDate', error)
      return Array.from(new Set(local))
    }

    const db = (data ?? []).map((r) => r.employee_id)
    return Array.from(new Set([...local, ...db]))
  }


  const autoSelectForSlot = async (index, take = 3) => {
    const slot = scheduleSlots.value[index]
    if (!slot) return { ok: false, message: 'Slot no existe' }
    if (!slot.unit_id) return { ok: false, message: 'Selecciona unidad' }
    if (!slot.date) return { ok: false, message: 'Selecciona fecha' }

    loading.value = true

    try {
      const required = await getRequiredCoursesForUnit(slot.unit_id)
      slot.requiredCourses = required // guardamos para mostrar en pantalla

      const eligible = employees.value.filter((emp) =>
        required.every((req) => {
          const has = emp.courses.find((c) => c.course_id === req.course_id)
          return has && has.level >= req.required_level
        }),
      )

      const assigned = await getAssignedEmployeeIdsForDate(slot.date)
      const available = eligible.filter((e) => !assigned.includes(e.id))

      slot.employees = available.slice(0, take).map((e) => e.id)

      loading.value = false
      return { ok: true }
    } catch (err) {
      loading.value = false
      return { ok: false, message: err.message }
    }
  }

  const toggleEmployeeInSlot = async (slotIndex, empId) => {
    const slot = scheduleSlots.value[slotIndex]
    if (!slot) return false

    const conflict = scheduleSlots.value.some((s, i) => {
      if (i === slotIndex) return false
      return s.date === slot.date && s.employees.includes(empId)
    })

    if (conflict) {
      alert('Este empleado ya está asignado ese día.')
      return false
    }

    const idx = slot.employees.indexOf(empId)
    if (idx === -1) slot.employees.push(empId)
    else slot.employees.splice(idx, 1)

    return true
  }

  const saveAll = async () => {
    if (!isAuthReady.value) {
      await new Promise((resolve) => {
        const t = setInterval(() => {
          if (isAuthReady.value) {
            clearInterval(t)
            resolve()
          }
        }, 50)
      })
    }

    const currentUser = user.value
    if (!currentUser) {
      alert('No estás autenticado.')
      return { ok: false }
    }

    loading.value = true
    error.value = ''

    try {
      for (const slot of scheduleSlots.value) {
        if (!slot.date || !slot.line_id || !slot.unit_id) continue

        const { data: existing } = await supabase
          .from('schedule')
          .select('id')
          .eq('line_id', slot.line_id)
          .eq('unit_id', slot.unit_id)
          .eq('date', slot.date)
          .maybeSingle()

        let scheduleId

        if (existing?.id) {
          scheduleId = existing.id
        } else {
          const weekNo = isoWeekNumber(slot.date)
          const { data: inserted, error: insErr } = await supabase
            .from('schedule')
            .insert({
              line_id: slot.line_id,
              unit_id: slot.unit_id,
              date: slot.date,
              week: weekNo,
              created_by: currentUser.id,
            })
            .select()
            .single()

          if (insErr) continue
          scheduleId = inserted.id
        }

        for (const empId of slot.employees) {
          const { data: already } = await supabase
            .from('employee_assignments')
            .select('id')
            .eq('employee_id', empId)
            .eq('date', slot.date)
            .maybeSingle()

          if (already?.id) continue

          await supabase.from('employee_assignments').insert({
            employee_id: empId,
            schedule_id: scheduleId,
            line_id: slot.line_id,
            date: slot.date,
          })
        }
      }

      await loadSchedules()

      loading.value = false
      return { ok: true }
    } catch (err) {
      loading.value = false
      error.value = err.message
      return { ok: false }
    }
  }


  const loadSchedules = async () => {
    loading.value = true

    try {
      const { data: rows, error: e } = await supabase
        .from('schedule')
        .select(
          `
        id, date, line_id, unit_id,
        lines(id, name),
        units(id, name)
      `,
        )
        .order('date')

      if (e) throw e

      const scheduleIds = rows.map((r) => r.id)
      const unitIds = Array.from(new Set(rows.map((r) => r.unit_id)))

      const { data: unitCourses } = await supabase
        .from('unit_courses')
        .select(
          `
        unit_id,
        course_id,
        required_level,
        courses(id, name)
      `,
        )
        .in('unit_id', unitIds)

      const unitCoursesMap = {}
      ;(unitCourses ?? []).forEach((uc) => {
        unitCoursesMap[uc.unit_id] ||= []
        unitCoursesMap[uc.unit_id].push({
          id: uc.courses?.id,
          name: uc.courses?.name,
          course_id: uc.course_id,
          required_level: uc.required_level ?? 1,
        })
      })

      let assignments = []
      if (scheduleIds.length) {
        const { data: aData } = await supabase
          .from('employee_assignments')
          .select(
            `
          schedule_id,
          employee_id,
          employees(id, profiles(full_name))
        `,
          )
          .in('schedule_id', scheduleIds)

        assignments = aData ?? []
      }

      const map = {}
      assignments.forEach((a) => {
        map[a.schedule_id] ||= []
        map[a.schedule_id].push({
          id: a.employee_id,
          name: a.employees?.profiles?.full_name,
        })
      })

      schedulesCreated.value = rows.map((r) => ({
        id: r.id,
        date: r.date,
        line_id: r.line_id,
        line_name: r.lines?.name,
        unit_id: r.unit_id,
        unit_name: r.units?.name,
        unit_courses: unitCoursesMap[r.unit_id] ?? [],
        employees: map[r.id] ?? [],
      }))
    } catch (err) {
      console.error('loadSchedules error', err)
      schedulesCreated.value = []
    }

    loading.value = false
  }

  const deleteScheduleById = async (id) => {
    loading.value = true

    try {
      await supabase.from('employee_assignments').delete().eq('schedule_id', id)

      const { error: delErr } = await supabase.from('schedule').delete().eq('id', id)

      if (delErr) return { ok: false, error: delErr.message }

      await loadSchedules()
      loading.value = false
      return { ok: true }
    } catch (err) {
      loading.value = false
      return { ok: false, error: err.message }
    }
  }

  const updateSchedule = async (scheduleId, updates = {}) => {
    loading.value = true

    try {
      if (updates.date) {
        updates.week = isoWeekNumber(updates.date)
      }

      const { error: uErr } = await supabase.from('schedule').update(updates).eq('id', scheduleId)

      if (uErr) return { ok: false, error: uErr.message }

      await loadSchedules()
      loading.value = false
      return { ok: true }
    } catch (err) {
      loading.value = false
      return { ok: false, error: err.message }
    }
  }

  return {
    loading,
    error,
    lines,
    units,
    employees,
    scheduleSlots,
    schedulesCreated,

    loadAll,
    addSlot,
    removeSlot,
    autoSelectForSlot,
    toggleEmployeeInSlot,
    saveAll,
    loadSchedules,

    deleteScheduleById,
    updateSchedule,
  }
}
