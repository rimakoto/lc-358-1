import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'
import * as THREE from 'three'
import { SnowTerrain } from './SnowTerrain'
import { Snowflakes } from './Snowflakes'
import { TERRAIN_SIZE } from './SnowTerrain'

export function SnowScene() {
  const cameraPos = useMemo(() => new THREE.Vector3(8, 12, 14), [])

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        shadows
        camera={{
          position: cameraPos,
          fov: 50,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#c8d8e8']} />

          <fog attach="fog" args={['#b8c8d8', 25, 70]} />

          <Sky
            distance={450000}
            sunPosition={[15, 12, 8]}
            inclination={0.48}
            azimuth={0.25}
            turbidity={10}
            rayleigh={2.5}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
          />

          <Environment preset="dawn" />

          <ambientLight intensity={0.55} color="#e8f0ff" />

          <hemisphereLight
            color="#d8e8f8"
            groundColor="#f0f4f0"
            intensity={0.45}
          />

          <directionalLight
            position={[12, 18, 10]}
            intensity={1.4}
            color="#fff8ee"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-TERRAIN_SIZE / 2}
            shadow-camera-right={TERRAIN_SIZE / 2}
            shadow-camera-top={TERRAIN_SIZE / 2}
            shadow-camera-bottom={-TERRAIN_SIZE / 2}
            shadow-camera-near={0.5}
            shadow-camera-far={60}
            shadow-bias={-0.0005}
            shadow-normalBias={0.02}
          />

          <directionalLight
            position={[-8, 10, -6]}
            intensity={0.25}
            color="#e0ecff"
          />

          <SnowTerrain />

          <Snowflakes />

          <DistantTrees />

          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            minDistance={5}
            maxDistance={40}
            minPolarAngle={0.15}
            maxPolarAngle={Math.PI / 2 - 0.08}
            target={[0, 0, 0]}
            enablePan
            panSpeed={0.6}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
          />

          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.35}
              luminanceThreshold={0.85}
              luminanceSmoothing={0.9}
              mipmapBlur
              radius={0.6}
            />
            <ToneMapping
              adaptive
              averageLuminance={0.4}
              minLuminance={0.2}
              maxLuminance={1.6}
              middleGrey={0.7}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}

function DistantTrees() {
  const trees = useMemo(() => {
    const arr: { x: number; z: number; scale: number; type: number }[] = []
    const half = TERRAIN_SIZE / 2 + 4
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.2
      const radius = half + 2 + Math.random() * 4
      arr.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: 0.6 + Math.random() * 0.8,
        type: Math.floor(Math.random() * 2),
      })
    }
    return arr
  }, [])

  return (
    <group>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.scale}>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.15, 1, 6]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.95} />
          </mesh>
          {t.type === 0 ? (
            <>
              <mesh position={[0, 1.6, 0]} castShadow>
                <coneGeometry args={[1.1, 1.8, 8]} />
                <meshStandardMaterial color="#4a6a4a" roughness={0.9} />
              </mesh>
              <mesh position={[0, 2.4, 0]} castShadow>
                <coneGeometry args={[0.85, 1.4, 8]} />
                <meshStandardMaterial color="#527252" roughness={0.9} />
              </mesh>
              <mesh position={[0, 3.1, 0]} castShadow>
                <coneGeometry args={[0.6, 1.1, 8]} />
                <meshStandardMaterial color="#5a7a5a" roughness={0.9} />
              </mesh>
            </>
          ) : (
            <mesh position={[0, 2, 0]} castShadow>
              <sphereGeometry args={[1.2, 10, 10]} />
              <meshStandardMaterial color="#3d5a3d" roughness={0.92} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}
