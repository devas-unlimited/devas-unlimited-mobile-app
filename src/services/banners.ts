import { supabase } from '@/lib/supabase'
import type { BannerTheme, HomeBanner } from '@/types/database'

export const BANNER_THEMES: Record<BannerTheme, { label: string; background: string; dark: boolean }> = {
  plum:     { label: 'Plum',     background: 'linear-gradient(145deg, #7C2447 0%, #321B26 100%)', dark: true },
  rose:     { label: 'Rose',     background: 'linear-gradient(145deg, #B5476F 0%, #5B1A35 100%)', dark: true },
  lavender: { label: 'Lavender', background: 'linear-gradient(145deg, #5B3A7C 0%, #321B26 100%)', dark: true },
  gold:     { label: 'Gold',     background: 'linear-gradient(145deg, #8B6914 0%, #7C2447 60%, #321B26 100%)', dark: true },
  cream:    { label: 'Cream',    background: 'linear-gradient(135deg, #FFF4F1 0%, #FBE1E6 100%)', dark: false },
}

export type BannerStatus = 'live' | 'scheduled' | 'expired' | 'hidden'

export function bannerStatus(b: Pick<HomeBanner, 'is_active' | 'starts_at' | 'ends_at'>, now = new Date()): BannerStatus {
  if (!b.is_active) return 'hidden'
  if (b.starts_at && new Date(b.starts_at) > now) return 'scheduled'
  if (b.ends_at && new Date(b.ends_at) <= now) return 'expired'
  return 'live'
}

export const isExternalLink = (url: string) => /^https?:\/\//i.test(url)

/** Banners visible to clients right now, in admin-defined order */
export async function fetchLiveBanners(): Promise<HomeBanner[]> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('home_banners')
    .select('*')
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as HomeBanner[]
}

/** All banners (admin) */
export async function fetchAllBanners(): Promise<HomeBanner[]> {
  const { data, error } = await supabase
    .from('home_banners')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as HomeBanner[]
}
