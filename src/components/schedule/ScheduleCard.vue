<!-- src/components/schedule/ScheduleCard.vue -->
<template>
  <div class="border rounded-xl p-4 shadow hover:shadow-md transition">
    <div class="flex justify-between items-center mb-2">
      <div>
        <h3 class="font-bold text-lg">
          {{ schedule.unit_name }} - {{ schedule.line_name }}
        </h3>
        <p class="text-sm text-gray-600">Fecha: {{ formatDate(schedule.date) }}</p>
      </div>

      <div class="flex space-x-2">
        <button
          @click="$emit('edit', schedule)"
          class="text-blue-600 hover:underline text-sm"
        >
          Editar
        </button>

        <button
          @click="$emit('delete', schedule.id)"
          class="text-red-600 hover:underline text-sm"
        >
          Eliminar
        </button>
      </div>
    </div>

    <div v-if="schedule.unit_courses?.length" class="mb-2">
      <h4 class="font-semibold text-sm mb-1">Requisitos de la unidad:</h4>
      <ul class="text-xs text-gray-700 list-disc list-inside">
        <li v-for="course in schedule.unit_courses" :key="course.course_id">
          {{ course.name }} — Nivel {{ course.required_level }}
        </li>
      </ul>
    </div>

    <!-- Empleados asignados -->
    <div v-if="schedule.employees?.length">
      <h4 class="font-semibold text-sm mb-1">Empleados asignados:</h4>
      <ul class="text-xs text-gray-700 list-disc list-inside">
        <li v-for="emp in schedule.employees" :key="emp.id">
          {{ emp.name }}
        </li>
      </ul>
    </div>

    <div v-else class="text-gray-500 text-xs italic">
      No hay empleados asignados.
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { formatDate } from "@/utils/formatDate";

const props = defineProps({
  schedule: {
    type: Object,
    required: true,
  },
});
</script>
