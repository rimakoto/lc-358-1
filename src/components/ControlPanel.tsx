import { Snowflake, Clock, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { useSceneStore } from '../store/sceneStore'
import { cn } from '../lib/utils'

export function ControlPanel() {
  const [collapsed, setCollapsed] = useState(false)
  const snowfallSpeed = useSceneStore((s) => s.snowfallSpeed)
  const footprintFadeSpeed = useSceneStore((s) => s.footprintFadeSpeed)
  const setSnowfallSpeed = useSceneStore((s) => s.setSnowfallSpeed)
  const setFootprintFadeSpeed = useSceneStore((s) => s.setFootprintFadeSpeed)

  return (
    <div
      className={cn(
        'fixed top-6 right-6 z-20 transition-all duration-500 ease-out',
        collapsed ? 'translate-x-0' : 'translate-x-0',
      )}
      style={{
        animation: 'slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      <div
        className={cn(
          'backdrop-blur-xl rounded-3xl border transition-all duration-300',
          'bg-white/15 border-white/25',
          'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
          collapsed ? 'w-12 h-12' : 'w-72',
          'overflow-hidden',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-300/40 to-blue-400/30 flex items-center justify-center">
                <Settings size={16} className="text-white/90" />
              </div>
              <h3 className="text-white/95 text-[15px] font-light tracking-wide">
                场景参数
              </h3>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
              'hover:bg-white/15 text-white/80 hover:text-white',
              collapsed ? 'mx-auto' : '',
            )}
          >
            {collapsed ? <Settings size={18} /> : <X size={16} />}
          </button>
        </div>

        {!collapsed && (
          <div className="px-5 py-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/85">
                  <Snowflake size={15} className="text-sky-200" />
                  <span className="text-[13px] font-light tracking-wide">
                    降雪速度
                  </span>
                </div>
                <span
                  className="text-[12px] text-white/60 font-mono tabular-nums"
                >
                  {snowfallSpeed.toFixed(1)}×
                </span>
              </div>
              <div className="relative h-2">
                <div className="absolute inset-0 rounded-full bg-white/10" />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-300/70 to-blue-300/70"
                  style={{
                    width: `${((snowfallSpeed - 0.1) / 4.9) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min={0.1}
                  max={5}
                  step={0.1}
                  value={snowfallSpeed}
                  onChange={(e) => setSnowfallSpeed(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2 border-sky-200/50 pointer-events-none transition-transform"
                  style={{
                    left: `calc(${((snowfallSpeed - 0.1) / 4.9) * 100}% - 8px)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/40 font-light">
                <span>微风</span>
                <span>暴风雪</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/85">
                  <Clock size={15} className="text-indigo-200" />
                  <span className="text-[13px] font-light tracking-wide">
                    脚印消失速度
                  </span>
                </div>
                <span
                  className="text-[12px] text-white/60 font-mono tabular-nums"
                >
                  {footprintFadeSpeed.toFixed(1)}×
                </span>
              </div>
              <div className="relative h-2">
                <div className="absolute inset-0 rounded-full bg-white/10" />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-300/70 to-purple-300/70"
                  style={{
                    width: `${((footprintFadeSpeed - 0.5) / 2.5) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={footprintFadeSpeed}
                  onChange={(e) => setFootprintFadeSpeed(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2 border-indigo-200/50 pointer-events-none transition-transform"
                  style={{
                    left: `calc(${((footprintFadeSpeed - 0.5) / 2.5) * 100}% - 8px)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/40 font-light">
                <span>持久</span>
                <span>速融</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
