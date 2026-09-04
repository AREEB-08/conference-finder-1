"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up to a value when it scrolls into view.
 *
 * The server renders the final number, so the correct figure is in the HTML
 * for search engines and for anyone without JavaScript. The animation only
 * ever replaces a number that is already correct.
 */
export default function CountUp({
  value,
  duration = 900,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || hasRun.current) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion || value <= 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || hasRun.current) return;
        hasRun.current = true;
        observer.disconnect();

        const start = performance.now();
        setDisplay(0);

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          // Ease-out so the number settles rather than stopping dead.
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className="tnum">
      {display}
    </span>
  );
}
