<script setup lang="ts">
import type { AppLocale } from '@/utils/locale'
import {
  mdiArrowRight,
  mdiCity,
  mdiContentCopy,
  mdiCrosshairsGps,
  mdiMap,
  mdiMapMarker,
  mdiNavigationVariantOutline,
  mdiRefresh,
} from '@mdi/js'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import toast from '@/components/core/toast'
import { getAmapErrorReason, loadAmap, resetAmap } from '@/utils/amap'
import {
  getAntipode,
  getFarthestLocationInRings,
  isValidLatitude,
  isValidLongitude,
} from '@/utils/coordinates'
import { toAmapLocale } from '@/utils/locale'

interface LngLat {
  lng: number
  lat: number
}

interface LngLatLike {
  lng?: number | string
  lat?: number | string
  getLng?: () => number
  getLat?: () => number
}

interface AutocompleteTip {
  name: string
  district?: string
  address?: string
  adcode?: string
  location?: LngLatLike | string
}

interface JourneyPoint extends LngLat {
  address: string
}

interface DestinationCalculation extends LngLat {
  distanceMetres: number
  regionName?: string
}

interface LocationDetails {
  address: string
  province: string
}

type BoundaryLevel = 'country' | 'province'
type JourneyScope = 'china' | 'earth' | 'province'

class ProvinceUnavailableError extends Error {}

const { t, locale } = useI18n()
const theme = useTheme()
const mapElement = useTemplateRef<HTMLDivElement>('mapElement')
const amapApi = shallowRef<typeof AMap>()
const map = shallowRef<AMap.Map>()
const currentMarker = shallowRef<AMap.Marker>()
const originMarker = shallowRef<AMap.Marker>()
const destinationMarker = shallowRef<AMap.Marker>()
const routeLine = shallowRef<AMap.Polyline>()
const autoComplete = shallowRef<AMap.Autocomplete>()
const districtSearch = shallowRef<AMap.DistrictSearch>()
const placeSearch = shallowRef<AMap.PlaceSearch>()
const geolocation = shallowRef<AMap.Geolocation>()

const autocomplete = shallowRef<AutocompleteTip[]>([])
const selectedPlace = shallowRef<AutocompleteTip | null>(null)
const origin = shallowRef<JourneyPoint | null>(null)
const destination = shallowRef<JourneyPoint | null>(null)
const journeyScope = shallowRef<JourneyScope>('earth')
const resultScope = shallowRef<JourneyScope>('earth')
const resultRegionName = shallowRef('')
const distanceKilometres = shallowRef('')
const formattedAddress = shallowRef('')
const mapLoadErrorKey = shallowRef('')
const routePath = shallowRef('')
const isMapInitializing = shallowRef(false)
const isLocating = shallowRef(false)
const isCalculating = shallowRef(false)

let autocompleteRequestId = 0
let geolocationRequestId = 0
let geolocationTimeoutId: number | undefined
let routeFrameId: number | undefined

const boundaryRingsCache = new Map<string, LngLat[][]>()
const journeyActionKeys: Record<JourneyScope, string> = {
  china: 'map.actions.findChinaFarthest',
  earth: 'map.actions.findEarthFarthest',
  province: 'map.actions.findProvinceFarthest',
}

const curPosition = reactive<JourneyPoint>({
  address: '',
  lat: 0,
  lng: 0,
})

const mapLang = computed<AMap.Lang>(() => toAmapLocale(locale.value as AppLocale))
const mapLoadError = computed(() => mapLoadErrorKey.value ? t(mapLoadErrorKey.value) : '')
const isMapReady = computed(() => Boolean(map.value) && !mapLoadErrorKey.value)
const hasJourney = computed(() => Boolean(origin.value && destination.value))
const hasValidCoordinates = computed(() =>
  isValidLatitude(curPosition.lat) && isValidLongitude(curPosition.lng),
)
const canGoFarAway = computed(() =>
  isMapReady.value
  && hasValidCoordinates.value
  && !isMapInitializing.value
  && !isLocating.value
  && !isCalculating.value,
)
const canLocate = computed(() =>
  isMapReady.value
  && !isMapInitializing.value
  && !isLocating.value
  && !isCalculating.value,
)
const isDark = computed(() => theme.global.current.value.dark)
const journeyActionLabel = computed(() => t(journeyActionKeys[journeyScope.value]))
const resultTitle = computed(() => {
  if (resultScope.value === 'province') {
    return t('map.result.provinceTitle', {
      province: resultRegionName.value,
    })
  }

  return t(
    resultScope.value === 'china'
      ? 'map.result.chinaTitle'
      : 'map.result.earthTitle',
  )
})

watch(() => curPosition.address, (value, _oldValue, onCleanup) => {
  const keywords = value.trim()

  if (!keywords || keywords === formattedAddress.value) {
    autocomplete.value = []
    return
  }

  const timer = window.setTimeout(() => {
    void getAutoComplete(keywords)
  }, 350)

  onCleanup(() => window.clearTimeout(timer))
})

