import { useRef, useMemo, useEffect, useCallback } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneStore, Footprint } from '../store/sceneStore'
import { leftFootShape, rightFootShape, FootprintShape } from '../utils/footprintShape'

const TERRAIN_SIZE = 40
const TERRAIN_SEGMENTS = 256
const MAX_HEIGHT_OFFSET = 0.5
const FOOTPRINT_DEPTH = 0.35

const BASE_SNOW_COLOR = new THREE.Color('#f4f7fb')
const COMPRESSED_SNOW_COLOR = new THREE.Color('#a8b8cc')
const FOOTPRINT_EDGE_COLOR = new THREE.Color('#8899b0')

export function SnowTerrain() {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null)
  const baseHeightRef = useRef<Float32Array | null>(null)
  const lastFootprintIdRef = useRef<number>(0)
  const appliedFootprintsRef = useRef<Map<number, number>>(new Map())

  const footprints = useSceneStore((s) => s.footprints)
  const addFootprint = useSceneStore((s) => s.addFootprint)
  const fadeSpeed = useSceneStore((s) => s.footprintFadeSpeed)
  const updateFootprints = useSceneStore((s) => s.updateFootprints)

  const { geometry, positions, heightmap, colormap, normalTexture } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS)
    geo.rotateX(-Math.PI / 2)

    const posAttr = geo.attributes.position as THREE.BufferAttribute
    const posArr = posAttr.array as Float32Array
    const hmap = new Float32Array((TERRAIN_SEGMENTS + 1) * (TERRAIN_SEGMENTS + 1))
    const cmap = new Float32Array((TERRAIN_SEGMENTS + 1) * (TERRAIN_SEGMENTS + 1) * 3)

    for (let i = 0; i <= TERRAIN_SEGMENTS; i++) {
      for (let j = 0; j <= TERRAIN_SEGMENTS; j++) {
        const idx = i * (TERRAIN_SEGMENTS + 1) + j
        const x = (j / TERRAIN_SEGMENTS - 0.5) * TERRAIN_SIZE
        const z = (i / TERRAIN_SEGMENTS - 0.5) * TERRAIN_SIZE

        const distFromCenter = Math.sqrt(x * x + z * z)
        const edgeFade = Math.max(0, 1 - distFromCenter / (TERRAIN_SIZE * 0.45))
        const edgeRise = (1 - edgeFade) * 0.2

        const noise1 = Math.sin(x * 0.3) * Math.cos(z * 0.28) * 0.05
        const noise2 = Math.sin(x * 0.8 + z * 0.5) * 0.025
        const noise3 = Math.cos(x * 1.5 - z * 1.2) * 0.012

        hmap[idx] = noise1 + noise2 + noise3 + edgeRise
        posArr[idx * 3 + 1] = hmap[idx]

        const c3 = idx * 3
        cmap[c3] = BASE_SNOW_COLOR.r
        cmap[c3 + 1] = BASE_SNOW_COLOR.g
        cmap[c3 + 2] = BASE_SNOW_COLOR.b
      }
    }

    const colorAttr = new THREE.BufferAttribute(new Float32Array(cmap), 3)
    geo.setAttribute('color', colorAttr)

    baseHeightRef.current = new Float32Array(hmap)
    posAttr.needsUpdate = true
    geo.computeVertexNormals()

    const noiseCanvas = document.createElement('canvas')
    noiseCanvas.width = 512
    noiseCanvas.height = 512
    const nctx = noiseCanvas.getContext('2d')!
    const nImg = nctx.createImageData(512, 512)
    for (let p = 0; p < nImg.data.length; p += 4) {
      const v = 100 + Math.floor(Math.random() * 140)
      nImg.data[p] = v
      nImg.data[p + 1] = v + 8
      nImg.data[p + 2] = v + 18
      nImg.data[p + 3] = 255
    }
    nctx.putImageData(nImg, 0, 0)
    const nTex = new THREE.CanvasTexture(noiseCanvas)
    nTex.wrapS = nTex.wrapT = THREE.RepeatWrapping
    nTex.repeat.set(8, 8)

    return {
      geometry: geo,
      positions: posArr,
      heightmap: hmap,
      colormap: cmap,
      normalTexture: nTex,
    }
  }, [])

  useEffect(() => {
    geometryRef.current = geometry
    return () => {
      geometry.dispose()
      normalTexture.dispose()
    }
  }, [geometry, normalTexture])

  const applyFootprint = useCallback(
    (
      fp: Footprint,
      shape: FootprintShape,
      targetHmap: Float32Array,
      targetCmap: Float32Array,
    ) => {
      const gridStep = TERRAIN_SIZE / TERRAIN_SEGMENTS
      const worldToGrid = TERRAIN_SEGMENTS / TERRAIN_SIZE

      const footprintWorldWidth = fp.size
      const footprintWorldHeight = fp.size * 2
      const footprintGridWidth = Math.ceil(footprintWorldWidth * worldToGrid) + 6
      const footprintGridHeight = Math.ceil(footprintWorldHeight * worldToGrid) + 6

      const centerGridX = (fp.x / TERRAIN_SIZE + 0.5) * TERRAIN_SEGMENTS
      const centerGridZ = (fp.z / TERRAIN_SIZE + 0.5) * TERRAIN_SEGMENTS

      const cosR = Math.cos(-fp.rotation)
      const sinR = Math.sin(-fp.rotation)

      const startX = Math.max(0, Math.floor(centerGridX - footprintGridWidth / 2))
      const endX = Math.min(TERRAIN_SEGMENTS, Math.ceil(centerGridX + footprintGridWidth / 2))
      const startZ = Math.max(0, Math.floor(centerGridZ - footprintGridHeight / 2))
      const endZ = Math.min(TERRAIN_SEGMENTS, Math.ceil(centerGridZ + footprintGridHeight / 2))

      const effectiveFill = 1 - fp.fillProgress

      for (let gz = startZ; gz <= endZ; gz++) {
        for (let gx = startX; gx <= endX; gx++) {
          const localX = (gx - centerGridX) * gridStep
          const localZ = (gz - centerGridZ) * gridStep

          const rotX = localX * cosR - localZ * sinR
          const rotZ = localX * sinR + localZ * cosR

          const u = 0.5 + rotX / footprintWorldWidth
          const v = 0.5 + rotZ / footprintWorldHeight

          if (u < 0 || u > 1 || v < 0 || v > 1) continue

          const texX = Math.floor(u * (shape.width - 1))
          const texY = Math.floor(v * (shape.height - 1))
          const texIdx = texY * shape.width + texX
          let strength = shape.data[texIdx]

          if (strength <= 0.02) continue

          strength = Math.pow(strength, 0.9) * effectiveFill

          const hIdx = gz * (TERRAIN_SEGMENTS + 1) + gx
          const baseH = baseHeightRef.current![hIdx]
          const depthAmount = fp.depth * strength
          const targetH = baseH - depthAmount * MAX_HEIGHT_OFFSET * 3.5

          if (targetH < targetHmap[hIdx]) {
            targetHmap[hIdx] = targetH
          }

          const c3 = hIdx * 3
          const colorMix = Math.min(1, strength * 1.1)
          const r = BASE_SNOW_COLOR.r * (1 - colorMix) + COMPRESSED_SNOW_COLOR.r * colorMix
          const g = BASE_SNOW_COLOR.g * (1 - colorMix) + COMPRESSED_SNOW_COLOR.g * colorMix
          const b = BASE_SNOW_COLOR.b * (1 - colorMix) + COMPRESSED_SNOW_COLOR.b * colorMix

          if (r < targetCmap[c3]) targetCmap[c3] = r
          if (g < targetCmap[c3 + 1]) targetCmap[c3 + 1] = g
          if (b < targetCmap[c3 + 2]) targetCmap[c3 + 2] = b

          if (strength > 0.15 && strength < 0.5) {
            const edgeStrength = (1 - Math.abs(strength - 0.32) / 0.18) * effectiveFill * 0.35
            if (edgeStrength > 0) {
              targetCmap[c3] = targetCmap[c3] * (1 - edgeStrength) + FOOTPRINT_EDGE_COLOR.r * edgeStrength
              targetCmap[c3 + 1] = targetCmap[c3 + 1] * (1 - edgeStrength) + FOOTPRINT_EDGE_COLOR.g * edgeStrength
              targetCmap[c3 + 2] = targetCmap[c3 + 2] * (1 - edgeStrength) + FOOTPRINT_EDGE_COLOR.b * edgeStrength
            }
          }
        }
      }
    },
    [],
  )

  useFrame((_, delta) => {
    updateFootprints(delta, fadeSpeed)

    const baseH = baseHeightRef.current
    if (!baseH) return

    for (let i = 0; i < heightmap.length; i++) {
      heightmap[i] = baseH[i]
      const c3 = i * 3
      colormap[c3] = BASE_SNOW_COLOR.r
      colormap[c3 + 1] = BASE_SNOW_COLOR.g
      colormap[c3 + 2] = BASE_SNOW_COLOR.b
    }

    let needUpdate = false

    for (const fp of footprints) {
      const shape = fp.leftFoot ? leftFootShape : rightFootShape
      const prevApplied = appliedFootprintsRef.current.get(fp.id)
      if (prevApplied !== fp.fillProgress) {
        needUpdate = true
        appliedFootprintsRef.current.set(fp.id, fp.fillProgress)
      }
      applyFootprint(fp, shape, heightmap, colormap)
    }

    const toRemove: number[] = []
    for (const [id] of appliedFootprintsRef.current) {
      if (!footprints.find((f) => f.id === id)) {
        toRemove.push(id)
        needUpdate = true
      }
    }
    for (const id of toRemove) appliedFootprintsRef.current.delete(id)

    if (needUpdate || lastFootprintIdRef.current !== (footprints[footprints.length - 1]?.id ?? 0)) {
      lastFootprintIdRef.current = footprints[footprints.length - 1]?.id ?? 0

      for (let i = 0; i <= TERRAIN_SEGMENTS; i++) {
        for (let j = 0; j <= TERRAIN_SEGMENTS; j++) {
          const idx = i * (TERRAIN_SEGMENTS + 1) + j
          positions[idx * 3 + 1] = heightmap[idx]
        }
      }

      const posAttr = geometry.attributes.position as THREE.BufferAttribute
      const colorAttr = geometry.attributes.color as THREE.BufferAttribute
      const colorArr = colorAttr.array as Float32Array
      for (let i = 0; i < colormap.length; i++) {
        colorArr[i] = colormap[i]
      }
      posAttr.needsUpdate = true
      colorAttr.needsUpdate = true
      geometry.computeVertexNormals()
    }
  })

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      const point = e.point

      const half = TERRAIN_SIZE / 2 - 1
      const clampedX = Math.max(-half, Math.min(half, point.x))
      const clampedZ = Math.max(-half, Math.min(half, point.z))

      const fps = useSceneStore.getState().footprints
      const lastFp = fps[fps.length - 1]
      const isLeft = lastFp ? !lastFp.leftFoot : Math.random() > 0.5

      let rotation = -Math.PI / 2
      if (lastFp) {
        const dx = clampedX - lastFp.x
        const dz = clampedZ - lastFp.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist > 0.3) {
          rotation = Math.atan2(dx, dz)
        } else {
          rotation = lastFp.rotation
        }
      }

      addFootprint({
        x: clampedX,
        z: clampedZ,
        rotation,
        size: 1.4 + Math.random() * 0.2,
        depth: FOOTPRINT_DEPTH,
        leftFoot: isLeft,
      })
    },
    [addFootprint],
  )

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      receiveShadow
      castShadow
      onClick={handleClick}
    >
      <meshStandardMaterial
        vertexColors
        roughness={0.9}
        metalness={0.01}
        bumpMap={normalTexture}
        bumpScale={0.05}
        envMapIntensity={0.5}
        flatShading={false}
      />
    </mesh>
  )
}

export { TERRAIN_SIZE }
