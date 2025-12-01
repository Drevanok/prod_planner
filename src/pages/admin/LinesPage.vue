<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-bold text-gray-700">Líneas de Producción</h1>

    <!-- FORMULARIO AGREGAR LÍNEA -->
    <form @submit.prevent="handleAddLine" class="space-y-4 bg-white p-4 rounded shadow">
      <h2 class="text-gray-600 font-semibold">Agregar nueva línea</h2>

      <div class="flex flex-col gap-2">
        <label class="text-gray-500 font-medium">Nombre de la línea</label>
        <input v-model="name" required class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-gray-500 font-medium">Área</label>
        <select v-model="area_id" class="border border-gray-300 rounded px-3 py-2">
          <option value="">Selecciona un área</option>
          <option v-for="area in areas" :key="area.id" :value="area.id">
            {{ area.name }}
          </option>
        </select>
      </div>

      <button :disabled="loading" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
        {{ loading ? "Creando..." : "Agregar línea" }}
      </button>
      <p v-if="error" class="text-red-600">{{ error }}</p>
    </form>

    <!-- LISTADO DE LÍNEAS -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="line in lines" :key="line.id" class="p-4 bg-white rounded shadow">
        <h3 class="font-semibold text-gray-700">{{ line.name }}</h3>
        <p v-if="line.areas">Área: {{ line.areas.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useLines } from "@/composables/useLines";
import { useAreas } from "@/composables/useAreas";

const { lines, loadLines, addLine, loading, error } = useLines();
const { areas, loadAreas } = useAreas();

const name = ref("");
const area_id = ref(""); // Aquí guardamos la selección del área

// Cargar líneas y áreas al montar
onMounted(async () => {
  await loadLines();
  await loadAreas();
});

const handleAddLine = async () => {
  if (!name.value || !area_id.value) return;
  await addLine({ name: name.value, area_id: area_id.value });
  name.value = "";
  area_id.value = "";
};
</script>
