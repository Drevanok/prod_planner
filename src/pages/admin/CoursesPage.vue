<template>
  <div class="p-6 max-w-6xl mx-auto">

    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Gestión de Cursos</h1>

      <div class="flex gap-2">
        <button @click="openCreate"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Nuevo Curso
        </button>

        <button @click="refresh"
          class="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
          Refrescar
        </button>
      </div>
    </div>

    <!-- LISTADO -->
    <div v-if="loading" class="text-center py-8">Cargando cursos...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <CourseCard
        v-for="c in courses"
        :key="c.id"
        :course="c"
        @edit="openEdit"
        @view="openEnrollments"
        @delete="confirmDelete"
      />

      <div v-if="!courses.length" class="text-gray-500 col-span-full">
        No hay cursos.
      </div>
    </div>

    <!-- MODAL CREAR / EDITAR -->
    <div v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg">

        <h2 class="text-xl font-semibold mb-4">
          {{ editMode ? 'Editar curso' : 'Nuevo curso' }}
        </h2>

        <!-- FORM -->
        <div class="space-y-3">

          <div>
            <label class="block text-sm font-medium">Nombre</label>
            <input v-model="form.name" class="w-full border rounded p-2" />
          </div>

          <div>
            <label class="block text-sm font-medium">Categoría</label>
            <input v-model="form.category" class="w-full border rounded p-2" />
          </div>

          <div>
            <label class="block text-sm font-medium">Nivel máximo</label>
            <input v-model.number="form.max_level" type="number" min="1"
              class="w-full border rounded p-2" />
          </div>

          <div>
            <label class="block text-sm font-medium">Descripción</label>
            <textarea v-model="form.description" class="w-full border rounded p-2" rows="4"></textarea>
          </div>

        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button @click="closeModal" class="px-4 py-2 rounded bg-gray-200">
            Cancelar
          </button>
          <button @click="submitForm" class="px-4 py-2 rounded bg-blue-600 text-white">
            {{ editMode ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL INSCRITOS -->
    <div v-if="showEnrollments"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center z-50 overflow-auto py-10">
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl">

        <div class="flex justify-between items-center mb-4">

          <h2 class="text-xl font-semibold">
            Inscritos — {{ activeCourse?.name }}
          </h2>

          <div class="flex gap-2">
            <select v-model="selectedEmployeeToAssign" class="border p-2 rounded">
              <option value="">Selecciona empleado</option>
              <option v-for="e in employees" :key="e.id" :value="e.id">
                {{ e.profiles?.full_name ?? e.employee_code }}
              </option>
            </select>

            <input v-model.number="selectedLevelToAssign"
              type="number" min="1" :max="activeCourse?.max_level || 5"
              class="w-24 border p-2 rounded" placeholder="Nivel" />

            <button @click="assignEmployee"
              class="px-3 py-1 bg-green-600 text-white rounded">
              Asignar
            </button>

            <button @click="closeEnrollments"
              class="px-3 py-1 bg-gray-200 rounded">
              Cerrar
            </button>
          </div>
        </div>

        <!-- TABLA -->
        <table class="w-full table-auto">
          <thead>
            <tr class="text-left text-gray-600 border-b">
              <th class="py-2">Empleado</th>
              <th class="py-2">Nivel</th>
              <th class="py-2">Fecha</th>
              <th class="py-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in enrollments" :key="row.id" class="border-b">
              <td class="py-2">
                {{ row.employees?.profiles?.full_name ?? row.employees?.employee_code }}
              </td>

              <td class="py-2">{{ row.level }}</td>
              <td class="py-2">{{ formatDate(row.acquired_at) }}</td>

              <td class="py-2 flex gap-2">
                <button @click="editEnrollment(row)"
                  class="px-2 py-1 bg-yellow-500 text-white rounded">
                  Editar
                </button>

                <button @click="removeEnrollment(row.id)"
                  class="px-2 py-1 bg-red-600 text-white rounded">
                  Remover
                </button>
              </td>
            </tr>

            <tr v-if="!enrollments.length">
              <td colspan="4" class="py-4 text-center text-gray-500">
                No hay inscritos
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- CONFIRM DELETE -->
    <div v-if="confirmDeleteId"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div class="bg-white rounded p-6 w-full max-w-md">

        <p class="mb-4">
          ¿Eliminar este curso? También se eliminarán las inscripciones.
        </p>

        <div class="flex justify-end gap-2">
          <button @click="confirmDeleteId = null"
            class="px-3 py-1 rounded bg-gray-200">
            Cancelar
          </button>

          <button @click="doDelete"
            class="px-3 py-1 rounded bg-red-600 text-white">
            Eliminar
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCourses } from '@/composables/useCourses'
import { useEmployees } from '@/composables/useEmployees'
import CourseCard from '@/components/courses/CourseCard.vue'

const {
  courses, loading, loadCourses,
  createCourse, updateCourse, deleteCourse,
  getEnrollments, assignCourseToEmployee,
  updateEmployeeCourse, removeCourseFromEmployee
} = useCourses()

const { employees, loadEmployees } = useEmployees()

const showModal = ref(false)
const editMode = ref(false)
const form = ref({ name: '', category: '', max_level: 1, description: '' })
const editingId = ref(null)

const showEnrollments = ref(false)
const activeCourse = ref(null)
const enrollments = ref([])
const selectedEmployeeToAssign = ref('')
const selectedLevelToAssign = ref(1)
const confirmDeleteId = ref(null)

// Cargar datos iniciales
onMounted(async () => {
  await Promise.all([loadCourses(), loadEmployees()])
})

const openCreate = () => {
  editMode.value = false
  editingId.value = null
  form.value = { name: '', category: '', max_level: 1, description: '' }
  showModal.value = true
}

const openEdit = (course) => {
  editMode.value = true
  editingId.value = course.id
  form.value = { ...course }
  showModal.value = true
}

const closeModal = () => showModal.value = false

const submitForm = async () => {
  try {
    if (!form.value.name) return alert('El nombre es requerido')

    if (editMode.value) {
      await updateCourse(editingId.value, form.value)
      alert('Curso actualizado')
    } else {
      await createCourse(form.value)
      alert('Curso creado')
    }

    closeModal()
  } catch (e) {
    alert(e.message || e)
  }
}

const confirmDelete = (course) => {
  confirmDeleteId.value = course.id
}

const doDelete = async () => {
  try {
    await deleteCourse(confirmDeleteId.value)
    confirmDeleteId.value = null
  } catch (e) {
    alert(e.message || e)
  }
}

const openEnrollments = async (course) => {
  activeCourse.value = course
  showEnrollments.value = true
  await loadEnrollments()
}

const closeEnrollments = () => {
  showEnrollments.value = false
  activeCourse.value = null
  enrollments.value = []
  selectedEmployeeToAssign.value = ''
  selectedLevelToAssign.value = 1
}

// 🔥 FIX DEFINITIVO AQUÍ
const loadEnrollments = async () => {
  if (!activeCourse.value) {
    enrollments.value = []
    return
  }

  enrollments.value = await getEnrollments(activeCourse.value.id)
}

const assignEmployee = async () => {
  if (!selectedEmployeeToAssign.value) return alert('Selecciona un empleado')

  try {
    await assignCourseToEmployee({
      employee_id: selectedEmployeeToAssign.value,
      course_id: activeCourse.value.id,
      level: selectedLevelToAssign.value
    })

    await loadEnrollments()
    selectedEmployeeToAssign.value = ''
    selectedLevelToAssign.value = 1
  } catch (e) {
    alert(e.message || e)
  }
}

const editEnrollment = async (row) => {
  const newLevel = prompt('Nuevo nivel', row.level)
  if (!newLevel) return

  try {
    await updateEmployeeCourse(row.id, { level: parseInt(newLevel) })
    await loadEnrollments()
  } catch (e) {
    alert(e.message || e)
  }
}

const removeEnrollment = async (id) => {
  if (!confirm('¿Remover inscripción?')) return

  try {
    await removeCourseFromEmployee(id)
    await loadEnrollments()
  } catch (e) {
    alert(e.message || e)
  }
}

const refresh = async () => {
  await Promise.all([loadCourses(), loadEmployees()])
}

const formatDate = (d) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleDateString()
  } catch {
    return d
  }
}
</script>

<style scoped>
</style>
