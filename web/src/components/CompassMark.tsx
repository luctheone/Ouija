export default function CompassMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <circle cx="50" cy="50" r="43" stroke="currentColor" strokeWidth="1.5" />
      <line x1="80.4" y1="19.6" x2="75.6" y2="24.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".38" />
      <line x1="80.4" y1="80.4" x2="75.6" y2="75.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".38" />
      <line x1="19.6" y1="80.4" x2="24.4" y2="75.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".38" />
      <line x1="19.6" y1="19.6" x2="24.4" y2="24.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".38" />
      <path d="M50,12 L56,36 L50,50 L44,36 Z" fill="currentColor" />
      <path d="M50,88 L44,64 L50,50 L56,64 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M88,50 L64,44 L50,50 L64,56 Z" fill="currentColor" opacity=".68" />
      <path d="M12,50 L36,44 L50,50 L36,56 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity=".52" />
      <circle cx="50" cy="50" r="4.5" fill="currentColor" />
    </svg>
  );
}
