import AMapLoader from '@amap/amap-jsapi-loader'

export type AmapErrorReason = 'key' | 'missing-key' | 'network' | 'quota' | 'unknown'

let amapPromise: Promise<typeof AMap> | undefined

function getErrorMessage(error: unknown): string {
  if (error instanceof Error)
    return error.message

  if (typeof error === 'object' && error !== null) {
    return Object.values(error)
      .filter(value => typeof value === 'string' || typeof value === 'number')
      .join(' ')
  }

  return String(error)
}

export function getAmapErrorReason(error: unknown): AmapErrorReason {
  const message = getErrorMessage(error).toUpperCase()

  if (message.includes('VITE_AMAP_') || message.includes('请填写KEY'))
    return 'missing-key'

  if (message.includes('OVER_LIMIT') || message.includes('QUOTA'))
    return 'quota'

  if (message.includes('INVALID_USER_KEY') || message.includes('INVALID KEY'))
    return 'key'

  if (
    message.includes('FAILED TO FETCH')
    || message.includes('NETWORK')
    || message.includes('REQUEST')
  ) {
    return 'network'
  }

  return 'unknown'
}

export async function loadAmap(): Promise<typeof AMap> {
  const amapKey = import.meta.env.VITE_AMAP_KEY
  const amapSecurityCode = import.meta.env.VITE_AMAP_SECURITY_CODE

  if (amapKey == null || amapKey.length === 0) {
    throw new Error('VITE_AMAP_KEY is required to load AMap')
  }

  if (amapSecurityCode == null || amapSecurityCode.length === 0) {
    throw new Error('VITE_AMAP_SECURITY_CODE is required to load AMap')
  }

  const amapWindow = window as Window & {
    _AMapSecurityConfig?: { securityJsCode: string }
  }

  amapWindow._AMapSecurityConfig = {
    securityJsCode: amapSecurityCode,
  }

  amapPromise ??= AMapLoader.load({
    key: amapKey,
    version: '1.4.15',
    plugins: [
      'AMap.Autocomplete',
      'AMap.DistrictSearch',
      'AMap.Geocoder',
      'AMap.Geolocation',
      'AMap.GeometryUtil',
      'AMap.MapType',
      'AMap.PlaceSearch',
      'AMap.Scale',
      'AMap.ToolBar',
    ],
  }).catch((error) => {
    amapPromise = undefined
    throw error
  }) as Promise<typeof AMap>

  return amapPromise
}

export function resetAmap(): void {
  amapPromise = undefined
  ;(AMapLoader as typeof AMapLoader & { reset?: () => void }).reset?.()
}
