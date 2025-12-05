<template>
  <div
    class="border rounded-lg p-3 cursor-pointer transition-all duration-150 select-none"
    :class="selected ? 'bg-blue-600 text-white shadow-lg' : 'bg-white hover:bg-gray-100'"
    @click="$emit('toggle', employee.id)"
  >
    <div class="flex justify-between">
      <h3 class="font-bold text-lg">{{ employee.name }}</h3>
      <span class="text-sm opacity-80">{{ employee.position }}</span>
    </div>

    <div class="mt-2">
      <p class="text-sm font-semibold mb-1">Cursos:</p>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="c in employee.courses"
          :key="c.course_id"
          class="px-2 py-1 rounded text-xs"
          :class="selected ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'"
        >
          Curso {{ c.course_id }} (Lv {{ c.level }})
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  employee: Object,
  selected: Boolean,
});
</script>
