// Impulso symbol — four ascending bars (progress toward a goal), the last one
// solid rosa. Neutral bars use currentColor, so set the text color to control
// them: text-crema on dark backgrounds, text-tinta on light ones.
export function ImpulsoSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="60" width="17" height="32" rx="8.5" fill="currentColor" opacity="0.35" />
      <rect x="31" y="44" width="17" height="48" rx="8.5" fill="currentColor" opacity="0.55" />
      <rect x="54" y="26" width="17" height="66" rx="8.5" fill="currentColor" opacity="0.8" />
      <rect x="77" y="8" width="17" height="84" rx="8.5" fill="#F0355C" />
    </svg>
  )
}
