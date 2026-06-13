'use client'
import { Suspense, useRef, useState, useCallback, useMemo } from 'react'
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import Player from './Player'
import House from './House'

const CAMERA_BASE = new THREE.Vector3(1, 5, 5)
const WALK_SPEED = 0.05
const ARRIVE_THRESHOLD = 0.03
const SPOT_RADIUS = 1.5

type HouseConfig = {
  modelSrc: string
  position: [number, number, number]
  spotPos: [number, number, number]
  spotColor: string
  spotActiveColor: string
  hiddenY: number
  shownY: number
  scale?: [number, number, number]
}

type HouseInfo = {
  title: string
  description: string
}

const HOUSE_CONFIGS: HouseConfig[] = [
  {
    modelSrc: '/models/house.glb',
    position: [5, -1.3, 2],
    spotPos: [5, 0.005, 5],
    spotColor: 'yellow',
    spotActiveColor: 'seagreen',
    hiddenY: -1.3,
    shownY: 1,
  },
  {
    modelSrc: '/models/fantasyhouse.glb',
    position: [18, -3, 0],
    spotPos: [18, 0.005, 3],
    spotColor: '#a78bfa',
    spotActiveColor: '#7c3aed',
    hiddenY: -3,
    shownY: 0,
    scale: [3.2, 3.2, 3.2],
  },
  {
    modelSrc: '/models/witchhouse.glb',
    position: [-3, -3, 15],
    spotPos: [-3, 0.005, 18],
    spotColor: '#fb923c',
    spotActiveColor: '#6b21a8',
    hiddenY: -3,
    shownY: 0,
    scale: [3.4, 3.4, 3.4],
  },
]

const HOUSE_INFO: HouseInfo[] = [
  {
    title: '아늑한 오두막',
    description: '숲 속 깊은 곳에 자리한 따뜻한 오두막. 지친 여행자들의 쉼터가 되어주는 곳이다.',
  },
  {
    title: '환상의 성',
    description: '마법으로 가득한 신비로운 성. 수많은 전설이 깃들어 있으며, 밤이 되면 더욱 아름답게 빛난다.',
  },
  {
    title: '마녀의 집',
    description: '깊은 숲 속 마녀가 사는 기묘한 집. 달빛 아래 더욱 신비롭게 빛나며, 온갖 마법 재료가 가득하다.',
  },
]

// 각 경로의 방향·위치·색상 정의
const ARROW_PATHS = [
  { from: [0, 0] as [number, number], to: [5, 5]   as [number, number], count: 2, color: '#FFD700' },
  { from: [5, 5] as [number, number], to: [18, 3]  as [number, number], count: 3, color: '#a78bfa' },
  { from: [5, 5] as [number, number], to: [-3, 18] as [number, number], count: 3, color: '#fb923c' },
]

