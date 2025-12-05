<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Dashboard — Administrador</h1>

    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-500">Empleados</p>
        <p class="text-2xl font-semibold">{{ totals.employees }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-500">Unidades</p>
        <p class="text-2xl font-semibold">{{ totals.units }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-500">Líneas</p>
        <p class="text-2xl font-semibold">{{ totals.lines }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-500">Cursos</p>
        <p class="text-2xl font-semibold">{{ totals.courses }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-gray-500">Asignaciones hoy</p>
        <p class="text-2xl font-semibold">{{ totals.assignmentsToday }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Próximos schedules -->
      <div class="col-span-2 bg-white rounded-lg shadow p-4">
        <h2 class="text-xl font-semibold mb-4">Próximos schedules (7 días)</h2>

        <table class="w-full table-auto">
          <thead>
            <tr class="text-left text-gray-600 border-b">
              <th class="py-2">Fecha</th>
              <th class="py-2">Línea</th>
              <th class="py-2">Unidad</th>
              <th class="py-2">Requisitos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in upcomingSchedules" :key="s.id" class="border-b">
              <td class="py-2">{{ formatDate(s.date) }}</td>
              <td class="py-2">{{ s.lines?.name ?? "-" }}</td>
              <td class="py-2">{{ s.units?.name ?? "-" }}</td>
              <td class="py-2 text-sm text-gray-600">
                <template v-if="s.required_courses?.length">
                  <span v-for="(rc, i) in s.required_courses" :key="rc.course_id">
                    {{ rc.course_name }} (lvl {{ rc.required_level }})<span v-if="i < s.required_courses.length - 1">, </span>
                  </span>
                </template>
                <span v-else>—</span>
              </td>
            </tr>

            <tr v-if="!upcomingSchedules.length">
              <td colspan="4" class="py-4 text-center text-gray-500">No hay schedules próximos</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Top cursos -->
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-xl font-semibold mb-4">Top cursos</h2>

        <ul>
          <li v-for="c in topCourses" :key="c.id" class="mb-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">{{ c.name }}</p>
                <p class="text-xs text-gray-500">{{ c.category ?? "—" }}</p>
              </div>
              <div class="text-sm text-gray-700">{{ c.count }} empleados</div>
            </div>
          </li>

          <li v-if="!topCourses.length" class="text-sm text-gray-500">No hay datos</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useDashboard } from "@/composables/useDashboard";
import { formatDate } from "@/utils/formatDate";

const { totals, upcomingSchedules, topCourses, loadAll } = useDashboard();

onMounted(() => loadAll());
</script>
