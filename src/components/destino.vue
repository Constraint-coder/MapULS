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

<input 
  type="file" 
  accept="image/*" 
  @change="form.imagen = $event.target.files[0]" 
  class="mt-2"
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
            <vs-th>Imagen</vs-th>
            <vs-th>Acciones</vs-th>
          </vs-tr>
        </template>

        <template #tbody>
          <vs-tr v-for="dest in destinos" :key="dest.id">
            <vs-td>{{ dest.nombres }}</vs-td>
            <vs-td>{{ dest.piso?.nombres ?? '—' }}</vs-td>
            <vs-td>{{ Array.isArray(dest.coordenadas) ? dest.coordenadas.join(', ') : '—' }}</vs-td>
             <vs-td>
              <img 
                v-if="dest.imagen" 
                :src="backendURL + dest.imagen" 
                class="w-16 h-16 object-cover rounded"
              />

            </vs-td><vs-td>
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
  coordenadas: [],  // siempre array
  imagen: null,     // null o File
})

const backendURL = 'http://localhost:8000'

// Cargar pisos y destinos al montar
onMounted(async () => {
  pisos.value = await getPisos()
  await cargarDestinos()
})

// Cargar lista de destinos
const cargarDestinos = async () => {
  destinos.value = await getDestino()
}

// Guardar o editar destino usando FormData siempre
const guardarDestino = async () => {
  try {
    const coords = Array.isArray(form.value.coordenadas)
      ? form.value.coordenadas
      : form.value.coordenadas.trim().split(',').map(Number)

    if (coords.length !== 2 || coords.some(isNaN)) {
      alert('Formato de coordenadas inválido. Usa: latitud,longitud')
      return
    }

    const payload = new FormData()
    payload.append('nombres', form.value.nombres)
    payload.append('id_pisos', form.value.id_pisos)
    coords.forEach(c => payload.append('coordenadas[]', c))

    // ⚡ Solo agregar imagen si es un File
    if (form.value.imagen instanceof File) {
      payload.append('imagen', form.value.imagen)
    }

    if (editandoId.value) {
      // PATCH
      await editarDestino(editandoId.value, payload)
      alert('Destino actualizado correctamente')
    } else {
      await crearDestino(payload)
      alert('Destino registrado correctamente')
    }

    form.value = { nombres: '', id_pisos: '', coordenadas: [], imagen: null }
    editandoId.value = null
    await cargarDestinos()
    mostrarFormulario.value = false
    mostrarTabla.value = true

  } catch (error) {
    console.error('Error al guardar destino:', error)
    if (error.errors) {
      alert(Object.values(error.errors).flat().join('\n'))
    } else {
      alert('Error al guardar destino')
    }
  }
}

// Editar destino: no enviamos imagen existente como File
const editar = (dest) => {
  editandoId.value = dest.id
  form.value = {
    nombres: dest.nombres,
    id_pisos: dest.id_pisos,
    coordenadas: dest.coordenadas, // mantener array
    imagen: null,                  // no enviar la ruta existente
  }

  mostrarFormulario.value = true
  mostrarTabla.value = false
}

// Confirmar eliminación
const confirmarEliminar = async (id) => {
  if (confirm('¿Seguro que deseas eliminar este destino?')) {
    await eliminarDestino(id)
    await cargarDestinos()
  }
}
</script>


<style scoped>
table {
  background: white;
}
</style>
