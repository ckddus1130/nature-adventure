'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function SoundButton() {
  const [soundOn, setSoundOn] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/audio/mainBGM.wav')
    audioRef.current.loop = true
    audioRef.current.play().catch(() => {})
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current) return
    if (soundOn) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [soundOn])

  return (
    <button
      onClick={() => setSoundOn(prev => !prev)}
      className="fixed top-4 right-4 z-50 p-0 m-0 bg-transparent border-none outline-none cursor-pointer appearance-none"
      aria-label={soundOn ? '소리 끄기' : '소리 켜기'}
    >
      <Image
        src={soundOn ? '/icons/SoundOn.svg' : '/icons/SoundOff.svg'}
        alt={soundOn ? 'Sound On' : 'Sound Off'}
        width={40}
        height={40}
      />
    </button>
  )
}
