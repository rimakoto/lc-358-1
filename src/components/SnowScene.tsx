import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
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
          toneMappingExposure: 1.15,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#b8c8d8']} />

        <fog attach="fog" args={['#a8b8c8', 30, 70]} />

        <ambientLight intensity={0.55} color="#e0eaff" />

        <hemisphereLight
          color="#c8d8e8"
          groundColor="#e8ecf0"
          intensity={0.6}
        />

        <directionalLight
          position={[8, 22, 6]}
          intensity={2.6}
          color="#fff5e8"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-TERRAIN_SIZE / 2}
          shadow-camera-right={TERRAIN_SIZE / 2}
          shadow-camera-top={TERRAIN_SIZE / 2}
          shadow-camera-bottom={-TERRAIN_SIZE / 2}
          shadow-camera-near={0.5}
          shadow-camera-far={80}
          shadow-bias={-0.0008}
          shadow-normalBias={0.03}
        />

        <directionalLight
          position={[-10, 14, -8]}
          intensity={0.35}
          color="#d0e0ff"
        />

        <directionalLight
          position={[0, 6, -14]}
          intensity={0.25}
          color="#e0eaf5"
        />

        <GradientSky />

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
            intensity={0.4}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.7}
          />
          <ToneMapping
            averageLuminance={0.6}
            maxLuminance={1.4}
            middleGrey={0.7}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

function GradientSky() {
  const uniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color('#8098b0') },
      bottomColor: { value: new THREE.Color('#d8e4f0') },
      offset: { value: 25 },
      exponent: { value: 0.65 },
    }),
    [],
  )

  const skyGeo = useMemo(
    () => new THREE.SphereGeometry(90, 32, 15),
    [],
  )

  const skyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
          }
        `,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [uniforms],
  )

  return <mesh geometry={skyGeo} material={skyMat} />
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
