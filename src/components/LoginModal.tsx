import { useState, useEffect, FormEvent } from 'react';
import { X, Lock, Mail, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { UserSession } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserSession) => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login gagal';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="kasir-login-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="kasir-login-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-[#FAF7F2] border border-[#E3DAC9] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header - Pinned at top */}
        <div className="shrink-0 flex items-center justify-between p-5 sm:px-7 sm:py-5 border-b border-[#EAE3D6] bg-[#FAF8F5]">
          <div>
            <span className="text-[11px] uppercase font-semibold tracking-[0.2em] text-[#B89047]">
              Portal Restoran
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-medium tracking-tight text-[#3c2415]">
              Login Kasir
            </h2>
          </div>
          <button
            id="close-login-modal-btn"
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#7A6B60] hover:bg-[#EAE3D6] transition-colors cursor-pointer"
            aria-label="Tutup form login"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-7 overscroll-contain bg-white">
          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-4 rounded-xl bg-[#FAF4EF] border border-[#EBDCCF] p-3.5 text-xs text-[#8A5138] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B85D36]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1.5">
                Email Kasir
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8988C]" />
                <input
                  id="staff-login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kasir@maesoaji.com"
                  className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] pl-10 pr-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5A4E] mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8988C]" />
                <input
                  id="staff-login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-[#FAF8F5] border border-[#DDD3C4] pl-10 pr-3.5 py-2.5 text-sm text-[#3c2415] focus:outline-none focus:ring-2 focus:ring-[#B89047]/25 focus:border-[#B89047] transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="submit-staff-login-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center rounded-xl bg-[#3c2415] hover:bg-[#28170d] px-4 py-3 text-xs font-semibold tracking-wide text-white transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Memverifikasi...' : 'Masuk ke Dasbor Kasir'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
