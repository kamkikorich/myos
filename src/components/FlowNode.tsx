'use client'

import { NODE_TYPES, FlowNode as FlowNodeType } from '../types/index'

interface FlowNodeProps {
  node: FlowNodeType
  isSelected: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, content: string) => void
}

export default function FlowNode({ node, isSelected, onSelect, onDelete, onUpdate }: FlowNodeProps) {
  const nodeType = NODE_TYPES[node.type]

  return (
    <div
      onClick={() => onSelect(node.id)}
      className={`
        relative p-4 rounded-xl cursor-pointer min-w-[250px] max-w-[300px]
        bg-slate-800 border-2 transition-all duration-200
        hover:scale-105 hover:shadow-xl
        ${isSelected ? 'border-amber-400 shadow-lg shadow-amber-400/20' : 'border-slate-600'}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{nodeType.icon}</span>
          <span 
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: nodeType.color }}
          >
            {nodeType.label}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
          className="text-slate-500 hover:text-red-400 transition-colors"
        >
          ✕
        </button>
      </div>

      <textarea
        value={node.content}
        onChange={(e) => onUpdate(node.id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        placeholder="Tulis idea anda di sini..."
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-sm text-white resize-none focus:outline-none focus:border-amber-500"
        rows={3}
      />

      <div 
        className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
        style={{ backgroundColor: nodeType.color }}
      />
    </div>
  )
}