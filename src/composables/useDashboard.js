import { ref } from "vue";
import { useSupabase } from "./useSupabase";

export function useDashboard() {
  const supabase = useSupabase();

  const loading = ref(false);

  const totals = ref({
    employees: 0,
    units: 0,
    lines: 0,
    courses: 0,
    assignmentsToday: 0
  });

  const upcomingSchedules = ref([]);
  const topCourses = ref([]);

  const loadTotals = async () => {
    const q1 = await supabase.from("employees").select("*", { count: "exact", head: true });
    const q2 = await supabase.from("units").select("*", { count: "exact", head: true });
    const q3 = await supabase.from("lines").select("*", { count: "exact", head: true });
    const q4 = await supabase.from("courses").select("*", { count: "exact", head: true });

    totals.value.employees = q1.count ?? 0;
    totals.value.units = q2.count ?? 0;
    totals.value.lines = q3.count ?? 0;
    totals.value.courses = q4.count ?? 0;

    const today = new Date().toISOString().slice(0, 10);
    const { count } = await supabase
      .from("employee_assignments")
      .select("id", { count: "exact", head: true })
      .eq("date", today);

    totals.value.assignmentsToday = count ?? 0;
  };

  const loadUpcomingSchedules = async (days = 7) => {
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + days);

    const todayStr = today.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("schedule")
      .select(`
        id,
        date,
        line_id,
        unit_id,
        lines ( id, name ),
        units ( id, name )
      `)
      .gte("date", todayStr)
      .lte("date", endStr)
      .order("date", { ascending: true });

    if (error) {
      console.error("loadUpcomingSchedules", error);
      upcomingSchedules.value = [];
      return;
    }

    const rows = data || [];

    // obtener requirements
    const unitIds = [...new Set(rows.map((r) => r.unit_id).filter(Boolean))];

    let ucs = [];
    let courses = [];

    if (unitIds.length) {
      const { data: ucData, error: ucErr } = await supabase
        .from("unit_courses")
        .select("unit_id, course_id, required_level")
        .in("unit_id", unitIds);

      if (ucErr) console.error("loadUpcomingSchedules - unit_courses", ucErr);
      else ucs = ucData || [];

      const courseIds = [...new Set(ucs.map((u) => u.course_id))];
      if (courseIds.length) {
        const { data: cData, error: cErr } = await supabase
          .from("courses")
          .select("id, name")
          .in("id", courseIds);

        if (cErr) console.error("loadUpcomingSchedules - courses", cErr);
        else courses = cData || [];
      }
    }

    const ucsByUnit = {};
    ucs.forEach((r) => {
      ucsByUnit[r.unit_id] ||= [];
      ucsByUnit[r.unit_id].push(r);
    });

    const courseById = {};
    courses.forEach((c) => (courseById[c.id] = c));

    upcomingSchedules.value = rows.map((r) => ({
      ...r,
      required_courses: (ucsByUnit[r.unit_id] || []).map((u) => ({
        course_id: u.course_id,
        required_level: u.required_level,
        course_name: courseById[u.course_id]?.name ?? null
      }))
    }));
  };

  const loadTopCourses = async (limit = 5) => {
    const { data, error } = await supabase
      .from("courses")
      .select(`
        id,
        name,
        category,
        employee_courses ( employee_id )
      `);

    if (error) {
      console.error("loadTopCourses", error);
      topCourses.value = [];
      return;
    }

    topCourses.value = (data || [])
      .map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        count: c.employee_courses?.length ?? 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  };

  const loadAll = async () => {
    loading.value = true;
    await Promise.all([loadTotals(), loadUpcomingSchedules(), loadTopCourses()]);
    loading.value = false;
  };

  return {
    loading,
    totals,
    upcomingSchedules,
    topCourses,
    loadAll,
    loadTotals,
    loadUpcomingSchedules,
    loadTopCourses
  };
}
