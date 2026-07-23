import type { ReactNode } from 'react'

interface SectionHeaderProps {
  children: ReactNode
  className?: string
}

export default function SectionHeader({ children, className }: SectionHeaderProps) {
  return (
    <div className={`text-section font-bold text-text-tertiary mb-3 uppercase tracking-[6px] ${className ?? ''}`}>
      {children}
    </div>
  )
}
