import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should filter out falsy values', () => {
    expect(cn('foo', false, 'bar', null, 'baz', undefined)).toBe('foo bar baz')
  })

  it('should handle empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar')
  })

  it('should handle single class', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('should handle empty input', () => {
    expect(cn()).toBe('')
  })
})
