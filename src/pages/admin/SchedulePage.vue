<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Programación de Línea</h1>

    <!-- FORM -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Crear Schedule</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        <!-- Selección de Línea -->
        <div>
          <label class="block mb-1 font-semibold">Línea</label>
          <select v-model="line_id" class="w-full border rounded p-2">
            <option value="">Selecciona una línea</option>
            <option v-for="l in lines" :key="l.id" :value="l.id">
              {{ l.name }}
            </option>
          </select>
        </div>

        <!-- Selección de Unidad -->
        <div>
          <label class="block mb-1 font-semibold">Unidad</label>
          <select v-model="unit_id" class="w-full border rounded p-2">
            <option value="">Selecciona una unidad</option>
            <option v-for="u in units" :key="u.id" :value="u.id">
              {{ u.name }}
            </option>
          </select>
        </div>

        <!-- Fecha -->
        <div>
          <label class="block mb-1 font-semibold">Fecha</label>
          <input type="date" v-model="date" class="w-full border rounded p-2" />
        </div>
      </div>

      <!-- Botones -->
      <div class="mt-6 flex gap-4">
        <button @click="createScheduleClick" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" :disabled="loading">
          Crear Schedule
        </button>

        <button @click="runAutoAssign" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" :disabled="!scheduleId || loading">
          Asignación automática
        </button>
      </div>

      <!-- Mensajes -->
      <div class="mt-4">
        <p v-if="loading" class="text-blue-600 font-semibold">Procesando...</p>
        <p v-if="errorMsg" class="text-red-600 font-semibold">{{ errorMsg }}</p>
        <p v-if="successMsg" class="text-green-600 font-semibold">{{ successMsg }}</p>
      </div>
    </div>

    <!-- RESULTADOS -->
    <div v-if="assignedEmployees.length > 0" class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Empleados Seleccionados</h2>

      <table class="w-full border">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">#</th>
            <th class="p-2 border">Nombre</th>
            <th class="p-2 border">ID Empleado</th>
            <th class="p-2 border">Asignado hace (días)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(emp, idx) in assignedEmployees" :key="emp.id" class="border-t">
            <td class="p-2 border text-center">{{ idx + 1 }}</td>
            <td class="p-2 border">{{ emp.full_name }}</td>
            <td class="p-2 border text-center">{{ emp.id }}</td>
            <td class="p-2 border text-center">{{ emp.lastAssignedDays !== null ? emp.lastAssignedDays : 'Nunca' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useLines } from "@/composables/useLines";
import { useUnits } from "@/composables/useUnits";
import { useSchedule } from "@/composables/useSchedule";
import { useAuth } from "@/composables/useAuth";

// COMPOSABLES
const { lines, loadLines } = useLines();
const { units, loadUnits } = useUnits();
const { createSchedule, autoAssign } = useSchedule();
const { user } = useAuth();

// STATE
const line_id = ref("");
const unit_id = ref("");
const date = ref("");
const scheduleId = ref(null);

const loading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");
const assignedEmployees = ref([]);

// CARGAR LÍNEAS Y UNIDADES
onMounted(async () => {
  await loadLines();
  await loadUnits();
});

// CREAR SCHEDULE
const createScheduleClick = async () => {
  errorMsg.value = "";
  successMsg.value = "";
  loading.value = true;

  if (!line_id.value || !unit_id.value || !date.value) {
    errorMsg.value = "Completa todos los campos.";
    loading.value = false;
    return;
  }

  try {
    const sch = await createSchedule({
      line_id: line_id.value,
      unit_id: unit_id.value,
      date: date.value,
      created_by: user.value?.id || null,
    });

    scheduleId.value = sch.id;
    successMsg.value = "Schedule creado correctamente.";
  } catch (e) {
    errorMsg.value = e.message;
  }

  loading.value = false;
};

// ASIGNACIÓN AUTOMÁTICA
const runAutoAssign = async () => {
  errorMsg.value = "";
  successMsg.value = "";
  loading.value = true;

  try {
    const result = await autoAssign(scheduleId.value);
    assignedEmployees.value = result.assigned;

    successMsg.value = "Asignación automática completada.";
  } catch (e) {
    errorMsg.value = e.message;
  }

  loading.value = false;
};
</script>

