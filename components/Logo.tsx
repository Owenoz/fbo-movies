import Image from 'next/image'

export default function Logo({ size = 40, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image 
        src="/genz-logo.jpeg?v=2" 
        alt="Gen Z Corner"
        width={size}
        height={size}
        className="rounded-full flex-shrink-0 object-cover"
        priority
        unoptimized
      />
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-white tracking-wider">GEN Z</span>
          <span className="text-xs text-white/60 tracking-widest -mt-1">CORNER</span>
        </div>
      )}
    </div>
  )
}
