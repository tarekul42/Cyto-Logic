export const ICON = {
  CHECK: '\u2713',
  CROSS: '\u2717',
  WARNING: '\u26A0',
  INFO: '\u2139',
  EXPAND_DOWN: '\u25BE',
  EXPAND_RIGHT: '\u25B8',
  UNDO: '\u21A9',
  REDO: '\u21AA',
  SPINNER: '\u223F',
  SBOL: '\u29C9',
  DNA: '\u2240',
  SVG: '\u25A2',
  EMPTY_BOX: '\u22A1',
  DELETE: '\u2715',
  ARROW_RIGHT: '\u2192',
} as const

export const PLURAL = (count: number, word: string) => `${count} ${word}${count !== 1 ? 's' : ''}`
