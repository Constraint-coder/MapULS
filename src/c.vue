<template>
       
  <div class="map-container">

    <button 
        @click="regresarAulas"
        class="mb-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
      >
        ← Volver a Aulas
      </button>

      
    <h3>Mapa ULS</h3>
        <div class="container-selector"> 


           <!-- Mostrar Menu solo si el usuario está logueado -->

         
          <Menu v-if="auth.isAdmin" />

          
            

        <!-- selectores para destino y ubicacion de piso -->
        <div class="container-selector">
              <!-- 🔹 Buscador de destino -->
            
            <div class="selector destino">
              <label for="destino">Destino:</label>
              <select id="destino" v-model="destinoSeleccionado" @change="onDestinoChange">
                <option disabled value="">-- Selecciona Destino --</option>
                <option v-for="dest in destinos" :key="dest.id" :value="dest.id">
                {{ dest.nombres }}
                </option>
              </select>
            </div>

            <!-- 🔹 Selector de piso -->
            <div class="selector piso">
              <label for="piso">Piso actual:</label>
                <select v-model="pisoSeleccionado" @change="onDestinoChange">
                <option disabled value="">-- Selecciona Piso --</option>
                <option v-for="piso in pisos" :key="piso.id" :value="piso.id">
                  {{ piso.nombres }}
                </option>
              </select>
            </div>
          </div>
        </div>
   
    <!--     aqui empieza el contenedor con el mapa y boton de ubicacion actual, mas cuadro de indicaciones -->

    <!-- 🗺️ Mapa -->
    <div id="map" ref="mapElement"></div>

    <!-- 🔹 Botón para actualizar ubicación -->
    <div class="selector actualizar">
      <button @click="iniciarGeolocalizacion" class="btn-geo">
        🔄 Actualizar mi ubicación
      </button>
    </div>

    

    <!-- 🆕 Listado de indicaciones -->
    <div class="selector indicaciones" v-if="indicaciones.length > 0">
      <h4>🧭 Indicaciones</h4>
      <ul>
        <li v-for="(ind, i) in indicaciones" :key="i" v-html="ind"></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue"
import L, { marker } from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-imageoverlay-rotated"
import { getPasillo } from "./services/pasillosServices"
import { getDestino, getDestinoById } from "./services/destinoServices"
import { getPisos } from "./services/pisosServices"
import { getReferencia } from "./services/puntoServices"
import { useDestinoStore } from '@/stores/useDestinoStore'
import { useAuthStore } from './stores/authStore'
import Menu from './components/menu.vue'
import { useRouter } from "vue-router"

const router = useRouter()


// ====== Refs ======
const store = useDestinoStore()  // trae consigo el aula seleccionada

function regresarAulas() {
  store.setDestinoSeleccionado('') // limpia el aula seleccionada
   router.push('/dashboard')
  
}

const auth = useAuthStore()  /// detecta el lgueado

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

// 🆕 Variables reactivas
const origenCoords = ref(null)
const rutaSinPasillo = ref(null) // línea punteada reactiva

let map
let marcadorDestino = null
let marcadorUsuario = null
let rutasDibujadas = []
let marcadoresReferencia = []
const GROSOR_PASILLOS = 10

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
  if(!navigator.geolocation){ alert("Tu navegador no soporta geolocalización"); return }
  navigator.geolocation.watchPosition(
    pos=>{
      const coords=[pos.coords.latitude,pos.coords.longitude]
      origenCoords.value = coords
      console.log(coords)
      if(!marcadorUsuario){
        marcadorUsuario=L.marker(coords).addTo(map).bindPopup("📍 Tú estás aquí")
      } else marcadorUsuario.setLatLng(coords)
    },
    err=>console.error(err),
    { enableHighAccuracy:true, maximumAge:2000, timeout:25000 }
  )
}

