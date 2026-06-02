import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Horizontal swipe carousel built on native CSS scroll-snap.
 *
 * - One item per screen (~90% width) snapped to center, with neighbors peeking.
 * - Peeking (non-active) items are blurred / dimmed / slightly shrunk.
 * - Tracks the centered item via IntersectionObserver and exposes `isActive`.
 * - Renders a counter chip ("3 / 24") when there is more than one item.
 * - Self-sizes to fill the viewport below its own top, minus `bottomInset`
 *   (room for a fixed bottom bar), so each item can scroll internally.
 *
 * Usage:
 *   <Carousel items={list} getKey={r => r.id} bottomInset={96}>
 *     {(item, isActive, index) => <Card r={item} isActive={isActive} />}
 *   </Carousel>
 */
export default function Carousel({ items, getKey, children, bottomInset = 96, gap = 0, height }) {
  const wrapRef = useRef(null);
  const scrollRef = useRef(null);
  const ratios = useRef({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [measuredHeight, setMeasuredHeight] = useState(null);

  // Fill remaining viewport height below our top edge.
  // Skipped when an explicit `height` is supplied by the parent.
  useLayoutEffect(() => {
    if (height != null) return;
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      setMeasuredHeight(Math.max(320, vh - top - bottomInset));
    };
    measure();
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [bottomInset, items.length, height]);

  const finalHeight = height ?? measuredHeight ?? "70dvh";

  // Track the most-centered slot.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const slots = [...root.querySelectorAll("[data-slot]")];
    ratios.current = {};
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          ratios.current[Number(e.target.dataset.slot)] = e.intersectionRatio;
        });
        let best = 0;
        let bestRatio = -1;
        for (const [i, ratio] of Object.entries(ratios.current)) {
          if (ratio > bestRatio) { bestRatio = ratio; best = Number(i); }
        }
        setActiveIndex(best);
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    slots.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, [items.length]);

  return (
    <div ref={wrapRef} style={{ height: finalHeight, display: "flex", flexDirection: "column" }}>
      <style>{`.lb-carousel::-webkit-scrollbar{display:none}`}</style>

      {/* Progress slider — sits between whatever is above and the cards */}
      {items.length > 1 && (
        <div style={{ flex: "0 0 auto", padding: "4px 5% 10px" }}>
          <div style={{ position: "relative", height: 4, borderRadius: 99, background: "var(--border2)" }}>
            <div style={{
              position: "absolute", top: 0, bottom: 0,
              left: `${(activeIndex / items.length) * 100}%`,
              width: `${100 / items.length}%`,
              background: "#C8FF47", borderRadius: 99,
              transition: "left .25s cubic-bezier(.16,1,.3,1)",
            }} />
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="lb-carousel"
        style={{
          flex: "1 1 auto", minHeight: 0, display: "flex", gap,
          overflowX: "auto", overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          padding: "8px 5%",
        }}
      >
        {items.map((item, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={getKey ? getKey(item) : i}
              data-slot={i}
              style={{
                flex: "0 0 90%", height: "100%",
                scrollSnapAlign: "center",
                padding: "0 5px", display: "flex",
              }}
            >
              <div style={{
                width: "100%", height: "100%", display: "flex",
                transition: "filter .3s ease, opacity .3s ease, transform .3s ease",
                filter: isActive ? "blur(0)" : "blur(2px)",
                opacity: isActive ? 1 : 0.55,
                transform: isActive ? "scale(1)" : "scale(0.96)",
              }}>
                {children(item, isActive, i)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
