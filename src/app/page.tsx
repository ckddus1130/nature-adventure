'use client'
import IntroScreen from '@/components/intro/IntroScreen'
import { useAppStore } from '@/store/useAppStore'

export default function Home() {
  const phase = useAppStore(s => s.phase)

  return (
    <main>
      {(phase === 'loading' || phase === 'intro') && <IntroScreen />}
    </main>
  )
}