watch(mapLang, value => map.value?.setLang(value))
watch(isDark, () => {
  applyMapStyle()
  applyJourneyLineStyle()
  scheduleRouteOverlay()
})

onMounted(() => void initMap())

onBeforeUnmount(() => {
  geolocationRequestId += 1
  if (geolocationTimeoutId !== undefined)
    window.clearTimeout(geolocationTimeoutId)
  if (routeFrameId !== undefined)
    window.cancelAnimationFrame(routeFrameId)
  destroyMap()
})

async function ensureAmap(): Promise<typeof AMap> {
  if (amapApi.value)
    return amapApi.value

  amapApi.value = await loadAmap()
  return amapApi.value
}

async function initMap(): Promise<void> {
  if (isMapInitializing.value)
    return

  mapLoadErrorKey.value = ''
  isMapInitializing.value = true

  try {
    const AMapApi = await ensureAmap()
    if (!mapElement.value)
      throw new Error('Map container is unavailable')

    destroyMap()

    const mapInstance = new AMapApi.Map(mapElement.value, {
      resizeEnable: true,
      lang: mapLang.value,
      mapStyle: isDark.value ? 'amap://styles/darkblue' : 'amap://styles/normal',
      zoom: 4,
      features: ['bg', 'road', 'building', 'point'],
    })
    map.value = mapInstance

    mapInstance.addControl(new AMapApi.Scale())
    autoComplete.value = new AMapApi.Autocomplete()
    districtSearch.value = new AMapApi.DistrictSearch({
      extensions: 'all',
      level: 'country',
      showbiz: false,
      subdistrict: 0,
    })
    placeSearch.value = new AMapApi.PlaceSearch()
    geolocation.value = new AMapApi.Geolocation({
      showButton: false,
      zoomToAccuracy: true,
    })
    mapInstance.addControl(geolocation.value)
    mapInstance.on('mapmove', scheduleRouteOverlay)
    mapInstance.on('zoomchange', scheduleRouteOverlay)
    mapInstance.on('resize', scheduleRouteOverlay)

    const center = normalizeLngLat(mapInstance.getCenter())
    setCurrentPosition(center)
    setCurrentMarker(center)

    mapInstance.getCity((result) => {
      const address = `${result.province || ''}${result.city || ''}${result.district || ''}`
      formattedAddress.value = address
      curPosition.address ||= address
    })
  }
  catch (error) {
    handleMapLoadError(error)
  }
  finally {
    isMapInitializing.value = false
  }
}

async function retryMap(): Promise<void> {
  destroyMap()
  amapApi.value = undefined
  resetAmap()
  await initMap()
}

function destroyMap(): void {
  map.value?.destroy()
  map.value = undefined
  currentMarker.value = undefined
  originMarker.value = undefined
  destinationMarker.value = undefined
  routeLine.value = undefined
  routePath.value = ''
  autoComplete.value = undefined
  districtSearch.value = undefined
  boundaryRingsCache.clear()
  placeSearch.value = undefined
  geolocation.value = undefined
}

function applyMapStyle(): void {
  map.value?.setMapStyle(isDark.value ? 'amap://styles/darkblue' : 'amap://styles/normal')
}

function applyJourneyLineStyle(): void {
  routeLine.value?.setOptions({
    dirColor: isDark.value ? '#D9E9FF' : '#245B9D',
    outlineColor: isDark.value ? '#0F1722' : '#FFFFFF',
    strokeColor: isDark.value ? '#D9E9FF' : '#2D65A8',
  })
}

function handleMapLoadError(error: unknown): void {
  const errorKeys = {
    'key': 'map.load.key',
    'missing-key': 'map.load.missingKey',
    'network': 'map.load.network',
    'quota': 'map.load.quota',
    'unknown': 'map.load.error',
  } as const

  mapLoadErrorKey.value = errorKeys[getAmapErrorReason(error)]
}

function normalizeLngLat(location: LngLat | LngLatLike): LngLat {
  const value = location as LngLatLike
  const lng = Number(value.lng ?? value.getLng?.())
  const lat = Number(value.lat ?? value.getLat?.())

  if (!Number.isFinite(lng) || !Number.isFinite(lat))
    throw new TypeError('Invalid map coordinates')

  return { lng, lat }
}

function hasLngLat(location: AutocompleteTip['location']): location is LngLatLike {
  return typeof location === 'object'
    && location !== null
    && (location.lng !== undefined || location.getLng !== undefined)
}

function createMarkerContent(kind: 'origin' | 'destination'): HTMLDivElement {
  const element = document.createElement('div')
  element.className = `journey-marker journey-marker--${kind}`
  const core = document.createElement('span')
  core.className = 'journey-marker__core'
  element.append(core)
  return element
}

function makeMarker(location: LngLat, kind: 'origin' | 'destination', title = ''): AMap.Marker {
  if (!amapApi.value)
    throw new Error('AMap is unavailable')

  return new amapApi.value.Marker({
    anchor: 'bottom-center',
    content: createMarkerContent(kind),
    position: [location.lng, location.lat],
    title,
    zIndex: kind === 'destination' ? 120 : 110,
  })
}

