import { Category, MenuItem, RestaurantInfo, UserSession } from '../types';
import {
  supabase,
  isSupabaseConfigured,
  getSupabaseClient,
  mapCategoryRow,
  mapMenuItemRow,
  mapRestaurantInfoRow,
} from './supabaseClient';
import { REAL_RESTAURANT_SEED } from '@/seedData';

const TOKEN_STORAGE_KEY = 'maeso_aji_auth_token';
const USER_STORAGE_KEY = 'maeso_aji_auth_user';

// Local storage keys for offline demo fallback when Supabase keys are not set
const LOCAL_KEYS = {
  RESTAURANT: 'maeso_aji_local_restaurant',
  CATEGORIES: 'maeso_aji_local_categories',
  MENU_ITEMS: 'maeso_aji_local_menu_items',
};

export interface StoragePhotoItem {
  name: string;
  url: string;
  createdAt?: string;
  size?: number;
}

export function getStoredAuth(): { token: string | null; user: UserSession | null } {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    const user = rawUser ? JSON.parse(rawUser) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function setStoredAuth(token: string, user: UserSession) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

// Local Storage Fallback Helpers
function getLocalRestaurant(): RestaurantInfo {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.RESTAURANT);
    if (raw) return JSON.parse(raw);
  } catch {}
  return REAL_RESTAURANT_SEED.restaurant;
}

function setLocalRestaurant(info: RestaurantInfo) {
  try {
    localStorage.setItem(LOCAL_KEYS.RESTAURANT, JSON.stringify(info));
  } catch {}
}

function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.CATEGORIES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return REAL_RESTAURANT_SEED.categories;
}

function setLocalCategories(cats: Category[]) {
  try {
    localStorage.setItem(LOCAL_KEYS.CATEGORIES, JSON.stringify(cats));
  } catch {}
}

function getLocalMenuItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.MENU_ITEMS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return REAL_RESTAURANT_SEED.items;
}

function setLocalMenuItems(items: MenuItem[]) {
  try {
    localStorage.setItem(LOCAL_KEYS.MENU_ITEMS, JSON.stringify(items));
  } catch {}
}

