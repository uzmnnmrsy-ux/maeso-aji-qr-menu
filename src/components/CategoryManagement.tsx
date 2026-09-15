import { useState, FormEvent } from 'react';
import { Plus, Edit2, Trash2, Layers, AlertCircle, Check } from 'lucide-react';
import { Category, MenuItem } from '../types';
import { api } from '../services/api';
import { ConfirmationModal } from './ConfirmationModal';

interface CategoryManagementProps {
  categories: Category[];
  items: MenuItem[];
  onRefresh: () => void;
}

export function CategoryManagement({ categories, items, onRefresh }: CategoryManagementProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const startCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setErrorMsg('');
    setSuccessMsg('');
    setIsCreating(true);
  };

  const startEdit = (cat: Category) => {
    setIsCreating(false);
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingCategory(null);
    setName('');
    setDescription('');
    setErrorMsg('');
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama kategori tidak boleh kosong.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
        });
        setSuccessMsg(`Kategori "${name}" berhasil diperbarui.`);
      } else {
        await api.createCategory({
          name: name.trim(),
          description: description.trim(),
        });
        setSuccessMsg(`Kategori baru "${name}" berhasil ditambahkan.`);
      }
      cancelForm();
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan kategori';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (cat: Category) => {
    const count = items.filter((i) => i.categoryId === cat.id).length;
    if (count > 0) {
      setErrorMsg(
        `Kategori "${cat.name}" tidak dapat dihapus karena masih digunakan oleh ${count} menu. Pindahkan atau hapus menu tersebut terlebih dahulu.`
      );
      return;
    }

    setErrorMsg('');
    setCategoryToDelete(cat);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    setErrorMsg('');
    try {
      await api.deleteCategory(categoryToDelete.id);
      setSuccessMsg(`Kategori "${categoryToDelete.name}" berhasil dihapus.`);
      setCategoryToDelete(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus kategori';
      setErrorMsg(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif-display text-2xl sm:text-3xl font-medium text-[#3c2415]">
            Kelola Kategori Menu
          </h3>
          <p className="text-xs sm:text-sm text-[#7A6B60] mt-0.5">
            Atur pengelompokan menu restoran untuk mempermudah tamu saat memilih hidangan.
          </p>
        </div>
        {!isCreating && !editingCategory && (
          <button
            id="add-new-category-btn"
            onClick={startCreate}
            className="flex items-center gap-2 rounded-xl bg-[#3c2415] hover:bg-[#28170d] px-4 py-2.5 text-xs font-semibold tracking-wide text-white transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            <span>Tambah Kategori Baru</span>
          </button>
        )}
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="rounded-xl bg-[#FAF4EF] border border-[#EBDCCF] p-3.5 text-xs text-[#8A5138] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#B85D36]" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl bg-[#F2F8F3] border border-[#D1E7D5] p-3.5 text-xs text-[#2E7D32] flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-[#2E7D32]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add / Edit Form Drawer */}
      {(isCreating || editingCategory) && (
        <div className="rounded-2xl bg-white border border-[#EAE3D6] p-6 shadow-xs animate-in fade-in duration-150">
          <h4 className="font-serif-display text-xl font-medium text-[#3c2415] mb-3">
            {editingCategory ? `Edit Kategori: ${editingCategory.name}` : 'Tambah Kategori Baru'}
          </h4>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1">
                Nama Kategori *
              </label>
              <input
                id="category-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth. Hidangan Utama, Minuman Tradisional, Camilan"
                className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] px-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1">
                Deskripsi Singkat (Opsional)
              </label>
              <input
                id="category-desc-input"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="cth. Aneka olahan sop, rawon rempah gurih, dan bakaran khas Resto Maeso Aji Barokah"
                className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] px-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                id="cancel-category-btn"
                onClick={cancelForm}
                className="rounded-xl border border-[#DDD3C4] bg-[#FAF8F5] px-4 py-2 text-xs font-medium text-[#6B5A4E] hover:bg-[#F2ECE3] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                id="submit-category-btn"
                disabled={isLoading}
                className="rounded-xl bg-[#3c2415] hover:bg-[#28170d] px-5 py-2 text-xs font-semibold tracking-wide text-white disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isLoading ? 'Menyimpan...' : editingCategory ? 'Perbarui Kategori' : 'Simpan Kategori'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table / List */}
      <div className="rounded-2xl bg-white border border-[#EAE3D6] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#EAE3D6] text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8A7A6E]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Urutan</th>
                <th className="py-3.5 px-4">Nama Kategori</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Deskripsi</th>
                <th className="py-3.5 px-4 text-center">Jumlah Menu</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE3]">
              {categories.map((cat, index) => {
                const itemCount = items.filter((i) => i.categoryId === cat.id).length;
                return (
                  <tr key={cat.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4 text-center font-medium text-xs text-[#8A7A6E]">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-serif-display text-base font-medium text-[#3c2415]">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#B89047]" />
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#7A6B60] hidden md:table-cell max-w-xs truncate font-light">
                      {cat.description || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block rounded-full bg-[#FAF8F5] border border-[#EAE3D6] px-2.5 py-0.5 text-xs font-medium text-[#6B5A4E]">
                        {itemCount} item
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`edit-cat-btn-${cat.id}`}
                          onClick={() => startEdit(cat)}
                          className="rounded-lg p-1.5 text-[#6B5A4E] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
                          title="Edit kategori"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-cat-btn-${cat.id}`}
                          disabled={isDeleting && categoryToDelete?.id === cat.id}
                          onClick={() => handleDelete(cat)}
                          className="rounded-lg p-1.5 text-[#A64B2A] hover:bg-[#FAF4EF] transition-colors disabled:opacity-50 cursor-pointer"
                          title="Hapus kategori"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Confirmation Modal for Category Deletion */}
      <ConfirmationModal
        isOpen={!!categoryToDelete}
        onClose={() => {
          if (!isDeleting) setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori"
        message={
          <span>
            Apakah Anda yakin ingin menghapus kategori{' '}
            <strong className="font-bold text-[#2A2421]">"{categoryToDelete?.name}"</strong>?
          </span>
        }
        subtitle="Tindakan ini akan menghapus kategori ini dari daftar kategori restoran."
        confirmText="Hapus"
        cancelText="Batal"
        isLoading={isDeleting}
        variant="danger"
        idPrefix="delete-category-modal"
      />
    </div>
  );
}
