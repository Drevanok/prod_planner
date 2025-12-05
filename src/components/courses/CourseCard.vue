<template>
  <div class="border rounded-xl p-4 shadow hover:shadow-md transition">
    <div class="flex justify-between items-start mb-2">
      <div>
        <h3 class="font-bold text-lg">
          {{ course.name }}
        </h3>

        <p class="text-sm text-gray-600">
          {{ course.category || "Sin categoría" }}
        </p>

        <p class="text-xs text-gray-400">
          Creado: {{ formatDate(course.created_at) }}
        </p>

        <p class="text-sm text-gray-500 mt-1">
          Nivel máximo: <span class="font-semibold">{{ course.max_level }}</span>
        </p>
      </div>

      <div class="flex flex-col space-y-1 text-right">
        <button
          @click="$emit('edit', course)"
          class="text-blue-600 hover:underline text-sm"
        >
          Editar
        </button>

        <button
          @click="$emit('view', course)"
          class="text-green-600 hover:underline text-sm"
        >
          Inscritos
        </button>

        <button
          @click="$emit('delete', course)"
          class="text-red-600 hover:underline text-sm"
        >
          Eliminar
        </button>
      </div>
    </div>

    <p class="text-sm text-gray-700 mt-2">
      {{ course.description || "Sin descripción" }}
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  course: { type: Object, required: true }
})

const formatDate = (d) => {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString()
  } catch {
    return d
  }
}
</script>

<style scoped>
</style>
