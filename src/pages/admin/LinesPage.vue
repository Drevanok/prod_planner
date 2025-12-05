<template>
  <div class="space-y-8 p-6">
    <h1 class="text-3xl font-bold text-gray-800">Líneas de Producción</h1>


    <div class="border rounded-xl p-6 bg-white shadow-sm">
      <h2 class="font-semibold text-lg text-gray-700 mb-4">Agregar nueva línea</h2>

      <form @submit.prevent="handleAddLine" class="space-y-4">

        <div>
          <label class="font-medium text-gray-600 block mb-1">Nombre de la línea</label>
          <input v-model="name" required
            class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none" />
        </div>

        <div>
          <label class="font-medium text-gray-600 block mb-1">Área</label>
          <select v-model="area_id"
            class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none">
            <option value="">Selecciona un área</option>
            <option v-for="area in areas" :key="area.id" :value="area.id">
              {{ area.name }}
            </option>
          </select>
        </div>

        <button :disabled="loading" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
          {{ loading ? "Creando..." : "Agregar línea" }}
        </button>

        <p v-if="error" class="text-red-600">{{ error }}</p>
      </form>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="line in lines" :key="line.id"
        class="p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-center">
        <div>
          <h3 class="font-bold text-gray-800 text-lg">{{ line.name }}</h3>
          <p class="text-gray-600 text-sm" v-if="line.areas">
            Área: {{ line.areas.name }}
          </p>
        </div>

        <div class="flex gap-4 text-sm">
          <button @click="openEdit(line)" class="text-blue-600 hover:underline">
            Editar
          </button>

          <button @click="confirmDelete(line)" class="text-red-600 hover:underline">
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-lg animate-fadeIn">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Editar Línea</h2>

        <div class="space-y-4">
          <div>
            <label class="font-medium text-gray-600 block mb-1">Nombre</label>
            <input v-model="editForm.name"
              class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none" />
          </div>

          <div>
            <label class="font-medium text-gray-600 block mb-1">Área</label>
            <select v-model="editForm.area_id"
              class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none">
              <option v-for="a in areas" :key="a.id" :value="a.id">
                {{ a.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="closeModal" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
            Cancelar
          </button>

          <button @click="update" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Guardar
          </button>
        </div>
      </div>
    </div>

    <div v-if="deleteTarget" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm animate-fadeIn">
        <p class="mb-4 text-gray-700">
          ¿Eliminar la línea <strong>{{ deleteTarget.name }}</strong>?
        </p>

        <div class="flex justify-end gap-3">
          <button @click="deleteTarget = null" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
            Cancelar
          </button>

          <button @click="doDelete" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useLines } from "@/composables/useLines";
import { useAreas } from "@/composables/useAreas";

const { lines, loading, error, loadLines, addLine, updateLine, deleteLine } = useLines();
const { areas, loadAreas } = useAreas();

const name = ref("");
const area_id = ref("");

const showModal = ref(false);
const editForm = ref({ id: null, name: "", area_id: "" });

const deleteTarget = ref(null);

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

const openEdit = (line) => {
  editForm.value = {
    id: line.id,
    name: line.name,
    area_id: line.area_id,
  };
  showModal.value = true;
};

const closeModal = () => (showModal.value = false);

const update = async () => {
  await updateLine(editForm.value.id, {
    name: editForm.value.name,
    area_id: editForm.value.area_id,
  });
  showModal.value = false;
};

const confirmDelete = (line) => {
  deleteTarget.value = line;
};

const doDelete = async () => {
  await deleteLine(deleteTarget.value.id);
  deleteTarget.value = null;
};
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.18s ease-out;
}
</style>
