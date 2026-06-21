import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneStore } from '../store/sceneStore'
import { TERRAIN_SIZE } from './SnowTerrain'

const FLAKE_COUNT = 2000
const FALL_HEIGHT = 25

interface FlakeData {
  velocities: Float32Array
  phases: Float32Array
  sizes: Float32Array
}

export function Snowflakes() {
  const pointsRef = useRef<THREE.Points>(null)
  const flakeDataRef = useRef<FlakeData | null>(null)
  const snowfallSpeed = useSceneStore((s) => s.snowfallSpeed)

  const { geometry, spriteTexture } = useMemo(() => {
    const positions = new Float32Array(FLAKE_COUNT * 3)
    const velocities = new Float32Array(FLAKE_COUNT * 3)
    const phases = new Float32Array(FLAKE_COUNT)
    const sizes = new Float32Array(FLAKE_COUNT)

    const half = TERRAIN_SIZE / 2 + 3

    for (let i = 0; i < FLAKE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * TERRAIN_SIZE * 1.2
      positions[i * 3 + 1] = Math.random() * FALL_HEIGHT
      positions[i * 3 + 2] = (Math.random() - 0.5) * TERRAIN_SIZE * 1.2

      velocities[i * 3] = (Math.random() - 0.5) * 0.3
      velocities[i * 3 + 1] = -(0.5 + Math.random() * 0.8)
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3

      phases[i] = Math.random() * Math.PI * 2
      sizes[i] = 0.04 + Math.random() * 0.08
    }

    flakeDataRef.current = { velocities, phases, sizes }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.2, 'rgba(255,255,255,0.95)')
    grad.addColorStop(0.4, 'rgba(255,255,255,0.6)')
    grad.addColorStop(0.7, 'rgba(255,255,255,0.2)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true

    return { geometry: geo, spriteTexture: tex }
  }, [])

  useEffect(() => {
    return () => {
      geometry.dispose()
      spriteTexture.dispose()
    }
  }, [geometry, spriteTexture])

  useFrame((_, delta) => {
    if (!pointsRef.current || !flakeDataRef.current) return

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const positions = posAttr.array as Float32Array
    const { velocities, phases, sizes } = flakeDataRef.current
    const speed = snowfallSpeed
    const half = TERRAIN_SIZE / 2 + 2

    for (let i = 0; i < FLAKE_COUNT; i++) {
      const i3 = i * 3

      phases[i] += delta * (0.5 + speed * 0.3)

      positions[i3] += (velocities[i3] + Math.sin(phases[i]) * 0.2) * delta * speed
      positions[i3 + 1] += velocities[i3 + 1] * delta * speed * 1.5
      positions[i3 + 2] += (velocities[i3 + 2] + Math.cos(phases[i] * 0.7) * 0.15) * delta * speed

      if (positions[i3 + 1] < -0.2) {
        positions[i3] = (Math.random() - 0.5) * TERRAIN_SIZE * 1.2
        positions[i3 + 1] = FALL_HEIGHT
        positions[i3 + 2] = (Math.random() - 0.5) * TERRAIN_SIZE * 1.2
        phases[i] = Math.random() * Math.PI * 2
      }

      if (positions[i3] > half) positions[i3] = -half
      if (positions[i3] < -half) positions[i3] = half
      if (positions[i3 + 2] > half) positions[i3 + 2] = -half
      if (positions[i3 + 2] < -half) positions[i3 + 2] = half
    }

    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.12}
        map={spriteTexture}
        transparent
        opacity={0.85}
        depthWrite={false}
        sizeAttenuation
        color="#ffffff"
        blending={THREE.NormalBlending}
      />
    </points>
  )
}
