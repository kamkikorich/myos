'use client'

import { useState } from 'react'
import { FlowNode } from '../types/index'
import { downloadBlueprint, copyBlueprintToClipboard, generateBlueprintMarkdown } from '../lib/exportUtils'

interface ExportButtonProps {
    title: string
    summary: string
    nodes: FlowNode[]
}

export default function ExportButton({ title, summary, nodes }: ExportButtonProps) {
    const [showMenu, setShowMenu] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [copied, setCopied] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    const handleDownload = () => {
        setIsExporting(true)
        setTimeout(() => {
            downloadBlueprint(title, summary, nodes)
            setIsExporting(false)
            setShowMenu(false)
        }, 500)
    }

    const handleCopy = async () => {
        setIsExporting(true)
        const success = await copyBlueprintToClipboard(title, summary, nodes)
        setIsExporting(false)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
        setShowMenu(false)
    }

    const previewContent = generateBlueprintMarkdown(title, summary, nodes)

    return (
        <div className="relative">
            {/* Main Export Button */}
            <button
                onClick={() => setShowMenu(!showMenu)}
                className={`
          flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm
          bg-gradient-to-r from-emerald-500 to-teal-500
          hover:from-emerald-400 hover:to-teal-400
          text-white shadow-lg shadow-emerald-500/30
          transition-all duration-300 hover:scale-105 hover:shadow-xl
          ${isExporting ? 'animate-pulse' : ''}
        `}
            >
                <span className="text-lg">📤</span>
                <span>Export untuk AI</span>
                <span className="text-xs opacity-75">▼</span>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-slate-700">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>🚀</span> Export Blueprint
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            Hantar ke Antigraviti Google dengan satu klik!
                        </p>
                    </div>

                    <div className="p-2 space-y-1">
                        {/* Download Option */}
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors text-left group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">💾</span>
                            <div>
                                <div className="text-sm font-bold text-white">Download Fail</div>
                                <div className="text-xs text-slate-400">.blueprint.md</div>
                            </div>
                        </button>

                        {/* Copy Option */}
                        <button
                            onClick={handleCopy}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors text-left group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">
                                {copied ? '✅' : '📋'}
                            </span>
                            <div>
                                <div className="text-sm font-bold text-white">
                                    {copied ? 'Disalin!' : 'Salin ke Clipboard'}
                                </div>
                                <div className="text-xs text-slate-400">Paste terus di AI chat</div>
                            </div>
                        </button>

                        {/* Preview Option */}
                        <button
                            onClick={() => { setShowPreview(true); setShowMenu(false); }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors text-left group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">👁️</span>
                            <div>
                                <div className="text-sm font-bold text-white">Preview</div>
                                <div className="text-xs text-slate-400">Lihat sebelum export</div>
                            </div>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="p-3 bg-slate-700/50 border-t border-slate-700">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Nodes: {nodes.length}</span>
                            <span className="text-emerald-400 font-bold">Ready to Export ✓</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
                    <div className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📄</span>
                                <div>
                                    <h2 className="font-bold text-white">Preview Blueprint</h2>
                                    <p className="text-xs text-slate-400">Ini yang AI akan terima</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <span className="text-xl">✕</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 overflow-auto max-h-[60vh]">
                            <pre className="bg-slate-800 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap font-mono overflow-x-auto">
                                {previewContent}
                            </pre>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => { handleDownload(); setShowPreview(false); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-400 hover:to-teal-400 transition-all"
                            >
                                <span>💾</span> Download
                            </button>
                            <button
                                onClick={() => { handleCopy(); setShowPreview(false); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:from-amber-400 hover:to-orange-400 transition-all"
                            >
                                <span>📋</span> Salin
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close menu */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                />
            )}
        </div>
    )
}
