'use client'

import { NODE_TYPES, NodeType } from '../types/index'

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void
}

export default function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
        Tambah Node
      </h3>
      <div className="space-y-2">
        {Object.entries(NODE_TYPES).map(([key, value]) => (
          <button
            key={key}
            onClick={() => onAddNode(key as NodeType)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 transition-all text-left"
          >
            <span className="text-xl">{value.icon}</span>
            <span className="text-sm text-white">{value.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}