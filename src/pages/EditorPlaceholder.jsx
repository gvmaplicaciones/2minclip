import { useNavigate } from 'react-router-dom'
import { useEditor } from '../context/EditorContext'

export default function EditorPlaceholder() {
  const navigate = useNavigate()
  const { ratio } = useEditor()

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans flex flex-col items-center justify-center gap-4">
      <div className="bg-[#1f1008] border border-[#e87040] rounded-xl px-6 py-4 text-center">
        <p className="text-sm text-[#888] mb-1">Formato seleccionado</p>
        <p className="text-2xl font-bold text-[#e87040]">{ratio}</p>
      </div>
      <p className="text-sm text-[#444]">Editor — Tarea 3 (próximamente)</p>
      <button
        onClick={() => navigate('/formato')}
        className="text-sm text-[#555] hover:text-[#aaa] transition-colors mt-2"
      >
        ← Volver al selector
      </button>
    </div>
  )
}
