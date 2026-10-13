/** Daily intentions — one per day, in order, looping back to the first after the last */
export const INTENTIONS = [
  'Today, I choose peace over reaction.',
  'I allow myself to move through today with ease.',
  'My intention today is to listen within.',
  'I choose to trust the guidance unfolding for me.',
  'Today, I release what I no longer need to carry.',
  'I welcome this day with an open heart.',
  'My intention is to remain present in each moment.',
  'Today, I choose love in my thoughts, words, and actions.',
  'I allow clarity to arise from stillness.',
  'Today, I make space for the Divine to guide me.',
  'I choose to respond with awareness, not habit.',
  'My intention today is to be gentle with myself and others.',
  'I trust that every moment can teach me something.',
  'Today, I choose gratitude for what is already here.',
  'I allow myself to receive support, love, and grace.',
  'My intention is to stay centred, whatever the day brings.',
  'Today, I release the need to control every outcome.',
  'I choose thoughts that bring me closer to peace.',
  'Today, I honour the wisdom of my inner voice.',
  'I allow life to unfold without rushing it.',
  'My intention today is to bring light wherever I go.',
  'I choose courage over fear.',
  'Today, I create space between my thoughts and my reactions.',
  'I allow myself to simply be.',
  'My intention is to see beyond appearances.',
  'Today, I choose compassion before judgement.',
  'I trust that what is meant for me will unfold in its time.',
  'Today, I return to stillness whenever I feel scattered.',
  'I choose to recognise the Divine within myself and others.',
  'My intention today is to walk with awareness and gratitude.',
  'Today, I surrender, trust, and allow.',
]

/** The day the cycle begins with the first intention (local calendar date) */
const CYCLE_START = { year: 2026, month: 10, day: 12 }
const DAY_MS = 24 * 60 * 60 * 1000

/** Same intention for everyone all day (by local date); advances daily and loops */
export function getTodayIntention(date = new Date()) {
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const start = Date.UTC(CYCLE_START.year, CYCLE_START.month - 1, CYCLE_START.day)
  const days = Math.round((today - start) / DAY_MS)
  const index = ((days % INTENTIONS.length) + INTENTIONS.length) % INTENTIONS.length
  return INTENTIONS[index]
}
