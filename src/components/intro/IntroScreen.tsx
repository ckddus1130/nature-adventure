'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

export default function IntroScreen() {
  const [progress, setProgress] = useState(0)
  const setPhase = useAppStore(s => s.setPhase)

  useEffect(() => {
    // R3F useProgress로 실제 에셋 로딩 퍼센트 받아오는 부분
    // 여기선 시뮬레이션
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => setPhase('intro'), 500) // 완료 후 0.5초 뒤 전환
          return 100
        }
        return prev + Math.random() * 10
      })
    }, 150)
    return () => clearInterval(timer)
  }, [])

  if (progress < 100) {
    return (
      <div className="intro-loading">
        <div className="spinner" />
        <p>탐험을 준비하고 있어요</p>
        <span>{Math.floor(progress)}%</span>
      </div>
    )
  }

  return (
    <div className="intro-landing">
      {/* TODO: Next Image Tag 사용, 2. 원숭이 이미지(3D 모델링) */}
      {/* <img src="/characters/monkey.png" alt="원숭이" className="float" /> */}
      <h1>안녕! 나랑 탐험할래?</h1>
      <p>수학, 과학, 창의력의 세계로 함께 떠나요</p>
      <button onClick={() => setPhase('character-select')}>
        탐험 시작하기
      </button>
    </div>
  )
}