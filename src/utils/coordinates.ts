export interface DegreeParts {
  degree: number | string
  minute: number | string
  second: number | string
}

export interface NormalizedDegreeParts {
  degree: number
  minute: number
  second: number
}

export interface GeographicLocation {
  lat: number
  lng: number
}

export interface LocationDistance extends GeographicLocation {
  distanceMetres: number
}

const MEAN_EARTH_RADIUS_METRES = 6_371_008.8

function degreesToRadians(value: number): number {
  return value * Math.PI / 180
}

function toFiniteNumber(value: number | string): number {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function isFiniteInput(value: number | string): boolean {
  if (value === '')
    return false

  return Number.isFinite(Number(value))
}

export function isValidLatitude(value: number | string): boolean {
  return isFiniteInput(value) && Number(value) >= -90 && Number(value) <= 90
}

export function isValidLongitude(value: number | string): boolean {
  return isFiniteInput(value) && Number(value) >= -180 && Number(value) <= 180
}

export function isValidSexagesimalPart(value: number | string): boolean {
  return isFiniteInput(value) && Number(value) >= 0 && Number(value) < 60
}

export function getAntipode(location: GeographicLocation): GeographicLocation {
  const oppositeLongitude = location.lng <= 0
    ? location.lng + 180
    : location.lng - 180

  return {
    lat: Number((-location.lat).toFixed(12)),
    lng: Number(oppositeLongitude.toFixed(12)),
  }
}

export function getGreatCircleDistance(
  start: GeographicLocation,
  end: GeographicLocation,
): number {
  const startLatitude = degreesToRadians(start.lat)
  const endLatitude = degreesToRadians(end.lat)
  const latitudeDelta = endLatitude - startLatitude
  const longitudeDelta = degreesToRadians(end.lng - start.lng)
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2
  const angularDistance = 2 * Math.atan2(
    Math.sqrt(haversine),
    Math.sqrt(Math.max(0, 1 - haversine)),
  )

  return MEAN_EARTH_RADIUS_METRES * angularDistance
}

export function isLocationInRing(
  location: GeographicLocation,
  ring: GeographicLocation[],
): boolean {
  if (ring.length < 3)
    return false

  let isInside = false

  for (let index = 0, previousIndex = ring.length - 1; index < ring.length; previousIndex = index++) {
    const point = ring[index]
    const previousPoint = ring[previousIndex]
    const intersectsLatitude = (point.lat > location.lat) !== (previousPoint.lat > location.lat)

    if (!intersectsLatitude)
      continue

    const intersectionLongitude = (previousPoint.lng - point.lng)
      * (location.lat - point.lat)
      / (previousPoint.lat - point.lat)
      + point.lng

    if (location.lng < intersectionLongitude)
      isInside = !isInside
  }

  return isInside
}

export function getFarthestLocation(
  origin: GeographicLocation,
  candidates: GeographicLocation[],
): LocationDistance {
  if (!candidates.length)
    throw new RangeError('At least one destination candidate is required')

  let farthestLocation = candidates[0]
  let farthestDistance = getGreatCircleDistance(origin, farthestLocation)

  for (const candidate of candidates.slice(1)) {
    const distance = getGreatCircleDistance(origin, candidate)

    if (distance > farthestDistance) {
      farthestLocation = candidate
      farthestDistance = distance
    }
  }

  return {
    ...farthestLocation,
    distanceMetres: farthestDistance,
  }
}

export function getFarthestLocationInRings(
  origin: GeographicLocation,
  rings: GeographicLocation[][],
): LocationDistance {
  const antipode = getAntipode(origin)

  if (rings.some(ring => isLocationInRing(antipode, ring))) {
    return {
      ...antipode,
      distanceMetres: getGreatCircleDistance(origin, antipode),
    }
  }

  return getFarthestLocation(origin, rings.flat())
}

export function decimal2degree(decimal: number | string): NormalizedDegreeParts {
  const value = toFiniteNumber(decimal)
  const sign = value < 0 || Object.is(value, -0) ? -1 : 1
  const absolute = Math.abs(value)
  let degree = Math.floor(absolute)
  let minute = Math.floor((absolute - degree) * 60)
  let second = Math.round(((absolute - degree) * 60 - minute) * 60)

  if (second === 60) {
    second = 0
    minute += 1
  }

  if (minute === 60) {
    minute = 0
    degree += 1
  }

  return {
    degree: sign < 0 ? -degree : degree,
    minute,
    second,
  }
}

export function degree2decimal(parts: DegreeParts): number {
  const degree = toFiniteNumber(parts.degree)
  const minute = toFiniteNumber(parts.minute)
  const second = toFiniteNumber(parts.second)
  const sign = degree < 0 || Object.is(degree, -0) ? -1 : 1

  return sign * (Math.abs(degree) + minute / 60 + second / 3600)
}
