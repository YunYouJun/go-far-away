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
