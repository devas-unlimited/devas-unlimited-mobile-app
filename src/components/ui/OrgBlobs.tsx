interface OrgBlobsProps {
  variant?: 'splash' | 'default' | 'auth'
}

export function OrgBlobs({ variant = 'default' }: OrgBlobsProps) {
  if (variant === 'splash') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Top-left peach blob */}
        <div
          className="blob absolute -top-16 -left-16 w-64 h-64 opacity-50"
          style={{ background: '#F9E2D8' }}
        />
        {/* Top-right sage blob */}
        <div
          className="blob absolute -top-8 -right-20 w-56 h-56 opacity-40"
          style={{ background: '#DDE9D3', borderRadius: '40% 60% 50% 70% / 60% 40% 70% 30%' }}
        />
        {/* Bottom-left lavender blob */}
        <div
          className="blob absolute -bottom-10 -left-10 w-48 h-48 opacity-40"
          style={{ background: '#E8DDF2', borderRadius: '70% 30% 50% 60% / 40% 70% 30% 60%' }}
        />
        {/* Bottom-right blue blob */}
        <div
          className="blob absolute -bottom-16 -right-16 w-60 h-60 opacity-35"
          style={{ background: '#DDEDF1', borderRadius: '50% 50% 40% 60% / 60% 50% 50% 40%' }}
        />
      </div>
    )
  }

  if (variant === 'auth') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="blob absolute -top-10 -right-10 w-48 h-48 opacity-30"
          style={{ background: '#F9E2D8' }}
        />
        <div
          className="blob absolute -bottom-10 -left-10 w-40 h-40 opacity-25"
          style={{ background: '#DDE9D3', borderRadius: '40% 60% 70% 30% / 50% 40% 60% 50%' }}
        />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="blob absolute -top-8 -right-8 w-36 h-36 opacity-25"
        style={{ background: '#F9E2D8' }}
      />
      <div
        className="blob absolute -bottom-6 -left-6 w-32 h-32 opacity-20"
        style={{ background: '#DDE9D3', borderRadius: '40% 60% 70% 30% / 50% 40% 60% 50%' }}
      />
    </div>
  )
}
