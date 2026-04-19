'use client'
import { Suspense, useRef, useState, useCallback } from 'react'
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import Player from './Player'
import House from './House'

const CAMERA_BASE = new THREE.Vector3(1, 5, 5)

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
const SPOT_POS: [number, number, number] = [5, 0.005, 5]
const WALK_SPEED = 0.05
const ARRIVE_THRESHOLD = 0.03
const SPOT_RADIUS = 1.5

function SceneContent() {
  const playerRef = useRef<THREE.Group>(null)
  const pointerRef = useRef<THREE.Mesh>(null)
  const spotRef = useRef<THREE.Mesh>(null)
  const houseGroupRef = useRef<THREE.Group>(null)

  const movingRef = useRef(false)
  const [moving, setMoving] = useState(false)
  const destRef = useRef(new THREE.Vector3())

  const houseShownRef = useRef(false)
  const houseTargetY = useRef(-1.3)
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

      const nearSpot =
        Math.abs(SPOT_POS[0] - player.position.x) < SPOT_RADIUS &&
        Math.abs(SPOT_POS[2] - player.position.z) < SPOT_RADIUS

      if (nearSpot && !houseShownRef.current) {
        houseShownRef.current = true
        houseTargetY.current = 1
        camTargetY.current = 3
        if (spotRef.current) {
          (spotRef.current.material as THREE.MeshStandardMaterial).color.set('seagreen')
        }
      } else if (!nearSpot && houseShownRef.current) {
        houseShownRef.current = false
        houseTargetY.current = -1.3
        camTargetY.current = 5
        if (spotRef.current) {
          (spotRef.current.material as THREE.MeshStandardMaterial).color.set('yellow')
        }
      }
    }

    // 카메라 Y 부드럽게 이동
    camera.position.y += (camTargetY.current - camera.position.y) * 0.05

    // 집 Y 부드럽게 이동 (bounce 대체)
    if (houseGroupRef.current) {
      houseGroupRef.current.position.y +=
        (houseTargetY.current - houseGroupRef.current.position.y) * 0.1
    }
  })

  const isPressedRef = useRef(false)

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
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
  }, [])

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isPressedRef.current) return
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
  }, [])

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

      {/* 클릭 위치 표시 */}
      <mesh ref={pointerRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="crimson" transparent opacity={0.5} />
      </mesh>

      {/* 집 출현 트리거 스팟 */}
      <mesh ref={spotRef} position={SPOT_POS} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="yellow" transparent opacity={0.5} />
      </mesh>

      {/* 집 (초기 위치 땅 속) */}
      <group ref={houseGroupRef} position={[5, -1.3, 2]}>
        <House modelSrc="/models/house.glb" />
      </group>

      {/* 플레이어 */}
      <group ref={playerRef}>
        <Player modelSrc="/models/ilbuni.glb" moving={moving} />
      </group>
    </>
  )
}

export default function WorldStage() {
  return (
    <Canvas
      orthographic
      shadows
      camera={{
        position: [1, 5, 5],
        zoom: 0.2,
        near: -1000,
        far: 1000,
      }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
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
        <SceneContent />
      </Suspense>
    </Canvas>
  )
}
