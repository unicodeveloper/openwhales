/**
 * OpenWhales logo — whale tail fin on navy background.
 * Professional financial aesthetic.
 */
export function OpenWhalesIcon({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OpenWhales logo"
    >
      <rect width="32" height="32" rx="6" fill="#111" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <path
        d="M16 24c0-4 -3-7 -7-10 1.5 0 3.5 0.5 5 2.5 0-3-1-6-3-8.5 2 1.5 4.5 4.5 5 8.5 0.5-4 3-7 5-8.5-2 2.5-3 5.5-3 8.5 1.5-2 3.5-2.5 5-2.5-4 3-7 6-7 10z"
        fill="white"
      />
      <path
        d="M6 25.5c3-1 5.5-1.5 10-1.5s7 0.5 10 1.5"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
