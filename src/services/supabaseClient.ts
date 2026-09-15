import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Category, MenuItem, RestaurantInfo } from '../types';

// Environment variables provided at build time (Vite embeds VITE_* variables)
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const SUPABASE_URL = rawUrl.replace(/^["']|["']$/g, '').replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = rawAnonKey.replace(/^["']|["']$/g, '');

/**
 * Returns true if both Supabase URL and Anon (publishable) Key are configured.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Direct client-side Supabase client instance using the Anon (publishable) key.
 * Never use the service_role secret key in browser code!
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    })
  : null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Koneksi Supabase belum dikonfigurasi. Harap set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Secrets repository GitHub atau file .env.local.'
    );
  }
  return supabase;
}

/**
 * Helper to map raw database row to Category interface
 */
export function mapCategoryRow(row: any): Category {
  return {
    id: String(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : '',
    order: Number(row.order ?? 0),
  };
}

/**
 * Helper to map raw database row to MenuItem interface
 */
export function mapMenuItemRow(row: any): MenuItem {
  return {
    id: String(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : '',
    price: Number(row.price),
    categoryId: String(row.category_id),
    imageUrl: row.image_url ? String(row.image_url) : '',
    isAvailable: Boolean(row.is_available),
    isFeatured: Boolean(row.is_featured),
    spiceLevel: Number(row.spice_level ?? 0),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    variants: Array.isArray(row.variants) && row.variants.length > 0 ? row.variants : undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

/**
 * Helper to map raw database row to RestaurantInfo interface
 */
export function mapRestaurantInfoRow(row: any, fallback: RestaurantInfo): RestaurantInfo {
  return {
    name: String(row.name || fallback.name),
    tagline: String(row.tagline || fallback.tagline),
    address: String(row.address || fallback.address),
    phone: String(row.phone || fallback.phone),
    hours: String(row.hours || fallback.hours),
    instagram: row.instagram ? String(row.instagram) : fallback.instagram,
    facebook: row.facebook ? String(row.facebook) : fallback.facebook,
  };
}
