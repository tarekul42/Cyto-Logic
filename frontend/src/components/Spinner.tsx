export default function Spinner({ size = 14 }: { size?: number }) {
  const sizePx = `${size}px`;
  return (
    <span
      className="inline-block rounded-full animate-spin"
      style={{
        width: sizePx,
        height: sizePx,
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "var(--color-text-primary)",
      }}
    />
  );
}
