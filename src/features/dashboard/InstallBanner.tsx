import { useState } from 'react'
import { Download, Share, SquarePlus, X } from 'lucide-react'
import { useInstallPrompt } from '@/lib/pwa'

const DISMISS_KEY = 'devas:install-dismissed-at'
const SNOOZE_MS = 1000 * 60 * 60 * 24 * 14

function snoozed() {
  const at = Number(localStorage.getItem(DISMISS_KEY) ?? 0)
  return Date.now() - at < SNOOZE_MS
}

export function InstallBanner() {
  const { mode, install } = useInstallPrompt()
  const [hidden, setHidden] = useState(snoozed)

  if (!mode || hidden) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setHidden(true)
  }

  return (
    <div className="relative flex items-start gap-3 rounded-[22px] p-4 bg-white border border-[#F0E6EC] shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
      <img src="/icons/icon-192.png" alt="" className="w-12 h-12 rounded-[14px] shadow-[0_4px_12px_rgba(124,36,71,0.25)] flex-shrink-0" />
      <div className="flex-1 min-w-0 pr-5">
        <p className="text-sm font-bold text-[#321B26]">Get the Devas app</p>
        {mode === 'prompt' ? (
          <>
            <p className="text-xs text-[#8C7B85] mt-0.5 leading-relaxed">Add it to your home screen — opens full screen, stays signed in.</p>
            <button
              onClick={async () => { if (await install()) setHidden(true) }}
              className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7C2447] text-white text-xs font-bold active:scale-[0.97] transition-transform"
            >
              <Download size={13} /> Install app
            </button>
          </>
        ) : (
          <p className="text-xs text-[#8C7B85] mt-1 leading-relaxed">
            Tap <Share size={13} className="inline -mt-0.5 text-[#007AFF]" aria-label="Share" /> <strong className="text-[#4A3540]">Share</strong> below,
            then <SquarePlus size={13} className="inline -mt-0.5 text-[#4A3540]" aria-hidden="true" /> <strong className="text-[#4A3540]">Add to Home Screen</strong>.
          </p>
        )}
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[#C4B5BD] hover:bg-[#F7F0E9] hover:text-[#8C7B85] transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  )
}
