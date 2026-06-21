import { SnowScene } from '../components/SnowScene'
import { ControlPanel } from '../components/ControlPanel'
import { HintOverlay } from '../components/HintOverlay'

export default function Home() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-b from-[#b8d4e8] via-[#c8dcec] to-[#e8f0f8]">
      <div className="absolute inset-0 pointer-events-none z-30">
        <div
          className="absolute top-0 left-0 right-0 h-40"
          style={{
            background: 'linear-gradient(180deg, rgba(184,212,232,0.4) 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-60"
          style={{
            background: 'linear-gradient(0deg, rgba(200,220,236,0.3) 0%, transparent 100%)',
          }}
        />
      </div>

      <SnowScene />

      <div className="fixed top-6 left-6 z-20 pointer-events-none" style={{
        animation: 'fadeInTitle 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both',
      }}>
        <div className="space-y-1">
          <h1
            className="text-white/95 text-2xl md:text-3xl font-extralight tracking-[0.3em] drop-shadow-sm"
            style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}
          >
            雪&nbsp;印
          </h1>
          <p className="text-white/50 text-[11px] tracking-[0.25em] font-light pl-1">
            SNOW · FOOTPRINT
          </p>
        </div>
      </div>

      <ControlPanel />
      <HintOverlay />
    </div>
  )
}
