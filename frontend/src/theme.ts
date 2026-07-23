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
    bg:      '#1a4a6e',
    border:  '#2a7ab5',
  },
  AND: {
    icon:    '&',
    label:   'AND',
    bg:      '#4a2a5a',
    border:  '#7a4a8a',
  },
  OR: {
    icon:    '\u22651',
    label:   'OR',
    bg:      '#4a2a5a',
    border:  '#7a4a8a',
  },
  NOT: {
    icon:    '!',
    label:   'NOT',
    bg:      '#4a2a5a',
    border:  '#7a4a8a',
  },
  OUTPUT: {
    icon:    '\u25C6',
    label:   'Output',
    bg:      '#6e2a3a',
    border:  '#aa3a5a',
  },
}
