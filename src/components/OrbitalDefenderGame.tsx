import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';

interface Threat {
  id: number;
  kind: 'noise' | 'fast' | 'heavy' | 'alpha';
  angle: number;
  dist: number;
  speed: number;
  radius: number;
  hp: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Shockwave {
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

function playSynth(kind: 'deflect' | 'alpha' | 'hit' | 'emp' | 'gameover', muted: boolean) {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (kind === 'deflect') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.095);
    } else if (kind === 'alpha') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(1180, now + 0.14);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (kind === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.21);
    } else if (kind === 'emp') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.16);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.42);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);
      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(85, now + 0.4);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.start(now);
      osc.stop(now + 0.43);
    }
    setTimeout(() => ctx.close().catch(() => {}), 520);
  } catch {
    // Ignore autoplay errors
  }
}

function normalizeAngleDiff(a: number, b: number): number {
  let diff = a - b;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

const LOGICAL_W = 800;
const LOGICAL_H = 540;
const CX = LOGICAL_W / 2;
const CY = LOGICAL_H / 2;
const CORE_R = 34;
const SHIELD_R = 76;
const SHIELD_ARC = 1.18; // radians (~68 deg)

export function OrbitalDefenderGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'paused' | 'gameover'>('ready');
  const [muted, setMuted] = useState<boolean>(false);
  const [hud, setHud] = useState({
    score: 0,
    best:
      typeof window !== 'undefined'
        ? parseInt(localStorage.getItem('kronvex-orbital-best') || '0', 10) || 0
        : 0,
    combo: 1,
    wave: 1,
    integrity: 100,
    emp: 35,
  });

  const phaseRef = useRef(phase);
  const mutedRef = useRef(muted);
  phaseRef.current = phase;
  mutedRef.current = muted;

  const gameRef = useRef({
    shieldAngle: -Math.PI / 2,
    targetAngle: -Math.PI / 2,
    usingPointer: false,
    keys: { left: false, right: false },
    threats: [] as Threat[],
    particles: [] as Particle[],
    shockwaves: [] as Shockwave[],
    nextId: 1,
    spawnTimer: 0,
    elapsed: 0,
    score: 0,
    best:
      typeof window !== 'undefined'
        ? parseInt(localStorage.getItem('kronvex-orbital-best') || '0', 10) || 0
        : 0,
    combo: 1,
    streak: 0,
    wave: 1,
    integrity: 100,
    emp: 35,
    screenShake: 0,
    hudSyncTimer: 0,
  });

  const syncHud = useCallback(() => {
    const g = gameRef.current;
    setHud({
      score: Math.floor(g.score),
      best: Math.floor(g.best),
      combo: g.combo,
      wave: g.wave,
      integrity: Math.max(0, Math.round(g.integrity)),
      emp: Math.min(100, Math.round(g.emp)),
    });
  }, []);

  const spawnBurst = (x: number, y: number, color: string, count = 14) => {
    const g = gameRef.current;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1.4 + Math.random() * 4.2;
      g.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0,
        maxLife: 18 + Math.random() * 20,
        color,
        size: 1.8 + Math.random() * 2.8,
      });
    }
  };

  const triggerEmp = useCallback(() => {
    const g = gameRef.current;
    if (phaseRef.current !== 'playing' || g.emp < 100) return;
    g.emp = 0;
    g.screenShake = 10;
    g.shockwaves.push({ radius: CORE_R, maxRadius: 430, alpha: 1, color: '#38BDF8' });
    playSynth('emp', mutedRef.current);

    let cleared = 0;
    g.threats = g.threats.filter((th) => {
      if (th.kind === 'alpha') return true; // Keep beneficial Alpha Signals!
      const tx = CX + Math.cos(th.angle) * th.dist;
      const ty = CY + Math.sin(th.angle) * th.dist;
      spawnBurst(tx, ty, '#38BDF8', 16);
      cleared++;
      return false;
    });

    if (cleared > 0) {
      g.score += cleared * 35 * g.combo;
      if (g.score > g.best) {
        g.best = g.score;
        localStorage.setItem('kronvex-orbital-best', String(Math.floor(g.best)));
      }
    }
    syncHud();
  }, [syncHud]);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.threats = [];
    g.particles = [];
    g.shockwaves = [];
    g.spawnTimer = 0.25;
    g.elapsed = 0;
    g.score = 0;
    g.combo = 1;
    g.streak = 0;
    g.wave = 1;
    g.integrity = 100;
    g.emp = 35;
    g.screenShake = 0;
    g.shieldAngle = -Math.PI / 2;
    g.targetAngle = -Math.PI / 2;
    setPhase('playing');
    syncHud();
  }, [syncHud]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phaseRef.current !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        gameRef.current.keys.left = true;
        gameRef.current.usingPointer = false;
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        gameRef.current.keys.right = true;
        gameRef.current.usingPointer = false;
      } else if (e.code === 'Space') {
        e.preventDefault();
        triggerEmp();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') gameRef.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') gameRef.current.keys.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [triggerEmp]);

  // Main 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let lastTs = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      const g = gameRef.current;

      // Update game simulation
      if (phaseRef.current === 'playing') {
        g.elapsed += dt;
        g.wave = 1 + Math.floor(g.elapsed / 18);

        // Shield rotation
        if (g.keys.left) g.shieldAngle -= 4.4 * dt;
        if (g.keys.right) g.shieldAngle += 4.4 * dt;
        if (g.usingPointer) {
          const diff = normalizeAngleDiff(g.targetAngle, g.shieldAngle);
          g.shieldAngle += diff * Math.min(1, dt * 18);
        }

        // Spawn threats & alpha signals
        g.spawnTimer -= dt;
        if (g.spawnTimer <= 0) {
          const roll = Math.random();
          const angle = Math.random() * Math.PI * 2;
          const speedScale = 1 + (g.wave - 1) * 0.14;

          if (roll < 0.24) {
            g.threats.push({
              id: g.nextId++,
              kind: 'alpha',
              angle,
              dist: 410,
              speed: (92 + Math.random() * 28) * speedScale,
              radius: 10,
              hp: 1,
            });
          } else if (roll < 0.72) {
            g.threats.push({
              id: g.nextId++,
              kind: 'noise',
              angle,
              dist: 420,
              speed: (95 + Math.random() * 30) * speedScale,
              radius: 10,
              hp: 1,
            });
          } else if (roll < 0.9) {
            g.threats.push({
              id: g.nextId++,
              kind: 'fast',
              angle,
              dist: 430,
              speed: (145 + Math.random() * 35) * speedScale,
              radius: 8,
              hp: 1,
            });
          } else {
            g.threats.push({
              id: g.nextId++,
              kind: 'heavy',
              angle,
              dist: 420,
              speed: (68 + Math.random() * 18) * speedScale,
              radius: 14,
              hp: 2,
            });
          }

          g.spawnTimer = Math.max(0.36, 1.15 - g.wave * 0.085) * (0.85 + Math.random() * 0.3);
        }

        // Advance threats and check collisions
        const surviving: Threat[] = [];
        for (let i = 0; i < g.threats.length; i++) {
          const th = g.threats[i];
          th.dist -= th.speed * dt;
          const tx = CX + Math.cos(th.angle) * th.dist;
          const ty = CY + Math.sin(th.angle) * th.dist;

          // Shield arc collision check
          if (th.dist <= SHIELD_R + th.radius && th.dist >= SHIELD_R - th.radius - 10) {
            const angDiff = Math.abs(normalizeAngleDiff(th.angle, g.shieldAngle));
            if (angDiff <= SHIELD_ARC / 2 + 0.11) {
              if (th.kind === 'alpha') {
                // Shield bounced Alpha Signal softly — let it pass to core or collect directly!
                g.streak++;
                g.combo = Math.min(8, 1 + Math.floor(g.streak / 3));
                g.score += 50 * g.combo;
                g.emp = Math.min(100, g.emp + 18);
                g.integrity = Math.min(100, g.integrity + 3);
                spawnBurst(tx, ty, '#10B981', 16);
                playSynth('alpha', mutedRef.current);
                continue;
              } else {
                // Deflected Noise Packet!
                if (th.hp > 1) {
                  th.hp--;
                  th.dist += 75;
                  spawnBurst(tx, ty, '#F59E0B', 10);
                  playSynth('deflect', mutedRef.current);
                  surviving.push(th);
                  continue;
                }
                g.streak++;
                g.combo = Math.min(8, 1 + Math.floor(g.streak / 3));
                const pts = th.kind === 'fast' ? 35 : th.kind === 'heavy' ? 60 : 25;
                g.score += pts * g.combo;
                g.emp = Math.min(100, g.emp + 8);
                spawnBurst(tx, ty, '#38BDF8', 14);
                playSynth('deflect', mutedRef.current);
                continue;
              }
            }
          }

          // Core collision check
          if (th.dist <= CORE_R + th.radius) {
            if (th.kind === 'alpha') {
              // Absorbed Alpha Signal into Core!
              g.streak++;
              g.combo = Math.min(8, 1 + Math.floor(g.streak / 3));
              g.score += 65 * g.combo;
              g.emp = Math.min(100, g.emp + 22);
              g.integrity = Math.min(100, g.integrity + 5);
              spawnBurst(tx, ty, '#10B981', 18);
              playSynth('alpha', mutedRef.current);
              continue;
            } else {
              // Core took Noise damage!
              const dmg = th.kind === 'heavy' ? 24 : th.kind === 'fast' ? 14 : 18;
              g.integrity -= dmg;
              g.streak = 0;
              g.combo = 1;
              g.screenShake = 8;
              g.shockwaves.push({ radius: CORE_R, maxRadius: 120, alpha: 0.85, color: '#F43F5E' });
              spawnBurst(tx, ty, '#F43F5E', 20);

              if (g.integrity <= 0) {
                g.integrity = 0;
                if (g.score > g.best) {
                  g.best = g.score;
                  localStorage.setItem('kronvex-orbital-best', String(Math.floor(g.best)));
                }
                playSynth('gameover', mutedRef.current);
                setPhase('gameover');
                syncHud();
              } else {
                playSynth('hit', mutedRef.current);
              }
              continue;
            }
          }

          surviving.push(th);
        }
        g.threats = surviving;

        // Passive survival score & best tracking
        g.score += dt * 4 * g.combo;
        if (g.score > g.best) {
          g.best = g.score;
          localStorage.setItem('kronvex-orbital-best', String(Math.floor(g.best)));
        }

        // Particles & shockwaves
        g.particles = g.particles.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          return p.life < p.maxLife;
        });
        g.shockwaves = g.shockwaves.filter((sw) => {
          sw.radius += 560 * dt;
          sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
          return sw.radius < sw.maxRadius;
        });
        if (g.screenShake > 0) g.screenShake = Math.max(0, g.screenShake - dt * 28);

        g.hudSyncTimer += dt;
        if (g.hudSyncTimer >= 0.1) {
          g.hudSyncTimer = 0;
          syncHud();
        }
      }

      // Render Canvas
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== LOGICAL_W * dpr || canvas.height !== LOGICAL_H * dpr) {
        canvas.width = LOGICAL_W * dpr;
        canvas.height = LOGICAL_H * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      if (g.screenShake > 0.2) {
        ctx.translate((Math.random() - 0.5) * g.screenShake, (Math.random() - 0.5) * g.screenShake);
      }

      // Deep space background
      const bg = ctx.createRadialGradient(CX, CY, 16, CX, CY, 440);
      bg.addColorStop(0, '#0E1C38');
      bg.addColorStop(1, '#050811');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

      // Subtle tactical grid & radar rings
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 40; x < LOGICAL_W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, LOGICAL_H);
        ctx.stroke();
      }
      for (let y = 40; y < LOGICAL_H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(LOGICAL_W, y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      [SHIELD_R, 165, 255, 345].forEach((rad) => {
        ctx.beginPath();
        ctx.arc(CX, CY, rad, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Shockwaves
      g.shockwaves.forEach((sw) => {
        ctx.save();
        ctx.globalAlpha = sw.alpha;
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(CX, CY, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Orbital Shield Arc
      ctx.save();
      ctx.strokeStyle = g.emp >= 100 ? '#10B981' : '#38BDF8';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.shadowColor = g.emp >= 100 ? '#10B981' : '#38BDF8';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(CX, CY, SHIELD_R, g.shieldAngle - SHIELD_ARC / 2, g.shieldAngle + SHIELD_ARC / 2);
      ctx.stroke();
      ctx.restore();

      // KRONVEX 7-Node Core
      const coreGlow = ctx.createRadialGradient(CX, CY, 8, CX, CY, CORE_R * 2.1);
      coreGlow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      coreGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(CX, CY, CORE_R * 2.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#090F1E';
      ctx.strokeStyle = g.integrity > 35 ? '#38BDF8' : '#F43F5E';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(CX, CY, CORE_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 7-node emblem inside Core
      const spin = now * 0.0007;
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(CX, CY, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38BDF8';
      for (let k = 0; k < 6; k++) {
        const a = spin + (k * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(CX + Math.cos(a) * 18, CY + Math.sin(a) * 18, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Threats & Alpha Signals
      g.threats.forEach((th) => {
        const x = CX + Math.cos(th.angle) * th.dist;
        const y = CY + Math.sin(th.angle) * th.dist;
        ctx.save();
        if (th.kind === 'alpha') {
          ctx.fillStyle = '#10B981';
          ctx.shadowColor = '#10B981';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(x, y, th.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ECFDF5';
          ctx.beginPath();
          ctx.arc(x, y, th.radius * 0.42, 0, Math.PI * 2);
          ctx.fill();
        } else if (th.kind === 'fast') {
          ctx.fillStyle = '#F59E0B';
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 10;
          ctx.translate(x, y);
          ctx.rotate(th.angle + Math.PI);
          ctx.beginPath();
          ctx.moveTo(th.radius + 3, 0);
          ctx.lineTo(-th.radius, -th.radius * 0.8);
          ctx.lineTo(-th.radius, th.radius * 0.8);
          ctx.closePath();
          ctx.fill();
        } else if (th.kind === 'heavy') {
          ctx.fillStyle = th.hp > 1 ? '#A855F7' : '#F43F5E';
          ctx.strokeStyle = '#F8FAFC';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#A855F7';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(x, y, th.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = '#F43F5E';
          ctx.shadowColor = '#F43F5E';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(x, y, th.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Particles
      g.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [syncHud]);

  const aimAtClientCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * LOGICAL_W;
    const y = ((clientY - rect.top) / rect.height) * LOGICAL_H;
    gameRef.current.targetAngle = Math.atan2(y - CY, x - CX);
    gameRef.current.usingPointer = true;
  };

  return (
    <div className="space-y-5">
      {/* Open Inline Arcade Telemetry HUD (Zero Stat Boxes) */}
      <div className="pb-4 border-b border-slate-300/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-4 items-center">
        <div>
          <div className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100">SCORE</div>
          <div className="font-mono font-extrabold text-xl text-sky-600 dark:text-sky-400">
            {hud.score.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100">BEST SCORE</div>
          <div className="font-mono font-extrabold text-xl text-amber-600 dark:text-amber-300 inline-flex items-center gap-1">
            <Trophy className="w-4 h-4" /> {hud.best.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100">COMBO · WAVE</div>
          <div className="font-mono font-extrabold text-xl text-indigo-600 dark:text-indigo-300">
            x{hud.combo} <span className="text-xs font-semibold text-slate-900 dark:text-white">W{hud.wave}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span>CORE SHIELD</span>
            <span className={hud.integrity <= 35 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
              {hud.integrity}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                hud.integrity <= 35 ? 'bg-rose-500' : 'bg-gradient-to-r from-sky-400 to-emerald-400'
              }`}
              style={{ width: `${hud.integrity}%` }}
            />
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100 mb-1">
            <span>EMP CHARGE</span>
            <span className={hud.emp >= 100 ? 'text-emerald-500 font-bold animate-pulse' : 'text-sky-500 font-bold'}>
              {hud.emp}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                hud.emp >= 100 ? 'bg-emerald-400' : 'bg-sky-500'
              }`}
              style={{ width: `${hud.emp}%` }}
            />
          </div>
        </div>
      </div>

      {/* Canvas Stage */}
      <div
        dir="ltr"
        className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#050811] shadow-2xl select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseMove={(e) => {
            if (phase === 'playing') aimAtClientCoords(e.clientX, e.clientY);
          }}
          onPointerDown={(e) => {
            if (phase === 'playing') aimAtClientCoords(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (phase === 'playing' && e.buttons > 0) aimAtClientCoords(e.clientX, e.clientY);
          }}
          className="w-full h-auto block touch-none cursor-crosshair"
          style={{ aspectRatio: '800 / 540' }}
        />

        {/* Ready / Paused / Game Over Overlay */}
        {phase !== 'playing' && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-2xl bg-[#0B1120]/95 border border-sky-500/35 p-6 text-center space-y-4 text-white shadow-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30">
                <Shield className="w-3.5 h-3.5" /> KRONVEX ORBITAL DEFENDER
              </div>
              <h3 className="font-display font-bold text-2xl">
                {phase === 'ready'
                  ? 'Defend the 7-Node Core'
                  : phase === 'paused'
                  ? 'Mission Paused'
                  : 'Core Integrity Depleted'}
              </h3>
              {phase === 'gameover' ? (
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">FINAL SCORE</div>
                    <div className="text-lg font-bold text-sky-400">{hud.score.toLocaleString()}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">BEST RECORD</div>
                    <div className="text-lg font-bold text-amber-300">{hud.best.toLocaleString()}</div>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Sweep the orbital shield to deflect <span className="text-rose-400 font-semibold">Noise Packets</span>{' '}
                  and intercept <span className="text-emerald-400 font-semibold">Alpha Signals</span> for combo multipliers
                  &amp; shield repair. Unleash <span className="text-sky-300 font-semibold">EMP Pulse</span> at 100%!
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {phase === 'paused' ? (
                  <button
                    type="button"
                    onClick={() => setPhase('playing')}
                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition"
                  >
                    <Play className="w-4 h-4" /> Resume Defense
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startGame}
                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition"
                  >
                    <Play className="w-4 h-4" /> {phase === 'gameover' ? 'Play Again' : 'Start Mission'}
                  </button>
                )}
              </div>

              <div className="font-mono text-[10px] text-slate-400">
                Desktop: Mouse Aim or A/D / Arrows + Space (EMP) · Mobile: Touch &amp; Drag + EMP Button
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action & Legend Strip — Open Hairline Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-300/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-semibold text-slate-900 dark:text-white">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Noise
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Fast
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Heavy (2x)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Alpha (+HP/EMP)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={triggerEmp}
            disabled={phase !== 'playing' || hud.emp < 100}
            className={`px-4 py-2 rounded-full text-xs font-mono font-bold inline-flex items-center gap-1.5 transition ${
              phase === 'playing' && hud.emp >= 100
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 animate-pulse'
                : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-100 cursor-not-allowed opacity-60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> EMP Pulse ({hud.emp}%)
          </button>

          {phase === 'playing' || phase === 'paused' ? (
            <button
              type="button"
              onClick={() => setPhase((p) => (p === 'playing' ? 'paused' : 'playing'))}
              className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-black dark:text-white inline-flex items-center gap-1.5 hover:border-sky-500 transition"
            >
              {phase === 'playing' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {phase === 'playing' ? 'Pause' : 'Resume'}
            </button>
          ) : null}

          <button
            type="button"
            onClick={startGame}
            className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-black dark:text-white inline-flex items-center gap-1.5 hover:border-sky-500 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart
          </button>

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="p-2 rounded-full text-black dark:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition"
            aria-label={muted ? 'Unmute SFX' : 'Mute SFX'}
            title={muted ? 'Unmute SFX' : 'Mute SFX'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-900 dark:text-white">
        <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
        Runs at 60fps on HTML5 Canvas + Procedural Web Audio API · Local High-Score Storage · $0 Server Cost
      </div>
    </div>
  );
}
