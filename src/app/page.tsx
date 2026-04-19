'use client'
import { useAppStore } from '@/store/useAppStore'
import IntroScreen from '@/components/intro/IntroScreen'
import CharacterSelect from '@/components/character-select/CharacterSelect'
import WorldStage from '@/components/world/WorldState'

export default function Home() {
  const phase = useAppStore(s => s.phase)
  return (
    <main className="w-dvw h-dvh overflow-hidden">
      {phase === 'intro' && <IntroScreen />}
      {phase === 'character-select' && <CharacterSelect />}
      {phase === 'world' && <WorldStage />}
    </main>
  )
}