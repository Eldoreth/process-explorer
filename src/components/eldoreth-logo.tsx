export function EldorethLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="el-g" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="oklch(0.72 0.18 250)" />
          <stop offset="100%" stopColor="oklch(0.55 0.22 265)" />
        </linearGradient>
      </defs>
      <path d="M20 3 L36 12 L36 28 L20 37 L4 28 L4 12 Z" stroke="url(#el-g)" strokeWidth="2" />
      <path d="M20 11 L28 16 L28 24 L20 29 L12 24 L12 16 Z" fill="url(#el-g)" opacity="0.85" />
      <circle cx="20" cy="20" r="2.5" fill="oklch(0.99 0 0)" />
    </svg>
  );
}
