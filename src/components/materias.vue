<template>
  <div class="p-6 overflow-x-auto border border-blue-500">

    <!-- BOTONES SUPERIORES -->
    <div class="flex gap-4 mb-6">
      <vs-button block color="success" @click="mostrarFormulario = true; mostrarTabla = false; resetForm()">
        Registrar Materia
      </vs-button>

      <vs-button block color="dark" @click="cargarMaterias(); mostrarFormulario = false; mostrarTabla = true">
        Listar Materias
      </vs-button>
    </div>

    <!-- FORMULARIO DE REGISTRO -->
    <div v-if="mostrarFormulario">
      
        <h2 class="text-xl font-semibold text-center">{{ editandoId ? 'Editar Materia' : 'Registrar Materia' }}</h2>

        <!-- NOMBRE -->
        <vs-input
          v-model="form.nombres"
          label="Nombre"
          placeholder="Ejemplo: Matemáticas"
          required
        />

        <!-- HORARIOS -->
        <vs-input
          v-model="form.horarios"
          label="Horarios"
          placeholder="Ej: Lunes 2:00 PM"
          required
        />

        <!-- SELECT DE DESTINOS -->
        <vs-select
          v-model="form.id_puntos_destinos"
          label="Destino"
          placeholder="Seleccione un destino"
          required
        >
          <vs-option
            v-for="dest in destinos"
            :key="dest.id"
            :value="dest.id"
          >
            {{ dest.nombres }}
          </vs-option>
        </vs-select>

        <!-- BOTÓN -->
        <vs-button block color="success" class="mt-4" @click="guardarMateria">
          {{ editandoId ? 'Actualizar Materia' : 'Guardar Materia' }}
        </vs-button>
    
    </div>

    <!-- TABLA / LISTADO DE MATERIAS -->
    <div v-if="mostrarTabla" class="mt-6">
      <h2 class="text-xl font-semibold mb-4">Lista de Materias</h2>

      <vs-table :data="materias">
        <template #thead>
          <vs-tr>
            <vs-th>Nombre</vs-th>
            <vs-th>Horarios</vs-th>
            <vs-th>Destino</vs-th>
            <vs-th>Acciones</vs-th>
          </vs-tr>
        </template>

        <template #tbody>
          <vs-tr v-for="mat in materias" :key="mat.id">
            <vs-td>{{ mat.nombres }}</vs-td>
            <vs-td>{{ mat.horarios }}</vs-td>
            <vs-td>{{ destinos.find(d => d.id === mat.id_puntos_destinos)?.nombres ?? '—' }}</vs-td>
            <vs-td>
              <vs-button color="warning" small @click="editar(mat)">Editar</vs-button>
              <vs-button color="danger" small @click="confirmarEliminar(mat.id)">Eliminar</vs-button>
            </vs-td>
          </vs-tr>
        </template>
      </vs-table>
    </div>
    
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { getDestino } from '@/services/destinoServices'
import {
  getMaterias,
  crearMateria,
  editarMateria,
  eliminarMateria
} from '@/services/materiasServices'

const destinos = ref([])
const materias = ref([])

const mostrarFormulario = ref(true)
const mostrarTabla = ref(false)

const editandoId = ref(null)

const form = ref({
  nombres: '',
  horarios: '',
  id_puntos_destinos: ''
})

onMounted(async () => {
  destinos.value = await getDestino()
})

/* ============================
      CARGAR LISTA DE MATERIAS
=============================*/
const cargarMaterias = async () => {
  materias.value = await getMaterias()
}

/* ============================
      GUARDAR O EDITAR MATERIA
=============================*/
const guardarMateria = async () => {
  try {
    const payload = {
      nombres: form.value.nombres,
      horarios: form.value.horarios,
      id_puntos_destinos: form.value.id_puntos_destinos
    }

    if (editandoId.value) {
      await editarMateria(editandoId.value, payload)
      alert('Materia actualizada correctamente')
    } else {
      await crearMateria(payload)
      alert('Materia registrada correctamente')
    }

    resetForm()
    cargarMaterias()
    mostrarTabla.value = true
    mostrarFormulario.value = false

  } catch (err) {
    console.error(err)
    alert('Error al guardar materia')
  }
}

/* ============================
      CARGAR DATOS EN FORM AL EDITAR
=============================*/
const editar = (mat) => {
  editandoId.value = mat.id
  form.value = {
    nombres: mat.nombres,
    horarios: mat.horarios,
    id_puntos_destinos: mat.id_puntos_destinos
  }

  mostrarFormulario.value = true
  mostrarTabla.value = false
}

/* ============================
      CONFIRMAR ELIMINACIÓN
=============================*/
const confirmarEliminar = async (id) => {
  if (confirm('¿Seguro que deseas eliminar esta materia?')) {
    await eliminarMateria(id)
    cargarMaterias()
  }
}

/* ============================
      RESET FORMULARIO
=============================*/
const resetForm = () => {
  editandoId.value = null
  form.value = {
    nombres: '',
    horarios: '',
    id_puntos_destinos: ''
  }
}
</script>

<style scoped>
table {
  background: white;
}
</style>
