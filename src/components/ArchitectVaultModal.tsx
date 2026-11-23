import { useEffect, useState } from 'react';
import { Check, Copy, Mail, ShieldCheck, Sparkles, X } from 'lucide-react';
import type { DecryptedArchitectVault } from '../utils/architectVaultCrypto';

interface ArchitectVaultModalProps {
  payload: DecryptedArchitectVault;
  proofCode: string;
  onClose: () => void;
}

export function ArchitectVaultModal({ payload, proofCode, onClose }: ArchitectVaultModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const proofText = `${payload.vaultTitle}\nMonogram: ${payload.monogram}\nOrigin Architect: ${payload.architect} (${payload.handle})\nMatrix Status: 21/21 Trials Cleared\nCipher Proof: ${proofCode}\nVerified On: ${new Date().toISOString()}`;

  const copyProof = () => {
    navigator.clipboard?.writeText(proofText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const mailHref = `mailto:${payload.email}?subject=${encodeURIComponent(
    `[KRONVEX VAULT] 21-Trial Matrix Solved (${proofCode})`
  )}&body=${encodeURIComponent(
    `Hello ${payload.architect},\n\nI completed all 21 Trials of the KRONVEX Matrix and unlocked the Architect's Vault.\n\n${proofText}\n`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={payload.vaultTitle}
      dir="ltr"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 bg-[#02050c]/92 backdrop-blur-xl overflow-y-auto"
      onClick={onClose}
    >
      <style>{`
        @keyframes kvxStrokeDraw {
          from { stroke-dashoffset: 900; opacity: 0.25; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes kvxSigDraw {
          from { stroke-dashoffset: 520; opacity: 0.1; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes kvxFadeLift {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .kvx-draw-crown {
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: kvxStrokeDraw 2.1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .kvx-draw-letters {
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: kvxStrokeDraw 2.4s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards;
        }
        .kvx-draw-sig {
          stroke-dasharray: 520;
          stroke-dashoffset: 520;
          animation: kvxSigDraw 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.8s forwards;
        }
        .kvx-vault-enter {
          animation: kvxFadeLift 550ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      <div
        className="kvx-vault-enter relative w-full max-w-3xl rounded-3xl border border-amber-400/35 bg-[#050914]/95 shadow-[0_0_90px_-15px_rgba(34,255,136,0.32),0_0_60px_-20px_rgba(245,158,11,0.3)] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Luminous Ambient Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(245,158,11,0.18),transparent_65%),radial-gradient(ellipse_65%_50%_at_50%_100%,rgba(34,255,136,0.16),transparent_65%)]"
        />

        {/* Top Bar */}
        <div className="relative flex items-center justify-between gap-3 px-6 py-4 border-b border-white/10">
          <div className="inline-flex items-center gap-2 font-brand text-xs tracking-[0.22em] text-amber-300 uppercase">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{payload.vaultTitle}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Architect's Vault"
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Ceremonial Content */}
        <div className="relative px-6 sm:px-10 py-8 sm:py-10 space-y-7 text-center">
          {/* Custom Sculpted Animated SVG: Sovereign 7-Node Crown Fused with KAAN Monogram */}
          <div className="mx-auto max-w-[440px]">
            <svg
              viewBox="0 0 460 250"
              className="w-full h-auto block overflow-visible drop-shadow-[0_0_24px_rgba(245,158,11,0.28)]"
              role="img"
              aria-label={`Sovereign Crown fused with ${payload.monogram} emblem`}
            >
              <defs>
                <linearGradient id="kvxCrownGold" gradientUnits="userSpaceOnUse" x1="76" y1="18" x2="384" y2="140">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="48%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
                <linearGradient id="kvxMonoFill" gradientUnits="userSpaceOnUse" x1="100" y1="140" x2="360" y2="206">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#FEF08A" />
                  <stop offset="100%" stopColor="#6EE7B7" />
                </linearGradient>
                <radialGradient id="kvxJewelEmerald" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#A7F3D0" />
                  <stop offset="55%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </radialGradient>
              </defs>

              {/* Sacred Geometry Subtle Halo & Orbital 7-Node Arc */}
              <circle
                cx="230"
                cy="128"
                r="112"
                fill="none"
                stroke="url(#kvxCrownGold)"
                strokeOpacity="0.22"
                strokeWidth="1.2"
                strokeDasharray="4 8"
              />
              <path
                d="M 78 134 A 152 94 0 0 1 382 134"
                fill="none"
                stroke="#34D399"
                strokeOpacity="0.24"
                strokeWidth="1"
              />

              {/* Sculpted 5-Peak Sovereign Crown (تاج) Rising Directly Above & Locked Into KAAN */}
              <path
                className="kvx-draw-crown"
                d="M 96 126 L 76 58 L 138 92 L 178 36 L 206 86 L 230 18 L 254 86 L 282 36 L 322 92 L 384 58 L 364 126 Z"
                fill="rgba(245, 158, 11, 0.08)"
                stroke="url(#kvxCrownGold)"
                strokeWidth="3.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Inner Architectural Facets Linking Crown Peaks to Base Band */}
              <path
                className="kvx-draw-crown"
                d="M 104 114 L 356 114 M 138 92 L 154 114 M 206 86 L 230 114 L 254 86 M 322 92 L 306 114"
                fill="none"
                stroke="url(#kvxCrownGold)"
                strokeWidth="1.6"
                strokeOpacity="0.72"
                strokeLinecap="round"
              />

              {/* 7 Luminous Matrix Jewels Adorning the Crown (5 Peaks + 2 Base Anchors) */}
              <polygon
                points="230,6 239,18 230,30 221,18"
                fill="url(#kvxJewelEmerald)"
                stroke="#FEF08A"
                strokeWidth="1.5"
              />
              <circle cx="178" cy="34" r="5.2" fill="#38BDF8" stroke="#FEF08A" strokeWidth="1.4" />
              <circle cx="282" cy="34" r="5.2" fill="#38BDF8" stroke="#FEF08A" strokeWidth="1.4" />
              <circle cx="76" cy="56" r="4.5" fill="#FDE047" />
              <circle cx="384" cy="56" r="4.5" fill="#FDE047" />
              <circle cx="154" cy="114" r="3.4" fill="#34D399" />
              <circle cx="306" cy="114" r="3.4" fill="#34D399" />

              {/* Sovereign Base Rail Fused Directly Into the Monogram Letters */}
              <line
                className="kvx-draw-crown"
                x1="84"
                y1="134"
                x2="376"
                y2="134"
                stroke="url(#kvxCrownGold)"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Sculpted Geometric Vector Monogram Fused Directly With the Sovereign Crown */}
              <g
                className="kvx-draw-letters"
                fill="none"
                stroke="#F59E0B"
                strokeOpacity="0.28"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M 102 142 L 102 206 M 144 142 L 106 174 L 146 206" />
                <path d="M 164 206 L 191 134 L 218 206 M 174 184 L 208 184" />
                <path d="M 242 206 L 269 134 L 296 206 M 252 184 L 286 184" />
                <path d="M 316 206 L 316 142 L 358 206 L 358 142" />
              </g>
              <g
                className="kvx-draw-letters"
                fill="none"
                stroke="url(#kvxMonoFill)"
                strokeWidth="5.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M 102 142 L 102 206 M 144 142 L 106 174 L 146 206" />
                <path d="M 164 206 L 191 134 L 218 206 M 174 184 L 208 184" />
                <path d="M 242 206 L 269 134 L 296 206 M 252 184 L 286 184" />
                <path d="M 316 206 L 316 142 L 358 206 L 358 142" />
              </g>

              {/* Twin Structural Under-Bar & Center Emerald Diamond */}
              <line
                className="kvx-draw-letters"
                x1="98"
                y1="222"
                x2="214"
                y2="222"
                stroke="#34D399"
                strokeOpacity="0.65"
                strokeWidth="1.6"
              />
              <polygon points="230,216 237,222 230,228 223,222" fill="#34D399" />
              <line
                className="kvx-draw-letters"
                x1="246"
                y1="222"
                x2="362"
                y2="222"
                stroke="#34D399"
                strokeOpacity="0.65"
                strokeWidth="1.6"
              />
            </svg>
          </div>

          {/* Animated Calligraphic Signature Block */}
          <div dir="ltr" className="space-y-1.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.26em] text-emerald-300 font-bold">
              ORIGIN ARCHITECT · VERIFIED CRYPTOGRAPHIC SIGNATURE
            </div>
            <div
              className="font-editorial italic text-5xl sm:text-6xl bg-gradient-to-r from-amber-200 via-white to-emerald-300 bg-clip-text text-transparent leading-tight"
              style={{ fontStyle: 'italic' }}
            >
              {payload.architect}
            </div>
            {/* Live Pen-Stroke Flourish */}
            <svg viewBox="0 0 360 28" className="w-64 sm:w-80 h-auto mx-auto overflow-visible" aria-hidden="true">
              <defs>
                <linearGradient id="kvxSigGold" gradientUnits="userSpaceOnUse" x1="12" y1="14" x2="348" y2="14">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>
              <path
                className="kvx-draw-sig"
                d="M 12 18 C 74 4, 152 26, 224 12 C 276 3, 318 14, 348 9"
                fill="none"
                stroke="url(#kvxSigGold)"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
            <div className="font-mono text-xs text-slate-200">
              {payload.role} · <span className="text-sky-300">{payload.handle}</span>
            </div>
          </div>

          {/* Decrypted English-Only Architect Messages */}
          <div className="max-w-2xl mx-auto space-y-3.5 pt-4 border-t border-white/10">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-300/95">
              {payload.epigraph}
            </p>
            <p className="text-base sm:text-lg text-white leading-relaxed font-medium">
              {payload.revelation}
            </p>
            <p className="font-editorial italic text-lg sm:text-xl text-emerald-200/95 leading-relaxed">
              &ldquo;{payload.magicNote}&rdquo;
            </p>
          </div>

          {/* Cryptographic Proof Badge & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <div
              dir="ltr"
              className="px-4 py-2 rounded-full border border-emerald-400/35 bg-emerald-500/10 font-mono text-xs text-emerald-200 inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PROOF: {proofCode}</span>
            </div>

            <button
              type="button"
              onClick={copyProof}
              className="px-4 py-2 rounded-full border border-white/20 hover:border-amber-300 text-white text-xs font-mono font-semibold inline-flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Proof Copied!' : 'Copy Proof Certificate'}
            </button>

            <a
              href={mailHref}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 hover:opacity-95 text-black font-bold text-xs inline-flex items-center gap-1.5 transition"
            >
              <Mail className="w-3.5 h-3.5" /> Email Architect
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
