import { describe, expect, it } from 'vitest'
import { getAmapErrorReason } from '@/utils/amap'

describe('amap errors', () => {
  it('recognizes quota, key, configuration, and network failures', () => {
    expect(getAmapErrorReason('USER_DAILY_QUERY_OVER_LIMIT')).toBe('quota')
    expect(getAmapErrorReason({ info: 'USER_DAILY_QUERY_OVER_LIMIT', infocode: '10044' })).toBe('quota')
    expect(getAmapErrorReason(new Error('INVALID_USER_KEY'))).toBe('key')
    expect(getAmapErrorReason(new Error('VITE_AMAP_KEY is required'))).toBe('missing-key')
    expect(getAmapErrorReason(new Error('VITE_AMAP_SECURITY_CODE is required'))).toBe('missing-key')
    expect(getAmapErrorReason(new TypeError('Failed to fetch'))).toBe('network')
  })

  it('falls back to an unknown error reason', () => {
    expect(getAmapErrorReason(new Error('unexpected'))).toBe('unknown')
  })
})
