declare namespace AMap {
  class Autocomplete {
    search(
      keywords: string,
      callback: (status: string, result: { tips?: Array<{
        name: string
        district?: string
        address?: string
        adcode?: string
        location?: LngLat | string
      }> }) => void,
    ): void
  }

  class Geocoder {
    getLocation(
      address: string,
      callback: (status: string, result: { geocodes: Array<{
        name?: string
        location: LngLat
      }> }) => void,
    ): void

    getAddress(
      lnglat: [number, number] | LngLat,
      callback: (status: string, result: {
        regeocode?: {
          addressComponent?: {
            province?: string
          }
          formattedAddress?: string
        }
      } | string) => void,
    ): void
  }

  interface DistrictSearchResult {
    districtList?: Array<{
      adcode?: string
      boundaries?: LngLat[][]
      level?: string
      name?: string
    }>
  }

  class DistrictSearch {
    constructor(options?: {
      extensions?: 'all' | 'base'
      level?: 'biz_area' | 'city' | 'country' | 'district' | 'province'
      showbiz?: boolean
      subdistrict?: 0 | 1 | 2 | 3
    })

    search(
      keywords: string,
      callback: (status: string, result: DistrictSearchResult | string) => void,
    ): void

    setLevel(level: 'biz_area' | 'city' | 'country' | 'district' | 'province'): void
  }

  class Geolocation {
    constructor(options?: {
      showButton?: boolean
      zoomToAccuracy?: boolean
    })

    getCurrentPosition(callback: (status: string, result: {
      position: LngLat
      formattedAddress: string
      info: string
      message: string
    }) => void): void
  }

  class MapType {}

  class PlaceSearch {
    constructor(options?: {
      map?: Map
    })

    setCity(city: string): void
    search(
      keywords: string,
      callback: (status: string, result: { poiList: { pois: Array<{
        name?: string
        location: LngLat
      }> } }) => void,
    ): void
  }

  class Scale {}

  class ToolBar {}
}
