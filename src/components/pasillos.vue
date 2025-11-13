<template>
  <form @submit.prevent="guardarPasillo" class="space-y-4 p-4 max-w-lg mx-auto">
    <h2 class="text-xl font-semibold text-center">Registrar Pasillo</h2>

    <!-- NOMBRE -->
    <div>
      <label class="block font-medium mb-1">Nombre:</label>
      <input
        v-model="form.nombres"
        type="text"
        class="border p-2 w-full rounded"
        placeholder="Ejemplo: Pasillo Norte"
        required
      />
    </div>

    <!-- PISO -->
    <div>
      <label class="block font-medium mb-1">Piso:</label>
      <select
        v-model="form.id_pisos"
        class="border p-2 w-full rounded"
        required
      >
        <option disabled value="">Selecciona un piso</option>
        <option v-for="piso in pisos" :key="piso.id" :value="piso.id">
          {{ piso.nombres }}
        </option>
      </select>
    </div>

    <!-- COORDENADAS -->
    <div>
      <h3 class="font-semibold mb-2">Coordenadas</h3>
      <div
        v-for="(coord, index) in form.coordenadas"
        :key="index"
        class="flex gap-2 items-center mb-2"
      >
        <input
          v-model="coord.valor"
          type="text"
          placeholder="Ej: 13.692790,-89.191680"
          class="border p-2 rounded flex-1"
          required
        />
        <button
          type="button"
          @click="eliminarCoordenada(index)"
          class="bg-red-500 text-white px-2 py-1 rounded"
        >
          ✕
        </button>
      </div>

      <button
        type="button"
        @click="agregarCoordenada"
        class="bg-blue-500 text-white px-3 py-1 rounded"
      >
        + Agregar coordenada
      </button>
    </div>

    <!-- BOTÓN -->
    <button
      type="submit"
      class="bg-green-600 text-white px-4 py-2 rounded w-full"
    >
      Guardar Pasillo
    </button>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPisos } from '../services/pisosServices'
import { crearPasillo } from '../services/pasillosServices'

const pisos = ref([])

const form = ref({
  nombres: '',
  id_pisos: '',
  coordenadas: [{ valor: '' }] // formato "13.692790,-89.191680"
})

onMounted(async () => {
  try {
    pisos.value = await getPisos()
  } catch (error) {
    console.error('Error al cargar pisos:', error)
  }
})

const agregarCoordenada = () => {
  form.value.coordenadas.push({ valor: '' })
}

const eliminarCoordenada = (index) => {
  form.value.coordenadas.splice(index, 1)
}

const guardarPasillo = async () => {
  try {
    // 🔹 Convertir "13.692790,-89.191680" → [13.692790, -89.191680]
    const coordsTransformadas = form.value.coordenadas
      .map(c => c.valor.trim().split(',').map(Number))
      .filter(arr => arr.length === 2 && arr.every(v => !isNaN(v)))

    const payload = {
      nombres: form.value.nombres,
      id_pisos: form.value.id_pisos,
      coordenadas: coordsTransformadas
    }

    console.log('📤 Enviando a API:', payload)

    const response = await crearPasillo(payload)
    console.log('✅ Pasillo creado:', response)

    alert('Pasillo guardado correctamente')

    // 🔄 reiniciar formulario
    form.value = {
      nombres: '',
      id_pisos: '',
      coordenadas: [{ valor: '' }]
    }
  } catch (error) {
    console.error('❌ Error al guardar pasillo:', error)
    alert('Error al guardar el pasillo')
  }
}
</script>

<style scoped>
form {
  background: #f9fafb;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
