import { useRef, useState } from 'react'
import { ImagePlus, RefreshCw, Trash2, Link2, Loader2 } from 'lucide-react'
import { uploadImage, validateImage, type MediaFolder } from '@/services/storage'
import type { StagedUploads } from '../hooks/useStagedUploads'

interface Props {
  label: string
  value: string
  onChange: (url: string) => void
  folder: MediaFolder
  staged: StagedUploads
  /** e.g. "1200 × 600 recommended" */
  hint?: string
  error?: string
  /** Show the preview uncropped (logos / product shots) */
  contain?: boolean
}

export function ImageUploadField({ label, value, onChange, folder, staged, hint, error, contain = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [linkMode, setLinkMode] = useState(false)
  const [link, setLink] = useState('')

  const replaceWith = (url: string) => {
    const previous = value
    onChange(url)
    staged.discard(previous) // only deletes if the previous image was an unsaved upload
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    const problem = validateImage(file)
    if (problem) { setLocalError(problem); return }
    setLocalError(null)
    setUploading(true)
    try {
      const url = await uploadImage(file, folder)
      staged.track(url)
      replaceWith(url)
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const applyLink = () => {
    const url = link.trim()
    if (!/^(https?:\/\/|\/)/.test(url)) { setLocalError('Links must start with https://'); return }
    setLocalError(null)
    replaceWith(url)
    setLink('')
    setLinkMode(false)
  }

  const shownError = localError ?? error

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-xs font-semibold text-[#4A3540] uppercase tracking-wide">{label}</p>
        {hint && <span className="text-[10px] text-[#C4B5BD]">{hint}</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-[#E8DDF2] bg-[#FCF7F0]">
          <img src={value} alt="" className={`w-full h-40 ${contain ? 'object-contain p-3' : 'object-cover'}`} />
          {uploading && <UploadingOverlay />}
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 text-xs font-semibold text-[#321B26] shadow hover:bg-white disabled:opacity-50"
            >
              <RefreshCw size={12} /> Replace
            </button>
            <button
              type="button"
              onClick={() => replaceWith('')}
              disabled={uploading}
              aria-label="Remove image"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 text-xs font-semibold text-red-500 shadow hover:bg-white disabled:opacity-50"
            >
              <Trash2 size={12} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]) }}
          disabled={uploading}
          className={`relative w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors ${
            dragging ? 'border-[#7C2447] bg-[#7C2447]/5' : 'border-[#E8DDF2] bg-[#FCF7F0] hover:border-[#7C2447]/40'
          }`}
        >
          {uploading ? <UploadingOverlay /> : (
            <>
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#7C2447] shadow-sm">
                <ImagePlus size={18} />
              </span>
              <span className="text-sm font-semibold text-[#321B26]">Upload an image</span>
              <span className="text-[11px] text-[#8C7B85]">Drag & drop or click • JPG, PNG, WebP, GIF • max 5 MB</span>
            </>
          )}
        </button>
      )}

      {linkMode ? (
        <div className="flex gap-2 mt-2">
          <input
            value={link}
            onChange={e => setLink(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyLink() } }}
            placeholder="https://…"
            className="flex-1 px-3 py-2 rounded-lg border border-[#E8DDF2] text-xs text-[#321B26] bg-white placeholder-[#C4B5BD] focus:outline-none focus:ring-2 focus:ring-[#7C2447]/20"
          />
          <button type="button" onClick={applyLink} className="px-3 py-2 rounded-lg bg-[#7C2447] text-white text-xs font-semibold">Use link</button>
          <button type="button" onClick={() => { setLinkMode(false); setLocalError(null) }} className="px-3 py-2 rounded-lg text-xs text-[#8C7B85]">Cancel</button>
        </div>
      ) : (
        <button type="button" onClick={() => setLinkMode(true)} className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#8C7B85] hover:text-[#7C2447]">
          <Link2 size={12} /> or use an image link instead
        </button>
      )}

      {shownError && <p role="alert" className="mt-1 text-xs text-red-500">{shownError}</p>}
    </div>
  )
}

function UploadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/70 flex items-center justify-center gap-2 text-xs font-semibold text-[#7C2447]">
      <Loader2 size={16} className="animate-spin" /> Uploading…
    </div>
  )
}