function setCurrentMarker(location: LngLat, title = ''): void {
  if (!map.value || !amapApi.value)
    return

  clearJourney(false)
  const position: [number, number] = [location.lng, location.lat]

  if (!currentMarker.value) {
    currentMarker.value = makeMarker(location, 'origin', title)
    map.value.add(currentMarker.value)
  }
  else {
    currentMarker.value.setPosition(position)
    currentMarker.value.setTitle(title)
  }

  map.value.setCenter(position)
}

function displayCurrentMarker(location: LngLat | LngLatLike, name = '', zoom = 14): void {
  const normalizedLocation = normalizeLngLat(location)
  setCurrentMarker(normalizedLocation, name)
  map.value?.setZoom(zoom)
}

function setCurrentPosition(location: LngLat | LngLatLike): void {
  const normalizedLocation = normalizeLngLat(location)
  curPosition.lng = normalizedLocation.lng
  curPosition.lat = normalizedLocation.lat
  distanceKilometres.value = ''
}

function clearJourney(restoreCurrentMarker = true): void {
  const overlays = [originMarker.value, destinationMarker.value, routeLine.value]
    .filter((overlay): overlay is AMap.Marker | AMap.Polyline => Boolean(overlay))
  if (overlays.length)
    map.value?.remove(overlays)

  originMarker.value = undefined
  destinationMarker.value = undefined
  routeLine.value = undefined
  routePath.value = ''
  origin.value = null
  destination.value = null
  resultRegionName.value = ''
  distanceKilometres.value = ''

  if (restoreCurrentMarker && map.value) {
    setCurrentMarker({ lat: curPosition.lat, lng: curPosition.lng }, formattedAddress.value)
    map.value.setZoomAndCenter(4, [curPosition.lng, curPosition.lat])
  }
}

async function getAutoComplete(keywords: string): Promise<void> {
  const requestId = ++autocompleteRequestId

  try {
    await ensureAmap()
    if (!autoComplete.value)
      return

    autoComplete.value.search(keywords, (status, result) => {
      if (requestId !== autocompleteRequestId)
        return

      autocomplete.value = status === 'complete' && Array.isArray(result.tips)
        ? result.tips.filter((tip: AutocompleteTip) => tip.name)
        : []
    })
  }
  catch (error) {
    handleMapLoadError(error)
  }
}

async function getLocationDetails(location: LngLat): Promise<LocationDetails> {
  const AMapApi = await ensureAmap()
  const lnglat = `${location.lng},${location.lat}`

  return await new Promise<LocationDetails>((resolve) => {
    const geocoder = new AMapApi.Geocoder()
    geocoder.getAddress(lnglat, (status, result) => {
      const regeocode = status === 'complete' ? result.regeocode : undefined

      resolve({
        address: regeocode?.formattedAddress || t('map.address.unavailable'),
        province: regeocode?.addressComponent?.province?.trim() || '',
      })
    })
  })
}

async function getAddress(location: LngLat): Promise<string> {
  return (await getLocationDetails(location)).address
}

async function getBoundaryRings(
  keyword: string,
  level: BoundaryLevel,
): Promise<LngLat[][]> {
  const cacheKey = `${level}:${keyword}`
  const cachedRings = boundaryRingsCache.get(cacheKey)
  if (cachedRings)
    return cachedRings

  if (!districtSearch.value)
    throw new Error('Administrative boundary search is unavailable')

  const searchService = districtSearch.value
  searchService.setLevel(level)
  const rings = await new Promise<LngLat[][]>((resolve, reject) => {
    searchService.search(keyword, (status, result) => {
      if (status !== 'complete' || typeof result === 'string') {
        reject(new Error('Administrative boundary search failed'))
        return
      }

      const district = result.districtList?.find(item =>
        item.level === level && item.boundaries?.length,
      ) ?? result.districtList?.find(district => district.boundaries?.length)
      const boundaryRings = district?.boundaries
        ?.map(ring => ring.map(normalizeLngLat))
        .filter(ring => ring.length >= 3)

      if (!boundaryRings?.length) {
        reject(new Error('Administrative boundary data is empty'))
        return
      }

      resolve(boundaryRings)
    })
  })

  boundaryRingsCache.set(cacheKey, rings)
  return rings
}

async function calculateDestination(
  start: LngLat,
  scope: JourneyScope,
): Promise<DestinationCalculation> {
  if (!amapApi.value)
    throw new Error('AMap is unavailable')

  if (scope === 'china') {
    const rings = await getBoundaryRings('中国', 'country')
    return getFarthestLocationInRings(start, rings)
  }

  if (scope === 'province') {
    const { province } = await getLocationDetails(start)
    if (!province)
      throw new ProvinceUnavailableError('Current province is unavailable')

    const rings = await getBoundaryRings(province, 'province')
    return {
      ...getFarthestLocationInRings(start, rings),
      regionName: province,
    }
  }

  const antipode = getAntipode(start)
  return {
    ...antipode,
    distanceMetres: amapApi.value.GeometryUtil.distance(
      [start.lng, start.lat],
      [antipode.lng, antipode.lat],
    ),
  }
}

