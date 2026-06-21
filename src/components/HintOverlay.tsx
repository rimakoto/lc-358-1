import { useEffect, useState } from 'react'
import { MousePointerClick, Move, ZoomIn } from 'lucide-react'
import { cn } from '../lib/utils'

export function HintOverlay() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 12000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        'fixed left-6 bottom-6 z-20 transition-all duration-1000 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
      )}
      style={{
        animation: 'slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
      }}
    >
      <div
        className="backdrop-blur-xl rounded-2xl border border-white/20 bg-white/10
                   shadow-[0_8px_32px_rgba(0,0,0,0.1)] px-5 py-4"
      >
        <div className="space-y-2.5">
          <p className="text-white/95 text-[13px] font-light tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-400/25 flex items-center justify-center shrink-0">
              <MousePointerClick size={14} className="text-sky-200" />
            </span>
            <span>点击雪地踩下脚印</span>
          </p>
          <p className="text-white/70 text-[12px] font-light tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-400/20 flex items-center justify-center shrink-0">
              <Move size={13} className="text-indigo-200" />
            </span>
            <span>拖拽旋转视角观察细节</span>
          </p>
          <p className="text-white/70 text-[12px] font-light tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-400/20 flex items-center justify-center shrink-0">
              <ZoomIn size={13} className="text-purple-200" />
            </span>
            <span>滚轮缩放远近</span>
          </p>
        </div>
      </div>
    </div>
  )
}
