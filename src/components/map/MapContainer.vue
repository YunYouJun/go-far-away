<script setup lang="ts">
import type { AppLocale } from '@/utils/locale'
import {
  mdiChartTimelineVariant,
  mdiCity,
  mdiGolf,
  mdiMap,
  mdiMapMarker,
  mdiRefresh,
} from '@mdi/js'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue'
import { useI18n } from 'vue-i18n'
import toast from '@/components/core/toast'
import {
  getAmapErrorReason,
  loadAmap,
  resetAmap,
} from '@/utils/amap'
import {
  getAntipode,
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

interface MapActionState {
  canGoFarAway: boolean
  canLocate: boolean
}

const props = withDefaults(defineProps<{
  goFarAwayTrigger?: number
  accurateLocationTrigger?: number
}>(), {
  goFarAwayTrigger: 0,
  accurateLocationTrigger: 0,
})

const emit = defineEmits<{
  actionStateChange: [state: MapActionState]
}>()

const { t, locale } = useI18n()
const mapElement = useTemplateRef<HTMLDivElement>('mapElement')
const amapApi = shallowRef<typeof AMap>()
const map = shallowRef<AMap.Map>()
const marker = shallowRef<AMap.Marker>()
const autoComplete = shallowRef<AMap.Autocomplete>()
const placeSearch = shallowRef<AMap.PlaceSearch>()
const geolocation = shallowRef<AMap.Geolocation>()

const autocomplete = shallowRef<AutocompleteTip[]>([])
const selectedPlace = shallowRef<AutocompleteTip | null>(null)
const distanceKilometres = shallowRef('')
const formattedAddress = shallowRef('')
const mapLoadErrorKey = shallowRef('')
const isMapInitializing = shallowRef(false)
const isLocating = shallowRef(false)
const isCalculating = shallowRef(false)

let autocompleteRequestId = 0
let geolocationRequestId = 0
let geolocationTimeoutId: number | undefined

const curPosition = reactive<{
  address: string
  location: LngLat
}>({
  address: '',
  location: {
    lat: 0,
    lng: 0,
  },
})

const oldLocation = reactive<{
  lat: string
  lng: string
}>({
  lat: '',
  lng: '',
})

const searchHint = computed(() => formattedAddress.value || t('form.address.hint'))
const mapLang = computed<AMap.Lang>(() => toAmapLocale(locale.value as AppLocale))
const mapLoadError = computed(() =>
  mapLoadErrorKey.value ? t(mapLoadErrorKey.value) : '',
)
const isMapReady = computed(() => Boolean(map.value) && !mapLoadErrorKey.value)
const hasValidCoordinates = computed(() =>
  isValidLatitude(curPosition.location.lat)
  && isValidLongitude(curPosition.location.lng),
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

watch(mapLang, (value) => {
  map.value?.setLang(value)
})

watch(
  [canGoFarAway, canLocate],
  ([canGo, canUseLocation]) => {
    emit('actionStateChange', {
      canGoFarAway: canGo,
      canLocate: canUseLocation,
    })
  },
  { immediate: true },
)

watch(() => props.goFarAwayTrigger, (value, oldValue) => {
  if (value !== oldValue && canGoFarAway.value)
    void getFarthestInEarth(curPosition.location)
})

watch(() => props.accurateLocationTrigger, (value, oldValue) => {
  if (value !== oldValue && canLocate.value)
    void getCurPositionByBrowser()
})

onMounted(() => {
  void initMap()
})

onBeforeUnmount(() => {
  geolocationRequestId += 1
  if (geolocationTimeoutId !== undefined)
    window.clearTimeout(geolocationTimeoutId)
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
      zoom: 4,
    })
    map.value = mapInstance

    mapInstance.addControl(new AMapApi.Scale())
    mapInstance.addControl(new AMapApi.ToolBar())
    mapInstance.addControl(new AMapApi.MapType())

    autoComplete.value = new AMapApi.Autocomplete()
    placeSearch.value = new AMapApi.PlaceSearch()
    geolocation.value = new AMapApi.Geolocation({
      showButton: false,
      zoomToAccuracy: true,
    })
    mapInstance.addControl(geolocation.value)

    const center = normalizeLngLat(mapInstance.getCenter())
    setCurLnglat(center)
    setLocationMarker(center)

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
  marker.value = undefined
  autoComplete.value = undefined
  placeSearch.value = undefined
  geolocation.value = undefined
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
    && (
      location.lng !== undefined
      || location.getLng !== undefined
    )
}

function setLocationMarker(location: LngLat, title = ''): void {
  if (!amapApi.value || !map.value)
    return

  const position: [number, number] = [location.lng, location.lat]

  if (!marker.value) {
    marker.value = new amapApi.value.Marker({
      position,
      title,
      animation: 'AMAP_ANIMATION_DROP',
    })
    map.value.add(marker.value)
  }
  else {
    marker.value.setPosition(position)
    marker.value.setTitle(title)
  }

  map.value.setCenter(position)
}

function displayLocationMarker(
  location: LngLat | LngLatLike,
  name = '',
  zoom = 14,
): void {
  const normalizedLocation = normalizeLngLat(location)
  setLocationMarker(normalizedLocation, name)
  map.value?.setZoom(zoom)
}

function setCurLnglat(location: LngLat | LngLatLike): void {
  const normalizedLocation = normalizeLngLat(location)

  oldLocation.lng = String(curPosition.location.lng)
  oldLocation.lat = String(curPosition.location.lat)
  curPosition.location.lng = normalizedLocation.lng
  curPosition.location.lat = normalizedLocation.lat
  distanceKilometres.value = ''
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

async function getAddressByLnglat(): Promise<void> {
  if (!hasValidCoordinates.value)
    return

  try {
    const AMapApi = await ensureAmap()
    const requestedLocation = { ...curPosition.location }
    const lnglat = `${requestedLocation.lng},${requestedLocation.lat}`

    formattedAddress.value = ''
    curPosition.address = ''
    selectedPlace.value = null
    setLocationMarker(requestedLocation)

    await new Promise<void>((resolve) => {
      const geocoder = new AMapApi.Geocoder()
      geocoder.getAddress(lnglat, (status, result) => {
        const locationHasNotChanged
          = requestedLocation.lng === curPosition.location.lng
            && requestedLocation.lat === curPosition.location.lat

        if (!locationHasNotChanged) {
          resolve()
          return
        }

        if (status === 'complete' && result.regeocode?.formattedAddress) {
          formattedAddress.value = result.regeocode.formattedAddress
          curPosition.address = result.regeocode.formattedAddress
        }
        else {
          formattedAddress.value = t('map.address.unavailable')
        }

        resolve()
      })
    })
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
    const firstPoi = status === 'complete'
      ? result.poiList?.pois?.[0]
      : undefined

    if (!firstPoi) {
      toast.open({
        color: 'warning',
        text: t('map.search.noResult'),
      })
      return
    }

    setCurLnglat(firstPoi.location)
    displayLocationMarker(firstPoi.location, firstPoi.name || poi.name)
    void getAddressByLnglat()
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
    setCurLnglat(poi.location)
    displayLocationMarker(poi.location, poi.name)
    return
  }

  getPlaceBySearch(poi)
}

function validateAddressSelection(): void {
  if (!curPosition.address.trim() || selectedPlace.value)
    return

  toast.open({
    color: 'warning',
    text: t('map.search.selectSuggestion'),
  })
}

async function getCurPositionByBrowser(): Promise<void> {
  if (!map.value || !geolocation.value) {
    toast.open({
      color: 'warning',
      text: t('map.location.unavailable'),
    })
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
    toast.open({
      color: 'error',
      text: t('map.location.timeout'),
    })
  }, 15_000)

  geolocation.value.getCurrentPosition((status, result) => {
    if (requestId !== geolocationRequestId)
      return

    if (geolocationTimeoutId !== undefined)
      window.clearTimeout(geolocationTimeoutId)
    geolocationTimeoutId = undefined

    if (status === 'complete') {
      const location = normalizeLngLat(result.position)
      setCurLnglat(location)
      formattedAddress.value = result.formattedAddress
      curPosition.address = result.formattedAddress
      selectedPlace.value = null
      displayLocationMarker(location)
      toast.open({
        color: 'success',
        text: t('map.location.success'),
      })
    }
    else {
      toast.open({
        color: 'error',
        text: t('map.location.error'),
      })
    }

    isLocating.value = false
  })
}

async function getFarthestInEarth(location: LngLat): Promise<void> {
  if (!canGoFarAway.value)
    return

  isCalculating.value = true

  try {
    const AMapApi = await ensureAmap()
    const origin = { ...location }
    const destination = getAntipode(origin)

    setCurLnglat(destination)
    setLocationMarker(destination)
    map.value?.setZoom(3)

    const originLnglat: [number, number] = [origin.lng, origin.lat]
    const destinationLnglat: [number, number] = [destination.lng, destination.lat]
    const distanceMetres = AMapApi.GeometryUtil.distance(originLnglat, destinationLnglat)

    distanceKilometres.value = new Intl.NumberFormat(locale.value, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(distanceMetres / 1000)

    await getAddressByLnglat()
  }
  catch (error) {
    handleMapLoadError(error)
  }
  finally {
    isCalculating.value = false
  }
}

function latitudeRule(value: unknown): true | string {
  return isValidLatitude(String(value ?? '')) || t('validation.latitude')
}

function longitudeRule(value: unknown): true | string {
  return isValidLongitude(String(value ?? '')) || t('validation.longitude')
}
</script>

<template>
  <div>
    <v-form @submit.prevent>
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete
              id="address"
              v-model="selectedPlace"
              v-model:search="curPosition.address"
              :prepend-icon="mdiCity"
              :items="autocomplete"
              :label="$t('form.address.label')"
              :placeholder="$t('form.address.placeholder')"
              :append-inner-icon="mdiMapMarker"
              :color="formattedAddress ? 'success' : 'info'"
              :disabled="!isMapReady"
              :loading="isLocating"
              clearable
              hide-no-data
              item-title="name"
              item-value="name"
              persistent-hint
              :hint="searchHint"
              return-object
              no-filter
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
          </v-col>

          <v-col cols="6" md="3">
            <v-text-field
              v-model.number="curPosition.location.lat"
              :label="`${$t('geographic.latitude.north')} °N`"
              type="number"
              max="90"
              min="-90"
              step="any"
              required
              :rules="[latitudeRule]"
              :hint="oldLocation.lat"
              @change="getAddressByLnglat"
            />
          </v-col>

          <v-col cols="6" md="3">
            <v-text-field
              v-model.number="curPosition.location.lng"
              :label="`${$t('geographic.longitude.east')} °E`"
              type="number"
              max="180"
              min="-180"
              step="any"
              required
              :rules="[longitudeRule]"
              :hint="oldLocation.lng"
              @change="getAddressByLnglat"
            />
          </v-col>

          <v-col v-if="distanceKilometres" cols="12">
            <div class="text-center" aria-live="polite">
              <v-chip color="indigo" class="text-white">
                <template #prepend>
                  <v-icon>{{ mdiChartTimelineVariant }}</v-icon>
                </template>
                {{ `${distanceKilometres} ${$t('unit.km')}` }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-form>

    <div class="map-stage">
      <div ref="mapElement" class="amap-wrapper" />

      <div
        v-if="isMapInitializing"
        class="map-stage__overlay"
        role="status"
        aria-live="polite"
      >
        <v-progress-circular indeterminate color="green" />
        <span>{{ $t('map.load.loading') }}</span>
      </div>

      <v-sheet
        v-else-if="mapLoadError"
        class="map-stage__overlay pa-6 text-center"
        color="red-lighten-5"
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

    <p class="text-center">
      <v-btn
        color="green"
        :disabled="!canGoFarAway"
        :loading="isCalculating"
        @click="getFarthestInEarth(curPosition.location)"
      >
        <v-icon start>
          {{ mdiGolf }}
        </v-icon>
        {{ $t('map.actions.goFarAway') }}
      </v-btn>
    </p>
  </div>
</template>

<style scoped>
.map-stage {
  position: relative;
  min-height: 400px;
  margin: 0 0 1rem;
}

.amap-wrapper {
  width: 100%;
  height: 400px;
  box-shadow: 5px 5px 20px rgba(55, 55, 55, 0.28);
}

.map-stage__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

@media (max-width: 600px) {
  .map-stage,
  .amap-wrapper {
    min-height: 360px;
    height: 360px;
  }
}
</style>
