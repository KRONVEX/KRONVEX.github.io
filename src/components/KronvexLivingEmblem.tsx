import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OWL_VAULT_SEED, verifyOwlRitual } from '../utils/architectVaultCrypto';

export type SentinelPillarIndex = 0 | 1 | 2;

export interface SentinelPillarMeta {
  index: SentinelPillarIndex;
  code: string;
  label: string;
  hex: string;
  glowClass: string;
  badgeClass: string;
}

export const SENTINEL_PILLARS: SentinelPillarMeta[] = [
  {
    index: 0,
    code: '01',
    label: 'SYSTEMS',
    hex: '#38BDF8',
    glowClass: 'shadow-[0_0_48px_-10px_rgba(56,189,248,0.55)]',
    badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40',
  },
  {
    index: 1,
    code: '02',
    label: 'INTEL',
    hex: '#10B981',
    glowClass: 'shadow-[0_0_48px_-10px_rgba(16,185,129,0.55)]',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
  },
  {
    index: 2,
    code: '03',
    label: 'AI CORE',
    hex: '#818CF8',
    glowClass: 'shadow-[0_0_48px_-10px_rgba(129,140,248,0.55)]',
    badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40',
  },
];

interface KronvexLivingEmblemProps {
  activePillar: SentinelPillarIndex;
  onSelectPillar: (next: SentinelPillarIndex) => void;
}

/** Generate the exact 24-lobe scalloped medallion path matching KRONVEX's iconic crest. */
function buildScallopedRingPath(cx: number, cy: number, lobes: number, rInner: number, rOuter: number): string {
  const parts: string[] = [];
  for (let i = 0; i < lobes; i++) {
    const a0 = (i / lobes) * Math.PI * 2 - Math.PI / 2;
    const aMid = ((i + 0.5) / lobes) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / lobes) * Math.PI * 2 - Math.PI / 2;

    const x0 = cx + Math.cos(a0) * rInner;
    const y0 = cy + Math.sin(a0) * rInner;
    const xm = cx + Math.cos(aMid) * rOuter;
    const ym = cy + Math.sin(aMid) * rOuter;
    const x1 = cx + Math.cos(a1) * rInner;
    const y1 = cy + Math.sin(a1) * rInner;

    if (i === 0) {
      parts.push(`M ${x0.toFixed(2)} ${y0.toFixed(2)}`);
    }
    // Smooth quadratic crest lobe
    parts.push(`Q ${xm.toFixed(2)} ${ym.toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`);
  }
  parts.push('Z');
  return parts.join(' ');
}

const SATELLITE_ANGLES_DEG = [-90, -30, 30, 90, 150, 210];

