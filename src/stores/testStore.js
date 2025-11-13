// src/stores/testStore.js
import { defineStore } from 'pinia'

export const useTestStore = defineStore('test', {
  state: () => ({
    mensaje: 'Pinia está funcionando 🎉',
  }),
})
