// src/composables/useCourses.js
import { ref } from "vue";
import { useSupabase } from "./useSupabase";

export function useCourses() {
  const supabase = useSupabase();
  const courses = ref([]);
  const loading = ref(false);
  const error = ref("");

  // Cargar todos los cursos
  const loadCourses = async () => {
    loading.value = true;
    error.value = "";
    try {
      const { data, error: e } = await supabase
        .from("courses")
        .select("id, name, description, category, max_level, created_at")
        .order("name", { ascending: true });
      if (e) throw e;
      courses.value = data || [];
    } catch (err) {
      error.value = err.message || err;
    } finally {
      loading.value = false;
    }
  };

  // Agregar un curso nuevo
  const addCourse = async ({ name, description = "", category = "" }) => {
    loading.value = true;
    error.value = "";
    try {
      const { data, error: e } = await supabase
        .from("courses")
        .insert([{ name, description, category }])
        .select()
        .single();
      if (e) throw e;
      await loadCourses();
      return data;
    } catch (err) {
      error.value = err.message || err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { courses, loading, error, loadCourses, addCourse };
}
