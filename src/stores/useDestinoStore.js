import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDestinoStore = defineStore('destino', () => {
  const destinoSeleccionado = ref('') // aula seleccionada
  const destinos = ref([])             // lista completa de destinos

  function setDestinoSeleccionado(aula) {
    destinoSeleccionado.value = aula
  }

  function setDestinos(lista) {
    destinos.value = lista
  }

  return { destinoSeleccionado, destinos, setDestinoSeleccionado, setDestinos }
})
