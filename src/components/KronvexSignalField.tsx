import { useEffect, useRef } from 'react';

export type SignalIntensityMode = 'hero' | 'ambient' | 'subtle';

interface KronvexSignalFieldProps {
  mode?: SignalIntensityMode;
}

interface VectorParticle {
  bx: number;
  by: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pillar: 0 | 1 | 2; // 0 = Cyan (Systems), 1 = Emerald (Market Intel), 2 = Indigo (AI)
  depth: number; // 0.45 (far) · 0.85 (mid) · 1.35 (near) for 3-layer scroll parallax inertia
  isNode: boolean;
  phase: number;
  baseLen: number;
  baseAlpha: number;
}

interface PulseWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  pillar: 0 | 1 | 2;
  lineWidth: number;
}

const DARK_PALETTE = [
  { r: 56, g: 189, b: 248 },  // Cyan #38BDF8
  { r: 16, g: 185, b: 129 },  // Emerald #10B981
  { r: 129, g: 140, b: 248 }, // Indigo #818CF8
];

const LIGHT_PALETTE = [
  { r: 2, g: 132, b: 199 },   // Sky 600 #0284C7
  { r: 5, g: 150, b: 105 },   // Emerald 600 #059669
  { r: 79, g: 70, b: 229 },   // Indigo 600 #4F46E5
];

function modeToScale(mode: SignalIntensityMode): number {
  if (mode === 'hero') return 1.0;
  if (mode === 'ambient') return 0.56;
  return 0.36;
}

function buildParticles(isCompact: boolean): VectorParticle[] {
  const list: VectorParticle[] = [];

  const rings = isCompact ? [0.16, 0.29, 0.43, 0.59] : [0.14, 0.24, 0.35, 0.47, 0.6, 0.74];
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  rings.forEach((ringR, rIdx) => {
    const count = isCompact ? Math.round(10 + rIdx * 5) : Math.round(14 + rIdx * 8);
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2 + rIdx * 0.23;
      const jitterR = (rand() - 0.5) * 0.035;
      const jitterA = (rand() - 0.5) * 0.08;
      const bx = 0.52 + Math.cos(theta + jitterA) * (ringR + jitterR) * 0.78;
      const by = 0.5 + Math.sin(theta + jitterA) * (ringR + jitterR) * 0.88;
      if (bx < 0.02 || bx > 0.98 || by < 0.03 || by > 0.97) continue;

      const pillar = ((i + rIdx) % 3) as 0 | 1 | 2;
      const isNode = i % (isCompact ? 5 : 6) === 0 && rIdx >= 1;
      const depth = rIdx <= 1 ? 0.5 : rIdx <= 3 ? 0.9 : 1.35;
      list.push({
        bx,
        by,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        pillar,
        depth,
        isNode,
        phase: rand() * Math.PI * 2,
        baseLen: isNode ? 4.5 : 4.2 + rand() * 3.8,
        baseAlpha: 0.32 + (rIdx / rings.length) * 0.38,
      });
    }
  });

  const extra = isCompact ? 18 : 38;
  for (let i = 0; i < extra; i++) {
    const bx = 0.03 + rand() * 0.94;
    const by = 0.04 + rand() * 0.92;
    const pillar = (i % 3) as 0 | 1 | 2;
    const isNode = i % 5 === 0;
    const depth = 0.48 + rand() * 0.9;
    list.push({
      bx,
      by,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      pillar,
      depth,
      isNode,
      phase: rand() * Math.PI * 2,
      baseLen: 3.6 + rand() * 3.4,
      baseAlpha: 0.28 + rand() * 0.35,
    });
  }

  return list;
}