export function KronvexLivingEmblem({ activePillar, onSelectPillar }: KronvexLivingEmblemProps) {
  const wrapRef = useRef<HTMLButtonElement>(null);
  const ritualRef = useRef<number[]>([]);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [blinking, setBlinking] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pulseTick, setPulseTick] = useState(0);
  const [ritualFlash, setRitualFlash] = useState(false);
  const [activeSatellite, setActiveSatellite] = useState(0);
  const [midnightAngle, setMidnightAngle] = useState(-8.8);

  const reducedMotion = useMemo(
    () => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false),
    []
  );

  const scallopedPath = useMemo(() => buildScallopedRingPath(256, 256, 24, 190, 217), []);

  const satellites = useMemo(
    () =>
      SATELLITE_ANGLES_DEG.map((deg, idx) => {
        const rad = (deg * Math.PI) / 180;
        return {
          idx,
          cx: 256 + Math.cos(rad) * 44,
          cy: 360 + Math.sin(rad) * 44,
        };
      }),
    []
  );

  // Subtle orbital pulse stepping through the 6 chest satellite nodes
  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setActiveSatellite((s) => (s + 1) % 6);
    }, 650);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  // Doomsday / Nuclear War Midnight Clock tension micro-drift hovering just before 12:00 (no fixed time)
  useEffect(() => {
    if (reducedMotion) return;
    const sequence = [-10.4, -9.2, -7.8, -6.4, -7.2, -8.8, -9.8, -8.2];
    let step = 0;
    const id = window.setInterval(() => {
      step = (step + 1) % sequence.length;
      setMidnightAngle(sequence[step]);
    }, 1350);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  // Lifelike natural blink every 4.2–7.2 seconds
  useEffect(() => {
    if (reducedMotion) return;
    let blinkTimeout = 0;
    let closeTimeout = 0;

    const scheduleBlink = () => {
      const wait = 4200 + Math.random() * 3200;
      blinkTimeout = window.setTimeout(() => {
        setBlinking(true);
        closeTimeout = window.setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, 145);
      }, wait);
    };

    scheduleBlink();
    return () => {
      window.clearTimeout(blinkTimeout);
      window.clearTimeout(closeTimeout);
    };
  }, [reducedMotion]);

  // Global eye tracking + smooth 3D magnetic tilt toward pointer
  useEffect(() => {
    if (reducedMotion) return;
    const onPointerMove = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;

      // Subtle, fierce pupil tracking clamped within ±4.2 SVG units
      const mag = Math.min(1, dist / 260);
      setEyeOffset({
        x: (dx / dist) * 4.2 * mag,
        y: (dy / dist) * 3.4 * mag,
      });

      // 3D magnetic tilt intensifies when cursor is near or over the crest
      const tiltRadius = 460;
      if (dist < tiltRadius) {
        const strength = 1 - dist / tiltRadius;
        const maxDeg = 9.5;
        setTilt({
          rx: Math.max(-maxDeg, Math.min(maxDeg, (-dy / tiltRadius) * maxDeg * 2.1 * strength)),
          ry: Math.max(-maxDeg, Math.min(maxDeg, (dx / tiltRadius) * maxDeg * 2.1 * strength)),
        });
      } else {
        setTilt({ rx: 0, ry: 0 });
      }
    };

    const onLeave = () => {
      setTilt({ rx: 0, ry: 0 });
      setEyeOffset({ x: 0, y: 0 });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onLeave, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [reducedMotion]);

  // Broadcast live core pulse into global KronvexSignalField
  const emitCorePulse = useCallback((pillar: SentinelPillarIndex) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent('kronvex-core-pulse', {
        detail: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          pillar,
        },
      })
    );
  }, []);

  // Broadcast hover focus so background filaments subtly energize toward the emblem
  useEffect(() => {
    const el = wrapRef.current;
    const rect = el?.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent('kronvex-pillar-focus', {
        detail: {
          active: hovered,
          pillar: activePillar,
          x: rect ? rect.left + rect.width / 2 : window.innerWidth * 0.75,
          y: rect ? rect.top + rect.height / 2 : window.innerHeight * 0.45,
        },
      })
    );
  }, [hovered, activePillar]);

  const handleActivate = () => {
    const next = ((activePillar + 1) % 3) as SentinelPillarIndex;
    onSelectPillar(next);
    setPulseTick((t) => t + 1);
    emitCorePulse(next);

    // Quick acknowledgment blink
    if (!reducedMotion) {
      setBlinking(true);
      window.setTimeout(() => setBlinking(false), 130);
    }
  };

  const pillarMeta = SENTINEL_PILLARS[activePillar];

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ perspective: '900px' }}>
      {/* Soft Unbounded Ambient Pillar Glow Floating Directly in Open Space */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full blur-3xl transition-all duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${pillarMeta.hex}38 0%, ${pillarMeta.hex}10 48%, transparent 72%)`,
          opacity: hovered ? 0.95 : 0.62,
        }}
      />

      <button
        ref={wrapRef}
        type="button"
        onClick={handleActivate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`KRONVEX Reactive 3-Pillar Sentinel Crest — Active Mode: ${pillarMeta.label}. Click to cycle pillar energy and emit signal pulse.`}
        title={`KRONVEX Sentinel Crest (${pillarMeta.label}) — Click to pulse signal field`}
        style={{
          transform: `rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) scale(${
            hovered ? 1.04 : 1
          })`,
          transition: 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)',
          filter: `drop-shadow(0 18px 34px ${pillarMeta.hex}30)`,
        }}
        className="group relative w-64 h-64 sm:w-80 sm:h-80 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 cursor-pointer"
      >
        {/* Click Shockwave Ring */}
        {pulseTick > 0 && (
          <span
            key={pulseTick}
            aria-hidden="true"
            className="pointer-events-none absolute inset-4 rounded-full border-2 animate-ping"
            style={{
              borderColor: ritualFlash ? '#F59E0B' : pillarMeta.hex,
              animationIterationCount: 1,
              animationDuration: ritualFlash ? '900ms' : '700ms',
            }}
          />
        )}

        {/* Vector Coded Living Owl Crest (100% Transparent Backdrop — Floating Freely in Open Space) */}
        <svg
          viewBox="0 0 512 512"
          className="relative z-10 w-full h-full block overflow-visible"
          role="img"
          aria-label="KRONVEX Living Owl Crest"
          data-vault-seed={OWL_VAULT_SEED}
        >
          <defs>
            {/* Midnight backdrop */}
            <radialGradient id="kvxBg" cx="50%" cy="46%" r="58%">
              <stop offset="0%" stopColor="#0C1730" />
              <stop offset="100%" stopColor="#050A17" />
            </radialGradient>

            {/* 4 Gold Crossed Corner Finials */}
            <linearGradient id="kvxGold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF04D" />
              <stop offset="48%" stopColor="#FFD21F" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Scalloped Sky-Blue Medallion */}
            <linearGradient id="kvxScallop" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#08DCFF" />
              <stop offset="52%" stopColor="#14A8FF" />
              <stop offset="100%" stopColor="#227BFF" />
            </linearGradient>

            {/* Inner Pillar Arcs */}
            <linearGradient id="kvxGreenArc" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#43FF5D" />
              <stop offset="100%" stopColor="#0ED258" />
            </linearGradient>
            <linearGradient id="kvxCyanArc" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#26D7FF" />
              <stop offset="100%" stopColor="#0B8CF5" />
            </linearGradient>
            <linearGradient id="kvxYellowArc" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFE135" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="kvxRedArc" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF365E" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>

            {/* Owl Warm Bronze Plumage */}
            <linearGradient id="kvxOwlHead" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C98A54" />
              <stop offset="100%" stopColor="#A66A3A" />
            </linearGradient>
            <linearGradient id="kvxOwlBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B87A47" />
              <stop offset="100%" stopColor="#8E562C" />
            </linearGradient>

            {/* Glowing Emerald Sentinel Eyes */}
            <radialGradient id="kvxEyeGlow" cx="46%" cy="42%" r="58%">
              <stop offset="0%" stopColor="#B4FF5E" />
              <stop offset="52%" stopColor="#24EC48" />
              <stop offset="100%" stopColor="#099E3D" />
            </radialGradient>

            {/* 7-Node Ruby Matrix */}
            <radialGradient id="kvxCoreNode" cx="42%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#FFB0C2" />
              <stop offset="42%" stopColor="#FF355E" />
              <stop offset="100%" stopColor="#C71238" />
            </radialGradient>

            {/* Clip paths for inner circle & angled fierce eye apertures */}
            <clipPath id="kvxInnerCircle">
              <circle cx="256" cy="256" r="168" />
            </clipPath>
            <clipPath id="kvxLeftEyeClip">
              <path d="M 201 211 L 245 241 C 234 252 213 250 205 236 C 200 227 200 218 201 211 Z" />
            </clipPath>
            <clipPath id="kvxRightEyeClip">
              <path d="M 311 211 L 267 241 C 278 252 299 250 307 236 C 312 227 312 218 311 211 Z" />
            </clipPath>
          </defs>

          {/* Transparent Open Canvas — Crest Floats Directly Over KronvexSignalField */}

          {/* Rotating Subtle Orbital Telemetry Ring (Synced to Active Pillar Color) */}
          <g className={reducedMotion ? '' : 'origin-center animate-[spin_36s_linear_infinite]'}>
            <circle
              cx="256"
              cy="256"
              r="238"
              fill="none"
              stroke={pillarMeta.hex}
              strokeOpacity={hovered ? '0.55' : '0.3'}
              strokeWidth="1.5"
              strokeDasharray="6 14"
            />
            {[0, 51.4, 102.8, 154.3, 205.7, 257.1, 308.6].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <circle
                  key={deg}
                  cx={256 + Math.cos(rad) * 238}
                  cy={256 + Math.sin(rad) * 238}
                  r="3"
                  fill={pillarMeta.hex}
                  opacity={hovered ? 0.9 : 0.6}
                />
              );
            })}
          </g>

          {/* Layer 1: Four Bold Crossed Golden Corner Finials Reaching Toward All 4 Corners */}
          <g
            style={{
              transform: `translate(${(-eyeOffset.x * 0.5).toFixed(2)}px, ${(-eyeOffset.y * 0.5).toFixed(2)}px)`,
              transition: 'transform 160ms ease-out',
            }}
          >
            {[-45, 45, 135, 225].map((angle) => (
              <g key={angle} transform={`rotate(${angle} 256 256)`}>
                <path
                  d="M 237 112 L 237 28 C 206 25 186 6 192 -16 C 198 -38 228 -40 245 -22 C 251 -16 254 -8 256 -1 C 258 -8 261 -16 267 -22 C 284 -40 314 -38 320 -16 C 326 6 306 25 275 28 L 275 112 Z"
                  fill="url(#kvxGold)"
                  stroke="#081429"
                  strokeWidth="5"
                  strokeLinejoin="round"
                />
              </g>
            ))}
          </g>

          {/* Layer 2: Iconic 24-Lobe Scalloped Cyan Crest Ring */}
          <path
            d={scallopedPath}
            fill="url(#kvxScallop)"
            stroke="#081429"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Outer Orbital Nuclear War Midnight Clock Arrow Hands (No Numbers — Slicing Across r=238 Ring) */}
          <g aria-hidden="true">
            {/* Silent Midnight (12:00) Zenith Marker on the Outer Dashed Ring */}
            <polygon
              points="256,11 260.2,18 256,25 251.8,18"
              fill="#FF355E"
              stroke="#FEF08A"
              strokeWidth="1.3"
            />

            {/* Outer Hour Arrow Hand (Hovering Just Before Midnight) */}
            <g transform="rotate(-3.6 256 256)">
              <path
                d="M 256 64 L 251.2 40 L 256 20 L 260.8 40 Z"
                fill="#081429"
                stroke="#FEF08A"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <line x1="256" y1="54" x2="256" y2="26" stroke="#FEF08A" strokeWidth="1" opacity="0.85" />
            </g>

            {/* Outer Minute Arrow Hand (Subtle Tension Drift Across Outer Dashed Ring Seconds Before Midnight) */}
            <g
              style={{
                transformBox: 'view-box',
                transformOrigin: '256px 256px',
                transform: `rotate(${(midnightAngle * 1.45).toFixed(2)}deg)`,
                transition: 'transform 620ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <path
                d="M 256 62 L 251.8 33 L 256 4 L 260.2 33 Z"
                fill="#FF355E"
                stroke="#081429"
                strokeWidth="1.9"
                strokeLinejoin="round"
              />
              <line x1="256" y1="52" x2="256" y2="11" stroke="#FEF08A" strokeWidth="1.15" opacity="0.92" />
            </g>
          </g>

          {/* Subtle Glowing Active Pillar Rim Around Inner Medallion */}
          <circle
            cx="256"
            cy="256"
            r="175"
            fill="#071124"
            stroke={pillarMeta.hex}
            strokeOpacity={hovered ? '0.75' : '0.35'}
            strokeWidth="3.5"
          />

          {/* Layer 3: Sweeping Inner Spectrum Arc Wings (Clipped Cleanly Inside Medallion) */}
          <g clipPath="url(#kvxInnerCircle)">
            <circle cx="256" cy="256" r="168" fill="#071124" />

            {/* Left Sweeping Crescents */}
            <path
              d="M 110 315 C 122 365 154 404 202 424 L 222 372 C 176 356 144 330 110 315 Z"
              fill="url(#kvxRedArc)"
              stroke="#071124"
              strokeWidth="4.5"
              opacity={activePillar === 2 ? 1 : 0.92}
            />
            <path
              d="M 96 236 C 95 292 126 346 184 378 L 204 342 C 154 316 122 276 96 236 Z"
              fill="url(#kvxYellowArc)"
              stroke="#071124"
              strokeWidth="4.5"
            />
            <path
              d="M 150 132 C 102 184 98 272 154 334 L 182 308 C 134 260 132 192 150 132 Z"
              fill="url(#kvxCyanArc)"
              stroke="#071124"
              strokeWidth="4.5"
              opacity={activePillar === 0 ? 1 : 0.9}
            />
            <path
              d="M 224 106 C 148 128 118 228 168 308 L 194 282 C 152 222 164 148 224 106 Z"
              fill="url(#kvxGreenArc)"
              stroke="#071124"
              strokeWidth="4.5"
              opacity={activePillar === 1 ? 1 : 0.92}
            />

            {/* Right Sweeping Crescents (Exact Horizontal Mirror) */}
            <g transform="translate(512 0) scale(-1 1)">
              <path
                d="M 110 315 C 122 365 154 404 202 424 L 222 372 C 176 356 144 330 110 315 Z"
                fill="url(#kvxRedArc)"
                stroke="#071124"
                strokeWidth="4.5"
                opacity={activePillar === 2 ? 1 : 0.92}
              />
              <path
                d="M 96 236 C 95 292 126 346 184 378 L 204 342 C 154 316 122 276 96 236 Z"
                fill="url(#kvxYellowArc)"
                stroke="#071124"
                strokeWidth="4.5"
              />
              <path
                d="M 150 132 C 102 184 98 272 154 334 L 182 308 C 134 260 132 192 150 132 Z"
                fill="url(#kvxCyanArc)"
                stroke="#071124"
                strokeWidth="4.5"
                opacity={activePillar === 0 ? 1 : 0.9}
              />
              <path
                d="M 224 106 C 148 128 118 228 168 308 L 194 282 C 152 222 164 148 224 106 Z"
                fill="url(#kvxGreenArc)"
                stroke="#071124"
                strokeWidth="4.5"
                opacity={activePillar === 1 ? 1 : 0.92}
              />
            </g>

            {/* Layer 4: KRONVEX Owl Body & Folded Wings */}
            <g
              style={{
                transform: `translate(${(eyeOffset.x * 0.28).toFixed(2)}px, ${(eyeOffset.y * 0.25).toFixed(2)}px)`,
                transition: 'transform 140ms ease-out',
              }}
            >
              {/* Broad Tapered Torso */}
              <path
                d="M 178 264 C 156 308 158 378 202 426 L 310 426 C 354 378 356 308 334 264 Z"
                fill="url(#kvxOwlBody)"
                stroke="#081429"
                strokeWidth="5.5"
                strokeLinejoin="round"
              />
              {/* Folded Side Wing Contours */}
              <path
                d="M 192 310 C 179 348 184 388 206 416"
                fill="none"
                stroke="#081429"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <path
                d="M 320 310 C 333 348 328 388 306 416"
                fill="none"
                stroke="#081429"
                strokeWidth="5.5"
                strokeLinecap="round"
              />

              {/* Head & Fierce Pointed Ear Tufts */}
              <path
                d="M 178 168 L 222 192 Q 256 177 290 192 L 334 168 L 323 206 C 337 224 338 256 324 274 C 304 294 278 298 256 306 C 234 298 208 294 188 274 C 174 256 175 224 189 206 Z"
                fill="url(#kvxOwlHead)"
                stroke="#081429"
                strokeWidth="5.5"
                strokeLinejoin="round"
              />

              {/* Left & Right Tan Facial Eye Discs */}
              <circle cx="222" cy="233" r="33" fill="#EAC59C" stroke="#081429" strokeWidth="5" />
              <circle cx="290" cy="233" r="33" fill="#EAC59C" stroke="#081429" strokeWidth="5" />

              {/* Left Eye (Glowing Emerald + Eye-Tracking Pupil + Natural Blink) */}
              <g clipPath="url(#kvxLeftEyeClip)">
                <ellipse cx="223" cy="232" rx="25" ry="20" fill="url(#kvxEyeGlow)" />
                <g
                  style={{
                    transform: `translate(${eyeOffset.x.toFixed(2)}px, ${eyeOffset.y.toFixed(2)}px)`,
                    transition: 'transform 90ms linear',
                  }}
                >
                  <circle cx="223" cy="232" r="7.5" fill="#062814" opacity="0.88" />
                  <circle cx="220" cy="229" r="3" fill="#ECFEFF" opacity="0.95" />
                </g>
                {/* Eyelid Blink Curtain */}
                <rect
                  x="196"
                  y="206"
                  width="56"
                  height={blinking ? 52 : 0}
                  fill="#B87A47"
                  style={{ transition: 'height 95ms ease-in-out' }}
                />
              </g>
              <path
                d="M 201 211 L 245 241 C 234 252 213 250 205 236 C 200 227 200 218 201 211 Z"
                fill="none"
                stroke="#081429"
                strokeWidth="5"
                strokeLinejoin="round"
              />

              {/* Right Eye (Glowing Emerald + Eye-Tracking Pupil + Natural Blink) */}
              <g clipPath="url(#kvxRightEyeClip)">
                <ellipse cx="289" cy="232" rx="25" ry="20" fill="url(#kvxEyeGlow)" />
                <g
                  style={{
                    transform: `translate(${eyeOffset.x.toFixed(2)}px, ${eyeOffset.y.toFixed(2)}px)`,
                    transition: 'transform 90ms linear',
                  }}
                >
                  <circle cx="289" cy="232" r="7.5" fill="#062814" opacity="0.88" />
                  <circle cx="286" cy="229" r="3" fill="#ECFEFF" opacity="0.95" />
                </g>
                {/* Eyelid Blink Curtain */}
                <rect
                  x="260"
                  y="206"
                  width="56"
                  height={blinking ? 52 : 0}
                  fill="#B87A47"
                  style={{ transition: 'height 95ms ease-in-out' }}
                />
              </g>
              <path
                d="M 311 211 L 267 241 C 278 252 299 250 307 236 C 312 227 312 218 311 211 Z"
                fill="none"
                stroke="#081429"
                strokeWidth="5"
                strokeLinejoin="round"
              />

              {/* Fierce Single V-Brow Forehead Plate (Matching Original KRONVEX Crest) */}
              <path
                d="M 181 171 L 222 192 Q 256 177 290 192 L 331 171 L 256 244 Z"
                fill="url(#kvxOwlHead)"
                stroke="#081429"
                strokeWidth="5.5"
                strokeLinejoin="round"
              />

              {/* Golden Diamond Beak */}
              <path
                d="M 256 244 L 268 264 L 256 286 L 244 264 Z"
                fill="url(#kvxGold)"
                stroke="#081429"
                strokeWidth="5"
                strokeLinejoin="round"
              />

              {/* Layer 5: THE ICONIC 7-NODE CHEST MATRIX (1 Core + 6 Satellites) */}
              {/* Subtle synaptic filaments connecting satellites to center core on hover or active pulse */}
              {satellites.map((sat) => {
                const isLit = hovered || sat.idx === activeSatellite;
                return (
                  <line
                    key={`link-${sat.idx}`}
                    x1="256"
                    y1="360"
                    x2={sat.cx}
                    y2={sat.cy}
                    stroke={pillarMeta.hex}
                    strokeWidth={isLit ? 2 : 1}
                    strokeOpacity={hovered ? 0.65 : isLit ? 0.48 : 0.14}
                    style={{ transition: 'stroke-opacity 240ms ease' }}
                  />
                );
              })}

              {/* 6 Outer Crimson Satellite Nodes */}
              {satellites.map((sat) => {
                const isActive = sat.idx === activeSatellite;
                return (
                  <g key={`sat-${sat.idx}`}>
                    {isActive && (
                      <circle
                        cx={sat.cx}
                        cy={sat.cy}
                        r="14.5"
                        fill="none"
                        stroke={pillarMeta.hex}
                        strokeWidth="2"
                        opacity="0.7"
                      />
                    )}
                    <circle
                      cx={sat.cx}
                      cy={sat.cy}
                      r={isActive ? 10.6 : 9.6}
                      fill="url(#kvxCoreNode)"
                      stroke="#081429"
                      strokeWidth="3.2"
                      style={{ transition: 'r 220ms ease' }}
                    />
                  </g>
                );
              })}

              {/* Central Large Ruby Core Node */}
              <circle
                cx="256"
                cy="360"
                r={hovered ? 29.5 : 27.5}
                fill="none"
                stroke={pillarMeta.hex}
                strokeWidth="3"
                opacity={hovered ? 0.75 : 0.35}
                style={{ transition: 'all 250ms ease' }}
              />
              <circle
                cx="256"
                cy="360"
                r="26"
                fill="url(#kvxCoreNode)"
                stroke="#081429"
                strokeWidth="4.2"
              />

              {/* Nuclear War Midnight Clock Arrow Hands (No Numbers — Hovering Just Before Midnight) */}
              <g aria-hidden="true">
                {/* Hour Arrow Hand (near Midnight 12:00) */}
                <g transform="rotate(-2.4 256 360)">
                  <path
                    d="M 256 362 L 253.2 351.5 L 256 344.2 L 258.8 351.5 Z"
                    fill="#081429"
                    stroke="#FEF08A"
                    strokeWidth="0.75"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Minute Arrow Hand (subtle tension drift seconds before Midnight) */}
                <g
                  style={{
                    transformBox: 'view-box',
                    transformOrigin: '256px 360px',
                    transform: `rotate(${midnightAngle}deg)`,
                    transition: 'transform 620ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  <path
                    d="M 256 363.5 L 253.9 346.5 L 256 336.8 L 258.1 346.5 Z"
                    fill="#081429"
                    stroke="#FFF7D6"
                    strokeWidth="0.85"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Central Clock Pivot Axle */}
                <circle cx="256" cy="360" r="3.6" fill="#081429" stroke="#FEF08A" strokeWidth="0.9" />
                <circle cx="256" cy="360" r="1.4" fill="#FEF08A" />
              </g>
            </g>
          </g>
        </svg>
      </button>

      {/* Minimalist Open 3-Pillar Harmonic Switcher Directly Below Floating Crest */}
      <div className="mt-5 flex items-center justify-center gap-4 text-[11px] font-mono">
        {SENTINEL_PILLARS.map((p) => {
          const selected = p.index === activePillar;
          return (
            <button
              key={p.code}
              type="button"
              onClick={() => {
                onSelectPillar(p.index);
                setPulseTick((t) => t + 1);
                emitCorePulse(p.index);
                ritualRef.current = [...ritualRef.current, p.index].slice(-7);
                void verifyOwlRitual(ritualRef.current).then((armed) => {
                  if (armed) {
                    setRitualFlash(true);
                    setPulseTick((t) => t + 1);
                    emitCorePulse(1);
                    window.setTimeout(() => emitCorePulse(2), 180);
                    window.setTimeout(() => setRitualFlash(false), 1400);
                    window.setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('kronvex-matrix-gateway', { detail: { view: 'choose' } }));
                    }, 420);
                  }
                });
              }}
              className={`pb-1 border-b-2 transition inline-flex items-center gap-1.5 ${
                selected
                  ? 'text-black dark:text-white font-bold'
                  : 'border-transparent text-slate-800 dark:text-slate-100 hover:text-black dark:hover:text-white'
              }`}
              style={{ borderColor: selected ? p.hex : 'transparent' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: p.hex, opacity: selected ? 1 : 0.45 }}
              />
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
