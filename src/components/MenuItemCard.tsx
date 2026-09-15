import { useState } from 'react';
import { Flame, Utensils, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { MenuItem } from '../types';
import { formatRupiah, getPortionBadge } from '../utils/formatters';

interface MenuItemCardProps {
  key?: string;
  item: MenuItem;
  onClick: () => void;
  index?: number;
}

export function MenuItemCard({ item, onClick, index = 0 }: MenuItemCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const hasVariants = item.variants && item.variants.length > 1;
  const currentPrice =
    item.variants && item.variants.length > 0
      ? (item.variants[selectedVariantIdx]?.price ?? item.price)
      : item.price;
  const portionBadge = getPortionBadge(item.name, item.tags, item.variants);

  return (
    <motion.div
      id={`menu-card-${item.id}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{
        duration: 0.35,
        ease: 'easeOut',
        delay: Math.min((index % 4) * 0.04, 0.2),
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-white border transition-all duration-300 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#B89047]/40 ${
        item.isAvailable
          ? 'border-[#ECE4D8]/80 hover:border-[#D5C2AA] shadow-[0_4px_20px_rgba(60,36,21,0.04)] hover:shadow-[0_12px_32px_rgba(60,36,21,0.09)]'
          : 'border-[#EAE4DC] bg-[#FAF8F5]/90 opacity-75'
      }`}
    >
      {/* Thumbnail Container - Well Framed, Generous Proportions */}
      <div className="relative h-52 sm:h-auto sm:w-52 shrink-0 bg-[#F4EFEA] overflow-hidden">
        {!imgLoaded && !imgError && item.imageUrl?.trim() && (
          <div className="absolute inset-0 flex items-center justify-center text-[#B5A89B] animate-pulse">
            <Utensils className="w-6 h-6 text-[#C7B9A9]" />
          </div>
        )}

        {imgError || !item.imageUrl?.trim() ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-[#8C7B70] bg-[#F4EFEA]">
            <Utensils className="w-8 h-8 text-[#BAABA0] mb-1" />
            <span className="text-[11px] font-medium tracking-wide">Foto Hidangan</span>
          </div>
        ) : (
          <img
            src={item.imageUrl}
            alt={item.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
              !item.isAvailable ? 'grayscale contrast-110' : ''
            }`}
          />
        )}

        {/* Sold Out / Habis Overlay - Understated, refined overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-[#28170d]/50 backdrop-blur-[2px] flex items-center justify-center p-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF8F5]/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#5A4537] shadow-sm">
              Habis Terjual
            </span>
          </div>
        )}

        {/* Featured Ribbon if available - Subtle Gold Accent */}
        {item.isAvailable && item.isFeatured && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#3c2415]/85 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-[#FAF8F5] border border-[#C5A059]/40 shadow-xs">
              <span className="text-[#C5A059] text-xs">★</span> Rekomendasi
            </span>
          </div>
        )}
      </div>

      {/* Info Container - Editorial Hierarchy and Whitespace */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          {/* Top meta row: Understated portion badge and spice level */}
          <div className="mb-2 flex items-center justify-between gap-2">
            {portionBadge === 'multi' ? (
              <span className="inline-flex items-center rounded-full border border-[#DED4C5] bg-[#FBF9F5] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#735F50]">
                Porsi Kecil & Besar
              </span>
            ) : portionBadge ? (
              <span className="inline-flex items-center rounded-full border border-[#DED4C5] bg-[#FBF9F5] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#735F50]">
                {portionBadge === 'kecil' ? 'Porsi Kecil' : 'Porsi Besar'}
              </span>
            ) : (
              <div />
            )}

            {item.spiceLevel !== undefined && item.spiceLevel > 0 && (
              <div
                className="flex shrink-0 items-center gap-0.5 text-[#B89047]"
                title={`Level Pedas: ${item.spiceLevel}`}
              >
                {Array.from({ length: Math.min(item.spiceLevel, 3) }).map((_, i) => (
                  <Flame key={i} className="w-3.5 h-3.5 fill-[#B89047]" />
                ))}
              </div>
            )}
          </div>

          {/* Dish Name */}
          <h3
            className={`font-serif-display text-xl sm:text-2xl font-medium tracking-tight leading-snug transition-colors ${
              item.isAvailable ? 'text-[#3c2415] group-hover:text-[#8C5D38]' : 'text-[#8A7C73]'
            }`}
          >
            {item.name}
          </h3>

          {/* Description */}
          <p
            className={`mt-2 text-xs sm:text-sm line-clamp-2 leading-relaxed ${
              item.isAvailable ? 'text-[#736357]' : 'text-[#968980]'
            }`}
          >
            {item.description}
          </p>

          {/* Portion Variant Toggle Pills */}
          {hasVariants && (
            <div
              className="mt-3.5 flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[11px] font-medium text-[#735F50]">Porsi:</span>
              <div className="inline-flex rounded-lg bg-[#F5F0E9] p-0.5 border border-[#E8DFC2]">
                {item.variants!.map((v, i) => (
                  <button
                    key={v.label}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariantIdx(i);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      selectedVariantIdx === i
                        ? 'bg-[#3c2415] text-[#FAF8F5] shadow-xs font-semibold'
                        : 'text-[#6B5A4E] hover:text-[#3c2415]'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-[#F6F1EA] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[#7A6A5E]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Prominent tasteful price & refined CTA */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#F2ECE3]">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-serif-display text-xl sm:text-2xl font-medium tracking-tight ${
                item.isAvailable ? 'text-[#3c2415]' : 'text-[#8A7C73] line-through'
              }`}
            >
              {formatRupiah(currentPrice)}
            </span>
            {hasVariants && (
              <span className="text-[11px] text-[#8C7B70] font-normal">
                ({item.variants![selectedVariantIdx]?.label || ''})
              </span>
            )}
          </div>

          <div>
            {item.isAvailable ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#B89047] group-hover:text-[#3c2415] transition-colors">
                <span>Detail</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="text-[11px] font-medium tracking-wider uppercase text-[#968980]">
                Tidak Tersedia
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
