import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { KronvexSignalField, type SignalIntensityMode } from './components/KronvexSignalField';
import { HomePage } from './pages/HomePage';
import { I18nProvider } from './i18n/I18nContext';
import { detectHardwareProfile, detectUserOS } from './utils/hardware';
import type { DecryptedArchitectVault } from './utils/architectVaultCrypto';
import type { DetectedHardware } from './types/kronvex';

const AppsPage = lazy(() => import('./pages/AppsPage').then((m) => ({ default: m.AppsPage })));
const ModelsPage = lazy(() => import('./pages/ModelsPage').then((m) => ({ default: m.ModelsPage })));
const SkillsPage = lazy(() => import('./pages/SkillsPage').then((m) => ({ default: m.SkillsPage })));
const Index21Page = lazy(() => import('./pages/Index21Page').then((m) => ({ default: m.Index21Page })));
const ConstellationPage = lazy(() =>
  import('./pages/ConstellationPage').then((m) => ({ default: m.ConstellationPage }))
);
const VisionPage = lazy(() => import('./pages/VisionPage').then((m) => ({ default: m.VisionPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const ArcadePage = lazy(() => import('./pages/ArcadePage').then((m) => ({ default: m.ArcadePage })));
const EnterprisePage = lazy(() => import('./pages/EnterprisePage').then((m) => ({ default: m.EnterprisePage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const WorkPage = lazy(() => import('./pages/WorkPage').then((m) => ({ default: m.WorkPage })));
const PlaybookPage = lazy(() => import('./pages/PlaybookPage').then((m) => ({ default: m.PlaybookPage })));
const CommandTerminal = lazy(() =>
  import('./components/CommandTerminal').then((m) => ({ default: m.CommandTerminal }))
);
const ArchitectVaultModal = lazy(() =>
  import('./components/ArchitectVaultModal').then((m) => ({ default: m.ArchitectVaultModal }))
);
const MatrixChamberModal = lazy(() =>
  import('./components/MatrixChamberModal').then((m) => ({ default: m.MatrixChamberModal }))
);

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const timer = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }, 80);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function GlobalSignalBackdrop() {
  const { pathname } = useLocation();
  const mode: SignalIntensityMode =
    pathname === '/'
      ? 'hero'
      : pathname.startsWith('/arcade') || pathname.startsWith('/games') || pathname.startsWith('/constellation')
      ? 'subtle'
      : 'ambient';
  return <KronvexSignalField mode={mode} />;
}

function PageFallback() {
  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-24 flex items-center justify-center">
      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-mono text-sky-700 dark:text-sky-300">
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
        Loading KRONVEX module...
      </div>
    </div>
  );
}

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('kronvex-theme');
    return saved ? saved === 'dark' : true;
  });

  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdMode, setCmdMode] = useState<'palette' | 'terminal'>('palette');
  const [vaultState, setVaultState] = useState<{
    payload: DecryptedArchitectVault;
    proofCode: string;
  } | null>(null);
  const [gatewayView, setGatewayView] = useState<'choose' | 'chamber' | 'cli' | null>(null);

  const [hardware, setHardware] = useState<DetectedHardware>(() => ({
    os: detectUserOS(),
    cpuCores: typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4,
    ramGb: null,
    webgpuSupported: false,
    webgpuAdapter: null,
    wasmSupported: typeof WebAssembly !== 'undefined',
  }));

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('kronvex-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    detectHardwareProfile().then(setHardware).catch(() => {});
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdMode('palette');
        setCmdOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onVaultUnlock = (e: Event) => {
      const detail = (e as CustomEvent<{ payload: DecryptedArchitectVault; proofCode: string }>).detail;
      if (detail?.payload && detail?.proofCode) {
        setGatewayView(null);
        setVaultState({ payload: detail.payload, proofCode: detail.proofCode });
      }
    };
    const onMatrixGateway = (e: Event) => {
      const detail = (e as CustomEvent<{ view?: 'choose' | 'chamber' | 'cli' }>).detail;
      setGatewayView(detail?.view ?? 'choose');
    };
    window.addEventListener('kronvex-architect-vault', onVaultUnlock);
    window.addEventListener('kronvex-matrix-gateway', onMatrixGateway);
    return () => {
      window.removeEventListener('kronvex-architect-vault', onVaultUnlock);
      window.removeEventListener('kronvex-matrix-gateway', onMatrixGateway);
    };
  }, []);

  const openCommand = (mode: 'palette' | 'terminal' = 'palette') => {
    setCmdMode(mode);
    setCmdOpen(true);
  };

  return (
    <I18nProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <div aria-hidden="true" className="kronvex-ambient-glow" />
        <GlobalSignalBackdrop />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navbar
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode((d) => !d)}
            onOpenCommand={openCommand}
            hardware={hardware}
          />

          <main className="flex-1">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route
                  path="/"
                  element={<HomePage hardware={hardware} onOpenTerminal={() => openCommand('terminal')} />}
                />
                <Route path="/apps" element={<AppsPage hardware={hardware} />} />
                <Route path="/models" element={<ModelsPage hardware={hardware} />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/top-21" element={<Index21Page />} />
                <Route path="/research" element={<Index21Page defaultTab="papers" />} />
                <Route path="/papers" element={<Index21Page defaultTab="papers" />} />
                <Route path="/arcade" element={<ArcadePage />} />
                <Route path="/games" element={<ArcadePage />} />
                <Route path="/constellation" element={<ConstellationPage />} />
                <Route path="/enterprise" element={<EnterprisePage />} />
                <Route path="/solutions" element={<EnterprisePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/work" element={<WorkPage />} />
                <Route path="/case-studies" element={<WorkPage />} />
                <Route path="/playbook" element={<PlaybookPage />} />
                <Route path="/glossary" element={<PlaybookPage />} />
                <Route path="/vision" element={<VisionPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route
                  path="*"
                  element={<HomePage hardware={hardware} onOpenTerminal={() => openCommand('terminal')} />}
                />
              </Routes>
            </Suspense>
          </main>

          <Footer onOpenTerminal={() => openCommand('terminal')} />

          {cmdOpen && (
            <Suspense fallback={null}>
              <CommandTerminal
                open={cmdOpen}
                initialMode={cmdMode}
                onClose={() => setCmdOpen(false)}
                hardware={hardware}
              />
            </Suspense>
          )}

          {gatewayView && (
            <Suspense fallback={null}>
              <MatrixChamberModal
                initialView={gatewayView}
                onClose={() => setGatewayView(null)}
                onOpenBuiltInCli={() => {
                  setGatewayView(null);
                  openCommand('terminal');
                }}
                onUnlocked={({ payload, proofCode }) => {
                  setGatewayView(null);
                  setVaultState({ payload, proofCode });
                }}
              />
            </Suspense>
          )}

          {vaultState && (
            <Suspense fallback={null}>
              <ArchitectVaultModal
                payload={vaultState.payload}
                proofCode={vaultState.proofCode}
                onClose={() => setVaultState(null)}
              />
            </Suspense>
          )}
        </div>
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;
