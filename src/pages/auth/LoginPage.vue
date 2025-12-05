<script setup>
import LoginForm from "../../components/forms/LoginForm.vue";
</script>

<template>
  <div class="page auth-page flex flex-col items-center pt-5 bg-gray-100 min-h-screen">
    <h1
      class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 
             drop-shadow-sm select-none"
    >
      <span class="text-blue-600">Factory</span> Plan
    </h1>

    <LoginForm />
  </div>
</template>
