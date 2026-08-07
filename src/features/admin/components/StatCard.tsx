import type { ReactNode } from 'react'
import { TrendingUp } from 'lucide-react'

interface Props {
  label: string
  value: number | string
  icon: ReactNode
  accent?: string
  trend?: string
  loading?: boolean
}

export function StatCard({ label, value, icon, accent = '#7C2447', trend, loading = false }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC]">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <TrendingUp size={12} />
            {trend}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-7 w-16 bg-[#F7F0E9] rounded-lg animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-[#321B26]">{value}</p>
      )}
      <p className="text-xs text-[#8C7B85] mt-0.5">{label}</p>
    </div>
  )
}
