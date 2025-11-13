<template>
  <form @submit.prevent="guardarReferencia" class="space-y-4 p-4 max-w-lg mx-auto">
    <h2 class="text-xl font-semibold text-center">Registrar Referencia</h2>

    <!-- NOMBRE -->
    <div>
      <label class="block font-medium mb-1">Nombre:</label>
      <input
        v-model="form.nombres"
        type="text"
        class="border p-2 w-full rounded"
        placeholder="Ejemplo: Escalera Norte"
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

        <input
          v-model="form.coordenadas"
          type="text"
          placeholder="Ej: 13.692790,-89.191680"
          class="border p-2 rounded flex-1"
          required
        />
  
     

    </div>

    <!-- BOTÓN -->
    <button
      type="submit"
      class="bg-green-600 text-white px-4 py-2 rounded w-full"
    >
      Guardar Referencia
    </button>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPisos } from '../services/pisosServices'
import { crearReferencia } from '@/services/puntoServices'

const pisos = ref([])

const form = ref({
  nombres: '',
  id_pisos: '',
  coordenadas: '' // formato texto "lat,lng"
})

onMounted(async () => {
  try {
    pisos.value = await getPisos()
  } catch (error) {
    console.error('Error al cargar pisos:', error)
  }
})



// === GUARDAR REFERENCIA ===
const guardarReferencia = async () => {
  try {    // 🔹 Convertir "13.692790,-89.191680" → [13.692790, -89.191680]
    const coordsTransformadas = form.value.coordenadas
      .trim()
      .split(',')
      .map(Number)

    // Validación de formato correcto
    if (coordsTransformadas.length !== 2 || coordsTransformadas.some(isNaN)) {
      alert('Formato de coordenadas inválido. Usa: latitud,longitud')
      return
    }

    const payload = {
      nombres: form.value.nombres,
      id_pisos: form.value.id_pisos,
      coordenadas: coordsTransformadas // solo una coordenada [lat, lng]
    }

    console.log('📤 Enviando a API:', payload)
    const response = await crearReferencia(payload)
    console.log('✅ Referencia creada:', response)

    alert('Referencia guardada correctamente')

    // 🔄 Reiniciar formulario
    form.value = { nombres: '', id_pisos: '', coordenadas:'' }
  } catch (error) {
    console.error('❌ Error al guardar referencia:', error)
    alert('Error al guardar la referencia')
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
