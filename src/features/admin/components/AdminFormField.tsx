import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface BaseProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>
type SelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>

const inputClass = (error?: string) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#321B26] bg-white placeholder-[#C4B5BD] outline-none focus:ring-2 focus:ring-[#7C2447]/20 focus:border-[#7C2447] transition-all ${error ? 'border-red-400' : 'border-[#E8DDF2]'}`

const LabelRow = ({ label, required, hint }: { label: string; required?: boolean; hint?: string }) => (
  <div className="flex items-baseline justify-between mb-1.5">
    <label className="text-xs font-semibold text-[#4A3540] uppercase tracking-wide">
      {label}{required && <span className="text-[#7C2447] ml-0.5">*</span>}
    </label>
    {hint && <span className="text-[10px] text-[#C4B5BD]">{hint}</span>}
  </div>
)

export function AdminInput({ label, error, hint, required, ...rest }: InputProps) {
  return (
    <div>
      <LabelRow label={label} required={required} hint={hint} />
      <input className={inputClass(error)} {...rest} />
      {error && <p role="alert" className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function AdminSelect({ label, error, hint, required, children, ...rest }: SelectProps) {
  return (
    <div>
      <LabelRow label={label} required={required} hint={hint} />
      <select className={inputClass(error)} {...rest}>
        {children}
      </select>
      {error && <p role="alert" className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function AdminTextarea({ label, error, hint, required, ...rest }: TextareaProps) {
  return (
    <div>
      <LabelRow label={label} required={required} hint={hint} />
      <textarea className={`${inputClass(error)} resize-none`} rows={4} {...rest} />
      {error && <p role="alert" className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface ToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}

export function AdminToggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[#321B26]">{label}</p>
        {description && <p className="text-xs text-[#8C7B85] mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7C2447]/20 ${checked ? 'bg-[#7C2447]' : 'bg-[#E8DDF2]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}
