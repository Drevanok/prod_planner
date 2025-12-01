// src/composables/useAreas.js
import { ref } from "vue";
import { useSupabase } from "./useSupabase";

export function useAreas() {
  const supabase = useSupabase();
  const areas = ref([]);
  const loading = ref(false);
  const error = ref("");

  const loadAreas = async () => {
    loading.value = true;
    error.value = "";
    try {
      const { data, error: err } = await supabase.from("areas").select("*").order("name");
      if (err) throw err;
      areas.value = data || [];
    } catch (err) {
      error.value = err.message || err;
    } finally {
      loading.value = false;
    }
  };

  return { areas, loading, error, loadAreas };
}
