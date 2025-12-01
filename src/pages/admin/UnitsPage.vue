<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-bold text-gray-700">Unidades</h1>

    <!-- FORMULARIO AGREGAR UNIDAD -->
    <form @submit.prevent="handleAddUnit" class="space-y-4 bg-white p-4 rounded shadow">
      <h2 class="text-gray-600 font-semibold">Agregar nueva unidad</h2>

      <div class="flex flex-col gap-2">
        <label class="text-gray-500 font-medium">Nombre de la unidad</label>
        <input v-model="name" required class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <button :disabled="loading" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
        {{ loading ? "Creando..." : "Agregar unidad" }}
      </button>
      <p v-if="error" class="text-red-600">{{ error }}</p>
    </form>

    <!-- LISTADO DE UNIDADES -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="unit in units" :key="unit.id" class="p-4 bg-white rounded shadow">
        <h3 class="font-semibold text-gray-700">{{ unit.name }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUnits } from "@/composables/useUnits";

const { units, loadUnits, addUnit, loading, error } = useUnits();
const name = ref("");

onMounted(loadUnits);

const handleAddUnit = async () => {
  if (!name.value) return;
  await addUnit({ name: name.value });
  name.value = "";
};
</script>
