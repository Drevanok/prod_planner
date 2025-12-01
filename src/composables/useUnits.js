// src/composables/useUnits.js
import { ref } from "vue";
import { useSupabase } from "./useSupabase";

export function useUnits() {
  const supabase = useSupabase();
  const units = ref([]);
  const loading = ref(false);
  const error = ref("");

  // Cargar todas las unidades
  const loadUnits = async () => {
    loading.value = true;
    error.value = "";
    try {
      const { data, error: err } = await supabase
        .from("units")
        .select("*")
        .order("name");
      if (err) throw err;
      units.value = data || [];
    } catch (err) {
      error.value = err.message || err;
    } finally {
      loading.value = false;
    }
  };

  // Agregar nueva unidad
  const addUnit = async (unit) => {
    loading.value = true;
    error.value = "";
    try {
      const { data, error: err } = await supabase
        .from("units")
        .insert([unit])
        .select()
        .single();
      if (err) throw err;
      units.value.push(data);
      return data;
    } catch (err) {
      error.value = err.message || err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { units, loading, error, loadUnits, addUnit };
}
