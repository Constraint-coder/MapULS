<template>
  <div class="w-full min-h-screen">

    <div class="fixed top-0 left-0 right-0 z-[2000] 
             
            px-4 py-3"> 
        <div class="w-[75%] flex items-center justify-between pt-10 h-10 mt-3 pb-5 gap-2 flex-grow">
            <div class="flex items-center gap-3 flex-grow">
            <vs-button 
              color="dark"
              @click="regresarAulas"
              class="m-4 px-4 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-900 flex items-center"
            >
              <!-- Solo icono en pantallas pequeñas -->
              <span class="sm:hidden">←</span>
              
              <!-- Texto + icono en pantallas medianas en adelante -->
              <span class="hidden sm:inline">← Volver a Aulas</span>
            </vs-button>
              <div class="w-4 flex flex-grow justify-center items-end">
              <h3 class="sm:text-5xl text-2xl font-bold text-orange-600  bg-gray-600/50 ">Mapa ULS</h3>
              </div>
                <div v-if="cargandoUbicacion" class="justify-center items-center z-[1000]">
                <div class="w-4 h-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-sm text-gray-600 mt-3">ubicación...</p>
              </div>
            </div>

            <div class="w-[20%]z-[1000] top-4 right-1">
              <Menu v-if="auth.isAdmin" />
            </div>

          </div>



    <!-- Contenedor principal de selectores -->
        <div class="space-y-4">

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

            <!-- Selector Destino -->
            <div class="flex flex-col">
              <label for="destino" class="font-medium mb-1">Destino:</label>
              <select id="destino" v-model="destinoSeleccionado"
                class="border rounded-lg px-3 py-2 bg-gray-50 focus:ring focus:ring-blue-300">
                <option disabled value="">-- Selecciona Destino --</option>
                <option v-for="dest in destinos" :key="dest.id" :value="dest.id">
                  {{ dest.nombres }}
                </option>
              </select>
            </div>

            <!-- Selector Piso -->
            <div class="flex flex-col">
              <label for="piso" class="font-medium mb-1">Piso actual:</label>
              <select v-model="pisoSeleccionado"
                class="border rounded-lg px-3 py-2 bg-gray-50 focus:ring focus:ring-blue-300">
                <option disabled value="">-- Selecciona Piso --</option>
                <option v-for="piso in pisos" :key="piso.id" :value="piso.id">
                  {{ piso.nombres }}
                </option>
              </select>
            </div>

            <!-- Botón Buscar -->
            <div class="flex items-end">
              <button @click="encontrar"
                class="w-auto p-2 bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700">
                🔍 Buscar
              </button>
              
            </div>
            
          </div>
        </div>

          <!-- Botón actualizar ubicación -->
        <div class="z-[2000] flex justify-start mb--3">
          <button 
            @click="iniciarGeolocalizacion"
            class="px-6 py-2 rounded-lg shadow hover:bg-green-700">
            🔄
          </button>
        </div>
    </div>
    <!-- Mapa -->
    <div id="map" ref="mapElement"></div>

    <!-- Pestaña  Imagen -->
    <div>
        <!-- Pestaña Imagen fija abajo -->
        <div v-if="destinoImagen"
          class="fixed bottom-0 right-0 
         z-[1200] flex flex-col items-center">

          <!-- Botón -->
          <button
            @click="expandida = !expandida"
            class="bg-blue-600 text-white px-3 py-1 rounded-t-lg shadow-lg focus:outline-none"
          >
            Ver Imagen de Destino
          </button>

          <!-- Contenido expandible -->
          <div
                v-show="expandida"
                class="p-2 m-4 rounded-b-lg shadow-lg 
                      w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72
                      flex justify-center items-center bg-white
                      transition-all duration-300"
              >
                <img
                  :src="backendURL + (destinoImagen || '/img/default.png')"
                  alt="Destino"
                  class="w-full max-h-72 object-contain rounded"
                />
              </div>

        </div>


        <!-- Indicaciones -->
        <div
          v-if="indicaciones.length > 0"
          class="fixed bottom-2 left-4 z-[1100] bg-white p-4 rounded-xl shadow-lg w-auto sm:w-[50%] md:w-[45%]"
        >
          <!-- Botón para expandir/colapsar -->
          <button
            @click="expandeIndicacion = !expandeIndicacion"
            class="mb-2 text-lg text-blue-600 hover:underline"
          >
            {{ expandeIndicacion ? 'Ocultar' : 'Indicaciones' }}
          </button>

          <!-- Contenedor del listado -->
          <div
            :class="expandeIndicacion ? 'max-h-0 overflow-hidden' : 'max-h-60 overflow-y-auto'"
            class="transition-all duration-300"
          >
            <h4 class="text-xl font-semibold mb-2">🧭 Indicaciones</h4>

            <!-- Lista de indicaciones -->
            <ul class="list-disc ml-6 space-y-1 w-full">
              <li v-for="(ind, i) in indicaciones" :key="i" class="w-full" v-html="ind"></li>
            </ul>
          </div>
        </div>

    </div>


    <!-- Modal -->
    <transition name="modal-fade">
      <div v-if="mostrarModal"
        class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[2100]">

        <div class="bg-white w-80 p-6 rounded-xl shadow-lg space-y-4">
          <p class="text-center text-lg font-semibold" v-if="encontrado">
            {{ encontrado.nombres }}
          </p>

          <!-- Radios -->
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <input type="radio" value="actual" v-model="ubicacionSeleccionada" />
              <span>Ubicación actual</span>
            </label>

            <label class="flex items-center gap-2">
              <input type="radio" value="mapa" v-model="ubicacionSeleccionada" />
              <span>Ubicación desde mapa</span>
            </label>
          </div>

          <!-- Botones modal -->
          <div class="flex justify-between pt-2">
            <button 
              @click="SeleccionarUbicacion"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              ➤ Comenzar
            </button>

            <button 
              @click="cerrarModal"
              class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
              ✖ Cancelar
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Marcador flotante -->
    <div v-if="modoMapaActivo" class="text-3xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      📍
    </div>

    <!-- Aceptar ubicación -->
    <button 
      v-if="modoMapaActivo"
      @click="confirmarUbicacionMapa"
      class="fixed bottom-6 right-6 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700">
      ✔ Aceptar ubicación
    </button>


  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue"
