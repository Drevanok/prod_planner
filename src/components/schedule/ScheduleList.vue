<template>
  <div class="schedule-list">
    <ScheduleCard
      v-for="schedule in schedules"
      :key="schedule.id"
      :schedule="schedule"
      @edit="(s) => $emit('edit', s)"
      @delete="(s) => $emit('delete', s)"
    />
  </div>
</template>

<script setup>
import ScheduleCard from "./ScheduleCard.vue";

defineProps({
  schedules: {
    type: Array,
    default: () => []
  }
});

defineEmits(["edit", "delete"]);
</script>

<style scoped>
.schedule-list {
  display: grid;
  gap: 12px;
}
</style>
