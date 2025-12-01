// src/composables/useLines.js
import { ref } from "vue";
import { useSupabase } from "./useSupabase";

export function useLines() {
  const supabase = useSupabase();
  const lines = ref([]);
  const loading = ref(false);
  const error = ref("");

  const loadLines = async () => {
    loading.value = true;
    error.value = "";
    try {
      // Trae también la información del área
      const { data, error: err } = await supabase
        .from("lines")
        .select("*, area_id, areas(name)")
        .order("name");
      if (err) throw err;
      lines.value = data || [];
    } catch (err) {
      error.value = err.message || err;
    } finally {
      loading.value = false;
    }
  };

  const addLine = async (line) => {
    loading.value = true;
    error.value = "";
    try {
      const { data, error: err } = await supabase
        .from("lines")
        .insert([line])
        .select()
        .single();
      if (err) throw err;
      lines.value.push(data);
      return data;
    } catch (err) {
      error.value = err.message || err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { lines, loading, error, loadLines, addLine };
}
