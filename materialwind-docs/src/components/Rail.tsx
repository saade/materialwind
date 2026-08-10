import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export const NAV = [
  ["install", "Install"],
  ["playground", "Playground"],
  ["palette", "Palette"],
  ["components", "Components"],
  ["surfaces", "Surfaces"],
  ["states", "Interaction states"],
  ["dynamic", "Dynamic color"],
  ["arbitrary", "Arbitrary values"],
  ["options", "Options"],
  ["credits", "Credits"],
] as const;

/** Distance below the viewport top at which a section counts as current. */
const ACTIVE_LINE = 120;

/**
 * A scroll handler rather than IntersectionObserver: "the last section whose top
 * has passed the line" is a total order, so it can never land on two sections or
 * on none, which observer rootMargin tricks do when a section is shorter than
 * the viewport, leaving the final section unreachable.
 */
function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;

      // At the bottom of the page the last section wins even if its top never
      // crosses the line.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActive(ids[ids.length - 1] ?? null);
        return;
      }

      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= ACTIVE_LINE) current = id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return active;
}

/** One pill that slides, rather than a background per item, so the movement
 *  reads as a single object. */
function useIndicator(active: string | null) {
  const listRef = useRef<HTMLUListElement>(null);
  const [rect, setRect] = useState<{ top: number; height: number } | null>(null);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list || !active) return setRect(null);
    // Measure the <li>, not the <a>. Each <li> is `relative` so its text paints
    // above the absolutely-positioned pill, which also makes it the anchor's
    // offsetParent -- so the anchor's own offsetTop is always 0.
    const item = list.querySelector<HTMLElement>(`li[data-section="${active}"]`);
    if (!item) return setRect(null);
    setRect({ top: item.offsetTop, height: item.offsetHeight });
  }, [active]);

  // Layout effect so the pill is positioned in the same frame the active item
  // changes, otherwise it visibly jumps from 0 on first paint.
  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return { listRef, rect };
}

function Items({
  active,
  onNavigate,
}: {
  active: string | null;
  onNavigate?: () => void;
}) {
  const { listRef, rect } = useIndicator(active);

  return (
    <ul ref={listRef} className="relative">
      <span
        aria-hidden
        className="absolute inset-x-0 rounded-full bg-secondary-container transition-[transform,height,opacity] duration-300 ease-out motion-reduce:transition-none"
        style={{
          height: rect?.height ?? 0,
          transform: `translateY(${rect?.top ?? 0}px)`,
          opacity: rect ? 1 : 0,
        }}
      />
      {NAV.map(([id, label]) => {
        const isActive = active === id;
        return (
          <li key={id} data-section={id} className="relative">
            <a
              href={`#${id}`}
              onClick={onNavigate}
              aria-current={isActive ? "true" : undefined}
              className={`block rounded-full px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? "font-medium text-on-secondary-container"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function Rail({ open, onClose }: { open: boolean; onClose: () => void }) {
  const active = useActiveSection(NAV.map(([id]) => id));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  return (
    <>
      <nav
        aria-label="Sections"
        className="sticky top-20 hidden h-fit py-2 lg:block"
      >
        <Items active={active} />
      </nav>

      {/* Below lg a persistent rail would eat the page, so it becomes a drawer. */}
      <div
        className={`fixed inset-0 z-30 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-scrim/50 transition-opacity duration-200 motion-reduce:transition-none ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <nav
          aria-label="Sections"
          role="dialog"
          aria-modal={open}
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-surface-container p-4 shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="text-sm font-medium text-on-surface">Sections</span>
            <button
              onClick={onClose}
              aria-label="Close navigation"
              className="interactive-surface-container-high rounded-full px-3 py-1.5 text-xs font-medium"
            >
              Close
            </button>
          </div>
          <Items active={active} onNavigate={onClose} />
        </nav>
      </div>
    </>
  );
}
