<template>
<aside
  class="fixed z-[1000] top-6 right-4 bg-white rounded-lg shadow-xl
         w-auto max-w-[80vw] md:max-w-[40vw]
        max-h-[60vh]  md:max-h-[100vh]  overflow-y-auto overflow-x-hidden"
>

    <!-- 🔹 Título clickable -->
   <button
  @click="mostrarPanel = !mostrarPanel"
  class="w-max md:w-auto flex justify-center items-center gap-2
         text-center text-sm font-bold text-gray-800 
         hover:text-blue-500 transition
         py-2 px-3
         border-4 border-green-600
         rounded-r-lg"
>

  <!-- Ícono SOLO en pantallas pequeñas -->
  <Bars3Icon class="w-7 h-7 md:hidden text-green-700" />

  <!-- Texto SOLO en pantallas md+ -->
  <span class="hidden md:inline text-orange-600 text-lg">
    Panel Administración
  </span>
</button>


    <!-- 🔻 Contenido colapsable -->
    <transition name="fade">
      <div v-if="mostrarPanel" class="mt-6 space-y-3">

        <vs-button block color="success" @click="toggle('destino')">📍 Destino</vs-button>
        <vs-button block color="success" @click="toggle('pasillos')">🛣️ Pasillos</vs-button>
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
import { Bars3Icon } from '@heroicons/vue/24/solid'


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
