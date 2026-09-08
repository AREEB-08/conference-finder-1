/**
 * Floating decorative doodles — stars, arrows, plants, circles — in the
 * "designer's sketchbook" style from DESIGN.md. All strokes ~2px in
 * illustration ink; fills only from sage / rose / sea foam.
 */

const INK = "var(--illustration-ink)";
const SAGE = "var(--sage)";
const ROSE = "var(--rose)";
const SEAFOAM = "var(--seafoam)";

export function Star4({
  size = 26,
  color = SAGE,
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 1.5c.9 4.6 2.4 7.7 4.4 8.6 1.5.7 3.5 1.3 6.1 1.9-4.6.9-7.7 2.4-8.6 4.4-.7 1.5-1.3 3.5-1.9 6.1-.9-4.6-2.4-7.7-4.4-8.6-1.5-.7-3.5-1.3-6.1-1.9 4.6-.9 7.7-2.4 8.6-4.4.7-1.5 1.3-3.5 1.9-6.1z"
        fill={color}
      />
    </svg>
  );
}

export function Star8({
  size = 22,
  color = ROSE,
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.6" fill={color} />
    </svg>
  );
}

export function SketchCircle({
  size = 20,
  color = SEAFOAM,
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3.2c5.1-.5 8.9 3.4 8.7 8.5-.2 5.4-4.2 9.3-9.2 9-4.8-.2-8.4-4-8.2-8.9C3.5 7 7.2 3.7 12 3.2z"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusSign({
  size = 16,
  color = SAGE,
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8 1.5v13M1.5 8h13"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CurvedArrow({
  size = 64,
  color = INK,
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 64 45"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4 40C14 36 22 26 25 14c.4-1.8.6-3.6.5-5.4M20 13.5c1.8-2.4 3.7-4 5.5-4.9 1.4 2 2.5 4.3 3 6.9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 41c10-2 18-8 24-18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
    </svg>
  );
}

export function Squiggle({
  width = 90,
  color = SAGE,
  className,
}: {
  width?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={width * 0.22}
      viewBox="0 0 90 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 12c7-9 13-9 19 0s13 9 19 0 13-9 19 0 13 9 19 0"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlantDoodle({
  size = 44,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M22 40V22m0 6c-4.2-1-7.4-3.8-8.6-8.6 4.8.4 7.9 2.6 8.6 8.6zm0-6c4.6-.8 7.6-3.6 8.8-8.9-5.2.5-8.3 3-8.8 8.9zm0-6c-.6-4.6.8-8.2 4.4-11-1.4 4.4-2.8 8-4.4 11z"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 40h16"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EnvelopeDoodle({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 0.72}
      viewBox="0 0 40 29"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="2"
        y="2.5"
        width="36"
        height="24"
        rx="3"
        fill="var(--surface)"
        stroke={INK}
        strokeWidth="2"
      />
      <path
        d="M3.5 5l16.5 12L36.5 5"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PinDoodle({
  size = 34,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 34 43"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M17 41c9-10.5 13.5-18.6 13.5-24.3C30.5 8.6 24.5 2.5 17 2.5S3.5 8.6 3.5 16.7C3.5 22.4 8 30.5 17 41z"
        fill={SEAFOAM}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="16.5" r="5" fill="var(--surface)" stroke={INK} strokeWidth="2" />
    </svg>
  );
}