export const api = {
  // ================= RESTAURANT INFO =================
  async getRestaurantInfo(): Promise<RestaurantInfo> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('restaurant_info')
          .select('*')
          .eq('id', 'main')
          .maybeSingle();

        if (!error && data) {
          return mapRestaurantInfoRow(data, REAL_RESTAURANT_SEED.restaurant);
        }
      } catch (err) {
        console.warn('[Supabase] Gagal mengambil info resto dari database, menggunakan data lokal:', err);
      }
    }
    return getLocalRestaurant();
  },

  async updateRestaurantInfo(data: Partial<RestaurantInfo>): Promise<RestaurantInfo> {
    const current = await this.getRestaurantInfo();
    const updated: RestaurantInfo = {
      ...current,
      ...data,
    };

    if (isSupabaseConfigured() && supabase) {
      const client = getSupabaseClient();
      const { error } = await client.from('restaurant_info').upsert({
        id: 'main',
        name: updated.name,
        tagline: updated.tagline,
        address: updated.address,
        phone: updated.phone,
        hours: updated.hours,
        instagram: updated.instagram || '',
        facebook: updated.facebook || '',
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error('Gagal memperbarui informasi restoran di Supabase: ' + error.message);
      }
    }

    setLocalRestaurant(updated);
    return updated;
  },

  // ================= CATEGORIES =================
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(mapCategoryRow);
        }
      } catch (err) {
        console.warn('[Supabase] Gagal mengambil kategori dari Supabase, menggunakan data lokal:', err);
      }
    }
    return getLocalCategories();
  },

  async createCategory(data: { name: string; description?: string }): Promise<Category> {
    const id = 'cat_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const existing = await this.getCategories();
    const nextOrder = existing.length > 0 ? Math.max(...existing.map((c) => c.order)) + 1 : 1;

    if (isSupabaseConfigured() && supabase) {
      const client = getSupabaseClient();
      const { data: inserted, error } = await client
        .from('categories')
        .insert({
          id,
          name: data.name.trim(),
          description: (data.description || '').trim(),
          order: nextOrder,
        })
        .select()
        .single();

      if (error) {
        throw new Error('Gagal menambahkan kategori di Supabase: ' + error.message);
      }
      return mapCategoryRow(inserted);
    }

    const newCategory: Category = {
      id,
      name: data.name.trim(),
      description: data.description?.trim(),
      order: nextOrder,
    };
    const updatedList = [...existing, newCategory];
    setLocalCategories(updatedList);
    return newCategory;
  },

  async updateCategory(
    id: string,
    data: { name?: string; description?: string; order?: number }
  ): Promise<Category> {
    if (isSupabaseConfigured() && supabase) {
      const client = getSupabaseClient();
      const payload: any = {};
      if (data.name !== undefined) payload.name = data.name.trim();
      if (data.description !== undefined) payload.description = data.description.trim();
      if (data.order !== undefined) payload.order = Number(data.order);

      const { data: updated, error } = await client
        .from('categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error('Gagal memperbarui kategori di Supabase: ' + error.message);
      }
      return mapCategoryRow(updated);
    }

    const currentCats = getLocalCategories();
    const idx = currentCats.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Kategori tidak ditemukan');
    const updatedCat: Category = {
      ...currentCats[idx],
      name: data.name !== undefined ? data.name.trim() : currentCats[idx].name,
      description: data.description !== undefined ? data.description.trim() : currentCats[idx].description,
      order: data.order !== undefined ? Number(data.order) : currentCats[idx].order,
    };
    currentCats[idx] = updatedCat;
    setLocalCategories(currentCats);
    return updatedCat;
  },

  async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const client = getSupabaseClient();

      // Check if any items belong to this category
      const { count, error: countErr } = await client
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

      if (!countErr && typeof count === 'number' && count > 0) {
        throw new Error(
          `Kategori ini masih memiliki ${count} menu. Pindahkan atau hapus menu terlebih dahulu sebelum menghapus kategori.`
        );
      }

      const { error } = await client.from('categories').delete().eq('id', id);
      if (error) {
        throw new Error('Gagal menghapus kategori di Supabase: ' + error.message);
      }
      return;
    }

    const currentItems = getLocalMenuItems();
    const count = currentItems.filter((i) => i.categoryId === id).length;
    if (count > 0) {
      throw new Error(
        `Kategori ini masih memiliki ${count} menu. Pindahkan atau hapus menu terlebih dahulu sebelum menghapus kategori.`
      );
    }
    const currentCats = getLocalCategories().filter((c) => c.id !== id);
    setLocalCategories(currentCats);
  },

  // ================= MENU ITEMS =================
  async getMenuItems(): Promise<MenuItem[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(mapMenuItemRow);
        }
      } catch (err) {
        console.warn('[Supabase] Gagal mengambil item menu dari Supabase, menggunakan data lokal:', err);
      }
    }
    return getLocalMenuItems();
  },

  async createMenuItem(data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    const id = 'item_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured() && supabase) {
      const client = getSupabaseClient();
      const { data: inserted, error } = await client
        .from('menu_items')
        .insert({
          id,
          name: data.name.trim(),
          description: (data.description || '').trim(),
          price: Number(data.price),
          category_id: data.categoryId,
          image_url: (data.imageUrl || '').trim(),
          is_available: data.isAvailable !== false,
          is_featured: Boolean(data.isFeatured),
          spice_level: Number(data.spiceLevel ?? 0),
          tags: Array.isArray(data.tags) ? data.tags : [],
          variants: Array.isArray(data.variants) ? data.variants : [],
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select()
        .single();

      if (error) {
        throw new Error('Gagal menambahkan menu di Supabase: ' + error.message);
      }
      return mapMenuItemRow(inserted);
    }

    const newItem: MenuItem = {
      ...data,
      id,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    const items = [newItem, ...getLocalMenuItems()];
    setLocalMenuItems(items);
    return newItem;
  },

  async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured() && supabase) {
      const client = getSupabaseClient();
      const payload: any = { updated_at: nowIso };

      if (data.name !== undefined) payload.name = data.name.trim();
      if (data.description !== undefined) payload.description = data.description.trim();
      if (data.price !== undefined) payload.price = Number(data.price);
      if (data.categoryId !== undefined) payload.category_id = data.categoryId;
      if (data.imageUrl !== undefined) payload.image_url = data.imageUrl.trim();
      if (data.isAvailable !== undefined) payload.is_available = Boolean(data.isAvailable);
      if (data.isFeatured !== undefined) payload.is_featured = Boolean(data.isFeatured);
      if (data.spiceLevel !== undefined) payload.spice_level = Number(data.spiceLevel);
      if (data.tags !== undefined) payload.tags = Array.isArray(data.tags) ? data.tags : [];
      if (data.variants !== undefined) payload.variants = Array.isArray(data.variants) ? data.variants : [];

      const { data: updated, error } = await client
        .from('menu_items')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error('Gagal memperbarui menu di Supabase: ' + error.message);
      }
      return mapMenuItemRow(updated);
    }

    const currentItems = getLocalMenuItems();
    const idx = currentItems.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Menu tidak ditemukan');
    const updatedItem: MenuItem = {
      ...currentItems[idx],
      ...data,
      updatedAt: nowIso,
    };
    currentItems[idx] = updatedItem;
    setLocalMenuItems(currentItems);
    return updatedItem;
  },

  async toggleAvailability(id: string): Promise<{ id: string; isAvailable: boolean; name: string }> {
    if (isSupabaseConfigured() && supabase) {
      const client = getSupabaseClient();
      const { data: current, error: fetchErr } = await client
        .from('menu_items')
        .select('id, name, is_available')
        .eq('id', id)
        .single();

      if (fetchErr || !current) {
        throw new Error('Menu tidak ditemukan di Supabase');
      }

      const newStatus = !current.is_available;
      const { data: updated, error: updateErr } = await client
        .from('menu_items')
        .update({
          is_available: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('id, name, is_available')
        .single();

      if (updateErr || !updated) {
        throw new Error('Gagal mengubah ketersediaan di Supabase: ' + updateErr?.message);
      }

      return {
        id: updated.id,
        isAvailable: Boolean(updated.is_available),
        name: updated.name,
      };
    }

    const items = getLocalMenuItems();
    const item = items.find((i) => i.id === id);
    if (!item) throw new Error('Menu tidak ditemukan');
    item.isAvailable = !item.isAvailable;
    item.updatedAt = new Date().toISOString();
    setLocalMenuItems(items);
    return { id: item.id, isAvailable: item.isAvailable, name: item.name };
  },

  async deleteMenuItem(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const client = getSupabaseClient();
      const { error } = await client.from('menu_items').delete().eq('id', id);
      if (error) {
        throw new Error('Gagal menghapus menu di Supabase: ' + error.message);
      }
      return;
    }

    const items = getLocalMenuItems().filter((i) => i.id !== id);
    setLocalMenuItems(items);
  },

  // ================= PHOTO UPLOAD TO SUPABASE STORAGE =================
  async uploadPhoto(file: File): Promise<{
    url: string;
    imageUrl: string;
    filename: string;
  }> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Hanya file gambar yang diperbolehkan!');
    }

    if (isSupabaseConfigured() && supabase) {
      const client = getSupabaseClient();
      const rawExt = file.name.split('.').pop() || 'jpg';
      const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

      const { error } = await client.storage.from('menu-photos').upload(filename, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (error) {
        throw new Error('Gagal mengunggah foto ke Supabase Storage (menu-photos): ' + error.message);
      }

      const { data: publicUrlData } = client.storage.from('menu-photos').getPublicUrl(filename);
      return {
        url: publicUrlData.publicUrl,
        imageUrl: publicUrlData.publicUrl,
        filename,
      };
    }

    // Offline / Demo fallback: Convert to Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          url: dataUrl,
          imageUrl: dataUrl,
          filename: file.name,
        });
      };
      reader.onerror = () => reject(new Error('Gagal membaca file gambar lokal'));
      reader.readAsDataURL(file);
    });
  },

  async getStorageMenuPhotos(): Promise<StoragePhotoItem[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const client = getSupabaseClient();
        const { data, error } = await client.storage.from('menu-photos').list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

        if (!error && Array.isArray(data)) {
          return data
            .filter((f) => f.name && !f.name.startsWith('.'))
            .map((f) => {
              const { data: urlData } = client.storage.from('menu-photos').getPublicUrl(f.name);
              return {
                name: f.name,
                url: urlData.publicUrl,
                createdAt: f.created_at,
                size: f.metadata?.size,
              };
            });
        }
      } catch (err) {
        console.warn('[Supabase Storage] Gagal mengambil daftar foto:', err);
      }
    }
    return [];
  },

  // ================= KASIR AUTH =================
  async login(email: string, password: string): Promise<{ user: UserSession; token: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error(
        'Supabase belum terhubung. Konfigurasikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Secrets repository GitHub atau file .env.local.'
      );
    }

    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user || !data.session) {
      throw new Error(error?.message || 'Login gagal. Periksa kembali email dan password kasir.');
    }

    const userSession: UserSession = {
      email: data.user.email || email,
      name: data.user.user_metadata?.name || 'Kasir Resto Maeso Aji Barokah',
      role: 'kasir',
      token: data.session.access_token,
    };

    setStoredAuth(data.session.access_token, userSession);
    return { user: userSession, token: data.session.access_token };
  },

  async verifyAuth(): Promise<UserSession | null> {
    if (!isSupabaseConfigured() || !supabase) {
      const { token, user } = getStoredAuth();
      return token && user ? user : null;
    }

    try {
      const client = getSupabaseClient();
      const {
        data: { session },
        error,
      } = await client.auth.getSession();

      if (error || !session) {
        clearStoredAuth();
        return null;
      }

      const user = session.user;
      const userSession: UserSession = {
        email: user.email || '',
        name: user.user_metadata?.name || 'Kasir Resto Maeso Aji Barokah',
        role: 'kasir',
        token: session.access_token,
      };

      setStoredAuth(session.access_token, userSession);
      return userSession;
    } catch {
      clearStoredAuth();
      return null;
    }
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const client = getSupabaseClient();
        await client.auth.signOut();
      } catch {}
    }
    clearStoredAuth();
  },

  // ================= RESET DATA =================
  async resetDemoData(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const client = getSupabaseClient();

      // Clean existing records
      await client.from('menu_items').delete().neq('id', '___none___');
      await client.from('categories').delete().neq('id', '___none___');

      // Re-seed restaurant info
      await client.from('restaurant_info').upsert({
        id: 'main',
        name: REAL_RESTAURANT_SEED.restaurant.name,
        tagline: REAL_RESTAURANT_SEED.restaurant.tagline,
        address: REAL_RESTAURANT_SEED.restaurant.address,
        phone: REAL_RESTAURANT_SEED.restaurant.phone,
        hours: REAL_RESTAURANT_SEED.restaurant.hours,
        instagram: REAL_RESTAURANT_SEED.restaurant.instagram || '',
        facebook: REAL_RESTAURANT_SEED.restaurant.facebook || '',
        updated_at: new Date().toISOString(),
      });

      // Re-seed categories
      const catRows = REAL_RESTAURANT_SEED.categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        order: c.order ?? 0,
      }));
      await client.from('categories').upsert(catRows);

      // Re-seed items
      const nowMs = Date.now();
      const itemRows = REAL_RESTAURANT_SEED.items.map((item, idx) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: Number(item.price),
        category_id: item.categoryId,
        image_url: item.imageUrl || '',
        is_available: item.isAvailable !== false,
        is_featured: Boolean(item.isFeatured),
        spice_level: Number(item.spiceLevel ?? 0),
        tags: Array.isArray(item.tags) ? item.tags : [],
        variants: Array.isArray(item.variants) ? item.variants : [],
        created_at: new Date(nowMs - idx * 1000).toISOString(),
        updated_at: new Date(nowMs - idx * 1000).toISOString(),
      }));

      for (let i = 0; i < itemRows.length; i += 20) {
        await client.from('menu_items').upsert(itemRows.slice(i, i + 20));
      }
    } else {
      localStorage.removeItem(LOCAL_KEYS.RESTAURANT);
      localStorage.removeItem(LOCAL_KEYS.CATEGORIES);
      localStorage.removeItem(LOCAL_KEYS.MENU_ITEMS);
    }
  },
};
