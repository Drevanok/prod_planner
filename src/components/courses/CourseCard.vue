<template>
  <div class="border rounded-lg p-4 bg-white shadow-sm">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="font-semibold text-lg">{{ course.name }}</h3>
        <p class="text-sm text-gray-500">{{ course.category || 'Sin categoría' }}</p>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-400">Nivel max: {{ course.max_level }}</p>
        <p class="text-xs text-gray-400">{{ formatDate(course.created_at) }}</p>
      </div>
    </div>

    <p class="mt-3 text-sm text-gray-700">{{ course.description }}</p>

    <div class="mt-4 flex gap-2">
      <button @click="$emit('edit', course)" class="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600">Editar</button>
      <button @click="$emit('view', course)" class="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Inscritos</button>
      <button @click="$emit('delete', course)" class="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Eliminar</button>
    </div>
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
