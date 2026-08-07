interface DevasSymbolProps {
  size?: number
  color?: string
  className?: string
}

export function DevasSymbol({ size = 80, color = '#7C2447', className = '' }: DevasSymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Four-pointed lotus/star symbol */}
      <path
        d="M40 4 C40 4 44 20 44 40 C44 40 60 36 76 40 C60 44 44 40 44 40 C44 60 40 76 40 76 C40 76 36 60 36 40 C36 40 20 44 4 40 C20 36 36 40 36 40 C36 20 40 4 40 4Z"
        fill={color}
        fillOpacity="0.9"
      />
      {/* Inner petals */}
      <path
        d="M40 18 C40 18 42 28 42 40 C42 40 52 38 62 40 C52 42 42 40 42 40 C42 52 40 62 40 62 C40 62 38 52 38 40 C38 40 28 42 18 40 C28 38 38 40 38 40 C38 28 40 18 40 18Z"
        fill={color}
        fillOpacity="0.4"
      />
      {/* Center dot */}
      <circle cx="40" cy="40" r="4" fill={color} />
    </svg>
  )
}
