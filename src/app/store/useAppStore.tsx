import { create } from 'zustand'

type AppState = {
  phase: 'loading' | 'intro' | 'character-select' | 'world'
  selectedCharacter: string | null
  setPhase: (phase: AppState['phase']) => void
  setCharacter: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  phase: 'loading',
  selectedCharacter: null,
  setPhase: (phase) => set({ phase }),
  setCharacter: (id) => set({ selectedCharacter: id }),
}))