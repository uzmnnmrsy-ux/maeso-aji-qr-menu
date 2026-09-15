import { useState, FormEvent } from 'react';
import { Utensils, Layers, Store, ExternalLink, LogOut, RotateCcw, Check, AlertCircle, QrCode } from 'lucide-react';
import { Category, MenuItem, RestaurantInfo, UserSession } from '../types';
import { MenuManagement } from './MenuManagement';
import { CategoryManagement } from './CategoryManagement';
import { api } from '../services/api';
import { ConfirmationModal } from './ConfirmationModal';

interface AdminDashboardProps {
  user: UserSession;
  categories: Category[];
  items: MenuItem[];
  restaurantInfo: RestaurantInfo | null;
  onAddNewItem: () => void;
  onEditItem: (item: MenuItem) => void;
  onRefresh: () => void;
  onViewCustomerMenu: () => void;
  onOpenQrModal: () => void;
  onLogout: () => void;
}

export function AdminDashboard({
  user,
  categories,
  items,
  restaurantInfo,
  onAddNewItem,
  onEditItem,
  onRefresh,
  onViewCustomerMenu,
  onOpenQrModal,
  onLogout,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'menu' | 'categories' | 'restaurant'>('menu');

  // Restaurant info edit states
  const [restName, setRestName] = useState(restaurantInfo?.name || 'Resto Maeso Aji Barokah');
  const [restTagline, setRestTagline] = useState(restaurantInfo?.tagline || '');
  const [restAddress, setRestAddress] = useState(restaurantInfo?.address || '');
  const [restPhone, setRestPhone] = useState(restaurantInfo?.phone || '');
  const [restHours, setRestHours] = useState(restaurantInfo?.hours || '');
  const [restInstagram, setRestInstagram] = useState(restaurantInfo?.instagram || '');
  const [restFacebook, setRestFacebook] = useState(restaurantInfo?.facebook || '');
  const [isSavingRest, setIsSavingRest] = useState(false);
  const [restMsg, setRestMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  // Reset Demo State
  const [isResetting, setIsResetting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [showResetOption, setShowResetOption] = useState(false);

  const handleSaveRestaurantInfo = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingRest(true);
    setRestMsg(null);
    try {
      await api.updateRestaurantInfo({
        name: restName.trim(),
        tagline: restTagline.trim(),
        address: restAddress.trim(),
        phone: restPhone.trim(),
        hours: restHours.trim(),
        instagram: restInstagram.trim(),
        facebook: restFacebook.trim(),
      });
      setRestMsg({ text: 'Informasi restoran berhasil diperbarui!' });
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui informasi';
      setRestMsg({ text: msg, isError: true });
    } finally {
      setIsSavingRest(false);
    }
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    setRestMsg(null);
    try {
      await api.resetDemoData();
      setIsResetConfirmOpen(false);
      setRestMsg({ text: 'Data menu dan kategori berhasil direset ke menu Resto Maeso Aji Barokah!' });
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mereset data';
      setRestMsg({ text: msg, isError: true });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#3c2415] pb-20">
      {/* Admin Top Header */}
      <header className="bg-[#201108] text-white border-b border-[#3c2415] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
          {/* Row 1: Restaurant Brand & Kasir Identity (Full width on mobile) */}
          <div className="flex items-center justify-between gap-2.5 w-full sm:w-auto min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3c2415] border border-[#5a3a24] text-[#C5A059] shrink-0 shadow-inner">
                <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A059]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <h1
                    className="font-serif-display text-base sm:text-xl font-medium tracking-wide text-white truncate leading-tight"
                    title={restaurantInfo?.name || 'Resto Maeso Aji Barokah'}
                  >
                    {restaurantInfo?.name || 'Resto Maeso Aji Barokah'}
                  </h1>
                  <span className="hidden sm:inline-block rounded-full bg-[#3c2415] border border-[#5a3a24] px-2.5 py-0.5 text-[10px] font-semibold text-[#EADDC9] uppercase tracking-wider shrink-0">
                    Dasbor Kasir
                  </span>
                </div>
                <p className="text-[11px] text-[#A8988C] truncate mt-0.5 leading-none">
                  <span className="sm:hidden font-medium text-[#D8C7B5]">Kasir • Akses Penuh</span>
                  <span className="hidden sm:inline">
                    Masuk sebagai: <strong className="text-white font-medium">{user.name}</strong> • Akses Penuh Kasir
                  </span>
                </p>
              </div>
            </div>

            {/* Mobile badge indicator */}
            <span className="sm:hidden shrink-0 rounded-full bg-[#3c2415] border border-[#5a3a24] px-2 py-0.5 text-[10px] font-semibold text-[#EADDC9] uppercase tracking-wider">
              Kasir
            </span>
          </div>

          {/* Row 2: Quick Header Actions (Dedicated full-width row on mobile, right-aligned on desktop) */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t border-[#301c10]/90 sm:border-0">
            {/* Button 1: QR Code Modal */}
            <button
              id="admin-open-qr-modal-btn"
              onClick={onOpenQrModal}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl sm:rounded-full bg-[#301c10] hover:bg-[#3c2415] border border-[#5a3a24] px-3 sm:px-3.5 py-2 text-xs font-medium text-[#EADDC9] hover:text-white transition-all shadow-xs active:scale-[0.98] cursor-pointer whitespace-nowrap min-h-[38px]"
              title="Buka atau cetak QR Code Menu Restoran"
            >
              <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A059] shrink-0" />
              <span>QR Menu</span>
            </button>

            {/* Button 2: Customer Live Menu */}
            <button
              id="switch-to-customer-menu-btn"
              onClick={onViewCustomerMenu}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl sm:rounded-full bg-[#B89047] hover:bg-[#a67e35] px-3.5 sm:px-4 py-2 text-xs font-semibold text-[#201108] transition-all shadow-xs active:scale-[0.98] cursor-pointer whitespace-nowrap min-h-[38px]"
              title="Buka halaman menu publik pelanggan"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Menu Tamu (Live)</span>
              <span className="sm:hidden">Menu Tamu</span>
            </button>

            {/* Button 3: Logout */}
            <button
              id="admin-logout-btn"
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 rounded-xl sm:rounded-full bg-[#301c10] hover:bg-[#3c2415] border border-[#5a3a24] px-3 py-2 text-xs font-medium text-[#C4B7AC] hover:text-white transition-all shadow-xs active:scale-[0.98] cursor-pointer whitespace-nowrap min-h-[38px] shrink-0"
              title="Keluar dari akun kasir"
            >
              <LogOut className="w-3.5 h-3.5 text-[#A8988C] shrink-0" />
              <span className="text-xs">Keluar</span>
            </button>

            {/* Accessibility / compatibility fallback triggers */}
            <button
              id="nav-go-to-menu-btn"
              onClick={onViewCustomerMenu}
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            >
              Lihat Menu Tamu
            </button>
            <button
              id="nav-logout-btn"
              onClick={onLogout}
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Dashboard Tabs Bar */}
        <div className="bg-[#180d06] border-t border-[#2e180d] px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button
              id="admin-tab-menu"
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-xs font-medium tracking-wide transition-all border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'menu'
                  ? 'border-[#C5A059] text-[#C5A059] font-semibold'
                  : 'border-transparent text-[#9E9084] hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 shrink-0" />
              <span className="sm:hidden">Menu ({items.length})</span>
              <span className="hidden sm:inline">Kelola Menu ({items.length})</span>
            </button>

            <button
              id="admin-tab-categories"
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-xs font-medium tracking-wide transition-all border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'categories'
                  ? 'border-[#C5A059] text-[#C5A059] font-semibold'
                  : 'border-transparent text-[#9E9084] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="sm:hidden">Kategori ({categories.length})</span>
              <span className="hidden sm:inline">Kelola Kategori ({categories.length})</span>
            </button>

            <button
              id="admin-tab-restaurant"
              onClick={() => setActiveTab('restaurant')}
              className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-xs font-medium tracking-wide transition-all border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'restaurant'
                  ? 'border-[#C5A059] text-[#C5A059] font-semibold'
                  : 'border-transparent text-[#9E9084] hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5 shrink-0" />
              <span>Pengaturan & Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* QR Code Quick Access Banner for Staff */}
        <div className="mb-6 rounded-2xl bg-white border border-[#EAE3D6] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_2px_12px_rgba(60,36,21,0.03)]">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="rounded-xl bg-[#F7F2E7] border border-[#E8DFC2] p-2.5 text-[#3c2415] shadow-xs shrink-0">
              <QrCode className="w-5 h-5 text-[#B89047]" />
            </div>
            <div>
              <h3 className="font-serif-display text-base sm:text-lg font-medium text-[#3c2415]">
                QR Code Menu Restoran
              </h3>
              <p className="text-xs text-[#7A6B60] mt-0.5 leading-relaxed">
                Satu QR code untuk seluruh restoran. Buka atau cetak ulang stiker meja / tent card kapan saja.
              </p>
            </div>
          </div>
          <button
            id="dashboard-banner-qr-btn"
            type="button"
            onClick={onOpenQrModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#3c2415] hover:bg-[#28170d] px-4 py-2.5 text-xs font-medium text-white transition-colors shrink-0 w-full sm:w-auto cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#C5A059]" />
            <span>Lihat & Cetak QR Restoran</span>
          </button>
        </div>

        {activeTab === 'menu' && (
          <MenuManagement
            categories={categories}
            items={items}
            onAddNewItem={onAddNewItem}
            onEditItem={onEditItem}
            onRefresh={onRefresh}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryManagement
            categories={categories}
            items={items}
            onRefresh={onRefresh}
          />
        )}

        {activeTab === 'restaurant' && (
          <div className="space-y-6 max-w-3xl">
            {/* Dedicated QR Code Section in Settings */}
            <div className="rounded-2xl bg-white border border-[#EAE3D6] p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="rounded-xl bg-[#F7F2E7] border border-[#E8DFC2] p-3 text-[#B89047] shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif-display text-xl font-medium text-[#3c2415]">
                      Cetak QR Code Menu Restoran
                    </h3>
                    <p className="text-xs text-[#7A6B60] mt-1 max-w-md leading-relaxed">
                      Tampilkan kode QR beresolusi tinggi untuk dicetak ke stiker meja, poster kasir, atau stand akrilik pelanggan.
                    </p>
                  </div>
                </div>
                <button
                  id="settings-open-qr-btn"
                  type="button"
                  onClick={onOpenQrModal}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3c2415] hover:bg-[#28170d] text-white px-5 py-2.5 text-xs font-medium shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[#C5A059]" />
                  <span>Lihat & Cetak QR</span>
                </button>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-[#EAE3D6] p-6 shadow-xs">
              <h3 className="font-serif-display text-2xl font-medium text-[#3c2415] mb-1">
                Informasi Resto
              </h3>
              <p className="text-xs text-[#7A6B60] mb-5">
                Nama dan jam operasional yang tertera di halaman menu tamu.
              </p>

              {restMsg && (
                <div
                  className={`mb-4 rounded-xl p-3.5 text-xs flex items-center gap-2 border ${
                    restMsg.isError
                      ? 'bg-[#FAF4EF] border-[#EBDCCF] text-[#8A5138]'
                      : 'bg-[#F2F8F3] border-[#D1E7D5] text-[#2E7D32]'
                  }`}
                >
                  {restMsg.isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  <span>{restMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveRestaurantInfo} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1">
                    Nama Restoran
                  </label>
                  <input
                    id="rest-name-input"
                    type="text"
                    required
                    value={restName}
                    onChange={(e) => setRestName(e.target.value)}
                    className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] px-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1">
                    Slogan / Tagline
                  </label>
                  <input
                    id="rest-tagline-input"
                    type="text"
                    value={restTagline}
                    onChange={(e) => setRestTagline(e.target.value)}
                    className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] px-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      id="rest-phone-input"
                      type="text"
                      value={restPhone}
                      onChange={(e) => setRestPhone(e.target.value)}
                      className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] px-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1">
                      Jam Buka
                    </label>
                    <input
                      id="rest-hours-input"
                      type="text"
                      value={restHours}
                      onChange={(e) => setRestHours(e.target.value)}
                      className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] px-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1">
                    Alamat Lengkap
                  </label>
                  <input
                    id="rest-address-input"
                    type="text"
                    value={restAddress}
                    onChange={(e) => setRestAddress(e.target.value)}
                    className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] px-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1">
                      Instagram
                    </label>
                    <input
                      id="rest-instagram-input"
                      type="text"
                      value={restInstagram}
                      onChange={(e) => setRestInstagram(e.target.value)}
                      placeholder="@maeso_ajiresto"
                      className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] px-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1">
                      Facebook
                    </label>
                    <input
                      id="rest-facebook-input"
                      type="text"
                      value={restFacebook}
                      onChange={(e) => setRestFacebook(e.target.value)}
                      placeholder="Resto Maeso Aji Barokah"
                      className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] px-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    id="save-restaurant-info-btn"
                    type="submit"
                    disabled={isSavingRest}
                    className="rounded-xl bg-[#3c2415] hover:bg-[#28170d] px-6 py-2.5 text-xs font-semibold tracking-wide text-white disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingRest ? 'Menyimpan...' : 'Perbarui Info Restoran'}
                  </button>
                </div>
              </form>
            </div>

            {/* Reset Demo Data Card */}
            <div className="rounded-2xl bg-white border border-[#EAE3D6] p-6 shadow-xs">
              <h3 className="font-serif-display text-xl font-medium text-[#3c2415] mb-1">
                Setel Ulang Data Menu Demo
              </h3>
              <p className="text-xs text-[#7A6B60] mb-4 leading-relaxed">
                Kembalikan semua daftar menu dan kategori ke hidangan awal Resto Maeso Aji Barokah lengkap dengan varian menu sop, asem-asem, nasi gandul, rawon, dan bakaran.
              </p>

              {!showResetOption ? (
                <button
                  id="show-reset-option-btn"
                  type="button"
                  onClick={() => setShowResetOption(true)}
                  className="rounded-xl border border-[#DDD3C4] bg-[#FAF8F5] px-4 py-2 text-xs font-medium text-[#8A7A6E] hover:text-[#3c2415] hover:bg-[#F2ECE3] transition-colors cursor-pointer"
                >
                  Tampilkan Opsi Reset (Berbahaya)
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      id="reset-demo-data-btn"
                      type="button"
                      onClick={() => setIsResetConfirmOpen(true)}
                      disabled={isResetting}
                      className="flex items-center gap-2 rounded-xl bg-[#FAF4EF] border border-[#EBDCCF] px-4 py-2.5 text-xs font-semibold text-[#A64B2A] hover:bg-[#F5E8E0] transition-colors cursor-pointer"
                    >
                      <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                      <span>{isResetting ? 'Mereset Data...' : 'Reset ke Data Awal Resto Maeso Aji Barokah'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowResetOption(false)}
                      className="text-xs text-[#8A7A6E] hover:text-[#5C4D42] underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Sembunyikan Opsi Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal for Resetting Demo Data */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        onClose={() => {
          if (!isResetting) setIsResetConfirmOpen(false);
        }}
        onConfirm={handleConfirmReset}
        title="Konfirmasi Reset Data"
        message="PERINGATAN: Semua foto dan data menu yang sudah diedit akan HILANG dan kembali ke data contoh awal. Tindakan ini TIDAK BISA DIBATALKAN."
        subtitle="Pastikan Anda benar-benar yakin sebelum melanjutkan proses ini."
        confirmText="Ya, Reset Data"
        cancelText="Batal"
        isLoading={isResetting}
        variant="danger"
        idPrefix="reset-data-modal"
        requiredConfirmationText="RESET"
        confirmationInputPlaceholder="Ketik RESET"
      />
    </div>
  );
}
