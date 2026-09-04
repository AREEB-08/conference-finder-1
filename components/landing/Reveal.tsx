"use client";

import { useEffect, useRef } from "react";

/**
 * Reveals its children once they scroll into view.
 *
 * The hidden state lives in CSS behind `.js` and a reduced-motion query, so if
 * this component never mounts the content is simply visible. Nothing here can
 * leave a section permanently blank.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Milliseconds to stagger this item behind its neighbours. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      node.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          node.classList.add("is-visible");
          // Reveal once; re-animating on every scroll pass is distracting.
          observer.unobserve(node);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Widening to ElementType keeps the ref type from being intersected across
  // every tag this component can render as.
  const Component = Tag as React.ElementType;

  return (
    <Component
      ref={ref}
      data-reveal=""
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </Component>
  );
}
