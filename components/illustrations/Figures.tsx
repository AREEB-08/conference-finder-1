/**
 * Hand-drawn human figures inside browser frames — the brand's visual anchor
 * (see DESIGN.md "Illustration Style Guide"). Loose ~2px ink line work, faces
 * reduced to dots and a single curve, hair as solid inked shapes, flat brand
 * fills only (sage, rose, sea foam, navy).
 */

const INK = "var(--illustration-ink)";
const SAGE = "var(--sage)";
const ROSE = "var(--rose)";
const SEAFOAM = "var(--seafoam)";
const PAPER = "var(--surface)";

function BrowserFrame({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="10"
        fill={PAPER}
        stroke={INK}
        strokeWidth="2.4"
      />
      <line
        x1={x}
        y1={y + 26}
        x2={x + width}
        y2={y + 26}
        stroke={INK}
        strokeWidth="2"
      />
      <circle cx={x + 13} cy={y + 13} r="2.4" fill={INK} />
      <circle cx={x + 23} cy={y + 13} r="2.4" fill={INK} />
      <circle cx={x + 33} cy={y + 13} r="2.4" fill={INK} />
    </g>
  );
}

/**
 * A researcher with a magnifying glass, peering out of a browser window.
 */
export function ResearcherFigure({
  width = 230,
  className,
}: {
  width?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={width * (215 / 230)}
      viewBox="0 0 230 215"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <BrowserFrame x={18} y={22} width={168} height={172} />

      {/* torso — teal shirt, flat fill with ink outline */}
      <path
        d="M56 194c2-36 18-56 46-56s44 20 46 56"
        fill={SAGE}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* collar */}
      <path
        d="M92 140c3 7 8 10 10 10s7-3 10-10"
        stroke={INK}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* head */}
      <circle
        cx="102"
        cy="103"
        r="26"
        fill={PAPER}
        stroke={INK}
        strokeWidth="2.4"
      />
      {/* hair — solid ink shape */}
      <path
        d="M76 100c-1-18 11-30 26-30 16 0 27 12 26 30-3-10-8-15-13-16-2 3-5 5-9 5-8 0-12-3-15-8-7 3-12 9-15 19z"
        fill={INK}
      />
      {/* beard */}
      <path
        d="M83 112c1 12 9 19 19 19s18-7 19-19c-3 8-9 12-19 12s-16-4-19-12z"
        fill={INK}
      />
      {/* face */}
      <circle cx="93" cy="104" r="2.2" fill={INK} />
      <circle cx="111" cy="104" r="2.2" fill={INK} />
      <path
        d="M98 115c2.4 1.8 5.6 1.8 8 0"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* right arm holding the magnifier out of the frame */}
      <path
        d="M140 152c14-4 26-12 34-24"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* magnifying glass — rose rim, sea foam glass */}
      <circle
        cx="186"
        cy="106"
        r="20"
        fill={SEAFOAM}
        fillOpacity="0.55"
        stroke={ROSE}
        strokeWidth="4"
      />
      <path
        d="M177 99c2-3 6-5 10-4"
        stroke={PAPER}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M180 124l-7 15"
        stroke={INK}
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* floating doodles */}
      <path
        d="M204 40c.7 3.6 1.9 6 3.4 6.7 1.2.5 2.7 1 4.8 1.5-3.6.7-6 1.9-6.7 3.4-.5 1.2-1 2.7-1.5 4.8-.7-3.6-1.9-6-3.4-6.7-1.2-.5-2.7-1-4.8-1.5 3.6-.7 6-1.9 6.7-3.4.5-1.2 1-2.7 1.5-4.8z"
        fill={SAGE}
      />
      <path
        d="M28 205h13M34.5 198.5v13"
        stroke={ROSE}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="212" cy="176" r="5" stroke={SEAFOAM} strokeWidth="2.6" />
    </svg>
  );
}

/**
 * A presenter waving from behind a laptop, browser window behind them,
 * with a speech bubble overhead.
 */
