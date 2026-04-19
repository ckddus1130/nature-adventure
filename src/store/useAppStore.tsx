import { create } from 'zustand'

type Phase = 'intro' | 'character-select' | 'world'

type Zone = 'math' | 'science' | 'creative' | null

interface AppStore {
  phase: Phase
  selectedCharacter: string | null
  activeZone: Zone
  setPhase: (p: Phase) => void
  setCharacter: (id: string) => void
  setActiveZone: (z: Zone) => void
}

export const useAppStore = create<AppStore>((set) => ({
  phase: 'intro',
  selectedCharacter: null,
  activeZone: null,
  setPhase: (phase) => set({ phase }),
  setCharacter: (id) => set({ selectedCharacter: id }),
  setActiveZone: (zone) => set({ activeZone: zone }),
}))