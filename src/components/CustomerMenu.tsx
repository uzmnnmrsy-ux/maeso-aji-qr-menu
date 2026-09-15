import { useState, useMemo, useEffect } from 'react';
import { Search, X, UtensilsCrossed, ArrowUp, GlassWater } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, MenuItem, RestaurantInfo } from '../types';
import { MenuItemCard } from './MenuItemCard';
import { ItemDetailModal } from './ItemDetailModal';
import jogloBgImage from '../assets/images/javanese_joglo_house_1789366224189.jpg';

interface CustomerMenuProps {
  categories: Category[];
  items: MenuItem[];
  restaurantInfo: RestaurantInfo | null;
}

export function CustomerMenu({
  categories,
  items,
  restaurantInfo,
}: CustomerMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Smooth scroll to top when category changes
  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Monitor scroll position to show/hide "Back to Top" floating button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category check
      if (selectedCategoryId !== 'all' && item.categoryId !== selectedCategoryId) {
        return false;
      }
      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesTags;
      }
      return true;
    });
  }, [items, selectedCategoryId, searchQuery]);

  // Group filtered items by category
  const groupedCategories = useMemo(() => {
    const sortedCats = [...categories].sort((a, b) => a.order - b.order);

    if (selectedCategoryId !== 'all') {
      const singleCat = sortedCats.find((c) => c.id === selectedCategoryId);
      if (!singleCat) return [];
      const catItems = filteredItems.filter((i) => i.categoryId === singleCat.id);
      return [{ category: singleCat, items: catItems }];
    }

    return sortedCats
      .map((cat) => ({
        category: cat,
        items: filteredItems.filter((item) => item.categoryId === cat.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [categories, filteredItems, selectedCategoryId]);

  // Counts for category badges
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    items.forEach((item) => {
      map[item.categoryId] = (map[item.categoryId] || 0) + 1;
    });
    return map;
  }, [items]);

  const activeCategoryObject = categories.find((c) => c.id === activeItem?.categoryId);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#3c2415] pb-24">
      {/* Restaurant Hero / Header with Atmospheric Javanese Joglo House Background */}
      <header className="relative bg-[#28170d] text-[#FAF8F5] overflow-hidden border-b border-[#3c2415]">
        {/* Joglo Architecture Background with Graceful Solid-Color Fallback */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <img
            src={jogloBgImage}
            alt="Arsitektur Tradisional Rumah Joglo Jawa"
            role="presentation"
            aria-hidden="true"
            referrerPolicy="no-referrer"
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-cover object-[center_38%] sm:object-[center_35%] filter brightness-[1.05] contrast-[1.04] saturate-[1.12] transition-all duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* Targeted readability gradient: gentle espresso contrast on the left for typography legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#201108]/90 via-[#201108]/50 to-transparent" />

          {/* Softer top-bottom vignette gradient to reveal the joglo pillars and roofline */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#201108]/40 via-transparent to-[#201108]/65" />

          {/* Warm dusk/lantern glow ambient lighting */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#B89047]/15 via-transparent to-[#C5A059]/10 mix-blend-screen" />
        </div>

        {/* Foreground Brasserie Hero Header Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="max-w-2xl"
            >
              {/* Editorial Eyebrow */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C5A059]">
                  Kuliner Tradisi Jawa • Fine-Casual
                </span>
              </div>

              {/* Restaurant Name in Refined Display Serif */}
              <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-wide text-white drop-shadow-md leading-[1.08]">
                {restaurantInfo?.name || 'Resto Maeso Aji Barokah'}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[#EADDC9] font-light leading-relaxed drop-shadow-sm max-w-xl">
                {restaurantInfo?.tagline || 'Sop, Asem-Asem, Nasi Gandul, Rawon & Aneka Bakaran Tradisi Nusantara Khas Pati'}
              </p>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Sticky Search & Refined Minimal Category Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#EAE3D6] shadow-[0_2px_12px_rgba(60,36,21,0.03)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3.5">
          {/* Search Bar */}
          <div className="flex items-center gap-3 mb-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8988C]" />
              <input
                id="menu-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari hidangan (cth. Sop Iga, Asem-Asem, Nasi Gandul, Rawon, Es Kopi)..."
                className="w-full rounded-full bg-white border border-[#E2D8C7] pl-11 pr-10 py-2.5 text-xs sm:text-sm text-[#3c2415] placeholder-[#9E9084] focus:outline-none focus:ring-2 focus:ring-[#B89047]/30 focus:border-[#B89047] transition-all shadow-[0_2px_8px_rgba(60,36,21,0.03)]"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A8988C] hover:text-[#3c2415] p-1 cursor-pointer"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Minimalist Editorial Category Tabs with Subtle Edge Gradient Fades */}
          <div className="relative">
            {/* Left Edge Gradient Fade */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#FBF9F5] via-[#FBF9F5]/80 to-transparent z-10" />

            {/* Horizontally Scrollable Category Tabs */}
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar border-b border-[#EAE3D6]/60 pt-1 px-3 sm:px-1">
              {/* 'Semua' Tab */}
              <button
                id="cat-tab-all"
                onClick={() => handleSelectCategory('all')}
                className={`pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer relative ${
                  selectedCategoryId === 'all'
                    ? 'text-[#3c2415] font-semibold border-b-2 border-[#3c2415]'
                    : 'text-[#8A7A6E] hover:text-[#3c2415] border-b-2 border-transparent font-normal'
                }`}
              >
                <span>Semua Menu</span>
                <span className={`text-[10px] ${selectedCategoryId === 'all' ? 'text-[#3c2415] font-bold' : 'text-[#B0A296]'}`}>
                  ({categoryCounts['all'] || 0})
                </span>
              </button>

              {/* Categories from DB */}
              {categories
                .sort((a, b) => a.order - b.order)
                .map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  const count = categoryCounts[cat.id] || 0;
                  const isMinuman = cat.name.toLowerCase().includes('minuman');

                  return (
                    <button
                      key={cat.id}
                      id={`cat-tab-${cat.id}`}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`pb-2.5 pt-1 text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer relative ${
                        isSelected
                          ? 'text-[#3c2415] font-semibold border-b-2 border-[#3c2415]'
                          : 'text-[#8A7A6E] hover:text-[#3c2415] border-b-2 border-transparent font-normal'
                      }`}
                    >
                      {isMinuman && (
                        <GlassWater className={`w-3.5 h-3.5 ${isSelected ? 'text-[#3c2415]' : 'text-[#B89047]'}`} />
                      )}
                      <span>{cat.name}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-[#3c2415] font-bold' : 'text-[#B0A296]'}`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* Right Edge Gradient Fade */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#FBF9F5] via-[#FBF9F5]/80 to-transparent z-10" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          {groupedCategories.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="my-16 rounded-2xl border border-dashed border-[#DDD2C4] bg-white p-12 text-center shadow-xs"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F2E7] text-[#3c2415] mb-4">
                <UtensilsCrossed className="w-6 h-6 text-[#B89047]" />
              </div>
              <h3 className="font-serif-display text-2xl font-medium text-[#3c2415]">
                Tidak Ada Menu Ditemukan
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#7A6B60] max-w-sm mx-auto leading-relaxed">
                {searchQuery
                  ? `Tidak ada menu yang sesuai dengan kata kunci "${searchQuery}".`
                  : 'Belum ada menu yang tersedia untuk kategori ini.'}
              </p>
              {(searchQuery || selectedCategoryId !== 'all') && (
                <button
                  id="reset-filter-btn"
                  onClick={() => {
                    setSearchQuery('');
                    handleSelectCategory('all');
                  }}
                  className="mt-5 rounded-xl bg-[#3c2415] text-white px-5 py-2.5 text-xs font-semibold hover:bg-[#28170d] transition-colors cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={selectedCategoryId + (searchQuery ? `_q_${searchQuery}` : '')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="space-y-14 sm:space-y-16"
            >
              {groupedCategories.map(({ category, items: catItems }) => (
                <section key={category.id} id={`category-section-${category.id}`} className="scroll-mt-36">
                  {/* Category Header */}
                  <div className="mb-6 pb-2.5 border-b border-[#EAE3D6]/70">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="font-serif-display text-3xl sm:text-4xl font-medium text-[#3c2415] tracking-tight">
                        {category.name}
                      </h2>
                      <span className="text-xs font-semibold uppercase tracking-widest text-[#B89047]">
                        {catItems.length} Pilihan
                      </span>
                    </div>
                    {category.description && (
                      <p className="mt-1 text-xs sm:text-sm text-[#7D6E63] font-light leading-relaxed">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* Grid of Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    {catItems.map((item, idx) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        index={idx}
                        onClick={() => setActiveItem(item)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Restaurant Footer Notice - Editorial Style */}
        <footer className="mt-20 rounded-2xl bg-white border border-[#EAE3D6] p-8 sm:p-12 text-center text-[#6B5A4E] shadow-[0_4px_24px_rgba(60,36,21,0.03)]">
          <p className="font-serif-display text-2xl sm:text-3xl font-medium text-[#3c2415] tracking-wide">
            {restaurantInfo?.name || 'Resto Maeso Aji Barokah'}
          </p>
          <p className="text-xs sm:text-sm text-[#B89047] font-medium tracking-wide mt-1">
            {restaurantInfo?.tagline || 'Warung Olahan Sop, Asem-Asem, Nasi Gandul, Rawon & Aneka Bakaran Khas Pati'}
          </p>
          <p className="text-xs text-[#7A6B60] mt-3 max-w-lg mx-auto leading-relaxed">
            {restaurantInfo?.address || 'Gedong, Kedumulyo, Kec. Sukolilo, Kabupaten Pati, Jawa Tengah 59172'}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#6B5A4E]">
            <span>Reservasi / WA: <strong className="text-[#3c2415]">{restaurantInfo?.phone || '082143800818'}</strong></span>
            <span>Instagram: <strong className="text-[#3c2415]">{restaurantInfo?.instagram || '@maeso_ajiresto'}</strong></span>
            <span>Facebook: <strong className="text-[#3c2415]">{restaurantInfo?.facebook || 'Resto Maeso Aji Barokah'}</strong></span>
          </div>
          <div className="mt-4 text-[11px] text-[#A39284] tracking-wide">
            <span>Dihidangkan segar setiap hari dengan bahan baku pilihan halal & higienis.</span>
          </div>
        </footer>
      </main>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          id="back-to-top-btn"
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#3c2415]/95 hover:bg-[#28170d] text-[#FAF8F5] pl-4 pr-5 py-2.5 shadow-xl border border-[#5a3a24] backdrop-blur-md text-xs font-medium transition-all hover:scale-105 active:scale-95 animate-in fade-in zoom-in-95 duration-200 cursor-pointer"
          aria-label="Kembali ke atas menu"
          title="Kembali ke atas menu"
        >
          <ArrowUp className="w-4 h-4 text-[#C5A059]" />
          <span>Ke Atas</span>
        </button>
      )}

      {/* Item Detail Sheet / Modal */}
      <ItemDetailModal
        item={activeItem}
        category={activeCategoryObject}
        onClose={() => setActiveItem(null)}
      />
    </div>
  );
}
