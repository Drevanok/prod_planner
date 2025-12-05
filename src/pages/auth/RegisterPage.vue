<script setup>
import RegisterForm from "@/components/forms/RegisterForm.vue";
</script>

<template>
  <div class="page auth-page flex flex-col items-center pt-10 bg-gray-100 min-h-screen">

    <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 
             drop-shadow-sm mb-6 select-none">
      <span class="text-blue-600">Factory</span> Plan
    </h1>

    <RegisterForm />
  </div>
</template>