async function refreshCurrentAddress(): Promise<void> {
  if (!hasValidCoordinates.value)
    return

  try {
    const requestedLocation = { lat: curPosition.lat, lng: curPosition.lng }
    clearJourney(false)
    formattedAddress.value = ''
    curPosition.address = ''
    selectedPlace.value = null
    setCurrentMarker(requestedLocation)
    const address = await getAddress(requestedLocation)

    if (requestedLocation.lng === curPosition.lng && requestedLocation.lat === curPosition.lat) {
      formattedAddress.value = address
      curPosition.address = address
    }
  }
  catch (error) {
    handleMapLoadError(error)
  }
}

function getPlaceBySearch(poi: AutocompleteTip): void {
  if (!placeSearch.value)
    return

  placeSearch.value.setCity(poi.adcode || '')
  placeSearch.value.search(poi.name, (status, result) => {
    const firstPoi = status === 'complete' ? result.poiList?.pois?.[0] : undefined

    if (!firstPoi) {
      toast.open({ color: 'warning', text: t('map.search.noResult') })
      return
    }

    setCurrentPosition(firstPoi.location)
    displayCurrentMarker(firstPoi.location, firstPoi.name || poi.name)
    void refreshCurrentAddress()
  })
}

function searchPlace(poi: AutocompleteTip | null): void {
  if (!poi)
    return

  const address = `${poi.district || ''}${poi.address || ''}${poi.name}`
  formattedAddress.value = address
  curPosition.address = address
  autocomplete.value = []

  if (hasLngLat(poi.location)) {
    setCurrentPosition(poi.location)
    displayCurrentMarker(poi.location, poi.name)
    return
  }

  getPlaceBySearch(poi)
}

function validateAddressSelection(): void {
  if (!curPosition.address.trim() || selectedPlace.value)
    return

  toast.open({ color: 'warning', text: t('map.search.selectSuggestion') })
}

async function getCurPositionByBrowser(): Promise<void> {
  if (!map.value || !geolocation.value) {
    toast.open({ color: 'warning', text: t('map.location.unavailable') })
    return
  }

  isLocating.value = true
  const requestId = ++geolocationRequestId

  if (geolocationTimeoutId !== undefined)
    window.clearTimeout(geolocationTimeoutId)

  geolocationTimeoutId = window.setTimeout(() => {
    if (requestId !== geolocationRequestId)
      return

    geolocationRequestId += 1
    isLocating.value = false
    toast.open({ color: 'error', text: t('map.location.timeout') })
  }, 15_000)

  geolocation.value.getCurrentPosition((status, result) => {
    if (requestId !== geolocationRequestId)
      return

    if (geolocationTimeoutId !== undefined)
      window.clearTimeout(geolocationTimeoutId)
    geolocationTimeoutId = undefined

    if (status === 'complete') {
      const location = normalizeLngLat(result.position)
      setCurrentPosition(location)
      formattedAddress.value = result.formattedAddress
      curPosition.address = result.formattedAddress
      selectedPlace.value = null
      displayCurrentMarker(location)
      toast.open({ color: 'success', text: t('map.location.success') })
    }
    else {
      toast.open({ color: 'error', text: t('map.location.error') })
    }

    isLocating.value = false
  })
}

