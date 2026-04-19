'use client'
import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { Mesh } from 'three'

type Props = {
  modelSrc: string
  position?: [number, number, number]
  visible?: boolean
}

export default function House({ modelSrc, position = [0, 0, 0], visible = true }: Props) {
  const { scene } = useGLTF(modelSrc)

  useEffect(() => {
    scene.traverse(child => {
      if (child instanceof Mesh) child.castShadow = true
    })
  }, [scene])

  return (
    <primitive object={scene} position={position} visible={visible} />
  )
}
