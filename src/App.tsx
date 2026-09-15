import { useState, useEffect, useCallback, useRef } from 'react';
import { Category, MenuItem, RestaurantInfo, UserSession } from './types';
import { api, getStoredAuth, clearStoredAuth } from './services/api';
import { REAL_RESTAURANT_SEED } from '../seedData';
import { Navbar } from './components/Navbar';
import { CustomerMenu } from './components/CustomerMenu';
import { AdminDashboard } from './components/AdminDashboard';
import { RestaurantQrModal } from './components/RestaurantQrModal';
import { LoginModal } from './components/LoginModal';
import { MenuItemFormModal } from './components/MenuItemFormModal';
import { Loader2, Utensils } from 'lucide-react';

export default function App() {
  const checkIsAdminPath = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;
    return (
      path === '/admin' ||
      path.endsWith('/admin') ||
      path.endsWith('/admin/') ||
      path.includes('/admin/') ||
      hash === '#/admin' ||
      hash === '#admin' ||
      search.includes('view=admin')
    );
  };

  const isInitialAdmin = checkIsAdminPath();

  const [currentView, setCurrentView] = useState<'customer' | 'admin'>(() => {
    return isInitialAdmin ? 'admin' : 'customer';
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modals
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => {
    if (isInitialAdmin) {
      const { token, user: cachedUser } = getStoredAuth();
      return !(token && cachedUser);
    }
    return false;
  });
  const [isItemFormModalOpen, setIsItemFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Handle Switching View and URL Synchronization
  const handleSwitchView = useCallback((view: 'customer' | 'admin') => {
    setCurrentView(view);
    try {
      const cleanBase = window.location.pathname.replace(/\/admin\/?$/, '').replace(/\/$/, '');
      if (view === 'admin') {
        const target = cleanBase ? `${cleanBase}/admin` : '/admin';
        if (!checkIsAdminPath()) {
          window.history.pushState({}, '', target);
        }
      } else {
        const target = cleanBase ? `${cleanBase}/` : '/';
        if (checkIsAdminPath()) {
          window.history.pushState({}, '', target);
        }
      }
    } catch {}
  }, []);

  // Fetch all initial data with retry on server boot/restart
  const fetchData = useCallback(async (quiet = false, retriesLeft = 2) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const [catsRes, itemsRes, restRes] = await Promise.all([
        api.getCategories(),
        api.getMenuItems(),
        api.getRestaurantInfo(),
      ]);
      setCategories(catsRes);
      setItems(itemsRes);
      setRestaurantInfo(restRes);
      setIsLoading(false);
      setIsRefreshing(false);
    } catch (err) {
      console.warn('Gagal mengambil data menu dari server:', err);
      if (retriesLeft > 0) {
        // Retry after a brief delay if server is still starting up
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(() => {
          fetchData(true, retriesLeft - 1);
        }, 1000);
      } else {
        // Fallback to embedded seed data so customer menu is never blank or broken
        setCategories((prev) => (prev.length > 0 ? prev : REAL_RESTAURANT_SEED.categories));
        setItems((prev) => (prev.length > 0 ? prev : REAL_RESTAURANT_SEED.items));
        setRestaurantInfo((prev) => prev || REAL_RESTAURANT_SEED.restaurant);
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // Synchronize view on browser back / forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const isPathAdmin = checkIsAdminPath();
      if (isPathAdmin) {
        setCurrentView('admin');
        const { token, user: cachedUser } = getStoredAuth();
        if (!token || !cachedUser) {
          setIsLoginModalOpen(true);
        }
      } else {
        setCurrentView('customer');
        setIsLoginModalOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Check auth session on startup and check path
  useEffect(() => {
    const { token, user: cachedUser } = getStoredAuth();
    const isPathAdmin = checkIsAdminPath();

    if (token && cachedUser) {
      setUser(cachedUser);
      if (isPathAdmin) {
        setCurrentView('admin');
      }
      api.verifyAuth().then((verifiedUser) => {
        if (verifiedUser) {
          setUser(verifiedUser);
        } else {
          setUser(null);
          if (checkIsAdminPath()) {
            setIsLoginModalOpen(true);
          }
        }
      });
    } else {
      if (isPathAdmin) {
        setCurrentView('admin');
        setIsLoginModalOpen(true);
      }
    }

    fetchData();
  }, [fetchData]);

  // Automatically refetch menu data silently in the background every 60 seconds (no visible loading indicator)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData(true);
    }, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);

  // Handle Logout
  const handleLogout = async () => {
    await api.logout();
    clearStoredAuth();
    setUser(null);
    setCurrentView('customer');
    try {
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
    } catch {}
  };

  // Open Form to Add Item
  const handleAddNewItem = () => {
    setEditingItem(null);
    setIsItemFormModalOpen(true);
  };

  // Open Form to Edit Item
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsItemFormModalOpen(true);
  };

  // After saving item in modal
  const handleItemSaved = () => {
    fetchData(true);
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FBF9F5] p-6 text-[#3c2415]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3c2415] text-[#FAF8F5] shadow-md mb-5">
          <Utensils className="w-6 h-6 text-[#C5A059]" />
        </div>
        <h2 className="font-serif-display text-3xl font-medium tracking-wide text-[#3c2415]">Resto Maeso Aji Barokah</h2>
        <p className="text-xs text-[#8C7B70] mt-2 flex items-center gap-2 tracking-wide font-normal">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B89047]" />
          <span>Memuat buku menu...</span>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#3c2415]">
      {/* Top Navbar: Shown for customer view and unauthorized staff access */}
      {(currentView === 'customer' || !user) && (
        <Navbar
          currentView={currentView}
          user={user}
          restaurantInfo={restaurantInfo}
          onSwitchView={handleSwitchView}
          onLogout={handleLogout}
        />
      )}

      {/* Primary Views */}
      {currentView === 'customer' ? (
        <CustomerMenu
          categories={categories}
          items={items}
          restaurantInfo={restaurantInfo}
        />
      ) : user ? (
        <AdminDashboard
          user={user}
          categories={categories}
          items={items}
          restaurantInfo={restaurantInfo}
          onAddNewItem={handleAddNewItem}
          onEditItem={handleEditItem}
          onRefresh={() => fetchData(true)}
          onViewCustomerMenu={() => handleSwitchView('customer')}
          onOpenQrModal={() => setIsQrModalOpen(true)}
          onLogout={handleLogout}
        />
      ) : (
        /* Unauthenticated access on /admin route - dedicated portal screen */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FBF9F5]">
          <div className="max-w-md w-full rounded-2xl bg-white border border-[#EAE3D6] p-8 shadow-[0_4px_24px_rgba(60,36,21,0.05)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7F2E7] text-[#3c2415] mb-4">
              <Utensils className="w-5 h-5 text-[#B89047]" />
            </div>
            <h3 className="font-serif-display text-2xl font-medium tracking-tight text-[#3c2415]">
              Portal Kasir Resto Maeso Aji Barokah
            </h3>
            <p className="mt-2 text-xs text-[#7A6B60] leading-relaxed">
              Area khusus staf kasir untuk mengelola menu, ketersediaan, dan kategori hidangan.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                id="open-login-prompt-btn"
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full rounded-xl bg-[#3c2415] hover:bg-[#28170d] px-5 py-3 text-xs font-semibold tracking-wide text-white transition-all shadow-xs cursor-pointer"
              >
                Buka Form Login Kasir
              </button>
              <button
                id="back-to-guest-menu-btn"
                onClick={() => handleSwitchView('customer')}
                className="w-full rounded-xl border border-[#DED4C5] bg-[#FAF8F5] px-5 py-2.5 text-xs font-semibold text-[#5C4D42] hover:bg-[#F2ECE1] transition-all cursor-pointer"
              >
                Kembali ke Halaman Utama
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Restaurant Official QR Code Modal */}
      <RestaurantQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        restaurantInfo={restaurantInfo}
      />

      {/* Staff Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          // If closing modal on /admin without logging in, redirect to home ("/")
          if (!user && (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/'))) {
            handleSwitchView('customer');
          }
        }}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setCurrentView('admin');
          setIsLoginModalOpen(false);
          try {
            if (window.location.pathname !== '/admin') {
              window.history.pushState({}, '', '/admin');
            }
          } catch {}
        }}
      />

      {/* Add / Edit Menu Item Modal */}
      <MenuItemFormModal
        isOpen={isItemFormModalOpen}
        onClose={() => setIsItemFormModalOpen(false)}
        categories={categories}
        initialItem={editingItem}
        onSaveSuccess={handleItemSaved}
      />
    </div>
  );
}