import L, { marker } from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-imageoverlay-rotated"
import { getPasillo } from "./services/pasillosServices"
import { getDestino, getDestinoById,getDestinoByI } from "./services/destinoServices"
import { getPisos } from "./services/pisosServices"
import { getReferencia } from "./services/puntoServices"
import { useDestinoStore } from '@/stores/useDestinoStore'
import { useAuthStore } from './stores/authStore'
import Menu from './components/menu.vue'
import { useRouter } from "vue-router"

const router = useRouter()


const backendURL = 'http://localhost:8000'

// ====== Refs ======
const store = useDestinoStore()  // trae consigo el aula seleccionada

// Radio button
const ubicacionSeleccionada = ref('actual') // valor por defecto
const expandida = ref(false); //expander para imagen
const expandeIndicacion = ref(false) //expander para indicacion

const auth = useAuthStore()  /// detecta el lgueado

let destinoImagen = ""
const mapElement = ref(null)
const destinos = ref([])
const referencias = ref([])
const destinoSeleccionado = ref("")
const pisos = ref([])
const pisoSeleccionado = ref("")
const pasillos = ref([])
const rutasPisos = ref([])
const logPasillosUsados = ref([])
const indicaciones = ref([]) // 🆕 Listado de instrucciones
 const encontrado =ref("")


// 🆕 Variables reactivas
const origenCoords = ref(null)
 const CorrdsControl = ref(null)
const rutaSinPasillo = ref(null) // línea punteada reactiva
const modoMapaActivo = ref(false);
const cargandoUbicacion = ref(false);


let map
let marcadorDestino = null
let marcadorUsuario = null
let rutasDibujadas = []
let marcadoresReferencia = []

