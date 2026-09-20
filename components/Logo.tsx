import Image from 'next/image'

export default function Logo({ size = 40, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image 
        src="/fbo-logo.jpg" 
        alt="FBO Movies"
        width={size}
        height={size}
        className="rounded-lg flex-shrink-0 object-cover"
        priority
      />
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-white tracking-wider">FBO</span>
          <span className="text-xs text-white/60 tracking-widest -mt-1">MOVIES</span>
        </div>
      )}
    </div>
  )
}