function PathArrows() {
  const arrowShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.3, -0.7)
    s.lineTo( 0.3, -0.7)
    s.lineTo( 0.3,  0.0)
    s.lineTo( 0.7,  0.0)
    s.lineTo( 0.0,  0.8)
    s.lineTo(-0.7,  0.0)
    s.lineTo(-0.3,  0.0)
    s.closePath()
    return s
  }, [])

  // 경로별 화살표 위치·각도 계산
  const arrows = useMemo(() => {
    const result: { x: number; z: number; angle: number; color: string }[] = []
    ARROW_PATHS.forEach(({ from, to, count, color }) => {
      const dx = to[0] - from[0]
      const dz = to[1] - from[1]
      // 로컬 +Y → 월드 -Z 방향이므로 atan2(-dx, -dz)로 목적지 방향 구함
      const angle = Math.atan2(-dx, -dz)
      for (let i = 1; i <= count; i++) {
        const t = i / (count + 1)
        result.push({ x: from[0] + dx * t, z: from[1] + dz * t, angle, color })
      }
    })
    return result
  }, [])

  const meshesRef = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const opacity = 0.35 + Math.sin(clock.getElapsedTime() * 2.5) * 0.3
    meshesRef.current.forEach(mesh => {
      if (mesh) (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0.05, opacity)
    })
  })

  return (
    <>
      {arrows.map((a, i) => (
        <group key={i} position={[a.x, 0.02, a.z]} rotation={[0, a.angle, 0]}>
          <mesh
            ref={el => { meshesRef.current[i] = el }}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <shapeGeometry args={[arrowShape]} />
            <meshBasicMaterial
              color={a.color}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

function CameraSetup() {
  const prevSize = useRef({ width: 0, height: 0 })

  useFrame(({ camera, size }) => {
    if (prevSize.current.width === size.width && prevSize.current.height === size.height) return
    prevSize.current = { width: size.width, height: size.height }

    const ortho = camera as THREE.OrthographicCamera
    const aspect = size.width / size.height
    ortho.left = -aspect
    ortho.right = aspect
    ortho.top = 1
    ortho.bottom = -1
    ortho.near = -1000
    ortho.far = 1000
    ortho.zoom = 0.2
    ortho.updateProjectionMatrix()
  })

  return null
}

function HouseInfoPanel({
  houseIndex,
  onClose,
}: {
  houseIndex: number | null
  onClose: () => void
}) {
  if (houseIndex === null) return null
  const config = HOUSE_CONFIGS[houseIndex]
  const info = HOUSE_INFO[houseIndex]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(10, 10, 20, 0.92)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '1rem',
        maxWidth: '420px',
        width: '90%',
        textAlign: 'center',
        zIndex: 100,
        border: `2px solid ${config.spotActiveColor}`,
        boxShadow: `0 0 28px ${config.spotActiveColor}55`,
        fontFamily: 'sans-serif',
      }}
    >
      <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.3rem', fontWeight: 700 }}>
        {info.title}
      </h2>
      <p style={{ margin: '0 0 1.25rem', lineHeight: 1.7, color: '#ccc', fontSize: '0.9rem' }}>
        {info.description}
      </p>
      <button
        onClick={onClose}
        style={{
          background: config.spotActiveColor,
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.5rem 1.5rem',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 600,
        }}
      >
        닫기
      </button>
    </div>
  )
}

type SceneContentProps = {
  lockedRef: { current: boolean }
  onEnterHouse: (index: number) => void
  onLeaveHouse: () => void
}

function SceneContent({ lockedRef, onEnterHouse, onLeaveHouse }: SceneContentProps) {
  const playerRef = useRef<THREE.Group>(null)
  const pointerRef = useRef<THREE.Mesh>(null)

  const houseGroupRefs = useRef<(THREE.Group | null)[]>(HOUSE_CONFIGS.map(() => null))
  const spotMeshRefs = useRef<(THREE.Mesh | null)[]>(HOUSE_CONFIGS.map(() => null))
  const houseShownRefs = useRef<boolean[]>(HOUSE_CONFIGS.map(() => false))
  const houseTargetYs = useRef<number[]>(HOUSE_CONFIGS.map(c => c.hiddenY))

  const movingRef = useRef(false)
  const [moving, setMoving] = useState(false)
  const destRef = useRef(new THREE.Vector3())
  const camTargetY = useRef(5)

  const floorTexture = useTexture('/images/grid.png', (t) => {
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(50, 50)
  })


  useFrame(({ camera }) => {
    const player = playerRef.current
    if (!player) return

    camera.lookAt(player.position)

    if (movingRef.current) {
      const dest = destRef.current
      const angle = Math.atan2(dest.z - player.position.z, dest.x - player.position.x)
      player.position.x += Math.cos(angle) * WALK_SPEED
      player.position.z += Math.sin(angle) * WALK_SPEED

      camera.position.x = CAMERA_BASE.x + player.position.x
      camera.position.z = CAMERA_BASE.z + player.position.z

      if (
        Math.abs(dest.x - player.position.x) < ARRIVE_THRESHOLD &&
        Math.abs(dest.z - player.position.z) < ARRIVE_THRESHOLD
      ) {
        movingRef.current = false
        setMoving(false)
      }
    }

    // 영역 감지 - 매 프레임 실행
    HOUSE_CONFIGS.forEach((config, i) => {
      const nearSpot =
        Math.abs(config.spotPos[0] - player.position.x) < SPOT_RADIUS &&
        Math.abs(config.spotPos[2] - player.position.z) < SPOT_RADIUS

      const spot = spotMeshRefs.current[i]

      if (nearSpot && !houseShownRefs.current[i]) {
        houseShownRefs.current[i] = true
        houseTargetYs.current[i] = config.shownY
        if (spot) (spot.material as THREE.MeshStandardMaterial).color.set(config.spotActiveColor)
        movingRef.current = false
        setMoving(false)
        lockedRef.current = true
        onEnterHouse(i)
      } else if (!nearSpot && houseShownRefs.current[i]) {
        houseShownRefs.current[i] = false
        houseTargetYs.current[i] = config.hiddenY
        if (spot) (spot.material as THREE.MeshStandardMaterial).color.set(config.spotColor)
        lockedRef.current = false
        onLeaveHouse()
      }
    })

    camTargetY.current = houseShownRefs.current.some(v => v) ? 3 : 5

    // 카메라 Y 부드럽게 이동
    camera.position.y += (camTargetY.current - camera.position.y) * 0.05

    // 집들 Y 부드럽게 이동
    HOUSE_CONFIGS.forEach((_, i) => {
      const group = houseGroupRefs.current[i]
      if (group) {
        group.position.y += (houseTargetYs.current[i] - group.position.y) * 0.1
      }
    })
  })

  const isPressedRef = useRef(false)

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (lockedRef.current) return
    e.stopPropagation()
    isPressedRef.current = true
    const player = playerRef.current
    if (!player) return
    destRef.current.set(e.point.x, 0.3, e.point.z)
    player.lookAt(new THREE.Vector3(e.point.x, player.position.y, e.point.z))
    movingRef.current = true
    setMoving(true)
    if (pointerRef.current) {
      pointerRef.current.position.x = e.point.x
      pointerRef.current.position.z = e.point.z
    }
  }, [lockedRef])

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isPressedRef.current || lockedRef.current) return
    e.stopPropagation()
    const player = playerRef.current
    if (!player) return
    destRef.current.set(e.point.x, 0.3, e.point.z)
    player.lookAt(new THREE.Vector3(e.point.x, player.position.y, e.point.z))
    movingRef.current = true
    setMoving(true)
    if (pointerRef.current) {
      pointerRef.current.position.x = e.point.x
      pointerRef.current.position.z = e.point.z
    }
  }, [lockedRef])

  const handlePointerUp = useCallback(() => {
    isPressedRef.current = false
  }, [])

  return (
    <>
      {/* 바닥 */}
      <mesh
        name="floor"
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial map={floorTexture} />
      </mesh>

      {/* 이동 경로 화살표 */}
      <PathArrows />

      {/* 클릭 위치 표시 */}
      <mesh ref={pointerRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="crimson" transparent opacity={0.5} />
      </mesh>

      {/* 트리거 스팟 */}
      {HOUSE_CONFIGS.map((config, i) => (
        <mesh
          key={`spot-${i}`}
          ref={el => { spotMeshRefs.current[i] = el }}
          position={config.spotPos}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[3, 3]} />
          <meshStandardMaterial color={config.spotColor} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* 집들 (초기 위치 땅 속) */}
      {HOUSE_CONFIGS.map((config, i) => (
        <group
          key={`house-${i}`}
          ref={el => { houseGroupRefs.current[i] = el }}
          position={config.position}
        >
          <group scale={config.scale ?? [1, 1, 1]}>
            <House modelSrc={config.modelSrc} />
          </group>
        </group>
      ))}

      {/* 플레이어 */}
      <group ref={playerRef}>
        <Player modelSrc="/models/ilbuni.glb" moving={moving} />
      </group>
    </>
  )
}

export default function WorldStage() {
  const lockedRef = useRef(false)
  const [activeHouseIndex, setActiveHouseIndex] = useState<number | null>(null)

  const handleEnterHouse = useCallback((i: number) => {
    lockedRef.current = true
    setActiveHouseIndex(i)
  }, [])

  const handleLeaveHouse = useCallback(() => {
    lockedRef.current = false
    setActiveHouseIndex(null)
  }, [])

  const handleClosePanel = useCallback(() => {
    lockedRef.current = false
    setActiveHouseIndex(null)
  }, [])

  return (
    <>
      <Canvas
        orthographic
        shadows
        camera={{
          position: [1, 5, 5],
          zoom: 0.2,
          near: -1000,
          far: 1000,
        }}
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', touchAction: 'none' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[1, 1, 1]}
          intensity={3}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
          shadow-camera-near={-100}
          shadow-camera-far={100}
        />
        <CameraSetup />
        <Suspense fallback={null}>
          <SceneContent
            lockedRef={lockedRef}
            onEnterHouse={handleEnterHouse}
            onLeaveHouse={handleLeaveHouse}
          />
        </Suspense>
      </Canvas>
      <HouseInfoPanel houseIndex={activeHouseIndex} onClose={handleClosePanel} />
    </>
  )
}
