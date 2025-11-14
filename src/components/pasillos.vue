<template>
  <div class="p-6 overflow-x-auto border border-blue-500 text-sm">

    <!-- BOTONES SUPERIORES -->
    <div class="flex gap-4 mb-6">
      <vs-button block color="success" @click="mostrarFormulario = true; mostrarTabla = false; resetForm()">
        Registrar Pasillo
      </vs-button>

      <vs-button block color="dark" @click="cargarPasillos(); mostrarFormulario = false; mostrarTabla = true">
        Listar Pasillos
      </vs-button>
    </div>

    <!-- FORMULARIO DE REGISTRO -->
    <div v-if="mostrarFormulario">
   
        <h2 class="text-xl font-semibold text-center">{{ editandoId ? 'Editar Pasillo' : 'Registrar Pasillo' }}</h2>

        <!-- NOMBRE -->
        <vs-input v-model="form.nombres" label="Nombre" placeholder="Ejemplo: Pasillo Norte" required />

        <!-- PISO -->
        <vs-select v-model="form.id_pisos" label="Piso" placeholder="Selecciona un piso" required>
          <vs-option v-for="piso in pisos" :key="piso.id" :value="piso.id">
            {{ piso.nombres }}
          </vs-option>
        </vs-select>

        <!-- COORDENADAS -->
        <div class="mt-4">
          <h3 class="font-semibold mb-2">Coordenadas</h3>

          <div v-for="(coord, index) in form.coordenadas" :key="index" class="flex gap-2 items-center mb-2">
            <vs-input v-model="coord.valor" placeholder="Ej: 13.692790,-89.191680" class="flex-1" required />
            <vs-button color="danger" small @click="eliminarCoordenada(index)">✕</vs-button>
          </div>

          <vs-button color="primary" small @click="agregarCoordenada">+ Agregar coordenada</vs-button>
        </div>

        <!-- BOTÓN GUARDAR -->
        <vs-button block color="success" class="mt-4" @click="guardarPasillo">
          {{ editandoId ? 'Actualizar Pasillo' : 'Guardar Pasillo' }}
        </vs-button>
      
    </div>

    <!-- TABLA / LISTADO DE PASILLOS -->
    <div v-if="mostrarTabla" class="mt-6">
      <h2 class="text-sm font-semibold mb-4">Lista de Pasillos</h2>

      <vs-table :data="pasillos">
        <template #thead>
          <vs-tr>
            <vs-th>Nombre</vs-th>
            <vs-th>Piso</vs-th>
            <vs-th>Coordenadas</vs-th>
            <vs-th>Acciones</vs-th>
          </vs-tr>
        </template>

        <template #tbody>
          <vs-tr v-for="pasillo in pasillos" :key="pasillo.id">
            <vs-td>{{ pasillo.nombres }}</vs-td>
            <vs-td>{{ pasillo.piso?.nombres ?? '—' }}</vs-td>
            <vs-td>
              {{ Array.isArray(pasillo.coordenadas) ? pasillo.coordenadas.map(c => c.join(',')).join(' | ') : '—' }}
            </vs-td>
            <vs-td>
              <vs-button color="warning" small @click="editarPasillos(pasillo)">Editar</vs-button>
              <vs-button color="danger" small @click="confirmarEliminar(pasillo.id)">Eliminar</vs-button>
            </vs-td>
          </vs-tr>
        </template>
      </vs-table>
    </div>

  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { getPasillo, crearPasillo, editarPasillo, eliminarPasillo } from '../services/pasillosServices'
import { getPisos } from '../services/pisosServices'

const pisos = ref([])
const pasillos = ref([])

const mostrarFormulario = ref(true)
const mostrarTabla = ref(false)

const editandoId = ref(null)

const form = ref({
  nombres: '',
  id_pisos: '',
  coordenadas: [{ valor: '' }]
})

onMounted(async () => {
  try {
    pisos.value = await getPisos()
  } catch (error) {
    console.error('Error al cargar pisos:', error)
  }
})

/* ==========================
   CARGAR LISTA DE PASILLOS
========================== */
const cargarPasillos = async () => {
  pasillos.value = await getPasillo()
}

/* ==========================
   AGREGAR / ELIMINAR COORDENADAS
========================== */
const agregarCoordenada = () => form.value.coordenadas.push({ valor: '' })
const eliminarCoordenada = (index) => form.value.coordenadas.splice(index, 1)

/* ==========================
   GUARDAR / EDITAR PASILLO
========================== */
const guardarPasillo = async () => {
  try {
    const coordsTransformadas = form.value.coordenadas
      .map(c => c.valor.trim().split(',').map(Number))
      .filter(arr => arr.length === 2 && arr.every(v => !isNaN(v)))

    const payload = {
      nombres: form.value.nombres,
      id_pisos: form.value.id_pisos,
      coordenadas: coordsTransformadas
    }

    if (editandoId.value) {
      await editarPasillo(editandoId.value, payload)
      alert('Pasillo actualizado correctamente')
    } else {
      await crearPasillo(payload)
      alert('Pasillo registrado correctamente')
    }

    resetForm()
    cargarPasillos()
    mostrarTabla.value = true
    mostrarFormulario.value = false

  } catch (error) {
    console.error('Error al guardar pasillo:', error)
    alert('Error al guardar pasillo')
  }
}

/* ==========================
   EDITAR PASILLO
========================== */
const editarPasillos = (pasillo) => {
  editandoId.value = pasillo.id
  form.value = {
    nombres: pasillo.nombres,
    id_pisos: pasillo.id_pisos,
    coordenadas: pasillo.coordenadas.map(c => ({ valor: c.join(',') }))
  }

  mostrarFormulario.value = true
  mostrarTabla.value = false
}

/* ==========================
   CONFIRMAR ELIMINACIÓN
========================== */
const confirmarEliminar = async (id) => {
  if (!confirm('¿Seguro que deseas eliminar este pasillo?')) return
  try {
    await eliminarPasillo(id)
    cargarPasillos()
  } catch (error) {
    console.error(error)
    alert('Error al eliminar pasillo')
  }
}

/* ==========================
   RESET FORMULARIO
========================== */
const resetForm = () => {
  editandoId.value = null
  form.value = {
    nombres: '',
    id_pisos: '',
    coordenadas: [{ valor: '' }]
  }
}
</script>

<style scoped>
table {
  background: white;
}
</style>