// ====== Calcular ruta ======
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
    if (!destino) { alert("Destino no encontrado"); return }

    // 🚀 Construir nodos interpolados de todos los pasillos
    const laberintos = pasillos.value.map(p => ({
      ...p,
      coordenadas: interpolarSegmentoPasillo(p)
    }))

    // 🔹 Grafo global
    const grafoGlobal = construirGrafo(laberintos)

    // 🔹 Nodo inicio: el más cercano a tu ubicación
    const todosNodos = laberintos.flatMap(p => p.coordenadas)
    const nodoInicio = todosNodos.reduce((a, b) =>
      distancia(a, origenCoords.value) < distancia(b, origenCoords.value) ? a : b
    )

    // 🔹 Nodo final: el más cercano al destino
    const nodoFinal = todosNodos.reduce((a, b) =>
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
    const poly = L.polyline(rutaCoords, { color: "#007bff", weight: GROSOR_PASILLOS, opacity: 0.9 }).addTo(map)
    rutasDibujadas.push(poly)

    // 🔹 Generar indicaciones por referencias (escaleras/elevadores)
    for (let i = 0; i < rutaCoords.length; i++) {
      const coord = rutaCoords[i]
      const ref = referencias.value.find(r => distancia(r.coordenadas, coord) < 1)
      if (ref && !indicaciones.value.includes(ref.nombres)) {
        indicaciones.value.push(`Usa referencia: ${ref.nombres}`)
        const m = L.marker(ref.coordenadas).addTo(map).bindPopup(`🪜 ${ref.nombres}`)
        marcadoresReferencia.push(m)
      }
    }

    // 🔹 Línea punteada desde ubicación actual al primer nodo del pasillo
    const puntoInicioRuta = rutaCoords[0]
    if (rutaSinPasillo.value) map.removeLayer(rutaSinPasillo.value)
    rutaSinPasillo.value = L.polyline([origenCoords.value, puntoInicioRuta], {
      color: "black", weight: 2, opacity: 0.8, dashArray: "5,10"
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

  map = L.map(mapElement.value).setView([13.674637493821512, -89.192900546007], 20)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 22
  }).addTo(map)

  const bounds = [
    [13.674637493821512, -89.192900546007],
    [13.676577590764193, -89.19452698220893]
  ]
  L.imageOverlay("CroquisUS.png", bounds, { opacity: 1, interactive: true }).addTo(map)

  

  // 🆕 Detectar click sostenido para obtener coordenadas
  let clickTimer = null
  let marke = null
  map.on("mousedown", (e) => {
    clickTimer = setTimeout(() => {
      const { lat, lng } = e.latlng
        marke = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`📍 Coordenadas: ${lat.toFixed(7)},${lng.toFixed(7)}`)
      .openPopup()
  }, 600)  // mantener presionado 600ms
  })

  map.on("mouseup", () => {
    clearTimeout(clickTimer)
  })
  map.on("dblclick", () => {
  if (marke) {
    map.removeLayer(marke)
    marke = null
  }
})
})

watch(
  () => store.destinoSeleccionado,
  (nuevo) => {
    const encontrado = destinos.value.find(d => d.nombres === nuevo || d.id === nuevo)
    if (!encontrado) return

    // Actualizar el select
    destinoSeleccionado.value = encontrado.id
    console.log('Destino sincronizado desde aula.vue:', nuevo)

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
.container-selector{
  margin-top: 5px;
 
  display: flex;
  padding: 5px;
  height: auto;
  border: 2px solid #0056b3 ;
}

.selector.destino{
  margin: 5px;
}
.selector.piso{
  margin: 5px;
}
.selector.indicaciones {
  position:absolute ;
  bottom: 1px;
  left: 10px;
  max-width: 300px;
  background: rgba(255,255,255,0.95);
  border: 1px solid #ccc;
  font-size: 14px;
  max-height: 200px;
  overflow-y: auto;
}

.selector.indicaciones h4 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: bold;
}

.selector.indicaciones ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.selector.indicaciones li {
  margin-bottom: 4px;
  line-height: 1.3;
}

.map-container {
  height: 90vh;
  width: 100%;
  position: absolute;
  font-family: Arial, sans-serif;
  border: 2px solid aqua;
}

h3 {
  position: absolute;
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 8px;
  box-shadow: 0 0 6px rgba(0,0,0,0.3);
  font-size: 18px;
}

#map {
  height: 70vh;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #ccc;
  z-index: 0;
}

/* 🔹 Selectores flotantes */

/* Posiciones específicas */

/* Estilo de select */
select {
  margin-left: 6px;
  padding: 4px 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

/* Botón de geolocalización */
.btn-geo {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
}

.btn-geo:hover {
  background-color: #0056b3;
}

/* 🔹 Responsive - Pantallas medianas (tablets) */


/* 🔹 Responsive - Pantallas pequeñas (móviles) */
@media (max-width: 768px) {

.container-selector{
  font-size: 12px;
  
}
  .selector.actualizar {
    top: auto;
    bottom: 10px;
    left: 10px;
    right: 10px;
    width: calc(100% - 20px);
    margin-bottom: 8px;
    font-size: 12px;
    padding: 6px 10px;
    display:block;
  }
  h3 {
    font-size: 12px;
    padding: 3px 6px;
  }
  .selector.destino{
    margin-right: 15px;
    width: 30%;
    font-size: 12px;

  }
  .selector.piso{
    margin-right: 15px;
    width: 30%;
    font-size: 12px;
  }
}
@media (max-width: 468px) {

.container-selector{
  font-size: 12px;
    display: block;
}
  .selector.actualizar {
    top: auto;
    bottom: 10px;
    left: 10px;
    right: 10px;
    width: calc(100% - 20px);
    margin-bottom: 8px;
    font-size: 12px;
    padding: 6px 10px;
    display:block;
  }
  h3 {
    font-size: 12px;
    padding: 3px 6px;
  }
  .selector.destino{
    width: 30%;
    font-size: 12px;

  }
  .selector.piso{
    width: 30%;
    font-size: 12px;
  }
}

</style>