let marcadorMapa = null;

const GROSOR_PASILLOS = 10


const mostrarModal = ref(false); 
  // 🔥 Variable reactiva para manejo del modal



  function regresarAulas() {
  store.setDestinoSeleccionado('') // limpia el aula seleccionada
   router.push('/dashboard')
  
}

const encontrar = async () => {

  rutasPisos.value = [];
  logPasillosUsados.value = [];
  indicaciones.value = [];
  marcadoresReferencia.forEach(m => map.removeLayer(m));
  marcadoresReferencia = [];

  // VALIDACIONES BÁSICAS
  if (!pisoSeleccionado.value) {
    alert("Selecciona tu piso actual");
    return;
  }

  if (!destinoSeleccionado.value) {
    alert("Selecciona Destino...");
    return;
  }

  try {
    // 🔹 Verificar si existe el destino
    const destino = await getDestinoById(destinoSeleccionado.value);

    if (!destino) {
      alert("Destino no encontrado");
      return;
    }
        const todos = destinos.value.flat();
    const encuentra = todos.find(d => d.id === destinoSeleccionado.value); 
    encontrado.value = encuentra.nombres;
    // 👉 SI TODO ES CORRECTO => ABRIR MODAL
    mostrarModal.value = true;

  } catch (e) {
    console.error(e);
    alert("Error validando ruta");
  }
};    // 👉 Abrir modal

const cerrarModal = () => {
  mostrarModal.value = false;     // 👉 Cerrar modal
};

function confirmarUbicacionMapa() {
    // Tomar coordenadas del centro del mapa
    const center = map.getCenter();
    const lat = center.lat;
    const lng = center.lng;

    // Guardar como origen
    origenCoords.value = [lat, lng];

   CorrdsControl.value = [...origenCoords.value] 

    // Crear un marcador fijo en esa posición
    marcadorMapa = L.marker([lat, lng])
      .addTo(map)
      .bindPopup("📍 Punto seleccionado")
      .openPopup();

    modoMapaActivo.value = false; // salir del modo mapa

    console.log("Coordenadas elegidas:", origenCoords.value);

    onDestinoChange(); // Calcular la ruta

}


function SeleccionarUbicacion() {
  // Cerrar modal
  mostrarModal.value = false;

  // 👉 OPCIÓN 1: Usar ubicación actual del celular
  if (ubicacionSeleccionada.value === 'actual') {

   if (marcadorMapa) {
  map.removeLayer(marcadorMapa);
  marcadorMapa = null; // opcional, para limpiar la referencia
}
    
if (CorrdsControl.value && origenCoords.value) {
  const iguales =
    CorrdsControl.value[0] === origenCoords.value[0] &&
    CorrdsControl.value[1] === origenCoords.value[1];

  if (iguales) {
    alert("Buscando ubicación GPS");
    return;
  }
}
    iniciarGeolocalizacion();

    if (!origenCoords.value) {
      alert("No se detecta tu ubicación actual aún.");
      return;
    }
    console.log("Ruta desde GPS:", origenCoords.value);
    onDestinoChange();
    return;
  }

  // 👉 OPCIÓN 2: Usar ubicación desde mapa
if (ubicacionSeleccionada.value === "mapa") {
    mostrarModal.value = false;  

    // Activar modo mapa
    modoMapaActivo.value = true;

    // Si existe un marcador anterior, eliminarlo
    if (marcadorMapa) {
        map.removeLayer(marcadorMapa);
        marcadorMapa = null;
    }

    // En este modo NO se crea marcador, solo flotante
    return;
}

}



// ====== Utilidades ======
function distancia(a, b) {
  const R = 6371e3, rad = Math.PI / 180
  const φ1 = a[0] * rad, φ2 = b[0] * rad, Δφ = (b[0]-a[0]) * rad, Δλ = (b[1]-a[1]) * rad
  const x = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x))
}
// Interpolar todos los segmentos de un pasillo
function interpolarSegmentoPasillo(pasillo) {
  const nodos = []
  for (let i = 0; i < pasillo.coordenadas.length - 1; i++) {
    const inter = interpolarSegmento(pasillo.coordenadas[i], pasillo.coordenadas[i + 1])
    if (i > 0) inter.shift() // evitar duplicar nodos
    nodos.push(...inter)
  }
  return nodos
}

