import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, ExternalLink, QrCode, Copy, Check, Sparkles } from 'lucide-react';
import { RestaurantInfo } from '../types';

interface RestaurantQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantInfo: RestaurantInfo | null;
}

export function RestaurantQrModal({
  isOpen,
  onClose,
  restaurantInfo,
}: RestaurantQrModalProps) {
  const [copied, setCopied] = useState(false);

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

  // Single official restaurant menu URL (points to customer menu root or subfolder base)
  const basePath = window.location.pathname.replace(/\/admin\/?$/, '').replace(/\/$/, '');
  const menuUrl = `${window.location.origin}${basePath}/`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="restaurant-qr-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="restaurant-qr-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-[#FAF8F5] border border-[#EAE3D6] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-[#3c2415]"
      >
        {/* Header - Pinned at top */}
        <div className="shrink-0 flex items-center justify-between p-5 sm:px-6 sm:py-4 border-b border-[#EAE3D6] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-[#F7F2E7] border border-[#E8DFC2] p-2 text-[#B89047]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-xl font-medium text-[#3c2415]">
                QR Code Menu Digital
              </h3>
              <p className="text-xs text-[#7A6B60]">
                Satu QR code resmi untuk seluruh restoran
              </p>
            </div>
          </div>
          <button
            id="close-qr-modal-btn"
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#7A6B60] hover:bg-[#F2ECE3] hover:text-[#3c2415] transition-colors cursor-pointer"
            aria-label="Tutup QR code"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 overscroll-contain">
          {/* QR Card - Printable Area */}
          <div
            id="printable-qr-card"
            className="rounded-2xl border border-[#EAE3D6] bg-white p-6 text-center shadow-xs mb-5 flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Subtle decorative top accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-[#B89047]" />

            <div className="mb-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF8F5] border border-[#C5A059]/40 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#B89047]">
                <Sparkles className="w-3 h-3 text-[#B89047]" />
                <span>Menu Digital Tamu</span>
              </span>
              <h4 className="font-serif-display text-2xl font-medium text-[#3c2415] mt-2">
                {restaurantInfo?.name || 'Resto Maeso Aji Barokah'}
              </h4>
              <p className="text-xs text-[#7A6B60] max-w-xs mt-0.5 font-light">
                {restaurantInfo?.tagline || 'Warung Olahan Sop, Asem-Asem, Nasi Gandul, Rawon & Aneka Bakaran Khas Pati'}
              </p>
            </div>

            {/* QR Canvas */}
            <div className="p-3.5 bg-white rounded-2xl shadow-xs border border-[#EAE3D6] my-2 inline-block">
              <QRCodeSVG
                value={menuUrl}
                size={180}
                level="H"
                includeMargin={true}
                fgColor="#3c2415"
                bgColor="#FFFFFF"
              />
            </div>

            <p className="text-xs font-medium text-[#3c2415] mt-2">
              Pindai untuk melihat daftar menu lengkap
            </p>

            <p className="text-[11px] text-[#8A7A6E] max-w-xs break-all mt-1 select-all bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#EAE3D6]">
              {menuUrl}
            </p>
          </div>

          {/* Copy Link & Action Buttons */}
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <button
                id="copy-menu-link-btn"
                onClick={handleCopyLink}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                  copied
                    ? 'bg-[#F2F8F3] border-[#D1E7D5] text-[#2E7D32]'
                    : 'bg-white border-[#DDD3C4] text-[#6B5A4E] hover:bg-[#FAF8F5]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#2E7D32]" />
                    <span>Tautan Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#8A7A6E]" />
                    <span>Salin Tautan</span>
                  </>
                )}
              </button>

              <button
                id="print-qr-btn"
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-[#DDD3C4] px-3.5 py-2.5 text-xs font-medium text-[#6B5A4E] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#8A7A6E]" />
                <span>Cetak Standing QR</span>
              </button>
            </div>

            <a
              id="test-menu-url-link"
              href={menuUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3c2415] hover:bg-[#28170d] px-4 py-2.5 text-xs font-semibold tracking-wide text-white transition-colors shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#C5A059]" />
              <span>Buka Menu Tamu di Tab Baru</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
