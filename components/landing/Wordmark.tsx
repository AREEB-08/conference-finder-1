/**
 * Site mark: a hand-drawn globe. Drawn with slightly wobbly strokes so it sits
 * in the same "designer's sketchbook" family as the site illustrations.
 */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="14" cy="14" r="12" fill="var(--accent-wash)" />
      <circle
        cx="14"
        cy="14"
        r="12"
        stroke="var(--accent)"
        strokeWidth="1.8"
      />
      {/* meridians */}
      <path
        d="M14 2c-4.6 3.1-4.6 20.9 0 24M14 2c4.6 3.1 4.6 20.9 0 24"
        stroke="var(--accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* parallels */}
      <path
        d="M3.4 9.4c6.6-2.4 14.6-2.4 21.2 0M3.4 18.6c6.6 2.4 14.6 2.4 21.2 0"
        stroke="var(--accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* a little orbit star, sketchbook style */}
      <path
        d="M23.6 3.2l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5.5-1.3z"
        fill="var(--illustration-rose, #d6aec1)"
      />
    </svg>
  );
}
