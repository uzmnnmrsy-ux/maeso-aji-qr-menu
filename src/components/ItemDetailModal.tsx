import { useState, useEffect } from 'react';
import { X, Flame, CheckCircle2, AlertCircle, Utensils } from 'lucide-react';
import { MenuItem, Category } from '../types';
import { formatRupiah, getSpiceInfo, getPortionBadge } from '../utils/formatters';

interface ItemDetailModalProps {
  item: MenuItem | null;
  category?: Category;
  onClose: () => void;
}

export function ItemDetailModal({ item, category, onClose }: ItemDetailModalProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  // Reset selected variant when opened item changes
  useEffect(() => {
    setSelectedVariantIdx(0);
  }, [item?.id]);

  const hasVariants = Boolean(item?.variants && item.variants.length > 1);
  const currentPrice =
    item?.variants && item.variants.length > 0
      ? (item.variants[selectedVariantIdx]?.price ?? item.price)
      : (item?.price ?? 0);
  const currentVariantLabel = hasVariants && item?.variants ? item.variants[selectedVariantIdx]?.label : null;
  const portionBadge = item ? getPortionBadge(item.name, item.tags, item.variants) : null;

  // Escape key handler to close modal
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const spiceInfo = getSpiceInfo(item.spiceLevel);

  return (
    <div
      id="item-detail-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="item-detail-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-[#FAF7F2] border border-[#E3DAC9] shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Close Button: Fixed relative to modal card, always visible and accessible regardless of scroll position */}
        <button
          id="close-item-detail-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 rounded-full bg-[#201108]/75 hover:bg-[#201108] p-2.5 text-[#FAF8F5] transition-all backdrop-blur-md shadow-lg border border-white/20 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#B89047] cursor-pointer"
          aria-label="Tutup detail menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Internally scrollable content area (image + text) */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* Large Full-Width Photo Container */}
          <div className="relative h-72 sm:h-84 w-full bg-[#F4EFEA] overflow-hidden shrink-0">
            {!imgLoaded && !imgError && item.imageUrl?.trim() && (
              <div className="absolute inset-0 flex items-center justify-center text-[#B5A89B] animate-pulse">
                <Utensils className="w-8 h-8 text-[#C7B9A9]" />
              </div>
            )}
            {imgError || !item.imageUrl?.trim() ? (
              <div className="flex h-full w-full flex-col items-center justify-center bg-[#F4EFEA] text-[#8C7B70]">
                <Utensils className="w-12 h-12 mb-2 text-[#BAABA0]" />
                <p className="text-xs tracking-wide">
                  {!item.imageUrl?.trim() ? 'Foto Hidangan' : 'Foto hidangan tidak dapat dimuat'}
                </p>
              </div>
            ) : (
              <img
                src={item.imageUrl}
                alt={item.name}
                referrerPolicy="no-referrer"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                className={`h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105 ${
                  !item.isAvailable ? 'grayscale contrast-110' : ''
                }`}
              />
            )}

            {/* Subtle Gradient Shadow at bottom of photo for seamless text transition */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

            {/* Availability Status Badges on image */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pr-12">
              {item.isAvailable ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF8F5]/95 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-[#3c2415] shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                  Tersedia
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#201108]/90 backdrop-blur-md px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#FAF8F5] shadow-md border border-white/20">
                  <AlertCircle className="w-3.5 h-3.5 text-[#C5A059]" />
                  Habis Terjual
                </span>
              )}

              {item.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#3c2415]/90 backdrop-blur-md px-3 py-1 text-xs font-medium text-[#FAF8F5] border border-[#C5A059]/40 shadow-xs">
                  <span className="text-[#C5A059]">★</span> Rekomendasi
                </span>
              )}

              {portionBadge === 'multi' ? (
                <span className="inline-flex items-center rounded-full bg-[#FAF8F5]/95 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#735F50] backdrop-blur-xs shadow-xs border border-[#DFD5C5]">
                  Porsi Kecil & Besar
                </span>
              ) : portionBadge ? (
                <span className="inline-flex items-center rounded-full bg-[#FAF8F5]/95 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#735F50] backdrop-blur-xs shadow-xs border border-[#DFD5C5]">
                  {portionBadge === 'kecil' ? 'Porsi Kecil' : 'Porsi Besar'}
                </span>
              ) : null}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 bg-white">
            {/* Category & Spice Level */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B89047]">
                  {category?.name || 'Menu Pilihan'}
                </span>
                {portionBadge === 'multi' ? (
                  <span className="inline-flex items-center rounded-full border border-[#DED4C5] bg-[#FAF8F5] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#735F50]">
                    Porsi Kecil & Besar
                  </span>
                ) : portionBadge ? (
                  <span className="inline-flex items-center rounded-full border border-[#DED4C5] bg-[#FAF8F5] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#735F50]">
                    {portionBadge === 'kecil' ? 'Porsi Kecil' : 'Porsi Besar'}
                  </span>
                ) : null}
              </div>

              {item.spiceLevel !== undefined && item.spiceLevel > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#8C5D38] bg-[#F7F2E7] px-3 py-1 rounded-full border border-[#E8DFC2]">
                  <Flame className="w-3.5 h-3.5 fill-[#B89047] text-[#B89047]" />
                  <span>{spiceInfo.label}</span>
                </div>
              )}
            </div>

            {/* Item Name */}
            <h2 className="font-serif-display text-3xl sm:text-4xl font-medium text-[#3c2415] leading-tight tracking-tight">
              {item.name}
            </h2>

            {/* Price */}
            <div className="mt-2 mb-4 flex items-baseline">
              <span className="font-serif-display text-2xl sm:text-3xl font-medium text-[#3c2415]">
                {formatRupiah(currentPrice)}
              </span>
              <span className="text-xs text-[#8A7A6E] ml-2 font-normal">
                {hasVariants ? `/ porsi ${currentVariantLabel?.toLowerCase()}` : '/ porsi'}
              </span>
            </div>

            {/* Portion Variant Selector Card */}
            {hasVariants && item.variants && (
              <div className="mb-5 rounded-2xl bg-[#FAF8F5] border border-[#ECE4D8] p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-[#6B5A4E] uppercase tracking-wider">
                    Pilih Ukuran Porsi:
                  </span>
                  <span className="text-xs font-medium text-[#B89047]">
                    Porsi {item.variants[selectedVariantIdx]?.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {item.variants.map((variant, idx) => (
                    <button
                      key={variant.label}
                      type="button"
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedVariantIdx === idx
                          ? 'bg-white border-[#3c2415] shadow-xs ring-1 ring-[#3c2415]'
                          : 'bg-[#F4EFEA]/70 border-[#E5DACD] hover:bg-[#EFE8DF]'
                      }`}
                    >
                      <span className={`text-xs font-semibold ${selectedVariantIdx === idx ? 'text-[#3c2415]' : 'text-[#6B5A4E]'}`}>
                        Porsi {variant.label}
                      </span>
                      <span className="font-serif-display text-sm font-medium text-[#3c2415] mt-1">
                        {formatRupiah(variant.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description Card */}
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#ECE4D8] p-5 text-[#5A4B40] text-sm leading-relaxed">
              <p className="font-semibold text-xs text-[#8A7A6E] uppercase tracking-wider mb-1.5">
                Catatan Kuliner:
              </p>
              <p className="font-light leading-relaxed">
                {item.description || 'Hidangan otentik racikan rempah istimewa khas Jawa, dimasak perlahan dengan bahan baku pilihan terbaik.'}
              </p>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-[#F6F1EA] px-3 py-1 text-xs font-medium text-[#7A6A5E]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Availability Notice */}
            {!item.isAvailable && (
              <div className="mt-5 rounded-xl bg-[#FAF4EF] border border-[#EBDCCF] p-4 text-xs text-[#8A5138] flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#B85D36]" />
                <span>Menu ini sedang habis untuk hari ini. Silakan tanyakan staf kami untuk ketersediaan berikutnya.</span>
              </div>
            )}

            {/* Close Action Button */}
            <div className="mt-8 pt-4 border-t border-[#F2ECE3] flex justify-end">
              <button
                id="dismiss-item-detail-btn"
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl bg-[#3c2415] hover:bg-[#28170d] px-7 py-3 text-xs font-semibold tracking-wide text-[#FAF8F5] transition-all shadow-xs cursor-pointer"
              >
                Kembali ke Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
