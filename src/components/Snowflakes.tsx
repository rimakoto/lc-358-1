import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneStore } from '../store/sceneStore'
import { TERRAIN_SIZE } from './SnowTerrain'

const FLAKE_COUNT = 3500
const FALL_HEIGHT = 28

interface FlakeData {
  velocities: Float32Array
  phases: Float32Array
  sizes: Float32Array
  colors: Float32Array
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
    const colors = new Float32Array(FLAKE_COUNT * 3)

    const half = TERRAIN_SIZE / 2 + 3

    const snowColor1 = new THREE.Color('#e8f0ff')
    const snowColor2 = new THREE.Color('#d0e0f5')
    const snowColor3 = new THREE.Color('#f8faff')

    for (let i = 0; i < FLAKE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * TERRAIN_SIZE * 1.3
      positions[i * 3 + 1] = Math.random() * FALL_HEIGHT
      positions[i * 3 + 2] = (Math.random() - 0.5) * TERRAIN_SIZE * 1.3

      velocities[i * 3] = (Math.random() - 0.5) * 0.35
      velocities[i * 3 + 1] = -(0.6 + Math.random() * 1.0)
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.35

      phases[i] = Math.random() * Math.PI * 2
      sizes[i] = 0.06 + Math.random() * 0.18

      const c3 = i * 3
      const colorT = Math.random()
      if (colorT < 0.33) {
        colors[c3] = snowColor1.r
        colors[c3 + 1] = snowColor1.g
        colors[c3 + 2] = snowColor1.b
      } else if (colorT < 0.66) {
        colors[c3] = snowColor2.r
        colors[c3 + 1] = snowColor2.g
        colors[c3 + 2] = snowColor2.b
      } else {
        colors[c3] = snowColor3.r
        colors[c3 + 1] = snowColor3.g
        colors[c3 + 2] = snowColor3.b
      }
    }

    flakeDataRef.current = { velocities, phases, sizes, colors }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.15, 'rgba(255,255,255,0.98)')
    grad.addColorStop(0.3, 'rgba(230,240,255,0.92)')
    grad.addColorStop(0.5, 'rgba(210,225,250,0.75)')
    grad.addColorStop(0.75, 'rgba(190,210,240,0.4)')
    grad.addColorStop(1, 'rgba(180,200,230,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)

    const subGrad = ctx.createRadialGradient(32, 32, 2, 32, 32, 10)
    subGrad.addColorStop(0, 'rgba(255,255,255,1)')
    subGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = subGrad
    ctx.fillRect(0, 0, 64, 64)
    ctx.globalCompositeOperation = 'source-over'

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
    const sizeAttr = pointsRef.current.geometry.attributes.size as THREE.BufferAttribute
    const sizeArr = sizeAttr.array as Float32Array
    const { velocities, phases } = flakeDataRef.current
    const speed = snowfallSpeed
    const half = TERRAIN_SIZE / 2 + 2

    for (let i = 0; i < FLAKE_COUNT; i++) {
      const i3 = i * 3

      phases[i] += delta * (0.5 + speed * 0.3)

      positions[i3] += (velocities[i3] + Math.sin(phases[i]) * 0.25) * delta * speed
      positions[i3 + 1] += velocities[i3 + 1] * delta * speed * 1.6
      positions[i3 + 2] += (velocities[i3 + 2] + Math.cos(phases[i] * 0.7) * 0.18) * delta * speed

      sizeArr[i] = sizeArr[i] * (0.995 + 0.01 * Math.sin(phases[i] * 2 + i * 0.01))

      if (positions[i3 + 1] < -0.3) {
        positions[i3] = (Math.random() - 0.5) * TERRAIN_SIZE * 1.3
        positions[i3 + 1] = FALL_HEIGHT
        positions[i3 + 2] = (Math.random() - 0.5) * TERRAIN_SIZE * 1.3
        phases[i] = Math.random() * Math.PI * 2
      }

      if (positions[i3] > half) positions[i3] = -half
      if (positions[i3] < -half) positions[i3] = half
      if (positions[i3 + 2] > half) positions[i3 + 2] = -half
      if (positions[i3 + 2] < -half) positions[i3 + 2] = half
    }

    posAttr.needsUpdate = true
    sizeAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.22}
        map={spriteTexture}
        vertexColors
        transparent
        opacity={0.95}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
