<template>
  <div class="map-container">
    <h3>Mi Ubicación en el Centro Comercial</h3>

    <!-- 🗺️ Mapa -->
    <div id="map" ref="mapElement"></div>

    <!-- 🔹 Botón para actualizar ubicación -->
    <div class="selector actualizar">
      <button @click="iniciarGeolocalizacion" class="btn-geo">
        🔄 Actualizar mi ubicación
      </button>
    </div>

    <!-- 🔹 Buscador de destino -->
    <div class="selector destino">
      <label for="destino">Destino:</label>
      <select v-model="destinoSeleccionado" @change="onDestinoChange">
        <option disabled value="">-- Selecciona Destino --</option>
        <option v-for="dest in destinos" :key="dest.id" :value="dest.id">
          {{ dest.icon }} {{ dest.nombres }}
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
import { ref, onMounted, nextTick } from "vue"
import L, { marker } from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-imageoverlay-rotated"
import { getPasillo } from "./services/pasillosServices"
import { getDestino, getDestinoById } from "./services/destinoServices"
import { getPisos } from "./services/pisosServices"
import { getReferencia } from "./services/puntoServices"

// ====== Refs ======
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
      if(!marcadorUsuario){
        marcadorUsuario=L.marker(coords).addTo(map).bindPopup("📍 Tú estás aquí")
      } else marcadorUsuario.setLatLng(coords)
    },
    err=>console.error(err),
    { enableHighAccuracy:true, maximumAge:1000, timeout:5000 }
  )
}

