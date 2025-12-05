<template>
  <div class="p-6 space-y-6">


    <div v-if="message" :class="messageType === 'success'
      ? 'bg-green-100 text-green-700 border border-green-300'
      : 'bg-red-100 text-red-700 border border-red-300'" class="p-3 rounded-md shadow">
      {{ message }}
    </div>


    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">Crear Horarios</h2>

      <button @click="addNewSlot" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
        + Agregar Slot
      </button>
    </div>


    <div v-for="(slot, i) in scheduleSlots" :key="i" class="bg-white border shadow rounded-xl p-4 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">


        <div>
          <label class="font-semibold">Fecha</label>
          <input type="date" v-model="slot.date" :min="today" class="mt-1 w-full p-2 border rounded" />
        </div>


        <div>
          <label class="font-semibold">Línea</label>
          <select v-model="slot.line_id" class="mt-1 w-full p-2 border rounded">
            <option :value="null">Selecciona línea</option>
            <option v-for="l in lines" :key="l.id" :value="l.id">
              {{ l.name }}
            </option>
          </select>
        </div>


        <div>
          <label class="font-semibold">Unidad</label>
          <select v-model="slot.unit_id" @change="loadUnitRequirements(slot.unit_id)"
            class="mt-1 w-full p-2 border rounded">
            <option :value="null">Selecciona unidad</option>
            <option v-for="u in units" :key="u.id" :value="u.id">
              {{ u.name }}
            </option>
          </select>
        </div>
      </div>


      <div v-if="slot.unit_id" class="bg-gray-50 p-3 rounded border">
        <h3 class="font-semibold mb-2">Requisitos de esta unidad</h3>

        <div v-if="getReqForSlot(slot).length === 0" class="text-gray-600">
          Esta unidad no tiene requisitos configurados.
        </div>

        <ul v-else class="space-y-1">
          <li v-for="req in getReqForSlot(slot)" :key="req.course_id" class="text-sm">
            <strong>{{ req.courses?.name }}</strong> — Nivel requerido: {{ req.required_level }}
          </li>
        </ul>
      </div>


      <button @click="autoSelectForSlot(i)"
        class="px-3 py-1 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700">
        Auto seleccionar empleados
      </button>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="emp in employees" :key="emp.id" class="border rounded p-3 shadow hover:shadow-md transition" :class="{
          'opacity-40 pointer-events-none': !employeeMeetsRequirements(
            emp,
            getReqForSlot(slot)
          ),
        }">
          <div class="flex justify-between items-center">
            <h4 class="font-semibold">{{ emp.name }}</h4>

            <input type="checkbox" :disabled="!employeeMeetsRequirements(emp, getReqForSlot(slot))"
              :checked="slot.employees.includes(emp.id)" @change="toggleEmployeeInSlot(i, emp.id)" class="w-5 h-5" />
          </div>

          <p class="text-xs text-gray-600">{{ emp.position }}</p>

          <div class="mt-2 text-sm space-y-1">
            <div v-for="req in getReqForSlot(slot)" :key="req.course_id" class="flex items-center gap-2">
              <strong>{{ req.courses?.name }}:</strong>

              <span :class="emp.courses.some(
                (c) =>
                  c.course_id === req.course_id &&
                  c.level >= req.required_level
              )
                ? 'text-green-700 font-bold'
                : 'text-red-700 font-bold'
                ">
                {{
                  emp.courses.find((c) => c.course_id === req.course_id)
                    ?.level || 0
                }}
              </span>
            </div>
          </div>
        </div>
      </div>


      <button @click="removeSlot(i)" class="text-red-600 underline">
        Eliminar Slot
      </button>
    </div>


    <div class="text-right">
      <button class="px-6 py-3 bg-green-600 text-white rounded shadow hover:bg-green-700" @click="onSaveAll">
        Guardar todo
      </button>
    </div>

    <div class="mt-10">
      <h2 class="text-xl font-bold mb-4">Horarios creados</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ScheduleCard v-for="s in schedulesCreated" :key="s.id" :schedule="s" @edit="onEditSchedule"
          @delete="askDelete" />
      </div>
    </div>

    <div v-if="editingSchedule"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-xl w-96 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Editar horario</h2>


        <label class="block mb-2 text-sm font-semibold">Fecha</label>
        <input type="date" v-model="editingSchedule.date" :min="today" class="w-full border rounded px-2 py-1 mb-4" />


        <label class="block mb-2 text-sm font-semibold">Unidad</label>
        <select v-model="editingSchedule.unit_id" @change="loadUnitRequirements(editingSchedule.unit_id)"
          class="w-full border rounded px-2 py-1 mb-4">
          <option :value="null">Selecciona unidad</option>
          <option v-for="u in units" :key="u.id" :value="u.id">
            {{ u.name }}
          </option>
        </select>


        <label class="block mb-2 text-sm font-semibold">Línea</label>
        <select v-model="editingSchedule.line_id" class="w-full border rounded px-2 py-1 mb-4">
          <option :value="null">Selecciona línea</option>
          <option v-for="l in lines" :key="l.id" :value="l.id">
            {{ l.name }}
          </option>
        </select>

        <div class="mb-4">
          <h3 class="font-semibold mb-2">Empleados asignados</h3>

          <div class="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            <div v-for="emp in employees" :key="emp.id"
              class="flex flex-col p-2 border rounded hover:shadow-md transition" :class="{
                'opacity-40 pointer-events-none': !employeeMeetsRequirements(
                  emp,
                  getReqForSlot(editingSchedule)
                ),
              }">
              <div class="flex justify-between items-center">
                <span>{{ emp.name }} - {{ emp.position }}</span>

                <input type="checkbox" :checked="editingSchedule.employees?.includes(emp.id)"
                  :disabled="!employeeMeetsRequirements(emp, getReqForSlot(editingSchedule))"
                  @change="toggleEmployeeInModal(emp.id)" />
              </div>

              <div class="text-xs text-gray-600 mt-1">
                <h5 class="font-semibold">Cursos:</h5>
                <ul class="list-disc list-inside space-y-0.5">
                  <li v-for="c in emp.courses" :key="c.course_id">
                    {{ c.course_name || c.name }} — Nivel {{ c.level }}
                  </li>
                </ul>
              </div>

              <div v-if="editingSchedule.unit_id && getReqForSlot(editingSchedule).length" class="text-xs mt-1">
                <h5 class="font-semibold">Cumple requisitos:</h5>

                <ul class="list-disc list-inside space-y-0.5">
                  <li v-for="req in getReqForSlot(editingSchedule)" :key="req.course_id" :class="emp.courses.some(
                    (c) =>
                      c.course_id === req.course_id &&
                      c.level >= req.required_level
                  )
                    ? 'text-green-700'
                    : 'text-red-700'
                    ">
                    {{ req.courses?.name }} — Req: {{ req.required_level }}, Emp:
                    {{
                      emp.courses.find((c) => c.course_id === req.course_id)
                        ?.level || 0
                    }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>


        <div class="flex justify-end space-x-2 mt-4">
          <button @click="editingSchedule = null" class="px-4 py-2 bg-gray-300 rounded">
            Cancelar
          </button>
          <button @click="saveEdit" class="px-4 py-2 bg-blue-600 text-white rounded">
            Guardar
          </button>
        </div>
      </div>
    </div>


    <div v-if="showDeleteModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-xl shadow-xl w-80">
        <h3 class="text-lg font-bold mb-4 text-gray-800">
          Confirmar eliminación
        </h3>

        <p class="text-gray-700 mb-6">
          ¿Seguro que deseas eliminar este horario?<br />
          Esta acción no se puede deshacer.
        </p>

        <div class="flex justify-end gap-2">
          <button @click="showDeleteModal = false" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancelar
          </button>

          <button @click="confirmDelete" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Eliminar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useSchedule } from "@/composables/useSchedule";
