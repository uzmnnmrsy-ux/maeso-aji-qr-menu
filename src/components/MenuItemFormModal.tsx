import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Flame,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Images,
  RotateCw,
  Loader2,
} from 'lucide-react';
import { Category, MenuItem, PortionVariant } from '../types';
import { api, StoragePhotoItem } from '../services/api';
import { formatRupiah } from '../utils/formatters';
import { compressAndResizeImage } from '../utils/imageCompression';

interface MenuItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialItem?: MenuItem | null;
  onSaveSuccess: (savedItem: MenuItem) => void;
}

export function MenuItemFormModal({
  isOpen,
  onClose,
  categories,
  initialItem,
  onSaveSuccess,
}: MenuItemFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>(35000);
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState(0);
  const [tagsInput, setTagsInput] = useState('');
  const [enableVariants, setEnableVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<PortionVariant[]>([
    { label: 'Kecil', price: 20000 },
    { label: 'Besar', price: 30000 },
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showStoragePhotos, setShowStoragePhotos] = useState(false);
  const [storagePhotos, setStoragePhotos] = useState<StoragePhotoItem[]>([]);
  const [isLoadingStorage, setIsLoadingStorage] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [hasLoadedStorageOnce, setHasLoadedStorageOnce] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setDescription(initialItem.description || '');
      setPrice(initialItem.price);
      setCategoryId(initialItem.categoryId);
      setImageUrl(initialItem.imageUrl || '');
      setIsAvailable(initialItem.isAvailable);
      setIsFeatured(!!initialItem.isFeatured);
      setSpiceLevel(initialItem.spiceLevel || 0);
      setTagsInput(initialItem.tags ? initialItem.tags.join(', ') : '');
      if (initialItem.variants && initialItem.variants.length > 0) {
        setEnableVariants(true);
        setVariantsList(initialItem.variants.map((v) => ({ label: v.label, price: v.price })));
      } else {
        setEnableVariants(false);
        setVariantsList([
          { label: 'Kecil', price: initialItem.price },
          { label: 'Besar', price: initialItem.price + 10000 },
        ]);
      }
    } else {
      setName('');
      setDescription('');
      setPrice(35000);
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setImageUrl('');
      setIsAvailable(true);
      setIsFeatured(false);
      setSpiceLevel(0);
      setTagsInput('');
      setEnableVariants(false);
      setVariantsList([
        { label: 'Kecil', price: 20000 },
        { label: 'Besar', price: 30000 },
      ]);
    }
    setErrorMsg('');
    setShowStoragePhotos(false);
  }, [initialItem, categories, isOpen]);

  // Escape key handler to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const loadStoragePhotos = async (force = false) => {
    if (!force && hasLoadedStorageOnce && storagePhotos.length > 0) return;
    setIsLoadingStorage(true);
    setStorageError('');
    try {
      const photos = await api.getStorageMenuPhotos();
      setStoragePhotos(photos);
      setHasLoadedStorageOnce(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat foto tersimpan';
      setStorageError(msg);
    } finally {
      setIsLoadingStorage(false);
    }
  };

  const handleToggleStoragePhotos = () => {
    const nextState = !showStoragePhotos;
    setShowStoragePhotos(nextState);
    if (nextState) {
      loadStoragePhotos();
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsUploading(true);
    try {
      // Compress and resize image to max width 1000px, JPEG ~80% before uploading
      const optimizedFile = await compressAndResizeImage(file, 1000, 0.8);
      const res = await api.uploadPhoto(optimizedFile);
      const uploadedUrl = res.imageUrl || res.url;
      setImageUrl(uploadedUrl);

      // Prepend newly uploaded photo into storagePhotos list so it is immediately visible
      setStoragePhotos((prev) => [
        {
          name: res.filename || 'Foto Baru',
          url: uploadedUrl,
          createdAt: new Date().toISOString(),
        },
        ...prev.filter((p) => p.url !== uploadedUrl),
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah foto';
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama menu wajib diisi.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg('Harga harus berupa angka valid (minimal Rp 0).');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Kategori wajib dipilih.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    let finalVariants: PortionVariant[] | undefined = undefined;
    let effectivePrice = numPrice;

    if (enableVariants) {
      const filtered = variantsList.filter((v) => v.label.trim().length > 0);
      if (filtered.length < 2) {
        setErrorMsg('Jika mengaktifkan varian porsi, buat minimal 2 pilihan porsi (cth: Kecil dan Besar).');
        return;
      }
      for (const v of filtered) {
        if (isNaN(Number(v.price)) || Number(v.price) < 0) {
          setErrorMsg(`Harga porsi "${v.label}" harus berupa angka valid.`);
          return;
        }
      }
      finalVariants = filtered.map((v) => ({ label: v.label.trim(), price: Number(v.price) }));
      // Set base price to the first variant's price
      if (finalVariants.length > 0) {
        effectivePrice = finalVariants[0].price;
      }
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      if (initialItem) {
        // Update
        const updated = await api.updateMenuItem(initialItem.id, {
          name: name.trim(),
          description: description.trim(),
          price: effectivePrice,
          categoryId,
          imageUrl: imageUrl.trim(),
          isAvailable,
          isFeatured,
          spiceLevel,
          tags,
          variants: finalVariants,
        });
        onSaveSuccess(updated);
      } else {
        // Create
        const created = await api.createMenuItem({
          name: name.trim(),
          description: description.trim(),
          price: effectivePrice,
          categoryId,
          imageUrl: imageUrl.trim(),
          isAvailable,
          isFeatured,
          spiceLevel,
          tags,
          variants: finalVariants,
        });
        onSaveSuccess(created);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan menu';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="menu-item-form-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="menu-item-form-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#FAF8F5] border border-[#EAE3D6] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-[#3c2415]"
      >
        {/* Modal Header - Pinned at top */}
        <div className="shrink-0 flex items-center justify-between p-5 sm:px-7 sm:py-4 border-b border-[#EAE3D6] bg-[#FAF8F5]">
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-[0.15em] text-[#B89047]">
              {initialItem ? 'Edit Hidangan' : 'Tambah Hidangan Baru'}
            </span>
            <h2 className="font-serif-display text-2xl font-medium text-[#3c2415]">
              {initialItem ? initialItem.name : 'Formulir Menu Restoran'}
            </h2>
          </div>
          <button
            id="close-menu-form-btn"
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#7A6B60] hover:bg-[#F2ECE3] hover:text-[#3c2415] transition-colors cursor-pointer"
            aria-label="Tutup formulir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form with scrollable body & pinned footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-5 overscroll-contain">
            {/* Error Alert */}
            {errorMsg && (
              <div className="rounded-xl bg-[#FAF4EF] border border-[#EBDCCF] p-3.5 text-xs text-[#8A5138] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#B85D36]" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Row 1: Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1.5">
                  Nama Menu Hidangan *
                </label>
                <input
                  id="menu-form-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="cth. Sop Daging Iga Rempah"
                  className="w-full rounded-xl bg-white border border-[#DDD3C4] px-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1.5">
                  Kategori Menu *
                </label>
                <select
                  id="menu-form-category-select"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl bg-white border border-[#DDD3C4] px-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047] cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Price & Availability Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1.5">
                  Harga (Rupiah) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8A7A6E]">
                    Rp
                  </span>
                  <input
                    id="menu-form-price-input"
                    type="number"
                    required
                    min="0"
                    step="500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl bg-white border border-[#DDD3C4] pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
                  />
                </div>
                <p className="text-[11px] text-[#8A7A6E] mt-1">
                  Tampilan format: <span className="font-serif-display font-medium text-[#3c2415]">{formatRupiah(Number(price) || 0)}</span>
                </p>
              </div>

              {/* Availability Status Switch */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1.5">
                  Status Ketersediaan
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    id="toggle-form-availability-btn"
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isAvailable ? 'bg-[#2E7D32]' : 'bg-[#A64B2A]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        isAvailable ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isAvailable ? 'text-[#2E7D32]' : 'text-[#A64B2A]'
                    }`}
                  >
                    {isAvailable ? 'Tersedia untuk Dipesan' : 'Habis / Sold Out'}
                  </span>
                </div>
                <p className="text-[11px] text-[#8A7A6E] mt-1">
                  Jika 'Habis', menu akan muncul berlabel "Habis" di halaman tamu.
                </p>
              </div>
            </div>

            {/* Portion Variants Configuration */}
            <div className="rounded-2xl bg-white border border-[#DDD3C4] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B5A4E]">
                    Varian Ukuran Porsi (Kecil / Besar)
                  </h3>
                  <p className="text-[11px] text-[#8A7A6E]">
                    Aktifkan jika menu ini memiliki opsi ukuran porsi dengan harga berbeda dalam 1 kartu menu.
                  </p>
                </div>
                <button
                  type="button"
                  id="toggle-enable-variants-btn"
                  onClick={() => {
                    const next = !enableVariants;
                    setEnableVariants(next);
                    if (next && variantsList.length === 0) {
                      setVariantsList([
                        { label: 'Kecil', price: Number(price) || 20000 },
                        { label: 'Besar', price: (Number(price) || 20000) + 10000 },
                      ]);
                    }
                  }}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    enableVariants ? 'bg-[#B89047]' : 'bg-[#D6CDC2]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      enableVariants ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {enableVariants && (
                <div className="pt-3 border-t border-[#F0EAE1] space-y-2.5">
                  <div className="space-y-2">
                    {variantsList.map((variant, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1/3">
                          <input
                            type="text"
                            placeholder="Nama Porsi (cth. Kecil)"
                            value={variant.label}
                            onChange={(e) => {
                              const updated = [...variantsList];
                              updated[index] = { ...updated[index], label: e.target.value };
                              setVariantsList(updated);
                            }}
                            className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] px-3 py-2 text-xs font-medium text-[#3c2415] focus:outline-none focus:ring-1 focus:ring-[#B89047]"
                          />
                        </div>
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8A7A6E]">
                            Rp
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="500"
                            placeholder="Harga"
                            value={variant.price}
                            onChange={(e) => {
                              const updated = [...variantsList];
                              updated[index] = { ...updated[index], price: Number(e.target.value) || 0 };
                              setVariantsList(updated);
                            }}
                            className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] pl-9 pr-3 py-2 text-xs font-medium text-[#3c2415] focus:outline-none focus:ring-1 focus:ring-[#B89047]"
                          />
                        </div>
                        {variantsList.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              setVariantsList(variantsList.filter((_, i) => i !== index));
                            }}
                            className="p-2 text-[#A8988C] hover:text-[#A64B2A] transition-colors rounded-lg hover:bg-[#FAF4EF] cursor-pointer"
                            title="Hapus varian porsi ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setVariantsList([...variantsList, { label: 'Jumbo', price: (Number(price) || 20000) + 15000 }]);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B89047] hover:text-[#3c2415] transition-colors pt-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Opsi Ukuran Porsi</span>
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1.5">
                Deskripsi Rasa & Rempah
              </label>
              <textarea
                id="menu-form-desc-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan bumbu, aroma, atau kekhasan sajian ini..."
                className="w-full rounded-xl bg-white border border-[#DDD3C4] p-3 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
              />
            </div>

            {/* Photo Management Section */}
            <div className="rounded-2xl bg-white border border-[#EAE3D6] p-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-2">
                Foto Hidangan
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Image Preview Box */}
                <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-[#EAE3D6] bg-[#FAF8F5]">
                  {imageUrl ? (
                    <div className="relative h-full w-full group">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        title="Hapus foto hidangan ini"
                        className="absolute top-1 right-1 rounded-full bg-black/65 hover:bg-black/85 text-white p-1 transition-colors cursor-pointer"
                        aria-label="Hapus foto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full w-full items-center justify-center p-2 text-center bg-[#F4EFEA]">
                      <ImageIcon className="w-7 h-7 text-[#DDD3C4] mb-1" />
                      <span className="text-[10px] font-medium text-[#8C7B70]">Belum ada foto</span>
                    </div>
                  )}
                </div>

                {/* Upload & Storage Controls */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* File Upload Button */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      id="trigger-file-upload-btn"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] px-3.5 py-2 text-xs font-medium text-[#3c2415] hover:bg-[#F2ECE3] transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#B89047]" />
                      <span>{isUploading ? 'Mengompres & Mengunggah...' : 'Unggah Foto dari Perangkat'}</span>
                    </button>

                    {/* Storage Photos Toggle */}
                    <button
                      type="button"
                      id="toggle-storage-photos-btn"
                      onClick={handleToggleStoragePhotos}
                      className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        showStoragePhotos
                          ? 'bg-[#3c2415] text-[#FAF8F5] border-[#3c2415] shadow-xs font-semibold'
                          : 'bg-white border-[#DDD3C4] text-[#3c2415] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <Images className={`w-3.5 h-3.5 ${showStoragePhotos ? 'text-[#D4AF37]' : 'text-[#B89047]'}`} />
                      <span>{showStoragePhotos ? 'Tutup Foto Tersimpan' : 'Pilih dari Foto Tersimpan'}</span>
                      {storagePhotos.length > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            showStoragePhotos ? 'bg-white/20 text-white' : 'bg-[#F2ECE3] text-[#735F50]'
                          }`}
                        >
                          {storagePhotos.length}
                        </span>
                      )}
                    </button>

                    {/* Clear/Delete Selected Photo Button */}
                    {imageUrl && (
                      <button
                        type="button"
                        id="clear-selected-photo-btn"
                        onClick={() => setImageUrl('')}
                        className="flex items-center gap-1.5 rounded-xl border border-[#EBDCCF] bg-[#FAF4EF] hover:bg-[#F5E6D8] px-3.5 py-2 text-xs font-medium text-[#B85D36] transition-colors cursor-pointer"
                        title="Kosongkan foto menu ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Foto</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8A7A6E] font-light">
                    Foto dari perangkat otomatis dioptimasi & dikompresi (maks. lebar 1000px, JPEG 80%) agar hemat penyimpanan dan cepat dimuat. Jika tanpa foto, menu akan menampilkan placeholder ikon hidangan.
                  </p>
                </div>
              </div>

              {/* Storage Photos Drawer */}
              {showStoragePhotos && (
                <div className="mt-4 pt-4 border-t border-[#EAE3D6] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-[#3c2415]">
                          Foto Tersimpan di Cloud Storage
                        </h4>
                        <span className="inline-flex items-center rounded-full bg-[#F5EFEB] px-2 py-0.5 text-[10px] font-medium text-[#735F50] border border-[#E5DACD]">
                          bucket: menu-photos
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8A7A6E]">
                        Klik salah satu foto yang pernah diunggah untuk langsung digunakan pada menu ini.
                      </p>
                    </div>

                    <button
                      type="button"
                      id="refresh-storage-photos-btn"
                      onClick={() => loadStoragePhotos(true)}
                      disabled={isLoadingStorage}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B89047] hover:text-[#3c2415] transition-colors p-1.5 rounded-lg hover:bg-[#F2ECE3] cursor-pointer"
                      title="Segarkan daftar foto storage"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isLoadingStorage ? 'animate-spin' : ''}`} />
                      <span>Segarkan</span>
                    </button>
                  </div>

                  {isLoadingStorage ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#8A7A6E]">
                      <Loader2 className="w-6 h-6 animate-spin text-[#B89047]" />
                      <span className="text-xs">Memuat foto dari Supabase Storage...</span>
                    </div>
                  ) : storageError ? (
                    <div className="rounded-xl bg-[#FAF4EF] border border-[#EBDCCF] p-3 text-xs text-[#8A5138] flex items-center justify-between">
                      <span>{storageError}</span>
                      <button
                        type="button"
                        onClick={() => loadStoragePhotos(true)}
                        className="font-medium text-[#B85D36] underline hover:text-[#3c2415] ml-2 cursor-pointer"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  ) : storagePhotos.length === 0 ? (
                    <div className="py-6 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#DDD3C4]">
                      <ImageIcon className="w-8 h-8 mx-auto text-[#C7BCAD] mb-1.5" />
                      <p className="text-xs font-medium text-[#6B5A4E]">Belum ada foto yang tersimpan</p>
                      <p className="text-[11px] text-[#8A7A6E] mt-0.5">
                        Unggah foto dari perangkat untuk menyimpannya ke Supabase Storage.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-52 overflow-y-auto p-1 no-scrollbar">
                      {storagePhotos.map((photo, idx) => {
                        const isSelected = imageUrl === photo.url;
                        return (
                          <button
                            key={photo.name || idx}
                            type="button"
                            onClick={() => {
                              setImageUrl(photo.url);
                              setShowStoragePhotos(false);
                            }}
                            className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all cursor-pointer bg-[#F5F0E9] ${
                              isSelected
                                ? 'border-[#3c2415] ring-2 ring-[#B89047]/50 shadow-sm'
                                : 'border-[#EAE3D6] hover:border-[#B89047]'
                            }`}
                            title={photo.name}
                          >
                            <img
                              src={photo.url}
                              alt={photo.name}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#3c2415]/50 flex items-center justify-center backdrop-blur-xs">
                                <Check className="w-5 h-5 text-[#D4AF37] drop-shadow-md stroke-[2.5]" />
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-[9px] text-white truncate text-center font-mono">
                                {photo.name.replace(/^menu-/, '').slice(0, 15)}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Row 3: Spice Level & Recommendations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1.5">
                  Tingkat Kepedasan
                </label>
                <div className="flex gap-1.5">
                  {[
                    { level: 0, label: 'Tidak Pedas' },
                    { level: 1, label: 'Sedang' },
                    { level: 2, label: 'Pedas' },
                    { level: 3, label: 'Ekstra' },
                  ].map((s) => (
                    <button
                      key={s.level}
                      type="button"
                      onClick={() => setSpiceLevel(s.level)}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium border transition-all cursor-pointer ${
                        spiceLevel === s.level
                          ? 'bg-[#FAF8F5] border-[#B89047] text-[#3c2415] font-semibold'
                          : 'bg-white border-[#DDD3C4] text-[#7A6B60] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {s.level > 0 && <Flame className="w-3 h-3 fill-[#B89047] text-[#B89047]" />}
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1.5">
                  Label / Tag Tambahan
                </label>
                <input
                  id="menu-form-tags-input"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="cth. Favorit, Rekomendasi, Tradisional"
                  className="w-full rounded-xl bg-white border border-[#DDD3C4] px-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047]"
                />
              </div>
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="menu-form-featured-checkbox"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-[#DDD3C4] text-[#3c2415] focus:ring-[#B89047] cursor-pointer"
              />
              <label htmlFor="menu-form-featured-checkbox" className="text-xs text-[#6B5A4E] font-medium cursor-pointer">
                Tandai sebagai <strong>Menu Spesial / Rekomendasi Tamu</strong>
              </label>
            </div>
          </div>

          {/* Modal Footer Actions - Pinned at bottom */}
          <div className="shrink-0 flex items-center justify-end gap-3 p-4 sm:px-7 border-t border-[#EAE3D6] bg-[#FAF8F5]">
            <button
              id="cancel-menu-form-btn"
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#DDD3C4] bg-white px-5 py-2.5 text-xs font-medium text-[#6B5A4E] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              id="save-menu-form-btn"
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#3c2415] hover:bg-[#28170d] px-6 py-2.5 text-xs font-semibold tracking-wide text-white transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Menyimpan ke Database...' : initialItem ? 'Perbarui Menu' : 'Simpan Menu Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
);
}
