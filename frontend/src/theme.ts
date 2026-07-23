export interface Theme {
  color: {
    canvas: string
    panel: string
    surface: string
    surfaceAlt: string
    border: string
    borderLight: string
    primary: string
    primaryDim: string
    secondary: string
    danger: string
    dangerDim: string
    warning: string
    textPrimary: string
    textSecondary: string
    textTertiary: string
    input: string
    inputBorder: string
    nodeInput: string
    nodeInputBorder: string
    nodeGate: string
    nodeGateBorder: string
    nodeOutput: string
    nodeOutputBorder: string
    success: string
    error: string
  }
  font: {
    brand: string
    body: string
    mono: string
  }
  size: {
    sidebar: number
    results: number
    radius: {
      card: number
      button: number
      input: number
      node: number
    }
    space: {
      outer: number
      inner: number
      tight: number
      gap: number
    }
    font: {
      brand: number
      section: number
      body: number
      small: number
      badge: number
      nodeType: number
      nodeLabel: number
    }
  }
  shadow: {
    card: string
    button: string
    glow: string
    node: string
    lift: string
  }
}

export const theme: Theme = {
  color: {
    canvas:       '#0b1926',
    panel:        '#112233',
    surface:      '#1a2d3d',
    surfaceAlt:   '#1f3347',
    border:       '#1e3a4f',
    borderLight:  '#2a4a63',
    primary:      '#00d4aa',
    primaryDim:   '#00a888',
    secondary:    '#4a8fe7',
    danger:       '#e74c5e',
    dangerDim:    '#c0392b',
    warning:      '#f39c12',
    textPrimary:  '#f0f4f8',
    textSecondary:'#8ba3b8',
    textTertiary: '#5a7388',
    input:        '#0a1628',
    inputBorder:  '#2a4a63',
    nodeInput:    '#1a4a6e',
    nodeInputBorder:'#2a7ab5',
    nodeGate:     '#4a2a5a',
    nodeGateBorder:'#7a4a8a',
    nodeOutput:   '#6e2a3a',
    nodeOutputBorder:'#aa3a5a',
    success:      '#00d4aa',
    error:        '#e74c5e',
  },
  font: {
    brand: '"Audiowide", sans-serif',
    body:  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono:  '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
  },
  size: {
    sidebar: 220,
    results: 320,
    radius:  {
      card:  8,
      button:6,
      input: 4,
      node:  6,
    },
    space:  {
      outer: 16,
      inner: 12,
      tight: 8,
      gap:   10,
    },
    font:   {
      brand:   20,
      section: 11,
      body:    13,
      small:   11,
      badge:   10,
      nodeType:14,
      nodeLabel:12,
    },
  },
  shadow: {
    card:   '0 2px 8px rgba(0,0,0,0.3)',
    button: '0 4px 12px rgba(0,0,0,0.3)',
    glow:   '0 0 20px rgba(0,212,170,0.3)',
    node:   '0 4px 8px rgba(0,0,0,0.3)',
    lift:   '0 8px 24px rgba(0,0,0,0.4)',
  },
}

export interface GateConfig {
  icon: string
  label: string
  bg: string
  border: string
}

export const gateConfig: Record<string, GateConfig> = {
  INPUT: {
    icon:    '\u203A',
    label:   'Input',
    bg:      theme.color.nodeInput,
    border:  theme.color.nodeInputBorder,
  },
  AND: {
    icon:    '&',
    label:   'AND',
    bg:      theme.color.nodeGate,
    border:  theme.color.nodeGateBorder,
  },
  OR: {
    icon:    '\u22651',
    label:   'OR',
    bg:      theme.color.nodeGate,
    border:  theme.color.nodeGateBorder,
  },
  NOT: {
    icon:    '!',
    label:   'NOT',
    bg:      theme.color.nodeGate,
    border:  theme.color.nodeGateBorder,
  },
  OUTPUT: {
    icon:    '\u25C6',
    label:   'Output',
    bg:      theme.color.nodeOutput,
    border:  theme.color.nodeOutputBorder,
  },
}
