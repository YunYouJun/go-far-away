import { describe, expect, it } from 'vitest'
import {
  decimal2degree,
  degree2decimal,
  getAntipode,
  isValidLatitude,
  isValidLongitude,
  isValidSexagesimalPart,
} from '@/utils/coordinates'

describe('coordinates', () => {
  it('converts positive decimal degrees to degree-minute-second fields', () => {
    expect(decimal2degree(121.5)).toEqual({
      degree: 121,
      minute: 30,
      second: 0,
    })
  })

  it('keeps negative decimal degrees reversible', () => {
    expect(decimal2degree(-73.9875)).toEqual({
      degree: -73,
      minute: 59,
      second: 15,
    })
    expect(degree2decimal({ degree: -73, minute: 59, second: 15 })).toBeCloseTo(-73.9875, 6)
  })

  it('normalizes rounded seconds into the next minute or degree', () => {
    expect(decimal2degree(12.999999)).toEqual({
      degree: 13,
      minute: 0,
      second: 0,
    })
  })

  it('accepts empty field values as zero', () => {
    expect(degree2decimal({ degree: '', minute: '', second: '' })).toBe(0)
  })

  it('calculates the antipode without mutating the original location', () => {
    const shanghai = { lat: 31.2304, lng: 121.4737 }

    expect(getAntipode(shanghai)).toEqual({
      lat: -31.2304,
      lng: -58.5263,
    })
    expect(shanghai).toEqual({ lat: 31.2304, lng: 121.4737 })
  })

  it('validates geographic coordinate boundaries', () => {
    expect(isValidLatitude(-90)).toBe(true)
    expect(isValidLatitude(90)).toBe(true)
    expect(isValidLatitude(90.0001)).toBe(false)
    expect(isValidLatitude('')).toBe(false)

    expect(isValidLongitude(-180)).toBe(true)
    expect(isValidLongitude(180)).toBe(true)
    expect(isValidLongitude(-180.0001)).toBe(false)
    expect(isValidLongitude('not-a-number')).toBe(false)
  })

  it('rejects minutes and seconds outside the sexagesimal range', () => {
    expect(isValidSexagesimalPart(0)).toBe(true)
    expect(isValidSexagesimalPart(59.999)).toBe(true)
    expect(isValidSexagesimalPart(60)).toBe(false)
    expect(isValidSexagesimalPart(-1)).toBe(false)
  })
})
