import { Utensils, Shield, LogOut } from 'lucide-react';
import { RestaurantInfo, UserSession } from '../types';

interface NavbarProps {
  currentView: 'customer' | 'admin';
  user: UserSession | null;
  restaurantInfo: RestaurantInfo | null;
  onSwitchView: (view: 'customer' | 'admin') => void;
  onLogout: () => void;
}

export function Navbar({
  currentView,
  user,
  restaurantInfo,
  onSwitchView,
  onLogout,
}: NavbarProps) {
  return (
    <nav className="bg-[#3c2415] text-[#FAF8F5] border-b border-[#2d1b10] shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-3">
        {/* Brand */}
        <div
          onClick={() => onSwitchView('customer')}
          role="button"
          tabIndex={0}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group min-w-0 flex-1 sm:flex-initial"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#28170d] border border-[#5a3a24] text-[#C5A059] shadow-inner group-hover:border-[#C5A059] transition-all shrink-0">
            <Utensils className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="min-w-0 flex-1">
            <span
              className="font-serif-display text-base sm:text-xl font-medium text-white tracking-wide leading-tight block truncate"
              title={restaurantInfo?.name || 'Resto Maeso Aji Barokah'}
            >
              {restaurantInfo?.name || 'Resto Maeso Aji Barokah'}
            </span>
            <span className="text-[10px] text-[#C5A059] tracking-widest uppercase leading-tight block mt-0.5 font-semibold truncate">
              Fine-Casual Dining
            </span>
          </div>
        </div>

        {/* Right Navigation & Status Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            /* Logged-in Kasir User: Switch to Dasbor Kasir / Lihat Menu Tamu, and Logout */
            <div className="flex items-center gap-2">
              {currentView === 'customer' ? (
                <button
                  id="nav-go-to-admin-btn"
                  onClick={() => onSwitchView('admin')}
                  className="flex items-center gap-1.5 rounded-xl bg-[#B89047] hover:bg-[#a67e35] text-[#28170d] px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Dasbor Kasir</span>
                </button>
              ) : (
                <button
                  id="nav-go-to-menu-btn"
                  onClick={() => onSwitchView('customer')}
                  className="flex items-center gap-1.5 rounded-xl bg-[#2a180e] hover:bg-[#20120a] border border-[#523522] text-[#FAF8F5] px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span>Lihat Menu Tamu</span>
                </button>
              )}

              <button
                id="nav-logout-btn"
                onClick={onLogout}
                className="rounded-xl p-2 text-[#C4B4A7] hover:text-white hover:bg-[#2d1b10] transition-colors cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Public Guest / Unauthenticated visitor */
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#C4B4A7] font-light tracking-wide">
              <span>Pati, Jawa Tengah</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