function interpolarSegmento(a,b){
  const nodos = [], pasos = Math.max(1, Math.ceil(distancia(a,b)/0.5))
  for(let i=0;i<=pasos;i++){
    const t=i/pasos
    nodos.push([a[0]+t*(b[0]-a[0]), a[1]+t*(b[1]-a[1])])
  }
  return nodos
}

function generarNodosPasillos(pasillos){
  return pasillos.map(p=>{
    const nodos=[]
    for(let i=0;i<p.coordenadas.length-1;i++){
      const inter = interpolarSegmento(p.coordenadas[i], p.coordenadas[i+1])
      if(i>0) inter.shift()
      nodos.push(...inter)
    }
    return {id:p.id, id_pisos:p.id_pisos, nombres:p.nombres, coordenadas:nodos}
  })
}

function construirGrafo(laberinto){
  const grafo = new Map()
  laberinto.forEach(p=>{
    const nodos=p.coordenadas
    for(let i=0;i<nodos.length-1;i++){
      const aKey=nodos[i].map(x=>x.toFixed(7)).join(",")
      const bKey=nodos[i+1].map(x=>x.toFixed(7)).join(",")
      const distAB=distancia(nodos[i], nodos[i+1])
      if(!grafo.has(aKey)) grafo.set(aKey, [])
      if(!grafo.has(bKey)) grafo.set(bKey, [])
      grafo.get(aKey).push({key:bKey, dist:distAB})
      grafo.get(bKey).push({key:aKey, dist:distAB})
    }
  })
  return grafo
}

function encontrarCaminoMasCorto(grafo, inicioKey, finKey){
  const dist=new Map(), prev=new Map(), cola=new Set(grafo.keys())
  grafo.forEach((_,k)=>dist.set(k, Infinity))
  dist.set(inicioKey,0)
  while(cola.size>0){
    const actual=[...cola].reduce((a,b)=>dist.get(a)<dist.get(b)?a:b)
    cola.delete(actual)
    if(actual===finKey) break
    for(const {key:v, dist:d} of grafo.get(actual)||[]){
      if(!cola.has(v)) continue
      const nueva=dist.get(actual)+d
      if(nueva<dist.get(v)){ dist.set(v,nueva); prev.set(v,actual) }
    }
  }
  const camino=[]
  let act=finKey
  while(act){ camino.unshift(act); act=prev.get(act) }
  return {camino, distancia: dist.get(finKey)}
}

// ====== Cargar datos ======
async function cargarDatos(){
  destinos.value = await getDestino().catch(console.error)
  pasillos.value = await getPasillo().catch(console.error)
  pisos.value = await getPisos().catch(console.error)
  referencias.value = await getReferencia().catch(console.error)
}
cargarDatos()

// ====== Geolocalización ======
function iniciarGeolocalizacion(){
  
  if(!navigator.geolocation){ alert("Tu navegador no soporta geolocalización");
   return 
  }
      cargandoUbicacion.value = true;
  

  navigator.geolocation.watchPosition(
    pos=>{
      const coords=[pos.coords.latitude,pos.coords.longitude]

      origenCoords.value = coords // aca le asigno las coordenadas a origencoords
         if (coords !=null){
      cargandoUbicacion.value = false;
    }
      if(!marcadorUsuario){
        marcadorUsuario=L.marker(coords).addTo(map).bindPopup("📍 Tú estás aquí")
      } else marcadorUsuario.setLatLng(coords)
    },
    err=>console.error(err),
    { enableHighAccuracy:true, maximumAge:2000, timeout:25000 }
  )
}

