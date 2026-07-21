export default function Sparkle({ size = 24, color = '#3b82f6', style = {}, spinDuration = '8s', floatDuration = '5s', floatDelay = '0s' }) {
  return (
    <div style={{ position: 'absolute', zIndex: 0, animation: `sparkleFloat ${floatDuration} ease-in-out ${floatDelay} infinite`, ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: `sparkleSpin ${spinDuration} linear infinite`, display: 'block' }}>
        <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill={color} />
      </svg>
    </div>
  );
}