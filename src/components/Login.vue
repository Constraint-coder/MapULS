<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

      <h2 class="text-2xl font-bold mb-6 text-center">
        {{ showRegister ? 'Registro' : 'Iniciar Sesión' }}
      </h2>

      <!-- Mensaje de error -->
      <div v-if="errorMessage" class="mb-4 text-red-500 text-sm">
        {{ errorMessage }}
      </div>

      <!-- LOGIN FORM -->
      <form v-if="!showRegister" @submit.prevent="loginUsuarioHandler" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            v-model="email"
            required
            placeholder="usuario@ejemplo.com"
            class="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            v-model="password"
            required
            placeholder="********"
            class="mt-1 block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
          />
        </div>

        <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-semibold transition-colors" :disabled="loading">
          {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
        </button>

        <p class="mt-4 text-center text-gray-600 text-sm">
          ¿No tienes cuenta?
          <a href="#" class="text-blue-500 hover:underline" @click.prevent="toggleForm">Regístrate</a>
        </p>
      </form>

      <!-- REGISTER FORM -->
      <form v-else @submit.prevent="registerUsuarioHandler" class="space-y-4">
        <div>
          <label class="block mb-1 font-semibold">Nombre</label>
          <input v-model="form.name" type="text" placeholder="Tu nombre" class="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label class="block mb-1 font-semibold">Email</label>
          <input v-model="form.email" type="email" placeholder="tu@email.com" class="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label class="block mb-1 font-semibold">Contraseña</label>
          <input v-model="form.password" type="password" placeholder="Contraseña" class="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label class="block mb-1 font-semibold">Confirmar contraseña</label>
          <input v-model="form.password_confirmation" type="password" placeholder="Repite la contraseña" class="w-full border rounded px-3 py-2" required />
        </div>

        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" :disabled="loading">
          {{ loading ? "Registrando..." : "Registrarse" }}
        </button>

        <p class="mt-4 text-center text-gray-600 text-sm">
          ¿Ya tienes cuenta?
          <a href="#" class="text-blue-500 hover:underline" @click.prevent="toggleForm">Iniciar Sesión</a>
        </p>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore' // Pinia store
import { loginUsuario, registerUsuario } from '@/services/loginServices'

const showRegister = ref(false)
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref(null)
const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

// 🔹 Alternar entre Login y Registro
function toggleForm() {
  showRegister.value = !showRegister.value
  errorMessage.value = null
}

// 🔹 Handler Login usando loginUsuario() y almacenando en Pinia
async function loginUsuarioHandler() {
  loading.value = true
  errorMessage.value = null
  try {
    const data = await loginUsuario(email.value, password.value)
    // Guardar datos del usuario y token en Pinia
    auth.user = data.user
    auth.token = data.token
    localStorage.setItem('token', data.token)
    router.push('/dashboard')
  } catch (err) {
    errorMessage.value = err.message || err?.response?.data?.message || 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}

// 🔹 Handler Registro usando registerUsuario()
async function registerUsuarioHandler() {
  loading.value = true
  errorMessage.value = null
  try {
    await registerUsuario(form)
    // Después de registrar, pasar a login automáticamente
    toggleForm()
    email.value = form.email
    password.value = form.password
    form.name = ''
    form.email = ''
    form.password = ''
    form.password_confirmation = ''
  } catch (err) {
    errorMessage.value = err.message || err?.response?.data?.message || 'Error al registrar'
  } finally {
    loading.value = false
  }
}
</script>
