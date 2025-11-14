<template>
  <div class="w-90 p-0 overflow-x-auto border border-blue-500">
    <h2 class="text-2xl font-bold text-center text-gray-800">🏢 Gestión de Pisos</h2>

    <!-- Formulario -->
    <form @submit.prevent="guardarPiso" class="space-y-4">
      <vs-input
      class="w-auto "
        v-model="form.nombres"
        label="Nombre del piso"
        placeholder="Ej: Piso 1"
        required
      />

      <vs-button block color="success" >
        {{ editandoId ? 'Actualizar' : 'Agregar' }} Piso
      </vs-button>
    </form>

    <!-- Lista de pisos -->
    <div>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">📋 Lista de Pisos</h3>
      <vs-table  :data="pisos">
        <template  #thead>
          <vs-tr>
            <vs-th>Nombre</vs-th>
            <vs-th>Acciones</vs-th>
          </vs-tr>
        </template>

        <template #tbody>
          <vs-tr v-for="piso in pisos" :key="piso.id">
            <vs-td>{{ piso.nombres }}</vs-td>
            <vs-td>
              <vs-button color="warning" small @click="cargarEdicion(piso)">Editar</vs-button>
              <vs-button color="danger" small @click="eliminar(piso.id)">Eliminar</vs-button>
            </vs-td>
          </vs-tr>
        </template>
      </vs-table>
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
