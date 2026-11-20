import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Cpu, Layers, Sparkles, X } from 'lucide-react';
import { NOVALIS_APPS, NOVALIS_MODELS, NOVALIS_PILLARS, NOVALIS_SKILLS } from '../data/catalog';

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
        label: 'NOVALIS CORE',
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
    NOVALIS_PILLARS.forEach((p, idx) => {
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
    NOVALIS_APPS.forEach((app, i) => {
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
    NOVALIS_MODELS.forEach((m, i) => {
      const span = Math.max(NOVALIS_MODELS.length - 1, 1);
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
    NOVALIS_SKILLS.forEach((s, i) => {
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

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const draw = () => {
      t += 0.012;
      const dpr = window.devicePixelRatio || 1;
      const width = 1000;
      const height = 620;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep space background
      const bg = ctx.createRadialGradient(500, 310, 20, 500, 310, 520);
      bg.addColorStop(0, '#0E1B36');
      bg.addColorStop(1, '#050811');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Subtle concentric radar rings
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.09)';
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
        ctx.strokeStyle = active ? `${edge.color}55` : 'rgba(148,163,184,0.08)';
        ctx.lineWidth = active ? 1.5 : 0.8;
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
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
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

        ctx.globalAlpha = visible ? 1 : 0.16;

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
        ctx.fillStyle = '#090E1B';
        ctx.strokeStyle = isHot ? '#FFFFFF' : node.color;
        ctx.lineWidth = isHot ? 2.6 : 1.8;
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
          ctx.fillStyle = '#38BDF8';
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

        // Label
        ctx.font = node.kind === 'core' || node.kind === 'pillar' ? '700 11.5px "JetBrains Mono", monospace' : '600 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isHot ? '#FFFFFF' : '#F8FAFC';
        ctx.fillText(node.label, nx, ny + node.r + 15);
        ctx.globalAlpha = 1;
      });

      ctx.restore();
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
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
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {KIND_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                filter === f.id
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'bg-slate-200/80 dark:bg-slate-900 text-slate-950 dark:text-slate-100 border border-slate-300 dark:border-slate-800 hover:border-sky-500/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="text-xs font-mono text-slate-800 dark:text-slate-200">
          Click any orbital node to inspect its Mission Dossier
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#050811] shadow-2xl">
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
          className={`w-full h-auto block ${hoveredId ? 'cursor-pointer' : 'cursor-default'}`}
          style={{ aspectRatio: '1000 / 620' }}
        />

        {/* Slide-Over Mission Dossier */}
        {selected && (
          <div className="absolute top-4 right-4 left-4 sm:left-auto sm:w-80 rounded-xl bg-[#0B1120]/95 backdrop-blur-xl border border-sky-500/30 p-5 text-slate-100 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30">
                {selected.kind === 'app' ? (
                  <Layers className="w-3 h-3" />
                ) : selected.kind === 'model' ? (
                  <Cpu className="w-3 h-3" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                {selected.kind.toUpperCase()}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1 rounded text-slate-200 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-display font-bold text-lg text-white">{selected.label}</h3>
            <div className="font-mono text-[11px] text-sky-300 mt-0.5 mb-3">{selected.meta}</div>
            <p className="text-xs text-slate-100 leading-relaxed mb-4">{selected.description}</p>
            <button
              type="button"
              onClick={() => navigate(selected.route)}
              className="w-full py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              Open Module <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
