<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <form
      @submit.prevent="handleRegister"
      class="w-full max-w-md bg-white shadow-lg rounded-xl p-6 space-y-4"
    >
      <h2 class="text-2xl font-bold text-center text-gray-700">Crear Cuenta</h2>

      <!-- Nombre -->
      <div>
        <label class="block text-gray-600 mb-1 font-medium">Nombre completo</label>
        <input
          v-model="full_name"
          required
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <!-- Email -->
      <div>
        <label class="block text-gray-600 mb-1 font-medium">Email</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <!-- Password -->
      <div>
        <label class="block text-gray-600 mb-1 font-medium">Contraseña</label>
        <input
          v-model="password"
          type="password"
          required
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <!-- Rol -->
      <div>
        <label class="block text-gray-600 mb-1 font-medium">Rol</label>
        <select
          v-model="role"
          class="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="employee">Empleado</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <!-- Error -->
      <p
        v-if="errorMsg"
        class="text-red-600 text-center font-semibold bg-red-100 py-2 rounded-lg"
      >
        {{ errorMsg }}
      </p>

      <!-- Botón Crear cuenta -->
      <button
        :disabled="loading"
        class="w-full py-2 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {{ loading ? "Creando..." : "Crear cuenta" }}
      </button>

      <!-- Enlace para volver al login -->
      <button
        type="button"
        @click="goLogin"
        class="w-full py-2 mt-2 text-blue-600 font-semibold hover:underline bg-gray-100 rounded-lg"
      >
        ← Volver al login
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";

const router = useRouter();

const full_name = ref("");
const email = ref("");
const password = ref("");
const role = ref("employee");

const { register, errorMsg, loading } = useAuth();

const handleRegister = async () => {
  // Validar correo: solo permite emails @ite.edu.mx para admins
  if (role.value === "admin" && !email.value.endsWith("@ite.edu.mx")) {
    alert("Solo correos @ite.edu.mx pueden ser administradores");
    return;
  }

  const ok = await register({
    full_name: full_name.value,
    email: email.value,
    password: password.value,
    role: role.value,
  });

  if (ok) {
    alert("Cuenta creada correctamente. Revisa tu correo.");
    router.push("/login");
  }
};

// Función para regresar al login
const goLogin = () => {
  router.push("/login");
};
</script>
