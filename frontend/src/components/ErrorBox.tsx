import type { ReactNode } from "react";

interface ErrorBoxProps {
  children: ReactNode;
  color?: string;
}

export default function ErrorBox({
  children,
  color = "var(--color-error)",
}: ErrorBoxProps) {
  return (
    <div
      className="text-xs px-2.5 py-1.5 rounded"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 11%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 33%, transparent)`,
      }}
    >
      {children}
    </div>
  );
}
