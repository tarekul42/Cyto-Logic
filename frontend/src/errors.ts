export class CircuitError extends Error {
  constructor(
    message: string,
    public code: string = 'CIRCUIT_ERROR',
  ) {
    super(message)
    this.name = 'CircuitError'
  }
}

export class CompileError extends Error {
  constructor(
    message: string,
    public code: string = 'COMPILE_ERROR',
  ) {
    super(message)
    this.name = 'CompileError'
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code: string = 'NETWORK_ERROR',
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class StorageError extends Error {
  constructor(
    message: string,
    public code: string = 'STORAGE_ERROR',
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred'
}