async function goFarAway(): Promise<void> {
  if (!canGoFarAway.value || !map.value || !amapApi.value)
    return

  isCalculating.value = true
  const requestedScope = journeyScope.value

  try {
    clearJourney(false)
    const start = { lat: curPosition.lat, lng: curPosition.lng }
    const {
      distanceMetres,
      regionName = '',
      ...end
    } = await calculateDestination(start, requestedScope)
    const destinationAddress = await getAddress(end)
    const originAddress = formattedAddress.value || curPosition.address || t('map.address.unavailable')

    resultScope.value = requestedScope
    resultRegionName.value = regionName
    origin.value = { ...start, address: originAddress }
    destination.value = { ...end, address: destinationAddress }
    originMarker.value = makeMarker(start, 'origin', originAddress)
    destinationMarker.value = makeMarker(end, 'destination', destinationAddress)
    routeLine.value = new amapApi.value.Polyline({
      borderWeight: 2,
      dirColor: isDark.value ? '#D9E9FF' : '#245B9D',
      geodesic: true,
      isOutline: true,
      lineCap: 'round',
      outlineColor: isDark.value ? '#0F1722' : '#FFFFFF',
      path: [[start.lng, start.lat], [end.lng, end.lat]],
      showDir: true,
      strokeColor: isDark.value ? '#D9E9FF' : '#2D65A8',
      strokeDasharray: [9, 8],
      strokeOpacity: 0.48,
      strokeStyle: 'dashed',
      strokeWeight: 2,
      zIndex: 90,
    })

    if (currentMarker.value) {
      map.value.remove(currentMarker.value)
      currentMarker.value = undefined
    }

    map.value.add([routeLine.value, originMarker.value, destinationMarker.value])
    distanceKilometres.value = new Intl.NumberFormat(locale.value, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(distanceMetres / 1000)

    map.value.setFitView(
      [routeLine.value, originMarker.value, destinationMarker.value],
      true,
      window.innerWidth <= 720 ? [48, 36, 120, 36] : [72, 72, 72, 72],
      4,
    )
    await nextTick()
    scheduleRouteOverlay()
  }
  catch (error) {
    clearJourney(true)

    if (error instanceof ProvinceUnavailableError)
      toast.open({ color: 'warning', text: t('map.province.unavailable') })
    else if (requestedScope === 'province')
      toast.open({ color: 'error', text: t('map.province.boundaryError') })
    else if (requestedScope === 'china')
      toast.open({ color: 'error', text: t('map.china.boundaryError') })
    else
      handleMapLoadError(error)
  }
  finally {
    isCalculating.value = false
  }
}

function scheduleRouteOverlay(): void {
  if (routeFrameId !== undefined)
    window.cancelAnimationFrame(routeFrameId)

  routeFrameId = window.requestAnimationFrame(() => {
    routeFrameId = undefined
    updateRouteOverlay()
  })
}

function updateRouteOverlay(): void {
  if (!map.value || !origin.value || !destination.value || !mapElement.value) {
    routePath.value = ''
    return
  }

  const start = map.value.lngLatToContainer([origin.value.lng, origin.value.lat])
  const end = map.value.lngLatToContainer([destination.value.lng, destination.value.lat])
  const x1 = start.getX()
  const y1 = start.getY()
  const x2 = end.getX()
  const y2 = end.getY()
  const distance = Math.hypot(x2 - x1, y2 - y1)
  const bend = Math.min(170, Math.max(56, distance * 0.24))
  const midpointY = Math.min(y1, y2) - bend
  const controlX1 = x1 + (x2 - x1) * 0.34
  const controlX2 = x1 + (x2 - x1) * 0.68
  routePath.value = `M ${x1} ${y1} C ${controlX1} ${midpointY}, ${controlX2} ${midpointY}, ${x2} ${y2}`
}

async function copyDestination(): Promise<void> {
  if (!destination.value)
    return

  const text = `${destination.value.lat.toFixed(6)}, ${destination.value.lng.toFixed(6)}`

  try {
    await navigator.clipboard.writeText(text)
    toast.open({ color: 'success', text: t('map.result.copied') })
  }
  catch {
    toast.open({ color: 'error', text: t('map.result.copyError') })
  }
}

function coordinateValue(value: number): string {
  return `${Math.abs(value).toFixed(6)}°`
}

function latitudeLabel(value: number): string {
  return value < 0 ? t('geographic.latitude.south') : t('geographic.latitude.north')
}

function longitudeLabel(value: number): string {
  return value < 0 ? t('geographic.longitude.west') : t('geographic.longitude.east')
}

function latitudeRule(value: unknown): true | string {
  return isValidLatitude(String(value ?? '')) || t('validation.latitude')
}

function longitudeRule(value: unknown): true | string {
  return isValidLongitude(String(value ?? '')) || t('validation.longitude')
}
</script>

<template>
  <section class="map-workspace" :class="{ 'map-workspace--result': hasJourney }">
    <v-form class="location-deck" @submit.prevent="goFarAway">
      <div class="location-deck__address">
        <v-autocomplete
          id="address"
          v-model="selectedPlace"
          v-model:search="curPosition.address"
          :items="autocomplete"
          :label="$t('form.address.label')"
          :placeholder="$t('form.address.placeholder')"
          :prepend-inner-icon="mdiCity"
          :append-inner-icon="mdiMapMarker"
          :disabled="!isMapReady"
          :loading="isLocating"
          :hint="formattedAddress || $t('form.address.hint')"
          class="journey-field"
          clearable
          hide-no-data
          item-title="name"
          item-value="name"
          persistent-hint
          return-object
          no-filter
          variant="outlined"
          @blur="validateAddressSelection"
          @click:append-inner="getCurPositionByBrowser"
          @update:model-value="searchPlace"
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps">
              <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.raw.district }}</v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-autocomplete>
      </div>

      <div class="location-deck__coordinates">
        <v-text-field
          v-model.number="curPosition.lat"
          :label="$t('latitude')"
          type="number"
          max="90"
          min="-90"
          step="any"
          required
          hide-details="auto"
          :rules="[latitudeRule]"
          class="journey-field"
          variant="outlined"
          @change="refreshCurrentAddress"
        />
        <v-text-field
          v-model.number="curPosition.lng"
          :label="$t('longitude')"
          type="number"
          max="180"
          min="-180"
          step="any"
          required
          hide-details="auto"
          :rules="[longitudeRule]"
          class="journey-field"
          variant="outlined"
          @change="refreshCurrentAddress"
        />
      </div>

      <v-btn-toggle
        v-model="journeyScope"
        class="location-deck__scope"
        color="primary"
        divided
        mandatory
        variant="outlined"
        :disabled="!isMapReady || isCalculating"
        :aria-label="$t('map.scope.label')"
      >
        <v-btn value="earth">
          {{ $t('map.scope.earth') }}
        </v-btn>
        <v-btn value="china">
          {{ $t('map.scope.china') }}
        </v-btn>
        <v-btn value="province">
          {{ $t('map.scope.province') }}
        </v-btn>
      </v-btn-toggle>

      <v-btn
        class="location-deck__locate"
        height="60"
        variant="outlined"
        :disabled="!canLocate"
        :loading="isLocating"
        @click="getCurPositionByBrowser"
      >
        <v-icon start>
          {{ mdiCrosshairsGps }}
        </v-icon>
        {{ $t('menu["Location Search"]') }}
      </v-btn>

      <v-btn
        class="location-deck__go"
        color="primary"
        height="60"
        variant="flat"
        :disabled="!canGoFarAway"
        :loading="isCalculating"
        type="submit"
      >
        {{ journeyActionLabel }}
        <v-icon end>
          {{ mdiArrowRight }}
        </v-icon>
      </v-btn>
    </v-form>

    <div class="map-stage">
      <div ref="mapElement" class="amap-wrapper" />

      <svg
        v-if="routePath"
        class="journey-line"
        aria-hidden="true"
      >
        <path class="journey-line__halo" :d="routePath" />
        <path class="journey-line__path" :d="routePath" />
      </svg>

      <v-btn
        class="map-stage__locate"
        :icon="mdiCrosshairsGps"
        color="surface"
        :disabled="!canLocate"
        :loading="isLocating"
        :aria-label="$t('map.actions.locate')"
        :title="$t('map.actions.locate')"
        @click="getCurPositionByBrowser"
      />

      <div
        v-if="isMapInitializing"
        class="map-stage__overlay"
        role="status"
        aria-live="polite"
      >
        <v-progress-circular indeterminate color="primary" />
        <span>{{ $t('map.load.loading') }}</span>
      </div>

      <v-sheet
        v-else-if="mapLoadError"
        class="map-stage__overlay map-stage__error pa-6 text-center"
        role="alert"
      >
        <v-icon color="error" size="42">
          {{ mdiMap }}
        </v-icon>
        <p class="mt-3 mb-4">
          {{ mapLoadError }}
        </p>
        <v-btn color="error" variant="outlined" @click="retryMap">
          <v-icon start>
            {{ mdiRefresh }}
          </v-icon>
          {{ $t('actions.retry') }}
        </v-btn>
      </v-sheet>
    </div>

    <Transition name="result-rail">
      <section v-if="destination" class="result-rail" aria-live="polite">
        <div class="result-rail__heading">
          <v-icon size="22">
            {{ mdiNavigationVariantOutline }}
          </v-icon>
          <div>
            <h1>{{ resultTitle }}</h1>
            <p>{{ destination.address }}</p>
          </div>
        </div>

        <dl class="result-rail__metrics">
          <div>
            <dt>{{ latitudeLabel(destination.lat) }}</dt>
            <dd>{{ coordinateValue(destination.lat) }}</dd>
          </div>
          <div>
            <dt>{{ longitudeLabel(destination.lng) }}</dt>
            <dd>{{ coordinateValue(destination.lng) }}</dd>
          </div>
          <div>
            <dt>{{ $t('map.result.distance') }}</dt>
            <dd>{{ $t('map.result.distanceValue', { value: distanceKilometres }) }}</dd>
          </div>
        </dl>

        <div class="result-rail__actions">
          <v-btn variant="text" @click="copyDestination">
            <v-icon start>
              {{ mdiContentCopy }}
            </v-icon>
            {{ $t('map.result.copy') }}
          </v-btn>
          <v-btn variant="text" @click="clearJourney(true)">
            <v-icon start>
              {{ mdiRefresh }}
            </v-icon>
            {{ $t('map.result.recalculate') }}
          </v-btn>
        </div>

        <v-btn
          class="result-rail__go"
          color="primary"
          height="56"
          variant="flat"
          :disabled="!canGoFarAway"
          :loading="isCalculating"
          @click="goFarAway"
        >
          {{ journeyActionLabel }}
          <v-icon end>
            {{ mdiArrowRight }}
          </v-icon>
        </v-btn>
      </section>
    </Transition>

    <v-btn
      v-if="!destination"
      class="mobile-go"
      color="primary"
      height="56"
      variant="flat"
      :disabled="!canGoFarAway"
      :loading="isCalculating"
      @click="goFarAway"
    >
      {{ journeyActionLabel }}
      <v-icon end>
        {{ mdiArrowRight }}
      </v-icon>
    </v-btn>
  </section>
