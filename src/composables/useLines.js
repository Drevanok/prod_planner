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
      const { data, error: err } = await supabase
        .from("lines")
        .select("id, name, area_id, areas(name)")
        .order("name");

      if (err) throw err;
      lines.value = data || [];
    } catch (err) {
      error.value = err.message || String(err);
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
        .select("id, name, area_id, areas(name)")
        .single();

      if (err) throw err;

      lines.value.push(data);
      return data;
    } catch (err) {
      error.value = err.message || String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateLine = async (id, values) => {
    loading.value = true;
    error.value = "";

    try {
      const { data, error: err } = await supabase
        .from("lines")
        .update(values)
        .eq("id", id)
        .select("id, name, area_id, areas(name)")
        .single();

      if (err) throw err;

      const index = lines.value.findIndex((l) => l.id === id);
      if (index !== -1) lines.value[index] = data;

      return data;
    } catch (err) {
      error.value = err.message || String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteLine = async (id) => {
    loading.value = true;
    error.value = "";

    try {
      const { error: err } = await supabase.from("lines").delete().eq("id", id);
      if (err) throw err;

      lines.value = lines.value.filter((l) => l.id !== id);
    } catch (err) {
      error.value = err.message || String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    lines,
    loading,
    error,
    loadLines,
    addLine,
    updateLine,
    deleteLine,
  };
}
