import { ToastProvider } from '../components/Toast'

export function renderWithProviders(ui) {
  const Wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>
  return { Wrapper, ui }
}
