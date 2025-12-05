<script setup>
import ResetPasswordForm from "@/components/forms/ResetPasswordForm.vue";
</script>

<template>
  <div class="page auth-page flex flex-col items-center pt-6 bg-gray-100 min-h-screen">

    <h1
      class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 
             drop-shadow-sm mb-2 select-none"
    >
      <span class="text-blue-600">Factory</span> Plan
    </h1>

    <h2 class="text-xl font-semibold text-gray-700 mb-4 select-none">
      Cambiar contraseña
    </h2>

    <ResetPasswordForm />
  </div>
</template>