// ====== Calcular ruta ======
async function onDestinoChange() {
  rutasPisos.value = []
  logPasillosUsados.value = []
  indicaciones.value = []
  marcadoresReferencia.forEach(m => map.removeLayer(m))
  marcadoresReferencia = []

  if (!pisoSeleccionado.value) { alert("Selecciona tu piso actual"); return }
  if (!origenCoords.value) { alert("Esperando ubicación actual..."); return }

  try {
    const destino = await getDestinoById(destinoSeleccionado.value)
    destinoImagen=destino.imagen
    if (!destino) { alert("Destino no encontrado"); return }

    const pisoActual = parseInt(pisoSeleccionado.value)

    // 🔹 Agregar marcador del destino
      if (marcadorDestino) map.removeLayer(marcadorDestino)

      marcadorDestino = L.marker(destino.coordenadas)
        .addTo(map)
        .bindPopup("📍 Destino seleccionado")

      marcadoresReferencia.push(marcadorDestino)

    // 🚀 Construir nodos interpolados de todos los pasillos
    const laberintos = pasillos.value.map(p => ({
      ...p,
      coordenadas: interpolarSegmentoPasillo(p)
    }))

    // 🔹 Grafo global
    const grafoGlobal = construirGrafo(laberintos)

    // 🔹 Nodo inicial
    const laberintosPisoActual = laberintos.filter(p => p.id_pisos === pisoActual)
    const nodosPisoActual = laberintosPisoActual.flatMap(p => p.coordenadas)
    const nodoInicio = nodosPisoActual.reduce((a, b) =>
      distancia(a, origenCoords.value) < distancia(b, origenCoords.value) ? a : b
    )

    // 🔹 Nodo final
    const nodoFinal = laberintos.flatMap(p => p.coordenadas)
      .reduce((a, b) =>
        distancia(a, destino.coordenadas) < distancia(b, destino.coordenadas) ? a : b
      )

    const keyIni = nodoInicio.map(x => x.toFixed(7)).join(",")
    const keyFin = nodoFinal.map(x => x.toFixed(7)).join(",")

    const ruta = encontrarCaminoMasCorto(grafoGlobal, keyIni, keyFin)
    if (ruta.camino.length === 0) { alert("No se pudo calcular ruta"); return }

    // 🔹 Dibujar ruta global
    rutasDibujadas.forEach(r => map.removeLayer(r))
    rutasDibujadas = []

    const rutaCoords = ruta.camino.map(k => k.split(",").map(Number))
    const poly = L.polyline(rutaCoords, {
      color: "#007bff",
      weight: GROSOR_PASILLOS,
      opacity: 0.9
    }).addTo(map)
    rutasDibujadas.push(poly)

    // 🔹 Generar indicaciones
    const pasillosUsados = new Set()
    const referenciaUsada = new Set()
    let pisoPrevio = pisoActual

    let i = 0
    while (i < rutaCoords.length) {
      const coord = rutaCoords[i]

      // Pasillo actual
      const pasillo = laberintos.find(p =>
        p.coordenadas.some(c => distancia(c, coord) < 0.3)
      )
      if (!pasillo) { i++; continue }

      // Saltar nodo de cambio de piso
      if (i > 0 && pasillo.id_pisos !== pisoPrevio &&
          distancia(coord, rutaCoords[i-1]) < 0.3) { i++; continue }

      // Distancia pasillo
      if (!pasillosUsados.has(pasillo.id)) {
        let idxStart = i
        let idxEnd = i
        while (
          idxEnd + 1 < rutaCoords.length &&
          pasillo.coordenadas.some(c =>
            distancia(c, rutaCoords[idxEnd + 1]) < 0.3
          )
        ) {
          idxEnd++
        }

        let longitudPasillo = 0
        for (let j = idxStart; j < idxEnd; j++) {
          longitudPasillo += distancia(rutaCoords[j], rutaCoords[j+1])
        }

        if (longitudPasillo >= 3) {
          indicaciones.value.push(
            `> Usa el pasillo: ${pasillo.nombres} (≈ ${longitudPasillo.toFixed(1)} m)`
          )
        }

        pasillosUsados.add(pasillo.id)
      }

      // Cambio de piso
      if (pasillo.id_pisos !== pisoPrevio) {
        const refCercana = referencias.value.reduce((a, b) =>
          distancia(a.coordenadas, coord) < distancia(b.coordenadas, coord) ? a : b
        )

        if (!referenciaUsada.has(refCercana.id)) {
          indicaciones.value.push(
            `Pasa por ${refCercana.nombres} → ${
              pasillo.id_pisos > pisoPrevio ? "Sube" : "Baja"
            } al piso ${pasillo.id_pisos}`
          )
          referenciaUsada.add(refCercana.id)

          const m = L.marker(refCercana.coordenadas)
            .addTo(map)
            .bindPopup(`🪜 ${refCercana.nombres}`)
          marcadoresReferencia.push(m)
        }

        pisoPrevio = pasillo.id_pisos
      }

      i++
    }

    // Línea punteada desde ubicación
    const puntoInicioRuta = rutaCoords[0]
    if (rutaSinPasillo.value) map.removeLayer(rutaSinPasillo.value)

    rutaSinPasillo.value = L.polyline([origenCoords.value, puntoInicioRuta], {
      color: "black",
      weight: 2,
      opacity: 0.8,
      dashArray: "5,10"
    }).addTo(map)

    await nextTick()
    map.invalidateSize()

  } catch (e) {
    console.error(e)
    alert("Error calculando ruta")
  }
}





