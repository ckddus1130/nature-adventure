'use client'
import { useAppStore } from '@/store/useAppStore'

export default function IntroScreen() {
  const setPhase = useAppStore(s => s.setPhase)
  return (
    <div className="w-full h-full bg-[#0a1628] flex flex-col items-center justify-center gap-6">
      <h1 className="text-white text-[32px] m-0">
        안녕! 나랑 탐험할래?
      </h1>
      <p className="text-[#9FE1CB] m-0">
        수학, 과학, 창의력의 세계로 함께 떠나요
      </p>
      <button
        onClick={() => setPhase('character-select')}
        className="bg-[#1D9E75] text-white border-none rounded-full px-10 py-3.5 text-base cursor-pointer"
      >
        탐험 시작하기
      </button>
    </div>
  )
}
