import { Network } from 'lucide-react';
import { ConstellationCanvas } from '../components/ConstellationCanvas';

export function ConstellationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/25">
          <Network className="w-3.5 h-3.5" /> INTERACTIVE ECOSYSTEM GRAPH · 7-NODE CORE
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-black dark:text-white">
          KRONVEX Ecosystem Constellation
        </h1>
        <p className="text-slate-900 dark:text-slate-100">
          Navigate how our Cross-Platform Apps, Market Intelligence engines, AI Models, and Agent Skills orbit around
          the 7-Node KRONVEX Core. Filter by layer or click any node to inspect its Mission Dossier.
        </p>
      </div>

      <ConstellationCanvas />
    </div>
  );
}
