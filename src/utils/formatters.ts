import { PortionVariant } from '../types';

/**
 * Formats a number to Indonesian Rupiah currency format.
 * Example: 38000 -> "Rp 38.000"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Returns spice level label and chili indicator
 */
export function getSpiceInfo(level?: number): { label: string; count: number } {
  const count = level || 0;
  if (count === 0) return { label: 'Tidak Pedas', count: 0 };
  if (count === 1) return { label: 'Pedas Sedang', count: 1 };
  if (count === 2) return { label: 'Pedas Mantap', count: 2 };
  return { label: 'Sangat Pedas', count: 3 };
}

/**
 * Returns portion tier indicator if item is Porsi Kecil, Porsi Besar, or has multiple variants
 */
export function getPortionBadge(
  name: string,
  tags?: string[],
  variants?: PortionVariant[]
): 'kecil' | 'besar' | 'multi' | null {
  if (variants && variants.length > 1) return 'multi';
  const combined = (name + ' ' + (tags ? tags.join(' ') : '')).toLowerCase();
  if (combined.includes('porsi kecil')) return 'kecil';
  if (combined.includes('porsi besar')) return 'besar';
  return null;
}

/**
 * Curated list of appetizing food photography presets for Resto Maeso Aji Barokah
 */
export const FOOD_PRESET_IMAGES = [
  {
    name: 'Nasi Liwet Rempah',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Ayam Bakar Madu',
    url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Rendang Sapi Warisan',
    url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Sate Daging Bakar',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Sop Buntut Gurih',
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bebek Goreng Krispi',
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tahu Tempe Bacem',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Sayur Asem Segar',
    url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Sambal Ulek Lalapan',
    url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bakwan Jagung',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Es Kelapa Jeruk Segar',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Es Cendol Santan Durian',
    url: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Wedang Rempah Hangat',
    url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Es Teh Manis Segar',
    url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Pisang Goreng Keju',
    url: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Kudapan Manis Kolak',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  },
];
