<template>
  <div class="min-h-screen bg-gray-100">
    <NavBar />
    <main class="p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavBar from "@/components/navbar/NavBar.vue";
</script>
