import { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Utensils, X, Flame } from 'lucide-react';
import { Category, MenuItem } from '../types';
import { api } from '../services/api';
import { formatRupiah, getPortionBadge } from '../utils/formatters';
import { ConfirmationModal } from './ConfirmationModal';

interface MenuManagementProps {
  categories: Category[];
  items: MenuItem[];
  onAddNewItem: () => void;
  onEditItem: (item: MenuItem) => void;
  onRefresh: () => void;
}

export function MenuManagement({
  categories,
  items,
  onAddNewItem,
  onEditItem,
  onRefresh,
}: MenuManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'soldout'>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ text: string; isError?: boolean } | null>(null);

  // Quick stats
  const totalItems = items.length;
  const availableCount = items.filter((i) => i.isAvailable).length;
  const soldOutCount = items.filter((i) => !i.isAvailable).length;

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }
      // Availability filter
      if (availabilityFilter === 'available' && !item.isAvailable) return false;
      if (availabilityFilter === 'soldout' && item.isAvailable) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        return matchesName || matchesDesc;
      }
      return true;
    });
  }, [items, selectedCategory, availabilityFilter, searchQuery]);

  // Instant Availability Toggle
  const handleToggleAvailability = async (item: MenuItem) => {
    setTogglingId(item.id);
    setActionNotice(null);
    try {
      const res = await api.toggleAvailability(item.id);
      const newStatus = res.isAvailable ? 'Tersedia' : 'Habis (Sold Out)';
      setActionNotice({
        text: `Status menu "${item.name}" diubah menjadi ${newStatus}.`,
      });
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status ketersediaan';
      setActionNotice({ text: msg, isError: true });
    } finally {
      setTogglingId(null);
    }
  };

  // Delete item handler - opens custom confirmation modal
  const handleDeleteItem = (item: MenuItem) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setActionNotice(null);
    try {
      await api.deleteMenuItem(itemToDelete.id);
      setActionNotice({ text: `Menu "${itemToDelete.name}" berhasil dihapus.` });
      setItemToDelete(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus menu';
      setActionNotice({ text: msg, isError: true });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif-display text-2xl sm:text-3xl font-medium text-[#3c2415]">
            Daftar Hidangan & Menu
          </h3>
          <p className="text-xs sm:text-sm text-[#7A6B60] mt-0.5">
            Kelola harga, foto, deskripsi, dan ubah status ketersediaan menu secara langsung.
          </p>
        </div>

        <button
          id="admin-add-menu-item-btn"
          onClick={onAddNewItem}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#3c2415] hover:bg-[#28170d] px-4 py-2.5 text-xs font-semibold tracking-wide text-white transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-[#EAE3D6] p-4 shadow-xs">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-[#8A7A6E] block">
            Total Menu
          </span>
          <span className="font-serif-display text-2xl font-medium text-[#3c2415] mt-0.5 block">
            {totalItems}
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#D1E7D5] p-4 shadow-xs">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-[#2E7D32] block">
            Menu Tersedia
          </span>
          <span className="font-serif-display text-2xl font-medium text-[#2E7D32] mt-0.5 block">
            {availableCount}
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-[#EBDCCF] p-4 shadow-xs">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-[#8A5138] block">
            Menu Habis
          </span>
          <span className="font-serif-display text-2xl font-medium text-[#8A5138] mt-0.5 block">
            {soldOutCount}
          </span>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div
          className={`rounded-xl p-3.5 text-xs flex items-center justify-between border ${
            actionNotice.isError
              ? 'bg-[#FAF4EF] border-[#EBDCCF] text-[#8A5138]'
              : 'bg-[#F2F8F3] border-[#D1E7D5] text-[#2E7D32]'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B85D36]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E7D32]" />
            )}
            <span>{actionNotice.text}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between bg-white border border-[#EAE3D6] p-3 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8988C]" />
          <input
            id="admin-search-menu-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama menu atau bumbu..."
            className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] pl-9 pr-3.5 py-2 text-xs text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Category Filter */}
          <select
            id="admin-filter-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] px-3 py-2 text-xs text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047] cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Availability Status Filter */}
          <select
            id="admin-filter-availability-select"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available' | 'soldout')}
            className="rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] px-3 py-2 text-xs text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047] cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="available">Hanya Tersedia</option>
            <option value="soldout">Hanya Habis</option>
          </select>
        </div>
      </div>

      {/* Menu Table */}
      <div className="rounded-2xl bg-white border border-[#EAE3D6] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#EAE3D6] text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A7A6E]">
              <tr>
                <th className="py-3.5 px-4 w-20">Foto</th>
                <th className="py-3.5 px-4">Nama Menu & Info</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Kategori</th>
                <th className="py-3.5 px-4">Harga</th>
                <th className="py-3.5 px-4 text-center">Ketersediaan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE3]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#8A7A6E]">
                    Tidak ada menu yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const cat = categories.find((c) => c.id === item.categoryId);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#FAF8F5] transition-colors ${
                        !item.isAvailable ? 'bg-[#FAF6F2]/60' : ''
                      }`}
                    >
                      {/* Photo Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="h-14 w-14 rounded-xl overflow-hidden bg-[#F4EFEA] border border-[#EAE3D6] relative flex items-center justify-center text-[#BAABA0]">
                          <Utensils className="w-5 h-5 text-[#C7B9A9]" />
                          {item.imageUrl?.trim() && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className={`absolute inset-0 h-full w-full object-cover ${
                                !item.isAvailable ? 'grayscale contrast-110' : ''
                              }`}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      </td>

                      {/* Name & Description */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-serif-display font-medium text-[#3c2415] text-base">
                            {item.name}
                          </span>
                          {(() => {
                            const pb = getPortionBadge(item.name, item.tags);
                            if (!pb) return null;
                            return (
                              <span className="rounded-full border border-[#DED4C5] bg-[#FAF8F5] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#735F50]">
                                {pb === 'kecil' ? 'Porsi Kecil' : 'Porsi Besar'}
                              </span>
                            );
                          })()}
                          {item.isFeatured && (
                            <span className="rounded-full bg-[#FAF8F5] border border-[#C5A059]/40 px-2 py-0.5 text-[9px] font-medium text-[#B89047]">
                              ★ Rekomendasi
                            </span>
                          )}
                          {item.spiceLevel !== undefined && item.spiceLevel > 0 && (
                            <span className="inline-flex items-center text-[10px] text-[#B89047]">
                              <Flame className="w-3 h-3 fill-current" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#7A6B60] line-clamp-1 mt-0.5 font-light">
                          {item.description}
                        </p>
                        <span className="sm:hidden inline-block text-[10px] font-semibold uppercase tracking-wider text-[#B89047] mt-0.5">
                          {cat?.name || '-'}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 hidden sm:table-cell text-xs text-[#6B5A4E]">
                        <span className="rounded-md bg-[#FAF8F5] border border-[#EAE3D6] px-2.5 py-1 text-xs">
                          {cat?.name || '-'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-xs sm:text-sm font-serif-display font-medium text-[#3c2415] whitespace-nowrap">
                        {formatRupiah(item.price)}
                      </td>

                      {/* Availability Toggle Switch */}
                      <td className="py-3 px-4 text-center">
                        <button
                          id={`toggle-item-status-${item.id}`}
                          disabled={togglingId === item.id}
                          onClick={() => handleToggleAvailability(item)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                            item.isAvailable
                              ? 'bg-[#F2F8F3] text-[#2E7D32] border border-[#D1E7D5] hover:bg-[#E2F0E5]'
                              : 'bg-[#FAF4EF] text-[#8A5138] border border-[#EBDCCF] hover:bg-[#F2E5D8]'
                          }`}
                          title="Klik untuk ubah status ketersediaan"
                        >
                          {togglingId === item.id ? (
                            <span className="animate-pulse">Menyimpan...</span>
                          ) : item.isAvailable ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                              <span>Tersedia</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-[#8A5138]" />
                              <span>Habis</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions (Edit / Delete) */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`edit-item-btn-${item.id}`}
                            onClick={() => onEditItem(item)}
                            className="rounded-lg p-1.5 text-[#6B5A4E] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
                            title="Edit menu"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-item-btn-${item.id}`}
                            disabled={isDeleting && itemToDelete?.id === item.id}
                            onClick={() => handleDeleteItem(item)}
                            className="rounded-lg p-1.5 text-[#A64B2A] hover:bg-[#FAF4EF] transition-colors disabled:opacity-50 cursor-pointer"
                            title="Hapus menu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Confirmation Modal for Menu Item Deletion */}
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => {
          if (!isDeleting) setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Menu"
        message={
          <span>
            Apakah Anda yakin ingin menghapus menu{' '}
            <strong className="font-bold text-[#2A2421]">"{itemToDelete?.name}"</strong>?
          </span>
        }
        subtitle="Tindakan ini akan menghapus hidangan secara permanen dari daftar menu restoran."
        confirmText="Hapus"
        cancelText="Batal"
        isLoading={isDeleting}
        variant="danger"
        idPrefix="delete-menu-item-modal"
      />
    </div>
  );
}
