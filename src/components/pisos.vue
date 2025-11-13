<template>
  <div class="bg-white p-6 rounded-lg shadow-lg space-y-6 z-[1000]">
    <h2 class="text-2xl font-bold text-center text-gray-800">🏢 Gestión de Pisos</h2>

    <!-- Formulario -->
    <form @submit.prevent="guardarPiso" class="space-y-4">
      <div>
        <label class="block font-medium text-gray-700 mb-1">Nombre del piso:</label>
        <input
          v-model="form.nombres"
          type="text"
          class="input"
          placeholder="Ej: Piso 1"
          required
        />
      </div>

      <button type="submit" class="btn-primary w-full">
        {{ editandoId ? 'Actualizar' : 'Agregar' }} Piso
      </button>
    </form>

    <!-- Lista de pisos -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">📋 Lista de Pisos</h3>
      <ul class="space-y-2">
        <li
          v-for="piso in pisos"
          :key="piso.id"
          class="flex justify-between items-center bg-gray-100 p-3 rounded-md shadow-sm"
        >
          <span class="text-gray-800 font-medium">{{ piso.nombres }}</span>
          <div class="space-x-2">
            <button @click="cargarEdicion(piso)" class="text-blue-600 hover:underline">Editar</button>
            <button @click="eliminar(piso.id)" class="text-red-600 hover:underline">Eliminar</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPisos, crearPisos, editarPisos, eliminarPisos } from '@/services/pisosServices'

const pisos = ref([])
const editandoId = ref(null)

const form = ref({
  nombres: ''
})

onMounted(() => {
  cargarPisos()
})

const cargarPisos = async () => {
  try {
    pisos.value = await getPisos()
  } catch (error) {
    console.error('❌ Error al cargar pisos:', error)
  }
}

const guardarPiso = async () => {
  try {
    const payload = { nombres: form.value.nombres }

    if (editandoId.value) {
      await editarPisos(editandoId.value, payload)
    } else {
      await crearPisos(payload)
    }

    form.value.nombres = ''
    editandoId.value = null
    await cargarPisos()
  } catch (error) {
    console.error('❌ Error al guardar piso:', error)
    alert('Error al guardar piso')
  }
}

const cargarEdicion = (piso) => {
  form.value.nombres = piso.nombres
  editandoId.value = piso.id
}

const eliminar = async (id) => {
  if (confirm('¿Eliminar este piso?')) {
    try {
      await eliminarPisos(id)
      await cargarPisos()
    } catch (error) {
      console.error('❌ Error al eliminar piso:', error)
      alert('No se pudo eliminar el piso')
    }
  }
}
</script>

<style scoped>
.input {
  @apply w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500;
}
.btn-primary {
  @apply bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition;
}
</style>
