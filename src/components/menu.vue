<template>
  <aside  class="mt-6 bg-white rounded-lg shadow-lg p-6 fixed top-10 right-4 z-[1000] w-auto max-w-full">
    <!-- 🔹 Título clickable -->
    <button
      @click="mostrarPanel = !mostrarPanel"
       class="w-20 md:w-full text-center text-sm md:text-sm font-bold text-gray-800 hover:text-blue-400 transition px-[1px] py-[1px] h-0 md:h-2">
      📋 Panel Administración
    </button>

    <!-- 🔻 Contenido colapsable -->
    <transition name="fade">
      <div v-if="mostrarPanel" class="mt-6 space-y-3">
        <button @click="toggle('destino')" class="btn">📍 Destino</button>
        <button @click="toggle('pasillos')" class="btn">🛣️ Pasillos</button>
        <button @click="toggle('referencia')" class="btn">📌 Referencia</button>
        <button @click="toggle('pisos')" class="btn">🏢 Pisos</button>

        <!-- Formularios -->
        <div class="mt-6 space-y-6">
          <Destino v-if="visibleForm === 'destino'" />
          <Pasillos v-if="visibleForm === 'pasillos'" />
          <Referencia v-if="visibleForm === 'referencia'" />
          <Pisos v-if="visibleForm === 'pisos'" />
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
