<template>
  <div class="p-4">

    <!-- ENCABEZADO -->
    <div class="flex items-center justify-between mb-6">

      
      <vs-button
        class="m-2"
        color="danger"
        :loading="loading"
        @click="cerrarSesion"
      >
        {{ loading ? "Cerrando..." : "Cerrar Sesión" }}
      </vs-button>

   
      <h2 class="text-2xl font-bold text-gray-800 text-center flex-1">
        Listado de Materias
      </h2>

      <vs-button
        class="m-2"
        color="success"
        @click="irACustomMap"
      >
        Custom Map
      </vs-button>
      
    </div>

    <!-- TABLA ESTILIZADA -->
    <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      
  <vs-table :data="datos" class="w-full border-2 border-black">
      <template #thead>
        <vs-tr>
          <vs-th >Materia</vs-th>
          <vs-th>Horario</vs-th>
          <vs-th>Aula</vs-th>
        </vs-tr>
      </template>

      <template #tbody>
        <vs-tr
          v-for="item in datos"
          :key="item.id"
        >
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
    </div>

    <!-- MENSAJE SIN DATOS -->
    <p
      v-if="datos.length === 0"
      class="mt-4 text-gray-600 text-center"
    >
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
<style scoped>
/* Encabezado */
.vs-table th {
  background: #f8fafc !important; /* slate-50 */
  font-weight: 700;
  text-transform: uppercase;
  font-size: 1.2rem;
  color: #475569; /* slate-600 */
  border-bottom: 2px solid #030405 !important; /* slate-300 */
}

/* Filas */
.vs-table tr {
  border-bottom: 1px solid #0c0d0e !important; /* slate-200 */
}

.vs-table tr:hover {
  background: #020203 !important; /* slate-100 */
}

/* Ajuste para celdas */
.vs-table td {
  font-size: 1.2rem;
  padding: 12px !important;
}
.vs-table th {
  padding: 12px !important;
}
</style>
