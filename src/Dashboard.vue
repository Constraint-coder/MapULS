<template>
  <div>
    <!-- Mostrar Aulas si no hay destino seleccionado -->
    <Aulas v-show="!store.destinoSeleccionado" />

    <!-- Mostrar CustomMap si hay un destino seleccionado -->
    <div v-show="store.destinoSeleccionado">
      <CustomMap />
    </div>
  </div>
</template>

<script setup>
import { useDestinoStore } from '@/stores/useDestinoStore'
import Aulas from './components/aulas.vue'
import CustomMap from './CustomMap.vue'

const store = useDestinoStore()
</script>

<style>
body, html, #app {
  margin: 0;
  height: 100%;
  width: 100%;
}
</style>
