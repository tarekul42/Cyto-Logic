import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from '../components/Toast'

function TestButton({ message = 'Test message', type = 'success' }: { message?: string; type?: string } = {}) {
  const toast = useToast()
  return <button onClick={() => toast(message, type)}>Show Toast</button>
}

describe('Toast', () => {
  it('renders children', () => {
    render(<ToastProvider><div>Child</div></ToastProvider>)
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it('shows toast when triggered', async () => {
    const user = userEvent.setup()
    render(<ToastProvider><TestButton /></ToastProvider>)

    await user.click(screen.getByText('Show Toast'))
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('shows multiple toasts', async () => {
    const user = userEvent.setup()
    render(<ToastProvider><TestButton /></ToastProvider>)

    await user.click(screen.getByText('Show Toast'))
    await user.click(screen.getByText('Show Toast'))
    expect(screen.getAllByText('Test message')).toHaveLength(2)
  })

  it('dismisses toast on click', async () => {
    const user = userEvent.setup()
    render(<ToastProvider><TestButton /></ToastProvider>)

    await user.click(screen.getByText('Show Toast'))
    await user.click(screen.getByText('Test message'))

    expect(screen.queryByText('Test message')).not.toBeInTheDocument()
  })

  it('throws error when useToast is used outside provider', () => {
    const origError = console.error
    console.error = () => {}
    expect(() => render(<TestButton />)).toThrow('useToast must be used within ToastProvider')
    console.error = origError
  })
})
