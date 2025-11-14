<template>
  <div>

    <!-- ENCABEZADO usando Vuesax Alpha -->
     <div class="flex gap-4 mb-6">
      <!-- Botón Cerrar Sesión (izquierda) -->
     
        <vs-button class="m-2" color="danger" :loading="loading" @click="cerrarSesion">
          {{ loading ? 'Cerrando...' : 'Cerrar Sesión' }}
        </vs-button>
    

      <!-- Título (centrado) -->
   
        <h2 class="text-xl font-bold text-center">Listado de Materias</h2>
    

      <!-- Botón Custom Map (derecha) -->
      
        <vs-button class="fixed right-4 " color="success" @click="irACustomMap">
          Custom Map
        </vs-button>
   
    </div>

    <!-- TABLA -->
    <vs-table :data="datos">
      <template #thead>
        <vs-tr>
          <vs-th>Materia</vs-th>
          <vs-th>Horario</vs-th>
          <vs-th>Aula</vs-th>
        </vs-tr>
      </template>

      <template #tbody>
        <vs-tr v-for="item in datos" :key="item.id">
          <vs-td>{{ item.materia }}</vs-td>
          <vs-td>{{ item.horario }}</vs-td>
          <vs-td>
            <vs-button
              type="flat"
              color="primary"
              class="underline cursor-pointer"
              @click="seleccionarDestino(item.aula)"
            >
              {{ item.aula }}
            </vs-button>
          </vs-td>
        </vs-tr>
      </template>
    </vs-table>

    <p v-if="datos.length === 0" class="mt-2 text-gray-600">
      No hay materias disponibles.
    </p>

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
