export interface Category {
  id: string;
  name: string;
  order: number;
  description?: string;
}

export interface PortionVariant {
  label: string; // "Kecil" atau "Besar"
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  spiceLevel?: number; // 0: None, 1: Mild, 2: Medium, 3: Hot
  tags?: string[];
  variants?: PortionVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  hours: string;
  instagram?: string;
  facebook?: string;
}

export interface UserSession {
  email: string;
  name: string;
  role: 'kasir';
  token: string;
}
