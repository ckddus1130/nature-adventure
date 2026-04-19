'use client'
import { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Group, Mesh } from 'three'

type Props = {
  modelSrc: string
  moving?: boolean
}

export default function Player({ modelSrc, moving = false }: Props) {
  const groupRef = useRef<Group>(null)
  const { scene, animations } = useGLTF(modelSrc)
  const { actions } = useAnimations(animations, groupRef)

  useEffect(() => {
    scene.traverse(child => {
      if (child instanceof Mesh) child.castShadow = true
    })
  }, [scene])

  useEffect(() => {
    const idle = actions[Object.keys(actions)[0]]
    const walk = actions[Object.keys(actions)[1]]
    if (moving) {
      idle?.stop()
      walk?.play()
    } else {
      walk?.stop()
      idle?.play()
    }
  }, [moving, actions])

  return (
    <group ref={groupRef} position={[0, 0.3, 0]} name="ilbuni">
      <primitive object={scene} />
    </group>
  )
}