import ScheduleCard from "@/components/schedule/ScheduleCard.vue";
import { useSupabase } from "@/composables/useSupabase";

const supabase = useSupabase();
const {
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
} = useSchedule();

const today = new Date().toISOString().split("T")[0];

const message = ref("");
const messageType = ref("success");

function showMessage(msg, type = "success") {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => (message.value = ""), 2500);
}

const unitRequirements = ref({});

async function loadUnitRequirements(unitId) {
  if (!unitId) return;

  const { data, error } = await supabase
    .from("unit_courses")
    .select("course_id, required_level")
    .eq("unit_id", unitId);

  if (error) {
    unitRequirements.value[unitId] = [];
    return;
  }

  const courseIds = data.map((c) => c.course_id);

  const { data: coursesData } = await supabase
    .from("courses")
    .select("id, name")
    .in("id", courseIds);

  unitRequirements.value[unitId] = data.map((c) => ({
    course_id: c.course_id,
    required_level: c.required_level,
    courses: coursesData.find((cd) => cd.id === c.course_id),
  }));
}

const getReqForSlot = (slot) => unitRequirements.value[slot.unit_id] || [];

function employeeMeetsRequirements(emp, requirements) {
  if (!requirements || requirements.length === 0) return true;
  return requirements.some((req) =>
    emp.courses.some(
      (c) => c.course_id === req.course_id && c.level >= req.required_level
    )
  );
}

