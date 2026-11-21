import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CommandTerminal } from './components/CommandTerminal';
import { HomePage } from './pages/HomePage';
import { AppsPage } from './pages/AppsPage';
import { ModelsPage } from './pages/ModelsPage';
import { SkillsPage } from './pages/SkillsPage';
import { ConstellationPage } from './pages/ConstellationPage';
import { VisionPage } from './pages/VisionPage';
import { ContactPage } from './pages/ContactPage';
import { Index21Page } from './pages/Index21Page';
import { detectHardwareProfile, detectUserOS } from './utils/hardware';
import type { DetectedHardware } from './types/kronvex';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('kronvex-theme');
    return saved ? saved === 'dark' : true;
  });

  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdMode, setCmdMode] = useState<'palette' | 'terminal'>('palette');

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

  const openCommand = (mode: 'palette' | 'terminal' = 'palette') => {
    setCmdMode(mode);
    setCmdOpen(true);
  };

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((d) => !d)}
          onOpenCommand={openCommand}
          hardware={hardware}
        />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={<HomePage hardware={hardware} onOpenTerminal={() => openCommand('terminal')} />}
            />
            <Route path="/apps" element={<AppsPage hardware={hardware} />} />
            <Route path="/models" element={<ModelsPage hardware={hardware} />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/top-21" element={<Index21Page />} />
            <Route path="/constellation" element={<ConstellationPage />} />
            <Route path="/vision" element={<VisionPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="*"
              element={<HomePage hardware={hardware} onOpenTerminal={() => openCommand('terminal')} />}
            />
          </Routes>
        </main>

        <Footer />

        <CommandTerminal
          open={cmdOpen}
          initialMode={cmdMode}
          onClose={() => setCmdOpen(false)}
          hardware={hardware}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
