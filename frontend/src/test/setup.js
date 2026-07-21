import '@testing-library/jest-dom/vitest'

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.DOMRect = class DOMRect {
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x; this.y = y; this.width = width; this.height = height;
    this.top = y; this.right = x + width; this.bottom = y + height; this.left = x;
  }
  toJSON() { return { x: this.x, y: this.y, width: this.width, height: this.height } }
}
