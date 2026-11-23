import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

interface ScrollScrubTextProps {
  text: string;
  as?: 'h2' | 'h3' | 'p' | 'div';
  className?: string;
}

/**
 * Apple / Antigravity-style Bidirectional Scroll-Scrubbed Word Reveal.
 * - Updates word spans directly via DOM refs inside requestAnimationFrame (0 React re-renders per scroll frame).
 * - Preserves full Arabic cursive ligatures by splitting on word boundaries only (never mid-word).
 * - Automatically degrades to static full-opacity text when prefers-reduced-motion is enabled.
 */
export function ScrollScrubText({ text, as = 'h2', className = '' }: ScrollScrubTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const tokens = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return [];
    const spaceWords = trimmed.split(/\s+/);
    // For CJK text without spaces (e.g. zh-CN), group into clean 2-character chunks
    if (spaceWords.length <= 2 && /[\u4e00-\u9fff]/.test(trimmed)) {
      const chunks: string[] = [];
      for (let i = 0; i < trimmed.length; i += 2) {
        chunks.push(trimmed.slice(i, i + 2));
      }
      return chunks;
    }
    return spaceWords;
  }, [text]);

  const isCjkNoSpaces = useMemo(
    () => text.trim().split(/\s+/).length <= 2 && /[\u4e00-\u9fff]/.test(text),
    [text]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || tokens.length === 0) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reducedMotion) {
      wordRefs.current.forEach((span) => {
        if (!span) return;
        span.style.opacity = '1';
        span.style.transform = 'none';
        span.style.filter = 'none';
      });
      return;
    }

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      // Progress = 0 when entering bottom (94% of viewport), 1 when comfortably in upper-mid screen (38% of viewport)
      const startY = vh * 0.94;
      const endY = vh * 0.36;
      const raw = (startY - rect.top) / Math.max(1, startY - endY);
      const progress = Math.max(0, Math.min(1, raw));

      const count = tokens.length;
      for (let i = 0; i < count; i++) {
        const span = wordRefs.current[i];
        if (!span) continue;
        // Overlapping wave window so words illuminate smoothly in sequence both scrolling down & up
        const wordStart = (i / count) * 0.72;
        const wordEnd = wordStart + 0.28;
        const local = Math.max(0, Math.min(1, (progress - wordStart) / (wordEnd - wordStart)));
        // Smoothstep easing — keeps >=58% base opacity so every word stays WCAG AA compliant at rest
        const eased = local * local * (3 - 2 * local);
        const opacity = 0.58 + eased * 0.42;
        const dy = (1 - eased) * 14;
        const blur = (1 - eased) * 2.2;
        span.style.opacity = opacity.toFixed(3);
        span.style.transform = `translate3d(0, ${dy.toFixed(2)}px, 0)`;
        span.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
      }
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [tokens]);

  const Tag = as;

  return (
    <div ref={containerRef}>
      <Tag className={className}>
        {tokens.map((word, idx) => (
          <span key={`${idx}-${word}`}>
            <span
              ref={(node) => {
                wordRefs.current[idx] = node;
              }}
              className="inline-block will-change-[opacity,transform,filter]"
              style={{ opacity: 0.58, transform: 'translate3d(0, 14px, 0)', filter: 'blur(2.2px)' }}
            >
              {word}
            </span>
            {!isCjkNoSpaces && idx < tokens.length - 1 ? ' ' : ''}
          </span>
        ))}
      </Tag>
    </div>
  );
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * Bidirectional Masked Slide-Up Reveal.
 * Smoothly glides elements into view both when scrolling down and when scrolling back up.
 */
export function ScrollReveal({ children, className = '', delayMs = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'visible' | 'below' | 'above'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return 'visible';
    }
    return 'below';
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      setState('visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState('visible');
          } else {
            setState(entry.boundingClientRect.top > 0 ? 'below' : 'above');
          }
        }
      },
      { threshold: 0.01, rootMargin: '0px 0px -12px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const transformClass =
    state === 'visible'
      ? 'opacity-100 translate-y-0'
      : state === 'below'
      ? 'opacity-0 translate-y-6'
      : 'opacity-0 -translate-y-4';

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: state === 'visible' && delayMs > 0 ? `${delayMs}ms` : '0ms',
      }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] ${transformClass} ${className}`}
    >
      {children}
    </div>
  );
}
