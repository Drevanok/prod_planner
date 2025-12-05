<template>
  <div class="space-y-8 p-6">
    <h1 class="text-3xl font-bold">Unidades</h1>

    <div class="border rounded-xl p-6 bg-white shadow-sm">
      <h2 class="font-semibold text-lg mb-4">Agregar Unidad</h2>

      <form @submit.prevent="handleAddUnit" class="space-y-4">
        <div>
          <label class="font-medium block mb-1">Nombre</label>
          <input
            v-model="name"
            class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
          />
        </div>

        <div>
          <label class="font-medium block mb-2">Cursos requeridos</label>

          <div
            class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3"
          >
            <label
              v-for="c in courses"
              :key="c.id"
              class="flex items-center gap-2 text-sm"
            >
              <input type="checkbox" :value="c.id" v-model="selectedCourses" />
              {{ c.name }}
            </label>
          </div>
        </div>

        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Crear
        </button>
      </form>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <div
        v-for="unit in units"
        :key="unit.id"
        class="border rounded-xl p-4 bg-white shadow hover:shadow-md transition space-y-3"
      >
        <h3 class="font-bold text-lg">{{ unit.name }}</h3>

        <p class="text-gray-600 text-sm">
          Cursos requeridos: {{ unit.course_ids.length }}
        </p>

        <div class="flex gap-4 text-sm">
          <button
            @click="openEdit(unit)"
            class="text-blue-600 hover:underline"
          >
            Editar
          </button>

          <button
            @click="confirmDelete(unit)"
            class="text-red-600 hover:underline"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showEdit"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div
        class="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg space-y-6 animate-fadeIn"
      >
        <h2 class="text-xl font-bold">Editar Unidad</h2>

        <div>
          <label class="font-medium block mb-1">Nombre</label>
          <input
            v-model="editForm.name"
            class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
          />
        </div>

        <div>
          <label class="font-medium block mb-2">Cursos requeridos</label>

          <div
            class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3"
          >
            <label
              v-for="c in courses"
              :key="c.id"
              class="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                :value="c.id"
                v-model="editForm.course_ids"
              />
              {{ c.name }}
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button
            @click="showEdit = false"
            class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancelar
          </button>

          <button
            @click="handleUpdateUnit"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="deleteTarget"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm space-y-6 animate-fadeIn">
        <h2 class="text-xl font-bold text-red-600">Eliminar Unidad</h2>

        <p class="text-gray-700">
          ¿Seguro que deseas eliminar la unidad 
          <strong>{{ deleteTarget.name }}</strong>?
        </p>

        <div class="flex justify-end gap-3">
          <button
            @click="deleteTarget = null"
            class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancelar
          </button>

          <button
            @click="doDelete"
            class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUnits } from "@/composables/useUnits";
import { useCourses } from "@/composables/useCourses";

const { units, loadUnits, addUnit, updateUnit, deleteUnit, updateUnitCourses } =
  useUnits();
const { courses, loadCourses } = useCourses();


const name = ref("");
const selectedCourses = ref([]);

const handleAddUnit = async () => {
  const newUnit = await addUnit({ name: name.value });

  if (selectedCourses.value.length > 0) {
    await updateUnitCourses(newUnit.id, selectedCourses.value);
  }

  name.value = "";
  selectedCourses.value = [];
};


const showEdit = ref(false);
const editForm = ref({
  id: null,
  name: "",
  course_ids: [],
});

const openEdit = (unit) => {
  editForm.value = {
    id: unit.id,
    name: unit.name,
    course_ids: [...unit.course_ids],
  };
  showEdit.value = true;
};

const handleUpdateUnit = async () => {
  await updateUnit(editForm.value.id, { name: editForm.value.name });
  await updateUnitCourses(editForm.value.id, editForm.value.course_ids);
  showEdit.value = false;
};

const deleteTarget = ref(null);

const confirmDelete = (unit) => {
  deleteTarget.value = unit;
};

const doDelete = async () => {
  await deleteUnit(deleteTarget.value.id);
  deleteTarget.value = null;
};

onMounted(() => {
  loadUnits();
  loadCourses();
});
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