</template>

<style scoped>
.map-workspace {
  display: grid;
  grid-template-rows: auto minmax(430px, 1fr);
  width: 100%;
  min-height: calc(100dvh - 64px);
  background: rgb(var(--v-theme-background));
}

.map-workspace--result {
  grid-template-rows: auto minmax(390px, 1fr) auto;
}

.location-deck {
  position: relative;
  z-index: 4;
  display: grid;
  grid-template-columns: minmax(270px, 1.2fr) minmax(260px, 0.95fr) minmax(230px, 0.62fr) minmax(150px, 0.45fr) minmax(190px, 0.55fr);
  gap: 0.75rem;
  padding: 1rem clamp(1rem, 2vw, 1.5rem);
  border-bottom: 1px solid rgb(var(--v-theme-on-surface), 0.1);
  background: rgb(var(--v-theme-surface));
}

.location-deck__coordinates {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.location-deck__coordinates .journey-field:first-child :deep(.v-field) {
  border-radius: 8px 0 0 8px;
}

.location-deck__coordinates .journey-field:last-child :deep(.v-field) {
  margin-left: -1px;
  border-radius: 0 8px 8px 0;
}

.journey-field :deep(.v-field) {
  min-height: 60px;
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
  font-size: 0.92rem;
}

.journey-field :deep(.v-field__outline) {
  --v-field-border-opacity: 0.16;
}

.journey-field :deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 0.45;
}

