'use client'

import { useState } from 'react'
import { Headphones, Palette, Music, Camera, PenLine, Mic, Gamepad2, Video, Lightbulb, Paintbrush } from 'lucide-react'

const CREATOR_TYPES = [
  { icon: Headphones, label: 'DJs' },
  { icon: Palette, label: 'Artistas' },
  { icon: Music, label: 'Músicos' },
  { icon: Camera, label: 'Fotógrafos' },
  { icon: PenLine, label: 'Escritores' },
  { icon: Mic, label: 'Podcasters' },
  { icon: Gamepad2, label: 'Streamers' },
  { icon: Video, label: 'Creadores de video' },
  { icon: Lightbulb, label: 'Emprendedores' },
  { icon: Paintbrush, label: 'Ilustradores' },
]

export function CreatorChips() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
      {CREATOR_TYPES.map((type) => {
        const Icon = type.icon
        const isActive = selected === type.label
        return (
          <button
            key={type.label}
            onClick={() => setSelected(isActive ? null : type.label)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-full text-base font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-white border-2 border-rose-600 text-gray-900 shadow-sm'
                : 'bg-rose-100/70 text-gray-700 hover:bg-white hover:border-2 hover:border-rose-300 hover:shadow-sm border-2 border-transparent'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-rose-600' : 'text-rose-500'}`} />
            {type.label}
          </button>
        )
      })}
    </div>
  )
}
