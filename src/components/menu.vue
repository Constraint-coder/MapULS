<template>
<aside
  class="mt-6 bg-white rounded-lg shadow-lg p-2 fixed top-10 right-4 z-[1000]
         w-20% max-w-full md:max-w-10% md:text-sm sm:max-w-5%
         max-h-[80vh]        <!-- altura máxima 80% -->
         overflow-y-auto      <!-- scroll vertical -->
         overflow-x-hidden    <!-- sin scroll horizontal -->
  "
>

    <!-- 🔹 Título clickable -->
    <button
      @click="mostrarPanel = !mostrarPanel"
      class="w-20 md:w-auto text-center text-sm md:text-sm font-bold text-gray-800 hover:text-blue-400 transition">
      📋 Panel Administración
    </button>

    <!-- 🔻 Contenido colapsable -->
    <transition name="fade">
      <div v-if="mostrarPanel" class="mt-6 space-y-3">
      <vs-button block color="success" @click="toggle('destino')">📍 Destino</vs-button>
      <vs-button block  color="success" @click="toggle('pasillos')">🛣️ Pasillos</vs-button>
      <vs-button block color="success" @click="toggle('referencia')">📌 Referencia</vs-button>
      <vs-button block color="success" @click="toggle('pisos')">🏢 Pisos</vs-button>
      <vs-button block color="success" @click="toggle('materias')">📕 Materias</vs-button>

        <!-- Formularios -->
        <div class="mt-6 space-y-6">
          <Destino v-if="visibleForm === 'destino'" />
          <Pasillos v-if="visibleForm === 'pasillos'" />
          <Referencia v-if="visibleForm === 'referencia'" />
          <Pisos v-if="visibleForm === 'pisos'" />
           <Materias v-if="visibleForm === 'materias'" />
        </div>
      </div>
    </transition>
  </aside>
</template>


<script setup>
import { ref } from 'vue'
import Destino from './destino.vue'
import Pasillos from './pasillos.vue'
import Referencia from './referencia.vue'
import Pisos from './pisos.vue'
import Materias from './materias.vue'

const mostrarPanel = ref(false)
const visibleForm = ref(null)

const toggle = (form) => {
  visibleForm.value = visibleForm.value === form ? null : form
}
</script>

<style scoped>
.btn {
  @apply w-full text-left px-4 py-2 bg-gray-100 rounded-md hover:bg-blue-100 text-gray-700  transition;
}

/* Animación suave */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