// ====== Calcular ruta ======
async function onDestinoChange() {
  rutasPisos.value = []
  logPasillosUsados.value = []
  indicaciones.value = [] // 🧭 limpiar lista de pasos
  marcadoresReferencia.forEach(m => map.removeLayer(m))
  marcadoresReferencia = []

  if (!destinoSeleccionado.value) { alert("Selecciona un destino"); return }
  if (!pisoSeleccionado.value) { alert("Selecciona tu piso actual"); return }
  if (!origenCoords.value) { alert("Esperando ubicación actual..."); return }

  try {
    const destino = await getDestinoById(destinoSeleccionado.value)
    if (!destino) { alert("Destino no encontrado"); return }

    const pisoActual = parseInt(pisoSeleccionado.value)
    const paso = pisoActual < destino.id_pisos ? 1 : -1
    for (let p = pisoActual; p !== destino.id_pisos + paso; p += paso) rutasPisos.value.push(p)

    if (marcadorDestino) map.removeLayer(marcadorDestino)
    marcadorDestino = L.marker(destino.coordenadas).addTo(map).bindPopup(`🏠 ${destino.nombres}`).openPopup()

    rutasDibujadas.forEach(r => map.removeLayer(r))
    rutasDibujadas = []

    if (rutaSinPasillo.value) {
      map.removeLayer(rutaSinPasillo.value)
      rutaSinPasillo.value = null
    }

    const coloresPorPiso = { 1: "#007bff", 2: "#ff0000", 3: "#00cc44", 4: "#ffcc00" }
    let origen = origenCoords.value
    let rutaGlobal = []

    for (let i = 0; i < rutasPisos.value.length; i++) {
      const piso = rutasPisos.value[i]
      const pasillosPiso = pasillos.value.filter(p => p.id_pisos === piso)
      const laberinto = generarNodosPasillos(pasillosPiso)
      const grafo = construirGrafo(laberinto)
      const nodos = laberinto.flatMap(p => p.coordenadas)

      const nodoInicio = nodos.reduce((a, b) => distancia(a, origen) < distancia(b, origen) ? a : b)
      let nodoFinal

      if (i === rutasPisos.value.length - 1) {
        nodoFinal = nodos.reduce((a, b) => distancia(a, destino.coordenadas) < distancia(b, destino.coordenadas) ? a : b)
      } else {
        const pisoSig = rutasPisos.value[i + 1]
        const pasillosSig = pasillos.value.filter(p => p.id_pisos === pisoSig)
        const nodosSig = generarNodosPasillos(pasillosSig).flatMap(p => p.coordenadas)
        nodoFinal = nodos.reduce((a, b) => {
          const dA = nodosSig.reduce((min, nS) => Math.min(min, distancia(a, nS)), Infinity)
          const dB = nodosSig.reduce((min, nS) => Math.min(min, distancia(b, nS)), Infinity)
          return dA < dB ? a : b
        })
      }

      const keyIni = nodoInicio.map(x => x.toFixed(7)).join(",")
      const keyFin = nodoFinal.map(x => x.toFixed(7)).join(",")
      const ruta = encontrarCaminoMasCorto(grafo, keyIni, keyFin)

      if (ruta.camino.length > 0) {
        const rutaCoords = ruta.camino.map(k => k.split(",").map(Number))
        rutaGlobal.push(...rutaCoords)
        const color = coloresPorPiso[piso] || "#000000"
        const poly = L.polyline(rutaCoords, { color, weight: 6, opacity: 0.9 }).addTo(map)
        rutasDibujadas.push(poly)

        // 🧭 Indicaciones por pasillo
        const pasilloMasCercano = pasillosPiso.reduce((a, b) =>
          distancia(a.coordenadas[0], nodoInicio) < distancia(b.coordenadas[0], nodoInicio) ? a : b
        )

        indicaciones.value.push(`> <b>Usa el pasillo:</b> "${pasilloMasCercano.nombres}", en el piso: ${piso}`)

        // 🔹 Insertar referencia más cercana al nodo final del pasillo antes de subir/bajar piso
   

        // 🧭 Cambio de piso
        if (i < rutasPisos.value.length - 1) {
            if (referencias.value.length > 0 && nodoFinal) {
          const refCercana = referencias.value.reduce((a, b) => {
            const distA = distancia(a.coordenadas, nodoFinal)
            const distB = distancia(b.coordenadas, nodoFinal)
            return distA < distB ? a : b
          })

          indicaciones.value.push(`><b> Usa la</b> ': ${refCercana.nombres} '`)

          // Agregar marcador en mapa
          L.marker(refCercana.coordenadas)
            .addTo(map)
            .bindPopup(`🪜  ${refCercana.nombres}`)
        }
          const proximoPiso = rutasPisos.value[i + 1]
          const dir = proximoPiso > piso ? "> <b>Sube</b>" : "> <b>Baja<b>"
          indicaciones.value.push(`${dir} al piso ${proximoPiso}`)
        }

        origen = nodoFinal
      }
    }

    // 🆕 Línea punteada hasta el pasillo más cercano del piso actual
    const pisoUsuario = parseInt(pisoSeleccionado.value)
    const pasillosPisoUsuario = pasillos.value.filter(p => p.id_pisos === pisoUsuario)

    if (pasillosPisoUsuario.length > 0) {
      const nodosPisoUsuario = generarNodosPasillos(pasillosPisoUsuario).flatMap(p => p.coordenadas)
      const rutaPisoActual = rutasDibujadas.find((r, idx) => rutasPisos.value[idx] === pisoUsuario)
      let puntoInicioRuta = null

      if (rutaPisoActual) {
        const coordsRuta = rutaPisoActual.getLatLngs().map(p => [p.lat, p.lng])
        puntoInicioRuta = coordsRuta.reduce((a, b) => distancia(a, origenCoords.value) < distancia(b, origenCoords.value) ? a : b)
      } else {
        puntoInicioRuta = nodosPisoUsuario.reduce((a, b) => distancia(a, origenCoords.value) < distancia(b, origenCoords.value) ? a : b)
      }

      if (puntoInicioRuta) {
        if (rutaSinPasillo.value) map.removeLayer(rutaSinPasillo.value)
        rutaSinPasillo.value = L.polyline([origenCoords.value, puntoInicioRuta], {
          color: "black", weight: 2, opacity: 0.8, dashArray: "5,10"
        }).addTo(map)
        await nextTick()
        map.invalidateSize()
      }
    }

  } catch (e) {
    console.error(e)
    alert("Error calculando ruta")
  }
}


// ====== Inicializar mapa ======
onMounted(() => {
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

  iniciarGeolocalizacion()

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
</script>




<style scoped>
.selector.indicaciones {
  bottom: 20px;
  right: 10px;
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
  position: relative;
  font-family: Arial, sans-serif;
}

h3 {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 8px;
  box-shadow: 0 0 6px rgba(0,0,0,0.3);
}

#map {
  height: 100%;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #ccc;
  z-index: 1;
}

/* 🔹 Selectores flotantes */
.selector {
  position: absolute;
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0,0,0,0.3);
  z-index: 1000;
  font-size: 14px;
}

/* Posiciones específicas */
.selector.origen { top: 60px; left: 10px; }
.selector.destino { top: 60px; right: 10px; }
.selector.piso { top: 110px; left: 10px; }
.selector.rutaPiso { top: 110px; right: 10px; }

/* Estilo de select */
select {
  margin-left: 6px;
  padding: 4px 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.selector.actualizar {
  top: 10px;
  left: 10px;
}

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


/* Responsive */
@media (max-width: 768px) {
  .selector.origen, .selector.destino, .selector.piso, .selector.rutaPiso {
    top: auto;
    bottom: 10px;
    left: 10px;
    right: 10px;
    width: calc(50% - 20px);
    margin-bottom: 8px;
  }
  h3 {
    font-size: 16px;
    padding: 4px 8px;
  }
}
</style>
