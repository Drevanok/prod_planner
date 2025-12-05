import { ref } from "vue";
import { useSupabase } from "./useSupabase";

export function useCourses() {
  const supabase = useSupabase();
  const courses = ref([]);
  const loading = ref(false);
  const error = ref("");


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
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCourse = async ({ name, description = "", category = "", max_level = 1 }) => {
    loading.value = true;
    error.value = "";
    try {
      const { data, error: e } = await supabase
        .from("courses")
        .insert([{ name, description, category, max_level }])
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

  const updateCourse = async (id, payload) => {
    loading.value = true;
    error.value = "";
    try {
      const { data, error: e } = await supabase
        .from("courses")
        .update(payload)
        .eq("id", id)
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

  const deleteCourse = async (id) => {
    loading.value = true;
    error.value = "";
    try {
      await supabase.from('employee_courses').delete().eq('course_id', id)
      const { error: e } = await supabase.from("courses").delete().eq("id", id);
      if (e) throw e;
      await loadCourses();
      return true;
    } catch (err) {
      error.value = err.message || err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getEnrollments = async (course_id) => {
    try {
      const { data, error: e } = await supabase
        .from("employee_courses")
        .select(`
          id,
          employee_id,
          level,
          acquired_at,
          employees (
            id,
            user_id,
            employee_code,
            position,
            profiles ( id, full_name )
          )
        `)
        .eq("course_id", course_id)
        .order("acquired_at", { ascending: false });
      if (e) throw e;
      return data || [];
    } catch (err) {
      throw err;
    }
  };

  const assignCourseToEmployee = async ({ employee_id, course_id, level = 1 }) => {
    try {
      const { data, error: e } = await supabase
        .from("employee_courses")
        .insert([{ employee_id, course_id, level }])
        .select()
        .single();
      if (e) {
        if (e.code === '23505') throw new Error('El empleado ya tiene este curso.');
        throw e;
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateEmployeeCourse = async (id, { level }) => {
    try {
      const { data, error: e } = await supabase
        .from("employee_courses")
        .update({ level })
        .eq("id", id)
        .select()
        .single();
      if (e) throw e;
      return data;
    } catch (err) {
      throw err;
    }
  };

  const removeCourseFromEmployee = async (id) => {
    try {
      const { error: e } = await supabase
        .from("employee_courses")
        .delete()
        .eq("id", id);
      if (e) throw e;
      return true;
    } catch (err) {
      throw err;
    }
  };

  return {
    courses,
    loading,
    error,
    loadCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getEnrollments,
    assignCourseToEmployee,
    updateEmployeeCourse,
    removeCourseFromEmployee
  };
}
