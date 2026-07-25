import { describe, it, expect } from 'vitest'
import { gateConfig } from '../theme'

describe('gateConfig', () => {
  const nodeTypes = ['INPUT', 'AND', 'OR', 'NOT', 'OUTPUT'] as const

  for (const type of nodeTypes) {
    it(`has config for ${type}`, () => {
      expect(gateConfig).toHaveProperty(type)
      expect(gateConfig[type]).toHaveProperty('icon')
      expect(gateConfig[type]).toHaveProperty('label')
      expect(gateConfig[type]).toHaveProperty('bg')
      expect(gateConfig[type]).toHaveProperty('border')
    })
  }

  it('each config has a non-empty icon', () => {
    for (const cfg of Object.values(gateConfig)) {
      expect(cfg.icon.length).toBeGreaterThan(0)
    }
  })

  it('each config has a non-empty label', () => {
    for (const cfg of Object.values(gateConfig)) {
      expect(cfg.label.length).toBeGreaterThan(0)
    }
  })
})
