import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Devas] Unhandled error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FCF7F0] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F9E2D8] flex items-center justify-center mb-4">
            <span className="text-2xl">✦</span>
          </div>
          <h2 className="text-[#321B26] font-semibold text-xl mb-2">Something went still</h2>
          <p className="text-[#8C7B85] text-sm mb-6">
            An unexpected error occurred. Please refresh to continue your practice.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#7C2447] text-white rounded-full text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
