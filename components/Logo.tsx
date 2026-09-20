export default function Logo({ size = 40, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 192 192" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <rect width="192" height="192" rx="42" fill="url(#logo-grad)"/>
        
        {/* Film reel decoration */}
        <circle cx="96" cy="96" r="70" fill="none" stroke="#ffffff" strokeWidth="4" opacity="0.2"/>
        
        {/* Play button */}
        <path d="M 75 60 L 75 132 L 135 96 Z" fill="#ffffff"/>
        
        {/* FBO Text */}
        <text 
          x="96" 
          y="165" 
          fontFamily="Arial, sans-serif" 
          fontSize="32" 
          fontWeight="900" 
          fill="#ffffff" 
          textAnchor="middle" 
          letterSpacing="2"
        >
          FBO
        </text>
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-white tracking-wider">FBO</span>
          <span className="text-xs text-white/60 tracking-widest -mt-1">MOVIES</span>
        </div>
      )}
    </div>
  )
}
