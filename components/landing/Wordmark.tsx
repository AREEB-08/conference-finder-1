/**
 * Site wordmark.
 *
 * The glyph is a neutral geometric mark — an open book rendered as two leaves —
 * NOT the Jamia Hamdard crest. If this becomes an official university project,
 * replace it with the real logo and update the alt text accordingly.
 */
export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="6"
        fill="var(--accent-wash)"
        stroke="var(--accent-line)"
      />
      <path
        d="M12 7.4c-1.5-1.1-3.2-1.5-5-1.3v9.6c1.8-.2 3.5.2 5 1.3m0-9.6c1.5-1.1 3.2-1.5 5-1.3v9.6c-1.8-.2-3.5.2-5 1.3m0-9.6v9.6"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
