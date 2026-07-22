import '@testing-library/jest-dom/vitest'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class DOMRectMock {
  x: number
  y: number
  width: number
  height: number
  top: number
  right: number
  bottom: number
  left: number

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x; this.y = y; this.width = width; this.height = height;
    this.top = y; this.right = x + width; this.bottom = y + height; this.left = x;
  }

  toJSON() { return { x: this.x, y: this.y, width: this.width, height: this.height } }
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
globalThis.DOMRect = DOMRectMock as unknown as typeof DOMRect