export function PresenterFigure({
  width = 230,
  className,
}: {
  width?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={width * (215 / 230)}
      viewBox="0 0 230 215"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <BrowserFrame x={42} y={40} width={166} height={150} />

      {/* raised waving arm — drawn before the body so it sits behind */}
      <path
        d="M162 118c10-10 16-22 17-36"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* hand */}
      <path
        d="M176 84c-1-4-1-7 1-10m4 9c0-4 .5-7 2.5-9m3.5 10c.5-3.5 1.5-6 3.5-7.5m1 9.5c1-2.5 2.5-4 4.5-5"
        stroke={INK}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* torso — navy sweater */}
      <path
        d="M76 190c2-32 17-50 42-50 26 0 41 18 43 50"
        fill="var(--navy)"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* head */}
      <circle
        cx="118"
        cy="108"
        r="25"
        fill={PAPER}
        stroke={INK}
        strokeWidth="2.4"
      />
      {/* hair with bun */}
      <circle cx="118" cy="76" r="9" fill={INK} />
      <path
        d="M93 106c-1-17 10-28 25-28s26 11 25 28c-4-9-9-14-14-15-3 3-7 4-11 4s-8-1-11-4c-5 1-10 6-14 15z"
        fill={INK}
      />
      {/* round glasses */}
      <circle cx="109" cy="108" r="6.5" stroke={INK} strokeWidth="2" />
      <circle cx="127" cy="108" r="6.5" stroke={INK} strokeWidth="2" />
      <path d="M115.5 108h5" stroke={INK} strokeWidth="2" />
      <circle cx="109" cy="108" r="1.8" fill={INK} />
      <circle cx="127" cy="108" r="1.8" fill={INK} />
      {/* smile */}
      <path
        d="M113 121c3 2.4 7 2.4 10 0"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* laptop in front */}
      <path
        d="M70 190l8-32c.5-2 2.3-3.5 4.4-3.5h68c2.9 0 5 2.7 4.4 5.5l-7 30"
        fill={SEAFOAM}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M60 190h116"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* heart on the lid */}
      <path
        d="M116 168c-2.5-3.5-7-3.4-8.4-.4-1.2 2.6.6 5.8 8 10.4 6.2-5.6 8.6-8.8 6.8-11.4-1.8-2.7-5.4-2-6.4 1.4z"
        fill={ROSE}
        stroke={INK}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* speech bubble with a spark */}
      <path
        d="M22 52c0-12 10-22 23-22s23 10 23 22-10 22-23 22c-2.4 0-4.7-.3-6.8-.9L28 78l3.4-9.4C25.6 64.6 22 58.7 22 52z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M45 41c.6 3.2 1.7 5.3 3 6 1 .4 2.4.8 4.2 1.3-3.2.6-5.3 1.7-6 3-.4 1-.8 2.4-1.3 4.2-.6-3.2-1.7-5.3-3-6-1-.4-2.4-.8-4.2-1.3 3.2-.6 5.3-1.7 6-3 .4-1 .8-2.4 1.3-4.2z"
        fill={SAGE}
      />

      {/* floating star */}
      <path
        d="M212 30l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6 1.6-4.4z"
        fill={ROSE}
      />
    </svg>
  );
}

/**
 * A reader holding a paper with a chart — used beside CTA and empty states.
 */
export function ReaderFigure({
  width = 200,
  className,
}: {
  width?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={width * (200 / 200)}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <BrowserFrame x={16} y={18} width={168} height={164} />

      {/* torso — rose top */}
      <path
        d="M54 182c2-30 16-47 42-47s40 17 42 47"
        fill={ROSE}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* head */}
      <circle
        cx="96"
        cy="97"
        r="24"
        fill={PAPER}
        stroke={INK}
        strokeWidth="2.4"
      />
      {/* long hair — solid ink, flowing to one side */}
      <path
        d="M72 95c-2-16 9-27 24-27 14 0 25 10 24 26 3 14 2 26-3 36-2-8-3-14-3-19-4 5-10 8-18 8-4 0-8-1-11-3-1 8-3 15-7 21-5-14-7-28-6-42z"
        fill={INK}
      />
      {/* face */}
      <circle cx="88" cy="99" r="2.2" fill={INK} />
      <circle cx="105" cy="99" r="2.2" fill={INK} />
      <path
        d="M92 109c2.6 2 6.4 2 9 0"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* paper held up, with chart lines */}
      <rect
        x="118"
        y="120"
        width="46"
        height="54"
        rx="4"
        fill={PAPER}
        stroke={INK}
        strokeWidth="2.2"
        transform="rotate(6 118 120)"
      />
      <path
        d="M127 134l30 3M126 143l30 3M125 152l18 2"
        stroke={SEAFOAM}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M128 166c4-5 7-6 10-3s6 2 10-4"
        stroke={SAGE}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* arm to the paper */}
      <path
        d="M116 150c-6-3-11-4-16-3"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* doodles */}
      <path
        d="M176 34l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5 1.5-4z"
        fill={SAGE}
      />
      <path
        d="M24 196c6-2 10-6 13-12"
        stroke={ROSE}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="1 6"
      />
    </svg>
  );
}
