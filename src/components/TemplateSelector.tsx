'use client'

import { useState } from 'react'
import { PROJECT_TEMPLATES, ProjectTemplate } from '../lib/templates'

interface TemplateSelectorProps {
    onSelectTemplate: (template: ProjectTemplate) => void
    isOpen: boolean
    onClose: () => void
}

export default function TemplateSelector({ onSelectTemplate, isOpen, onClose }: TemplateSelectorProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
                            🎨
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Pilih Template</h2>
                            <p className="text-slate-400">Mula dengan blueprint yang sudah siap!</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-slate-700 rounded-xl transition-colors text-slate-400 hover:text-white"
                    >
                        <span className="text-2xl">✕</span>
                    </button>
                </div>

                {/* Templates Grid */}
                <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PROJECT_TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => {
                                    onSelectTemplate(template)
                                    onClose()
                                }}
                                onMouseEnter={() => setHoveredId(template.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                className={`
                  relative p-5 rounded-2xl text-left transition-all duration-300
                  bg-slate-800 border-2 hover:scale-[1.02]
                  ${hoveredId === template.id
                                        ? 'border-amber-400 shadow-xl shadow-amber-400/20'
                                        : 'border-slate-700 hover:border-slate-600'}
                `}
                            >
                                {/* Color accent bar */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
                                    style={{ backgroundColor: template.color }}
                                />

                                {/* Icon */}
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-4 transition-transform duration-300"
                                    style={{
                                        backgroundColor: `${template.color}20`,
                                        transform: hoveredId === template.id ? 'scale(1.1) rotate(5deg)' : 'scale(1)'
                                    }}
                                >
                                    {template.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-bold text-white mb-1">
                                    {template.title}
                                </h3>
                                <p className="text-sm text-slate-400 mb-3">
                                    {template.description}
                                </p>

                                {/* Node count badge */}
                                {template.nodes.length > 0 && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="px-2 py-1 bg-slate-700 rounded-full">
                                            {template.nodes.length} nodes
                                        </span>
                                        <span>siap pakai</span>
                                    </div>
                                )}

                                {/* Hover arrow */}
                                <div
                                    className={`
                    absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${hoveredId === template.id
                                            ? 'bg-amber-500 text-white translate-x-0 opacity-100'
                                            : 'bg-slate-700 text-slate-400 -translate-x-2 opacity-0'}
                  `}
                                >
                                    →
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Tips Section */}
                    <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h4 className="font-bold text-white text-sm">Tips untuk Kanak-kanak</h4>
                                <p className="text-xs text-slate-400 mt-1">
                                    Pilih mana-mana template untuk mula. Anda boleh ubah suai kemudian!
                                    Cuba template "App Game" untuk buat permainan pertama anda! 🎮
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
