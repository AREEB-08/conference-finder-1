/**
 * The hero's decorative graphic: an abstract conference programme.
 *
 * Rows are sessions, blocks are talks, and they light up in sequence the way
 * you read down a schedule. It is drawn from theme tokens so it recolours with
 * light and dark mode, and it is purely decorative — hidden from assistive
 * technology and skipped entirely when motion is reduced.
 */
export default function ProgrammeMotif() {
  const rows = [
    { y: 0, blocks: [0, 78, 132], widths: [70, 48, 96] },
    { y: 42, blocks: [0, 92], widths: [84, 104] },
    { y: 84, blocks: [0, 60, 150], widths: [52, 84, 78] },
    { y: 126, blocks: [0, 74], widths: [66, 122] },
    { y: 168, blocks: [0, 96, 156], widths: [88, 52, 72] },
  ];

  return (
    <svg
      viewBox="0 0 260 210"
      role="presentation"
      aria-hidden="true"
      className="h-auto w-full max-w-sm"
    >
      {rows.map((row, rowIndex) => (
        <g key={row.y} transform={`translate(0 ${row.y})`}>
          {/* Time gutter */}
          <rect
            x="0"
            y="10"
            width="18"
            height="4"
            rx="2"
            fill="var(--rule-strong)"
          />

          {row.blocks.map((x, blockIndex) => (
            <rect
              key={x}
              className="cf-session"
              x={30 + x}
              y="4"
              width={row.widths[blockIndex]}
              height="16"
              rx="4"
              fill={
                (rowIndex + blockIndex) % 3 === 0
                  ? "var(--accent)"
                  : "var(--accent-line)"
              }
              style={{
                animationDelay: `${rowIndex * 320 + blockIndex * 160}ms`,
              }}
            />
          ))}
        </g>
      ))}

      {/* Baseline rule, echoing a printed programme */}
      <rect x="0" y="202" width="260" height="1" fill="var(--rule)" />
    </svg>
  );
}
