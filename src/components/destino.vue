<template>
  <div class="p-6 overflow-x-auto border border-blue-500">

    <!-- BOTONES SUPERIORES -->
    <div class="flex gap-4 mb-6">
      <vs-button block color="success" @click="mostrarFormulario = true; mostrarTabla = false; resetForm()">
        Registrar Destino
      </vs-button>

      <vs-button block color="dark" @click="cargarDestinos(); mostrarFormulario = false; mostrarTabla = true">
        Listar Destinos
      </vs-button>
    </div>

    <!-- FORMULARIO DE REGISTRO -->
    <div v-if="mostrarFormulario">
     
        <h2 class="text-xl font-semibold text-center">Registrar Destino</h2>

        <!-- NOMBRE -->
        <vs-input
          v-model="form.nombres"
          label="Nombre"
          placeholder="Ejemplo: Sala A"
          required
        />

        <!-- PISO -->
        <vs-select
          v-model="form.id_pisos"
          label="Piso"
          placeholder="Selecciona un piso"
          required
        >
          <vs-option v-for="piso in pisos" :key="piso.id" :value="piso.id">
            {{ piso.nombres }}
          </vs-option>
        </vs-select>

        <!-- COORDENADAS -->
        <vs-input
          v-model="form.coordenadas"
          label="Coordenadas"
          placeholder="Ej: 13.692790,-89.191680"
          required
        />

        <!-- BOTÓN -->
        <vs-button block color="success" class="mt-4" @click="guardarDestino">
          Guardar Destino
        </vs-button>
      
    </div>

    <!-- TABLA / LISTADO DE DESTINOS -->
    <div v-if="mostrarTabla" class="mt-6">
      <h2 class="text-xl font-semibold mb-4">Lista de Destinos</h2>

      <vs-table :data="destinos">
        <template #thead>
          <vs-tr>
            <vs-th>Nombre</vs-th>
            <vs-th>Piso</vs-th>
            <vs-th>Coordenadas</vs-th>
            <vs-th>Acciones</vs-th>
          </vs-tr>
        </template>

        <template #tbody>
          <vs-tr v-for="dest in destinos" :key="dest.id">
            <vs-td>{{ dest.nombres }}</vs-td>
            <vs-td>{{ dest.piso?.nombres ?? '—' }}</vs-td>
            <vs-td>{{ Array.isArray(dest.coordenadas) ? dest.coordenadas.join(', ') : '—' }}</vs-td>
            <vs-td>
              <vs-button color="warning" small @click="editar(dest)">Editar</vs-button>
              <vs-button color="danger" small @click="confirmarEliminar(dest.id)">Eliminar</vs-button>
            </vs-td>
          </vs-tr>
        </template>
      </vs-table>
    </div>

  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import {
  getDestino,
  crearDestino,
  editarDestino,
  eliminarDestino
} from '@/services/destinoServices'

import { getPisos } from '@/services/pisosServices'

const pisos = ref([])
const destinos = ref([])

const mostrarFormulario = ref(true)
const mostrarTabla = ref(false)

const editandoId = ref(null)

const form = ref({
  nombres: '',
  id_pisos: '',
  coordenadas: ''
})

onMounted(async () => {
  pisos.value = await getPisos()
})

/* ============================
      CARGAR LISTA DE DESTINOS
=============================*/
const cargarDestinos = async () => {
  destinos.value = await getDestino()
}

/* ============================
      GUARDAR O EDITAR DESTINO
=============================*/
const guardarDestino = async () => {
  try {
    // Convertir coordenadas
    const coordsTransformadas = form.value.coordenadas
      .trim()
      .split(',')
      .map(Number)

    if (coordsTransformadas.length !== 2 || coordsTransformadas.some(isNaN)) {
      alert('Formato de coordenadas inválido. Usa: latitud,longitud')
      return
    }

    const payload = {
      nombres: form.value.nombres,
      id_pisos: form.value.id_pisos,
      coordenadas: coordsTransformadas
    }

    if (editandoId.value) {
      // 🔄 EDITAR
      await editarDestino(editandoId.value, payload)
      alert('Destino actualizado correctamente')
    } else {
      // ➕ CREAR
      await crearDestino(payload)
      alert('Destino registrado correctamente')
    }

    // Reset
    form.value = { nombres: '', id_pisos: '', coordenadas: '' }
    editandoId.value = null

    // Recargar lista
    cargarDestinos()
    mostrarTabla.value = true
    mostrarFormulario.value = false

  } catch (error) {
    console.error('Error al guardar destino:', error)
    alert('Error al guardar destino')
  }
}

/* ============================
      CARGAR DATOS EN FORM AL EDITAR
=============================*/
const editar = (dest) => {
  editandoId.value = dest.id
  form.value = {
    nombres: dest.nombres,
    id_pisos: dest.id_pisos,
    coordenadas: dest.coordenadas.join(',')
  }

  mostrarFormulario.value = true
  mostrarTabla.value = false
}

/* ============================
      CONFIRMAR ELIMINACIÓN
=============================*/
const confirmarEliminar = async (id) => {
  if (confirm('¿Seguro que deseas eliminar este destino?')) {
    await eliminarDestino(id)
    cargarDestinos()
  }
}
</script>

<style scoped>
table {
  background: white;
}
</style>
