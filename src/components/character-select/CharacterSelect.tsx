'use client'
import Image from 'next/image'
import { useAppStore } from '@/store/useAppStore'

const CHARACTERS = [
  { id: 'monkey', label: '원숭이', file: '/characters/monkey.png' },
  { id: 'bear',   label: '곰',     file: '/characters/bear.png' },
  { id: 'fox',    label: '여우',   file: '/characters/fox.png' },
  { id: 'mole',   label: '두더지', file: '/characters/mole.png' },
  { id: 'rabbit', label: '토끼',   file: '/characters/rabbit.png' },
]

export default function CharacterSelect() {
  const { setPhase, setCharacter, selectedCharacter } = useAppStore()

  const handleConfirm = () => {
    if (selectedCharacter) setPhase('world')
  }

  return (
    <div className="w-full h-full bg-[#0a1628] flex flex-col items-center justify-center gap-8">
      <h2 className="text-white text-2xl m-0">
        함께할 친구를 골라줘!
      </h2>
      <div className="flex gap-5">
        {CHARACTERS.map(c => (
          <div
            key={c.id}
            onClick={() => setCharacter(c.id)}
            className={`flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 ${
              selectedCharacter === c.id
                ? 'scale-[1.15] drop-shadow-[0_0_12px_#1D9E75]'
                : 'scale-100'
            }`}
          >
            <Image src={c.file} alt={c.label} width={100} height={100} className="object-contain" />
            <span className="text-white text-sm">{c.label}</span>
          </div>
        ))}
      </div>
      <button
        onClick={handleConfirm}
        disabled={!selectedCharacter}
        className={`text-white border-none rounded-full px-10 py-3.5 text-base transition-colors duration-200 ${
          selectedCharacter ? 'bg-[#1D9E75] cursor-pointer' : 'bg-[#444] cursor-not-allowed'
        }`}
      >
        출발!
      </button>
    </div>
  )
}