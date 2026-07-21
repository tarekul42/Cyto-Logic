import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../components/ErrorBoundary'

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders error UI when child throws', () => {
    const ThrowingComponent = () => { throw new Error('Test crash') }

    const originalError = console.error
    console.error = () => {}

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test crash')).toBeInTheDocument()
    expect(screen.getByText('Reload Application')).toBeInTheDocument()

    console.error = originalError
  })

  it('renders fallback message when error has no message', () => {
    const ThrowingComponent = () => { throw new Error() }

    const originalError = console.error
    console.error = () => {}

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument()

    console.error = originalError
  })
})
