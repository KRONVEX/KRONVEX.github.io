import { Network } from 'lucide-react';
import { ConstellationCanvas } from '../components/ConstellationCanvas';
import { useI18n } from '../i18n/I18nContext';

export function ConstellationPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-sky-700 dark:text-sky-300">
            <Network className="w-4 h-4" /> {t.constellation.badge}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white tracking-tight">
            {t.constellation.title}
          </h1>
          <p className="text-base text-slate-900 dark:text-white leading-relaxed max-w-3xl">
            {t.constellation.subtitle}
          </p>
        </div>
        <div className="lg:col-span-4 lg:border-s border-slate-300/80 dark:border-slate-700/80 lg:ps-8 font-mono text-xs space-y-1">
          <div className="text-sky-600 dark:text-sky-400 font-bold">● 60FPS ORBITAL TELEMETRY</div>
          <div className="text-slate-900 dark:text-white">Apps · Market Intel · Local AI Models · Agent Skills</div>
        </div>
      </div>

      <div dir="ltr">
        <ConstellationCanvas />
      </div>
    </div>
  );
}