onMounted(async () => {
  await loadAll();
  await loadSchedules();
});

function addNewSlot() {
  addSlot();
  const last = scheduleSlots.value[scheduleSlots.value.length - 1];
  last.date = today;
}


async function onSaveAll() {
  for (const slot of scheduleSlots.value) {
    if (slot.date < today) {
      showMessage("No se permiten fechas pasadas.", "error");
      return;
    }
  }

  const res = await saveAll();
  if (res.ok) showMessage("Se guardó correctamente");
  else showMessage("Error al guardar", "error");
}


async function onDelete(id) {
  const res = await deleteScheduleById(id);
  if (res.ok) showMessage("Horario eliminado con éxito");
  else showMessage(res.error, "error");
}


const editingSchedule = ref(null);

function onEditSchedule(schedule) {
  editingSchedule.value = { ...schedule };
}

async function saveEdit() {
  if (!editingSchedule.value) return;

  if (editingSchedule.value.date < today) {
    showMessage("No puedes asignar una fecha pasada.", "error");
    return;
  }

  const { id, date, unit_id, line_id, employees: assignedEmployees } =
    editingSchedule.value;

  const res = await updateSchedule(id, { date, unit_id, line_id });

  if (!res.ok) {
    showMessage(res.error, "error");
    return;
  }

  await supabase.from("employee_assignments").delete().eq("schedule_id", id);

  for (const empId of assignedEmployees) {
    const emp = employees.value.find((e) => e.id === empId);
    if (!emp) continue;

    if (!employeeMeetsRequirements(emp, getReqForSlot(editingSchedule.value)))
      continue;

    await supabase.from("employee_assignments").insert({
      employee_id: empId,
      schedule_id: id,
      line_id,
      date,
    });
  }

  showMessage("Horario actualizado con éxito");
  editingSchedule.value = null;
  await loadSchedules();
}

function toggleEmployeeInModal(empId) {
  if (!editingSchedule.value) return;

  const idx = editingSchedule.value.employees.indexOf(empId);

  if (idx === -1) editingSchedule.value.employees.push(empId);
  else editingSchedule.value.employees.splice(idx, 1);
}

const deletingId = ref(null);
const showDeleteModal = ref(false);

function askDelete(id) {
  deletingId.value = id;
  showDeleteModal.value = true;
}

async function confirmDelete() {
  if (!deletingId.value) return;

  const res = await deleteScheduleById(deletingId.value);

  if (res.ok) showMessage("Horario eliminado con éxito");
  else showMessage(res.error, "error");

  showDeleteModal.value = false;
  deletingId.value = null;

  await loadSchedules();
}
</script>
