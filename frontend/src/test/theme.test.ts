import { describe, it, expect } from 'vitest'
import { theme, gateConfig } from '../theme'

const requiredColorKeys = ['canvas', 'panel', 'surface', 'border', 'primary', 'secondary', 'danger', 'textPrimary', 'textSecondary', 'textTertiary'] as const

describe('theme', () => {
  it('has all required color tokens', () => {
    for (const key of requiredColorKeys) {
      expect(theme.color).toHaveProperty(key)
      expect(theme.color[key]).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it('has typography tokens', () => {
    expect(theme.font).toHaveProperty('brand')
    expect(theme.font).toHaveProperty('body')
    expect(theme.font).toHaveProperty('mono')
  })

  it('has layout size tokens', () => {
    expect(theme.size.sidebar).toBe(220)
    expect(theme.size.results).toBe(320)
    expect(theme.size.radius.card).toBe(8)
    expect(theme.size.radius.button).toBe(6)
    expect(theme.size.radius.input).toBe(4)
  })

  it('has spacing tokens', () => {
    expect(theme.size.space.outer).toBe(16)
    expect(theme.size.space.inner).toBe(12)
    expect(theme.size.space.tight).toBe(8)
    expect(theme.size.space.gap).toBe(10)
  })

  it('has shadow tokens', () => {
    expect(theme.shadow).toHaveProperty('card')
    expect(theme.shadow).toHaveProperty('button')
    expect(theme.shadow).toHaveProperty('glow')
    expect(theme.shadow).toHaveProperty('node')
    expect(theme.shadow).toHaveProperty('lift')
  })
})

describe('gateConfig', () => {
  const types = ['INPUT', 'AND', 'OR', 'NOT', 'OUTPUT'] as const

  for (const type of types) {
    it(`has config for ${type}`, () => {
      expect(gateConfig).toHaveProperty(type)
      expect(gateConfig[type]).toHaveProperty('icon')
      expect(gateConfig[type]).toHaveProperty('label')
      expect(gateConfig[type]).toHaveProperty('bg')
      expect(gateConfig[type]).toHaveProperty('border')
    })
  }
})
