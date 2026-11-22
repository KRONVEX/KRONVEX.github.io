import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Cpu, Layers, Sparkles, X } from 'lucide-react';
import { KRONVEX_APPS, KRONVEX_MODELS, KRONVEX_PILLARS, KRONVEX_SKILLS } from '../data/catalog';

interface GraphNode {
  id: string;
  label: string;
  kind: 'core' | 'pillar' | 'app' | 'model' | 'skill';
  x: number;
  y: number;
  r: number;
  color: string;
  description: string;
  route: string;
  meta: string;
}

interface GraphEdge {
  from: string;
  to: string;
  color: string;
}

const KIND_FILTERS: { id: 'all' | GraphNode['kind']; label: string }[] = [
  { id: 'all', label: 'All Nodes' },
  { id: 'app', label: 'Apps' },
  { id: 'model', label: 'AI Models' },
  { id: 'skill', label: 'AI Skills' },
];

export function ConstellationCanvas() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [filter, setFilter] = useState<'all' | GraphNode['kind']>('all');
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const cx = 500;
    const cy = 310;
    const nList: GraphNode[] = [
      {
        id: 'core',
        label: 'KRONVEX CORE',
        kind: 'core',
        x: cx,
        y: cy,
        r: 34,
        color: '#38BDF8',
        description:
          'Unified 7-node engineering & applied intelligence architecture powering cross-platform apps, market intelligence, and mission-critical AI.',
        route: '/vision',
        meta: '7-NODE GENESIS CORE',
      },
    ];
    const eList: GraphEdge[] = [];

    const pillarColors: Record<string, string> = {
      cyan: '#38BDF8',
      emerald: '#10B981',
      violet: '#818CF8',
    };

    const pillarAngles = [-145, -35, 90];
    KRONVEX_PILLARS.forEach((p, idx) => {
      const ang = (pillarAngles[idx] * Math.PI) / 180;
      const px = cx + Math.cos(ang) * 145;
      const py = cy + Math.sin(ang) * 125;
      nList.push({
        id: p.id,
        label: p.title,
        kind: 'pillar',
        x: px,
        y: py,
        r: 22,
        color: pillarColors[p.accent],
        description: p.description,
        route: p.route,
        meta: `PILLAR ${p.code} · ${p.stack.join(' · ')}`,
      });
      eList.push({ from: 'core', to: p.id, color: pillarColors[p.accent] });
    });

    // Apps orbiting Pillar 1 (top-left)
    KRONVEX_APPS.forEach((app, i) => {
      const ang = ((-185 + i * 38) * Math.PI) / 180;
      nList.push({
        id: app.id,
        label: app.name,
        kind: 'app',
        x: cx + Math.cos(ang) * 320,
        y: cy + Math.sin(ang) * 235,
        r: 14,
        color: '#38BDF8',
        description: app.tagline,
        route: '/apps',
        meta: `${app.version} · ${app.platforms.join(' / ').toUpperCase()}`,
      });
      eList.push({ from: 'pillar-apps', to: app.id, color: '#38BDF8' });
    });

    // Models orbiting Pillar 3 (bottom fan — staggered radii so all 7+ models stay crystal clear)
    KRONVEX_MODELS.forEach((m, i) => {
      const span = Math.max(KRONVEX_MODELS.length - 1, 1);
      const deg = 24 + (i / span) * 132;
      const ang = (deg * Math.PI) / 180;
      const rx = i % 2 === 0 ? 355 : 275;
      const ry = i % 2 === 0 ? 255 : 205;
      nList.push({
        id: m.id,
        label: m.name.replace(' (Browser Ready)', ''),
        kind: 'model',
        x: cx + Math.cos(ang) * rx,
        y: cy + Math.sin(ang) * ry,
        r: 13,
        color: '#818CF8',
        description: m.tagline,
        route: '/models',
        meta: `${m.parameters} · ${m.browserRunnable ? 'BROWSER CHAT READY' : m.family}`,
      });
      eList.push({ from: 'pillar-ai', to: m.id, color: '#818CF8' });
    });

    // Skills orbiting Pillar 2 (top-right)
    KRONVEX_SKILLS.forEach((s, i) => {
      const ang = ((-82 + i * 24) * Math.PI) / 180;
      nList.push({
        id: s.id,
        label: s.name,
        kind: 'skill',
        x: cx + Math.cos(ang) * 335,
        y: cy + Math.sin(ang) * 240,
        r: 12,
        color: '#10B981',
        description: s.tagline,
        route: '/skills',
        meta: `SKILL v${s.version} · ${s.category}`,
      });
      eList.push({ from: 'pillar-intel', to: s.id, color: '#10B981' });
    });

    return { nodes: nList, edges: eList };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let t = 0;
    let isDark = document.documentElement.classList.contains('dark');

    const themeObs = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark');
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const draw = () => {
      t += 0.012;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = 1000;
      const height = 620;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 100% Transparent Canvas — Constellation floats freely over the open page & signal field
      ctx.clearRect(0, 0, width, height);

      // Soft central ambient nebula glow (no rectangular edge!)
      const bg = ctx.createRadialGradient(500, 310, 18, 500, 310, 420);
      bg.addColorStop(0, isDark ? 'rgba(56, 189, 248, 0.10)' : 'rgba(2, 132, 199, 0.07)');
      bg.addColorStop(0.65, isDark ? 'rgba(129, 140, 248, 0.04)' : 'rgba(79, 70, 229, 0.03)');
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(500, 310, 420, 0, Math.PI * 2);
      ctx.fill();

      // Subtle concentric radar rings
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(2, 132, 199, 0.18)';
      ctx.lineWidth = 1;
      [135, 245, 345].forEach((radius) => {
        ctx.beginPath();
        ctx.arc(500, 310, radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      const isVisible = (n: GraphNode) => filter === 'all' || n.kind === 'core' || n.kind === 'pillar' || n.kind === filter;

      // Edges + traveling light pulses
      edges.forEach((edge, idx) => {
        const a = nodeMap.get(edge.from);
        const b = nodeMap.get(edge.to);
        if (!a || !b) return;
        const active = isVisible(a) && isVisible(b);
        ctx.strokeStyle = active
          ? `${edge.color}${isDark ? '66' : '88'}`
          : isDark
          ? 'rgba(148,163,184,0.10)'
          : 'rgba(100,116,139,0.16)';
        ctx.lineWidth = active ? 1.6 : 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        if (active) {
          const prog = (t * 0.65 + idx * 0.17) % 1;
          const px = a.x + (b.x - a.x) * prog;
          const py = a.y + (b.y - a.y) * prog;
          ctx.fillStyle = edge.color;
          ctx.beginPath();
          ctx.arc(px, py, 2.7, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Nodes
      nodes.forEach((node, idx) => {
        const visible = isVisible(node);
        const bobY = node.kind === 'core' ? 0 : Math.sin(t * 1.4 + idx) * 2.2;
        const nx = node.x;
        const ny = node.y + bobY;
        const isHot = hoveredId === node.id || selected?.id === node.id;

        ctx.globalAlpha = visible ? 1 : 0.18;

        // Glow halo
        if (isHot || node.kind === 'core') {
          const glow = ctx.createRadialGradient(nx, ny, node.r * 0.4, nx, ny, node.r * 2.2);
          glow.addColorStop(0, `${node.color}55`);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(nx, ny, node.r * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Outer ring
        ctx.fillStyle = isDark ? '#070D1D' : '#FFFFFF';
        ctx.strokeStyle = isHot ? (isDark ? '#FFFFFF' : '#020617') : node.color;
        ctx.lineWidth = isHot ? 2.6 : 2;
        ctx.beginPath();
        ctx.arc(nx, ny, node.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner pulse dot (or 7-dot mini symbol for core!)
        if (node.kind === 'core') {
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(nx, ny, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0EA5E9';
          for (let k = 0; k < 6; k++) {
            const a = ((-90 + k * 60) * Math.PI) / 180 + t * 0.2;
            ctx.beginPath();
            ctx.arc(nx + Math.cos(a) * 16, ny + Math.sin(a) * 16, 2.8, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(nx, ny, node.r * 0.36, 0, Math.PI * 2);
          ctx.fill();
        }

        // Crisp high-contrast label in both Dark & Light modes
        ctx.font =
          node.kind === 'core' || node.kind === 'pillar'
            ? '700 12px "JetBrains Mono", monospace'
            : '600 11.5px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isDark ? '#FFFFFF' : '#020617';
        ctx.fillText(node.label, nx, ny + node.r + 16);
        ctx.globalAlpha = 1;
      });

      ctx.restore();
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      themeObs.disconnect();
    };
  }, [nodes, edges, filter, hoveredId, selected]);

  const getHitNode = (e: React.MouseEvent<HTMLCanvasElement>): GraphNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1000;
    const y = ((e.clientY - rect.top) / rect.height) * 620;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dist = Math.hypot(x - n.x, y - n.y);
      if (dist <= n.r + 10) return n;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Open Underline Filter Controls (Zero Boxed Chips) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-300/80 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-6">
          {KIND_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`pb-2 -mb-3.5 text-xs font-mono font-bold border-b-2 transition ${
                filter === f.id
                  ? 'border-sky-500 text-black dark:text-white'
                  : 'border-transparent text-slate-800 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="text-xs font-mono font-medium text-slate-900 dark:text-white">
          Click any orbital node to inspect its Mission Dossier
        </div>
      </div>

      {/* Borderless Open Floating Orbital Graph + Responsive Mission Dossier */}
      <div className="relative space-y-4 sm:space-y-0">
        <div className="overflow-x-auto overflow-y-hidden">
          <canvas
            ref={canvasRef}
            onMouseMove={(e) => {
              const hit = getHitNode(e);
              setHoveredId(hit ? hit.id : null);
            }}
            onClick={(e) => {
              const hit = getHitNode(e);
              if (hit) setSelected(hit);
            }}
            className={`min-w-[680px] sm:min-w-0 w-full h-auto block ${hoveredId ? 'cursor-pointer' : 'cursor-default'}`}
            style={{ aspectRatio: '1000 / 620' }}
          />
        </div>

        {/* Slide-Over Mission Dossier */}
        {selected && (
          <div className="sm:absolute sm:top-4 sm:right-4 sm:w-80 rounded-2xl bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border border-slate-300/80 dark:border-sky-500/35 p-5 text-black dark:text-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-600 dark:text-sky-300">
                {selected.kind === 'app' ? (
                  <Layers className="w-3.5 h-3.5" />
                ) : selected.kind === 'model' ? (
                  <Cpu className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {selected.kind.toUpperCase()}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1 rounded-full text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                aria-label="Close dossier"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-display font-bold text-lg text-black dark:text-white">{selected.label}</h3>
            <div className="font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-300 mt-0.5 mb-3">
              {selected.meta}
            </div>
            <p className="text-xs text-slate-900 dark:text-white leading-relaxed mb-4">{selected.description}</p>
            <button
              type="button"
              onClick={() => navigate(selected.route)}
              className="w-full py-2.5 px-4 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              Open Module <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch-Friendly Node Directory */}
      <div className="sm:hidden space-y-2.5 pt-2 border-t border-slate-300/70 dark:border-slate-800">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-900 dark:text-white">
          <span>TOUCH NODE DIRECTORY</span>
          <span>Swipe map above or tap below</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {nodes
            .filter((n) => filter === 'all' || n.kind === 'core' || n.kind === 'pillar' || n.kind === filter)
            .map((node) => {
              const active = selected?.id === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelected(node)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 border transition ${
                    active
                      ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                      : 'border-slate-300 dark:border-slate-700 text-black dark:text-white hover:border-sky-500/60'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: active ? '#020617' : node.color }}
                  />
                  <span>{node.label}</span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
