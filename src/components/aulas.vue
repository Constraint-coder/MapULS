<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Listado de Materias</h2>

              <!-- Botón Custom Map -->
        <button
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          @click="irACustomMap"
        >
          Custom Map
        </button>

      <!-- Botón Cerrar Sesión -->
      <button
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        @click="cerrarSesion"
        :disabled="loading"
      >
        {{ loading ? 'Cerrando...' : 'Cerrar Sesión' }}
      </button>
    </div>

    <section class="section">
      <table class="table-auto border-collapse border border-gray-300 w-full">
        <thead>
          <tr class="bg-gray-200">
            <th class="border border-gray-300 px-4 py-2">Materia</th>
            <th class="border border-gray-300 px-4 py-2">Horario</th>
            <th class="border border-gray-300 px-4 py-2">Aula</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in datos" :key="item.id" class="hover:bg-gray-100">
            <td class="border border-gray-300 px-4 py-2">{{ item.materia }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ item.horario }}</td>
            <td class="border border-gray-300 px-4 py-2">
              <a href="#" class="text-blue-600 hover:underline cursor-pointer"
                 @click.prevent="seleccionarDestino(item.aula)">
                {{ item.aula }}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="datos.length === 0" class="mt-2">No hay materias disponibles.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMaterias } from '@/services/materiasServices.js'
import { useDestinoStore } from '@/stores/useDestinoStore.js'
import { logoutUsuario } from '@/services/loginServices.js'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const router = useRouter()

const datos = ref([])
const destinoStore = useDestinoStore()
const loading = ref(false)
const auth = useAuthStore()

onMounted(async () => {
  try {
    const response = await getMaterias()
    const materias = Array.isArray(response) ? response : response.data || []

    datos.value = materias.map(item => ({
      id: item.id,
      materia: item.nombres,
      horario: item.horarios,
      aula: item.aula?.nombres || 'Sin asignar',
    }))
  } catch (error) {
    console.error('Error al cargar materias:', error)
    datos.value = []
  }
})

function seleccionarDestino(aula) {
  destinoStore.setDestinoSeleccionado(aula)
  console.log('Aula seleccionada:', aula)
}



async function cerrarSesion() {
  loading.value = true
  try {
    await logoutUsuario()
    auth.user = null
    auth.token = null
    router.push('/login') // redirige al login usando Vue Router
  } catch (err) {
    console.error('Error al cerrar sesión:', err)
  } finally {
    loading.value = false
  }
}
function irACustomMap() {
  router.push('/map')
}
</script>
