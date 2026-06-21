import { create } from 'zustand'

export interface Footprint {
  id: number
  x: number
  z: number
  rotation: number
  size: number
  depth: number
  createdAt: number
  fillProgress: number
  leftFoot: boolean
}

interface SceneState {
  snowfallSpeed: number
  footprintFadeSpeed: number
  footprints: Footprint[]
  nextFootprintId: number
  setSnowfallSpeed: (speed: number) => void
  setFootprintFadeSpeed: (speed: number) => void
  addFootprint: (fp: Omit<Footprint, 'id' | 'createdAt' | 'fillProgress'>) => void
  updateFootprints: (deltaTime: number, fadeSpeed: number) => void
}

export const useSceneStore = create<SceneState>((set, get) => ({
  snowfallSpeed: 1,
  footprintFadeSpeed: 1,
  footprints: [],
  nextFootprintId: 1,

  setSnowfallSpeed: (speed) => set({ snowfallSpeed: speed }),
  setFootprintFadeSpeed: (speed) => set({ footprintFadeSpeed: speed }),

  addFootprint: (fp) =>
    set((state) => ({
      footprints: [
        ...state.footprints,
        {
          ...fp,
          id: state.nextFootprintId,
          createdAt: performance.now(),
          fillProgress: 0,
        },
      ],
      nextFootprintId: state.nextFootprintId + 1,
    })),

  updateFootprints: (deltaTime, fadeSpeed) => {
    const { footprints } = get()
    const fadeRate = 0.08 * fadeSpeed * deltaTime

    const updated = footprints
      .map((fp) => ({
        ...fp,
        fillProgress: Math.min(1, fp.fillProgress + fadeRate),
      }))
      .filter((fp) => fp.fillProgress < 1)

    if (updated.length !== footprints.length || updated.some((fp, i) => fp.fillProgress !== footprints[i]?.fillProgress)) {
      set({ footprints: updated })
    }
  },
}))