export function KronvexSignalField({ mode = 'hero' }: KronvexSignalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<SignalIntensityMode>(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let isDark = document.documentElement.classList.contains('dark');
    let isRtl = document.documentElement.dir === 'rtl';
    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let nextAmbientPulse = 2.6;
    let currentScale = modeToScale(modeRef.current);

    const pointer = { x: -9999, y: -9999, active: false, isFine: false };
    const aura = { x: width * 0.5, y: height * 0.5, alpha: 0 };
    const gravity = { holding: false, holdStart: 0, charge: 0 };
    let lastScrollY = window.scrollY || 0;
    let scrollVelocity = 0;
    let scrollParallaxY = 0;

    const emblemFocus = { x: width * 0.75, y: height * 0.45, active: false, pillar: 0 as 0 | 1 | 2 };
    let activeHarmonicPillar: 0 | 1 | 2 = 0;
    let harmonicBoost = 0;
    let particles = buildParticles(width < 768);
    const pulses: PulseWave[] = [];

    const syncPositions = () => {
      particles.forEach((p) => {
        const mappedBx = isRtl ? 1 - p.bx : p.bx;
        p.x = mappedBx * width;
        p.y = p.by * height;
        p.vx = 0;
        p.vy = 0;
      });
    };

    const resize = () => {
      const nextW = window.innerWidth;
      const nextH = window.innerHeight;
      const wasCompact = width < 768;
      const nowCompact = nextW < 768;
      width = nextW;
      height = nextH;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      if (wasCompact !== nowCompact) {
        particles = buildParticles(nowCompact);
      }
      syncPositions();
    };

    resize();

    const attrObserver = new MutationObserver(() => {
      const nextDark = document.documentElement.classList.contains('dark');
      const nextRtl = document.documentElement.dir === 'rtl';
      const rtlChanged = nextRtl !== isRtl;
      isDark = nextDark;
      isRtl = nextRtl;
      if (rtlChanged) syncPositions();
      if (reducedMotion) renderFrame(0.016);
    });
    attrObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'dir'],
    });

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.isFine = e.pointerType !== 'touch';
    };

    const onPointerDown = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.isFine = e.pointerType !== 'touch';
      if (modeRef.current === 'subtle') return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'CANVAS') return;

      // Activate Gravity Well on primary press over non-interactive space
      if (e.button === 0 && !el?.closest('a,button,input,textarea,select,label,canvas,[role="button"]')) {
        gravity.holding = true;
        gravity.holdStart = performance.now();
      }

      pulses.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: Math.min(width, height) * 0.48,
        alpha: (isDark ? 0.3 : 0.2) * currentScale,
        pillar: activeHarmonicPillar,
        lineWidth: 1.3,
      });
    };

    const onPointerUp = () => {
      if (gravity.holding && gravity.charge > 0.22 && !reducedMotion) {
        // Release charged Gravity Well into a vibrant neon-green harmonic burst
        pulses.push(
          {
            x: pointer.x,
            y: pointer.y,
            radius: 14,
            maxRadius: Math.min(width, height) * (0.55 + gravity.charge * 0.35),
            alpha: (isDark ? 0.48 : 0.32) * currentScale,
            pillar: 1,
            lineWidth: 2.0,
          },
          {
            x: pointer.x,
            y: pointer.y,
            radius: 4,
            maxRadius: Math.min(width, height) * 0.34,
            alpha: (isDark ? 0.3 : 0.2) * currentScale,
            pillar: activeHarmonicPillar,
            lineWidth: 1.2,
          }
        );
      }
      gravity.holding = false;
    };

    const onScroll = () => {
      const y = window.scrollY || 0;
      const delta = y - lastScrollY;
      lastScrollY = y;
      // Inject damped scroll inertia (clamped so huge jumps stay silky)
      scrollVelocity = Math.max(-72, Math.min(72, scrollVelocity + delta * 0.24));
    };

    // Listen to direct harmonic signals emitted by KronvexLivingEmblem (Owl Crest)
    const onCorePulse = (e: Event) => {
      const detail = (e as CustomEvent<{ x: number; y: number; pillar: 0 | 1 | 2 }>).detail;
      if (!detail) return;
      activeHarmonicPillar = detail.pillar;
      emblemFocus.pillar = detail.pillar;
      emblemFocus.x = detail.x;
      emblemFocus.y = detail.y;
      harmonicBoost = 1.0;

      // Spawn twin harmonic shockwave rings straight from the Owl Crest core
      pulses.push(
        {
          x: detail.x,
          y: detail.y,
          radius: 16,
          maxRadius: Math.max(width, height) * 0.85,
          alpha: isDark ? 0.52 : 0.36,
          pillar: detail.pillar,
          lineWidth: 2.2,
        },
        {
          x: detail.x,
          y: detail.y,
          radius: 4,
          maxRadius: Math.max(width, height) * 0.52,
          alpha: isDark ? 0.34 : 0.24,
          pillar: detail.pillar,
          lineWidth: 1.3,
        }
      );
    };

    const onPillarFocus = (e: Event) => {
      const detail = (e as CustomEvent<{ active: boolean; pillar: 0 | 1 | 2; x: number; y: number }>).detail;
      if (!detail) return;
      emblemFocus.active = detail.active;
      emblemFocus.pillar = detail.pillar;
      emblemFocus.x = detail.x;
      emblemFocus.y = detail.y;
      activeHarmonicPillar = detail.pillar;
    };

    const onPointerLeave = () => {
      pointer.active = false;
      gravity.holding = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('kronvex-core-pulse', onCorePulse);
    window.addEventListener('kronvex-pillar-focus', onPillarFocus);
    document.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    const renderFrame = (dt: number) => {
      elapsed += dt;
      harmonicBoost = Math.max(0, harmonicBoost - dt * 0.42);
      const targetScale = modeToScale(modeRef.current);
      currentScale += (targetScale - currentScale) * Math.min(1, dt * 4.5);

      // Update 3-layer scroll parallax inertia (smooth exponential decay back to rest)
      if (!reducedMotion) {
        scrollParallaxY = Math.max(-96, Math.min(96, scrollParallaxY - scrollVelocity * dt * 16));
        scrollVelocity *= Math.pow(0.06, dt);
        scrollParallaxY *= Math.pow(0.18, dt);
      } else {
        scrollVelocity = 0;
        scrollParallaxY = 0;
      }

      // Update Click-Hold Gravity Well charge (engages softly after 160ms hold)
      if (gravity.holding && !reducedMotion && performance.now() - gravity.holdStart > 160) {
        gravity.charge = Math.min(1, gravity.charge + dt * 1.45);
      } else {
        gravity.charge = Math.max(0, gravity.charge - dt * 3.8);
      }

      // Spring-damped neon cursor aura (fine pointer devices only)
      const auraTargetAlpha = pointer.active && pointer.isFine && !reducedMotion ? 1 : 0;
      aura.alpha += (auraTargetAlpha - aura.alpha) * Math.min(1, dt * 6.0);
      if (pointer.active) {
        const lerp = Math.min(1, dt * 7.5);
        aura.x += (pointer.x - aura.x) * lerp;
        aura.y += (pointer.y - aura.y) * lerp;
      }

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Subtle GPU radial neon cursor spotlight aura behind particles
      if (aura.alpha > 0.015 && modeRef.current !== 'subtle') {
        const auraR = (isDark ? 245 : 210) - gravity.charge * 55;
        const grad = ctx.createRadialGradient(aura.x, aura.y, 0, aura.x, aura.y, auraR);
        const peak = (isDark ? 0.145 : 0.115) * aura.alpha * currentScale * (1 + gravity.charge * 0.75);
        if (isDark) {
          grad.addColorStop(0, `rgba(34, 255, 136, ${peak.toFixed(3)})`);
          grad.addColorStop(0.48, `rgba(16, 185, 129, ${(peak * 0.35).toFixed(3)})`);
          grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        } else {
          grad.addColorStop(0, `rgba(0, 230, 118, ${peak.toFixed(3)})`);
          grad.addColorStop(0.5, `rgba(16, 185, 129, ${(peak * 0.28).toFixed(3)})`);
          grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(aura.x, aura.y, auraR, 0, Math.PI * 2);
        ctx.fill();
      }

      const palette = isDark ? DARK_PALETTE : LIGHT_PALETTE;
      const isHero = modeRef.current === 'hero';
      const focalX = (isHero ? (isRtl ? 0.24 : 0.76) : 0.5) * width;
      const focalY = (isHero ? 0.48 : 0.35) * height;

      // Gentle ambient radar pulse on Hero & Ambient pages
      if (!reducedMotion && modeRef.current !== 'subtle' && elapsed >= nextAmbientPulse) {
        nextAmbientPulse = elapsed + (isHero ? 5.2 : 7.5);
        pulses.push({
          x: focalX,
          y: focalY,
          radius: 28,
          maxRadius: Math.max(width, height) * 0.56,
          alpha: (isDark ? 0.22 : 0.16) * currentScale,
          pillar: activeHarmonicPillar,
          lineWidth: 1.2,
        });
      }

      // Expanding subtle radar rings (color-synced to active KRONVEX Pillar)
      for (let i = pulses.length - 1; i >= 0; i--) {
        const w = pulses[i];
        w.radius += dt * (w.lineWidth > 1.8 ? 240 : 155);
        const progress = w.radius / w.maxRadius;
        if (progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }
        const fade = (1 - progress) * w.alpha;
        const c = palette[w.pillar];
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${fade.toFixed(3)})`;
        ctx.lineWidth = w.lineWidth;
        ctx.stroke();
      }

      const nodes: VectorParticle[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const anchorX = (isRtl ? 1 - p.bx : p.bx) * width;
        const anchorY = p.by * height + scrollParallaxY * p.depth;

        const driftX = reducedMotion ? 0 : Math.cos(elapsed * 0.52 + p.phase) * 9 * p.depth;
        const driftY = reducedMotion ? 0 : Math.sin(elapsed * 0.45 + p.phase * 1.3) * 8 * p.depth;
        let targetX = anchorX + driftX;
        let targetY = anchorY + driftY;

        let cursorInfluence = 0;
        if (pointer.active && !reducedMotion) {
          const dx = targetX - pointer.x;
          const dy = targetY - pointer.y;
          const distSq = dx * dx + dy * dy;
          const radius = gravity.charge > 0.05 ? 290 : 185;
          if (distSq > 1 && distSq < radius * radius) {
            const dist = Math.sqrt(distSq);
            cursorInfluence = 1 - dist / radius;
            if (gravity.charge > 0.05) {
              // Gravity Well: pull inward + orbital vortex curl
              const pull = cursorInfluence * gravity.charge * 78;
              const swirl = cursorInfluence * gravity.charge * 46;
              targetX -= (dx / dist) * pull - (dy / dist) * swirl;
              targetY -= (dy / dist) * pull + (dx / dist) * swirl;
            } else {
              const push = cursorInfluence * cursorInfluence * 28;
              targetX += (dx / dist) * push;
              targetY += (dy / dist) * push;
            }
          }
        }

        p.vx = (p.vx + (targetX - p.x) * 0.08) * 0.78;
        p.vy = (p.vy + (targetY - p.y) * 0.08) * 0.78;
        p.x += p.vx;
        p.y += p.vy;

        const fdx = p.x - focalX;
        const fdy = p.y - focalY;
        const fDist = Math.hypot(fdx, fdy) || 1;
        let angle = Math.atan2(fdy, fdx) + Math.sin(elapsed * 0.85 - fDist * 0.008 + p.phase) * 0.35;

        if (cursorInfluence > 0.02) {
          const toPointer = Math.atan2(pointer.y - p.y, pointer.x - p.x);
          angle = angle * (1 - cursorInfluence * 0.65) + (toPointer + Math.PI * 0.5) * (cursorInfluence * 0.65);
        }

        // Keep center hero headline gently attenuated on Home; softly calm center on inner pages
        const calmX = (isHero ? (isRtl ? 0.7 : 0.3) : 0.5) * width;
        const calmY = 0.46 * height;
        const distToCalm = Math.hypot((p.x - calmX) / (width * 0.38), (p.y - calmY) / (height * 0.44));
        const calmFactor = Math.min(1, Math.max(isHero ? 0.24 : 0.32, distToCalm));

        let waveBoost = 0;
        for (let k = 0; k < pulses.length; k++) {
          const pd = Math.abs(Math.hypot(p.x - pulses[k].x, p.y - pulses[k].y) - pulses[k].radius);
          if (pd < 42) {
            waveBoost = Math.max(waveBoost, (1 - pd / 42) * 0.45);
          }
        }

        const c = harmonicBoost > 0.2 && waveBoost > 0.08 ? palette[activeHarmonicPillar] : palette[p.pillar];
        const alpha = Math.min(
          isDark ? 0.92 : 0.78,
          (p.baseAlpha + cursorInfluence * 0.4 + waveBoost * (1 + harmonicBoost * 0.6)) * calmFactor * currentScale
        );

        if (p.isNode) {
          nodes.push(p);
          const r = 2.1 + cursorInfluence * 1.3 + waveBoost * 1.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha.toFixed(3)})`;
          ctx.fill();
        } else {
          const halfLen = (p.baseLen + cursorInfluence * 4.5 + waveBoost * 3.5) * 0.5;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(p.x - cosA * halfLen, p.y - sinA * halfLen);
          ctx.lineTo(p.x + cosA * halfLen, p.y + sinA * halfLen);
          ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 2 + cursorInfluence * 0.85;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // Layer B: Synaptic neural links between nearby Signal Nodes & cursor
      const linkDist = width < 768 ? 115 : 165;
      const linkDistSq = linkDist * linkDist;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const ca = palette[a.pillar];

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < linkDistSq) {
            const strength = 1 - Math.sqrt(dSq) / linkDist;
            const lineAlpha = strength * (isDark ? 0.24 : 0.16) * currentScale;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${ca.r}, ${ca.g}, ${ca.b}, ${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        if (pointer.active) {
          const dx = a.x - pointer.x;
          const dy = a.y - pointer.y;
          const dSq = dx * dx + dy * dy;
          const pRadius = 210;
          if (dSq < pRadius * pRadius) {
            const strength = 1 - Math.sqrt(dSq) / pRadius;
            const lineAlpha = strength * (isDark ? 0.4 : 0.26) * currentScale;
            ctx.beginPath();
            ctx.moveTo(pointer.x, pointer.y);
            ctx.lineTo(a.x, a.y);
            ctx.strokeStyle = `rgba(${ca.r}, ${ca.g}, ${ca.b}, ${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }

        // Direct synaptic filaments anchored to the Living Owl Emblem when hovered or pulsing
        if (isHero && (emblemFocus.active || harmonicBoost > 0.05)) {
          const dx = a.x - emblemFocus.x;
          const dy = a.y - emblemFocus.y;
          const dSq = dx * dx + dy * dy;
          const eRadius = 310;
          if (dSq < eRadius * eRadius) {
            const strength = 1 - Math.sqrt(dSq) / eRadius;
            const ec = palette[emblemFocus.pillar];
            const boost = Math.max(emblemFocus.active ? 0.42 : 0, harmonicBoost * 0.55);
            const lineAlpha = strength * boost * (isDark ? 1 : 0.72);
            ctx.beginPath();
            ctx.moveTo(emblemFocus.x, emblemFocus.y);
            ctx.lineTo(a.x, a.y);
            ctx.strokeStyle = `rgba(${ec.r}, ${ec.g}, ${ec.b}, ${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 1.25;
            ctx.stroke();
          }
        }
      }

      ctx.restore();
    };

    if (reducedMotion) {
      renderFrame(0.016);
    } else {
      const tick = (now: number) => {
        rafId = requestAnimationFrame(tick);
        if (document.hidden) {
          lastTime = now;
          return;
        }
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;
        renderFrame(dt);
      };
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafId);
      attrObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('kronvex-core-pulse', onCorePulse);
      window.removeEventListener('kronvex-pillar-focus', onPillarFocus);
      document.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 w-full h-full"
    />
  );
}