.journey-field :deep(.v-messages) {
  margin-top: 2px;
  font-size: 0.7rem;
}

.location-deck__scope {
  width: 100%;
  height: 60px;
  overflow: hidden;
  border-radius: 8px;
}

.location-deck__scope :deep(.v-btn) {
  min-width: 0;
  height: 60px;
  flex: 1 1 33.333%;
  padding: 0 0.6rem;
  font-size: 0.86rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

.location-deck__locate,
.location-deck__go,
.result-rail__go,
.mobile-go {
  border-radius: 8px;
  font-size: 0.94rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: none;
}

.location-deck__locate {
  border-color: rgb(var(--v-theme-on-surface), 0.14);
}

.location-deck__go,
.result-rail__go,
.mobile-go {
  box-shadow: 0 8px 18px rgb(var(--v-theme-primary), 0.18);
}

.map-stage {
  position: relative;
  min-height: 0;
  overflow: hidden;
  background: rgb(var(--v-theme-surface-variant));
}

.amap-wrapper {
  width: 100%;
  height: 100%;
  min-height: 390px;
}

.map-stage__locate {
  position: absolute;
  z-index: 5;
  top: 1rem;
  right: 1rem;
  display: none;
  border: 1px solid rgb(var(--v-theme-on-surface), 0.17);
  color: rgb(var(--v-theme-on-surface));
  box-shadow: 0 8px 24px rgb(0, 0, 0, 0.2);
}

.map-stage__overlay {
  position: absolute;
  z-index: 8;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgb(var(--v-theme-surface-variant), 0.94);
  color: rgb(var(--v-theme-on-surface), 0.76);
  backdrop-filter: blur(12px);
}

.map-stage__error {
  width: 100%;
  max-width: none;
  border-radius: 0;
}

.journey-line {
  position: absolute;
  z-index: 4;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.journey-line__halo,
.journey-line__path {
  fill: none;
  stroke-linecap: round;
}

.journey-line__halo {
  stroke: rgb(var(--v-theme-surface), 0.88);
  stroke-width: 5;
}

.journey-line__path {
  stroke: rgb(var(--v-theme-secondary));
  stroke-width: 2;
  stroke-dasharray: 9 9;
  animation: journey-flow 1.15s linear infinite;
}

.result-rail {
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: minmax(230px, 0.85fr) minmax(430px, 1.5fr) auto minmax(190px, 0.5fr);
  align-items: center;
  gap: clamp(1rem, 2vw, 2rem);
  min-height: 108px;
  padding: 0.9rem clamp(1rem, 2vw, 1.5rem);
  border-top: 1px solid rgb(var(--v-theme-on-surface), 0.1);
  background: rgb(var(--v-theme-surface), 0.97);
  box-shadow: 0 -12px 30px rgb(0, 0, 0, 0.08);
  backdrop-filter: blur(18px);
}

.result-rail__heading {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 0;
}

.result-rail__heading > .v-icon {
  flex: 0 0 auto;
  margin-top: 0.1rem;
}

.result-rail__heading h1 {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 650;
  line-height: 1.3;
}

.result-rail__heading p {
  max-width: 24rem;
  margin: 0.25rem 0 0;
  overflow: hidden;
  color: rgb(var(--v-theme-on-surface), 0.6);
  font-size: 0.76rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-rail__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr 1.35fr;
  margin: 0;
}

.result-rail__metrics > div {
  min-width: 0;
  padding: 0 1rem;
  border-left: 1px solid rgb(var(--v-theme-on-surface), 0.12);
}

.result-rail__metrics dt {
  color: rgb(var(--v-theme-on-surface), 0.58);
  font-size: 0.72rem;
}

.result-rail__metrics dd {
  margin: 0.25rem 0 0;
  font-size: 0.92rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.result-rail__actions {
  display: flex;
  align-items: center;
}

.result-rail__actions .v-btn {
  padding: 0 0.65rem;
  font-size: 0.82rem;
  letter-spacing: 0;
  text-transform: none;
}

.result-rail__actions .v-btn + .v-btn {
  border-left: 1px solid rgb(var(--v-theme-on-surface), 0.12);
  border-radius: 0;
}

.mobile-go {
  display: none;
}

:deep(.journey-marker) {
  position: relative;
  width: 28px;
  height: 36px;
  border: 3px solid #FFFFFF;
  border-radius: 18px 18px 18px 4px;
  box-shadow: 0 6px 15px rgb(0, 0, 0, 0.28);
  transform: rotate(-45deg);
}

:deep(.journey-marker--origin) {
  background: #3B82E3;
}

:deep(.journey-marker--destination) {
  background: #68A94B;
}

:deep(.journey-marker__core) {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #FFFFFF;
}

.result-rail-enter-active,
.result-rail-leave-active {
  transition: opacity 180ms ease, transform 220ms ease;
}

.result-rail-enter-from,
.result-rail-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

@keyframes journey-flow {
  to {
    stroke-dashoffset: -36;
  }
}

@media (max-width: 1200px) {
  .location-deck {
    grid-template-columns: minmax(220px, 1.25fr) minmax(240px, 1fr) minmax(210px, 0.7fr) minmax(180px, 0.6fr);
  }

  .location-deck__locate {
    display: none;
  }

  .result-rail {
    grid-template-columns: minmax(210px, 0.85fr) minmax(380px, 1.5fr) minmax(190px, 0.5fr);
  }

  .result-rail__actions {
    display: none;
  }
}

@media (max-width: 960px) {
  .location-deck {
    grid-template-columns: minmax(250px, 1.15fr) minmax(250px, 1fr);
  }
}

@media (max-width: 720px) {
  .map-workspace,
  .map-workspace--result {
    display: flex;
    flex-direction: column;
    min-height: calc(100dvh - 64px);
    padding-bottom: env(safe-area-inset-bottom);
    background: rgb(var(--v-theme-background));
  }

  .location-deck {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.7rem;
    padding: 0.75rem;
    border-bottom: 0;
    background: rgb(var(--v-theme-background));
  }

  .location-deck__coordinates {
    grid-template-columns: 1fr 1fr;
  }

  .journey-field :deep(.v-field) {
    min-height: 64px;
    background: rgb(var(--v-theme-surface-variant));
  }

  .location-deck__address .journey-field :deep(.v-field) {
    min-height: 66px;
  }

  .journey-field :deep(.v-field__outline) {
    --v-field-border-opacity: 0.09;
  }

  .location-deck__locate,
  .location-deck__go {
    display: none;
  }

  .location-deck__scope,
  .location-deck__scope :deep(.v-btn) {
    height: 48px;
  }

  .map-stage {
    flex: 1 1 52vh;
    min-height: 330px;
  }

  .amap-wrapper {
    min-height: 330px;
  }

  .map-stage__locate {
    display: inline-flex;
  }

  .result-rail {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    max-height: calc(100dvh - 180px);
    min-height: 0;
    padding: 1rem 0.75rem max(0.75rem, env(safe-area-inset-bottom));
    overflow-y: auto;
    border-top: 1px solid rgb(var(--v-theme-on-surface), 0.1);
    border-radius: 18px 18px 0 0;
    background: rgb(var(--v-theme-surface), 0.98);
    box-shadow: 0 -14px 34px rgb(0, 0, 0, 0.22);
  }

  .result-rail__heading {
    padding: 0 0.25rem 0.8rem;
  }

  .result-rail__heading h1 {
    font-size: 1rem;
  }

  .result-rail__heading p {
    max-width: calc(100vw - 4rem);
  }

  .result-rail__metrics {
    grid-template-columns: 1fr 1fr 1.25fr;
    padding: 0.8rem 0;
    border-top: 1px solid rgb(var(--v-theme-on-surface), 0.1);
    border-bottom: 1px solid rgb(var(--v-theme-on-surface), 0.1);
  }

  .result-rail__metrics > div {
    padding: 0 0.65rem;
  }

  .result-rail__metrics > div:first-child {
    border-left: 0;
  }

  .result-rail__metrics dt {
    font-size: 0.68rem;
  }

  .result-rail__metrics dd {
    overflow: hidden;
    font-size: 0.82rem;
    text-overflow: ellipsis;
  }

  .result-rail__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin: 0.35rem 0;
  }

  .result-rail__actions .v-btn {
    min-width: 0;
    padding: 0 0.25rem;
  }

  .result-rail__go,
  .mobile-go {
    width: 100%;
    margin-top: 0.25rem;
  }

  .mobile-go {
    position: fixed;
    z-index: 20;
    right: 0.75rem;
    bottom: max(0.75rem, env(safe-area-inset-bottom));
    left: 0.75rem;
    display: inline-flex;
    width: auto;
    flex: 0 0 56px;
    margin: 0;
  }

  :deep(.amap-controlbar),
  :deep(.amap-maptypecontrol),
  :deep(.amap-toolbar) {
    display: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .journey-line__path {
    animation: none;
  }

  .result-rail-enter-active,
  .result-rail-leave-active {
    transition: none;
  }
}
</style>
