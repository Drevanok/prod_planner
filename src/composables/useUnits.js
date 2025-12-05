import { ref } from "vue";
import { useSupabase } from "./useSupabase";

export function useUnits() {
  const supabase = useSupabase();
  const units = ref([]);
  const loading = ref(false);
  const error = ref("");

  const loadUnits = async () => {
    loading.value = true;
    error.value = "";
    try {
      const { data, error: err } = await supabase
        .from("units")
        .select(`
          id,
          name,
          unit_courses(course_id)
        `)
        .order("name");
      if (err) throw err;

      units.value = data.map(u => ({
        ...u,
        course_ids: u.unit_courses?.map(c => c.course_id) || []
      }));

    } catch (err) {
      error.value = err.message || err;
    } finally {
      loading.value = false;
    }
  };

  const addUnit = async (unit) => {
    loading.value = true;
    try {
      const { data, error: err } = await supabase
        .from("units")
        .insert([unit])
        .select()
        .single();
      if (err) throw err;

      await loadUnits();
      return data;

    } finally {
      loading.value = false;
    }
  };

  const updateUnit = async (id, unit) => {
    loading.value = true;
    try {
      const { error: err } = await supabase
        .from("units")
        .update(unit)
        .eq("id", id);
      if (err) throw err;

      await loadUnits();
      return true;

    } finally {
      loading.value = false;
    }
  };

  const deleteUnit = async (id) => {
    loading.value = true;
    try {
      await supabase.from("unit_courses").delete().eq("unit_id", id);

      const { error: err } = await supabase
        .from("units")
        .delete()
        .eq("id", id);
      if (err) throw err;

      await loadUnits();
    } finally {
      loading.value = false;
    }
  };


  const updateUnitCourses = async (unit_id, course_ids) => {
    loading.value = true;
    try {

      await supabase.from("unit_courses").delete().eq("unit_id", unit_id);

      if (course_ids.length === 0) return true;

      const payload = course_ids.map(cid => ({
        unit_id,
        course_id: cid
      }));

      const { error: err } = await supabase
        .from("unit_courses")
        .insert(payload);

      if (err) throw err;

      await loadUnits();
    } finally {
      loading.value = false;
    }
  };

  return { 
    units, loading, error, 
    loadUnits, addUnit, updateUnit, deleteUnit, updateUnitCourses 
  };
}