// ====== Inicializar mapa ======
onMounted(() => {

  iniciarGeolocalizacion()
 auth.fetchUser()

  map = L.map(mapElement.value).setView([13.6754897,-89.1936826], 19)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 22
  }).addTo(map)

  const bounds = [
    [13.674637493821512, -89.192900546007],
    [13.676577590764193, -89.19452698220893]
  ]
  L.imageOverlay("CroquisUS.png", bounds, { opacity: 1, interactive: true }).addTo(map)

  

let marker = null;
let clickTimer = null;

// Detectar si es móvil
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// 🖱️ PC → click derecho
map.on("contextmenu", (e) => {
  if (isMobile) return; 
  placeMarker(e.latlng);
});

// 📱 Móvil → long press (600ms)
map.on("touchstart", (e) => {
  if (!isMobile) return;

  clickTimer = setTimeout(() => {
    placeMarker(e.latlng);
  }, 600);
});

// cancelar si no mantiene presionado
map.on("touchend", () => clearTimeout(clickTimer));
map.on("touchmove", () => clearTimeout(clickTimer));

// 🧩 Función para crear o mover marcador
function placeMarker({ lat, lng }) {
  if (marker) {
    marker.setLatLng([lat, lng]);
    marker.setPopupContent(`📍 Coordenadas: ${lat.toFixed(7)}, ${lng.toFixed(7)}`);
    marker.openPopup();
  } else {
    marker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`📍 Coordenadas: ${lat.toFixed(7)}, ${lng.toFixed(7)}`)
      .openPopup();
  }
}

// 🖱️ PC → cancelar long press si se suelta mouse
map.on("mouseup", () => clearTimeout(clickTimer));

// 🗑️ Doble click → borrar marcador (si quieres esta función)
map.on("dblclick", () => {
  if (marker) {
    map.removeLayer(marker);
    marker = null;
  }
});

})

watch(
  () => store.destinoSeleccionado,
  (nuevo) => {
    const encontrado = destinos.value.find(d => d.nombres === nuevo || d.id === nuevo)
    if (!encontrado) return

    // Actualizar el select
    destinoSeleccionado.value = encontrado.id
    

    // Llamar función de cambio
    onDestinoChange()
  }
)
/* watch(destinoSeleccionado, (nuevo) => {
  const dest = destinos.value.find(d => d.id === nuevo)
  if (dest) store.setDestinoSeleccionado(dest.nombres)
}) */
</script>




<style scoped>
#map {
  height: 100vh;
  width: 100%;
  border-radius: 8px;
  border: 2px solid #031770;
  z-index: 0;
}
</style>
