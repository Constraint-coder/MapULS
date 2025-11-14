<template>
  <div class="p-6 overflow-x-auto border border-blue-500" >

    <!-- BOTONES SUPERIORES -->
    <div class="flex gap-4 mb-6">
       <vs-button block  color="success"
        @click="mostrarFormulario = true; mostrarTabla = false; resetForm()">
        Registrar Referencia
       </vs-button>
        

      <vs-button block  color="dark"
        @click="cargarReferencias(); mostrarFormulario = false; mostrarTabla = true">
        Listar Referencias
       </vs-button>
    </div>

    <!-- ========================== -->
    <!-- FORMULARIO DE REGISTRO -->
    <!-- ========================== -->
    <div v-if="mostrarFormulario">
      <form @submit.prevent="guardarReferencia" class="space-y-4 p-4 max-w-lg mx-auto">
        <h2 class="text-xl font-semibold text-center">
          {{ editMode ? "Editar Referencia" : "Registrar Referencia" }}
        </h2>

        <!-- NOMBRE -->
             
           <vs-input
          v-model="form.nombres"
          label="Nombre"
          placeholder="Ejemplo: Escalera Norte"
          required
        />
        
        <!-- PISO -->
        <vs-select
          v-model="form.id_pisos"
          label="Piso"
          placeholder="Selecciona un piso"
          required
        >
          <vs-option
            v-for="piso in pisos"
            :key="piso.id"
            :value="piso.id"
          >
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
      
           <vs-button block  color="success"
                     
            @click="guardarReferencia"
          >
            {{ editMode ? "Actualizar" : "Guardar" }}
           </vs-button>
          <button
            v-if="editMode"
            type="button"
            @click="resetForm(); mostrarFormulario = false"
            class="bg-gray-500 text-white px-4 py-2 rounded w-full"
          >
            Cancelar
          </button>
       
      </form>
    </div>

    <!-- ========================== -->
    <!-- TABLA / LISTADO DE REFERENCIAS -->
    <!-- ========================== -->
    <div v-if="mostrarTabla">
      <h2 class="text-xl font-semibold mb-4">Lista de Referencias</h2>

<vs-table :data="referencias">
          <template #thead>
            <vs-tr>
              <vs-th>Nombre</vs-th>
              <vs-th>Piso</vs-th>
              <vs-th>Coordenadas</vs-th>
              <vs-th>Acciones</vs-th>
            </vs-tr>
          </template>

          <template #tbody>
            <vs-tr v-for="ref in referencias" :key="ref.id">
              <vs-td>{{ ref.nombres }}</vs-td>
              <vs-td>{{ ref.piso?.nombres ?? '—' }}</vs-td>
              <vs-td>{{ Array.isArray(ref.coordenadas) ? ref.coordenadas.join(', ') : '—' }}</vs-td>
              <vs-td>
                <vs-td>
              <vs-button color="warning" small @click="editar(ref)">Editar</vs-button>
              <vs-button color="danger" small @click="confirmarEliminar(ref.id)">Eliminar</vs-button>
            </vs-td>
              </vs-td>
            </vs-tr>
          </template>
        </vs-table>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPisos } from '@/services/pisosServices'
import { getReferencia, crearReferencia, editarReferencia, eliminarReferencia } from '@/services/puntoServices'

const pisos = ref([])
const referencias = ref([])

const mostrarFormulario = ref(true)
const mostrarTabla = ref(false)
const editMode = ref(false)
const editandoId = ref(null)

const form = ref({
  nombres: '',
  id_pisos: '',
  coordenadas: ''
})

onMounted(async () => {
  try {
    pisos.value = await getPisos()
  } catch (error) {
    console.error('Error al cargar pisos:', error)
  }
})

// ============================
// CARGAR LISTA DE REFERENCIAS
// ============================
const cargarReferencias = async () => {
  referencias.value = await getReferencia()
}

// ============================
// GUARDAR / EDITAR REFERENCIA
// ============================
const guardarReferencia = async () => {
  try {
    const coordsTransformadas = form.value.coordenadas
      .trim()
      .split(',')
      .map(Number)

    if (coordsTransformadas.length !== 2 || coordsTransformadas.some(isNaN)) {
      alert('Formato de coordenadas inválido. Usa: latitud,longitud')
      return
    }

    const payload = {
      nombres: form.value.nombres.trim(),
      id_pisos: form.value.id_pisos,
      coordenadas: coordsTransformadas
    }

    if (editMode.value) {
      await editarReferencia(editandoId.value, payload)
      alert('Referencia actualizada correctamente')
    } else {
      await crearReferencia(payload)
      alert('Referencia guardada correctamente')
    }

    resetForm()
    cargarReferencias()
    mostrarFormulario.value = false
    mostrarTabla.value = true

  } catch (error) {
    console.error('Error al guardar referencia:', error)
    alert('Error al guardar la referencia')
  }
}

// ============================
// CARGAR DATOS EN FORM AL EDITAR
// ============================
const editar = (refObj) => {
  editMode.value = true
  editandoId.value = refObj.id
  form.value = {
    nombres: refObj.nombres,
    id_pisos: refObj.id_pisos,
    coordenadas: refObj.coordenadas.join(',')
  }

  mostrarFormulario.value = true
  mostrarTabla.value = false
}

// ============================
// CONFIRMAR ELIMINACIÓN
// ============================
const confirmarEliminar = async (id) => {
  if (confirm('¿Seguro que deseas eliminar esta referencia?')) {
    await eliminarReferencia(id)
    cargarReferencias()
  }
}

// ============================
// RESET FORM
// ============================
const resetForm = () => {
  form.value = { nombres: '', id_pisos: '', coordenadas: '' }
  editMode.value = false
  editandoId.value = null
}
</script>

<style scoped>
table {
  background: white;
}
</style>
