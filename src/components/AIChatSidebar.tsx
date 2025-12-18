'use client'

import { useState, useRef, useEffect } from 'react'
import { FlowNode } from '../types/index'
import { generateAIContext, AI_QUICK_ACTIONS, AI_MODELS } from '../lib/aiContext'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface AIChatSidebarProps {
    isOpen: boolean
    onClose: () => void
    projectTitle: string
    projectSummary: string
    nodes: FlowNode[]
}

export default function AIChatSidebar({
    isOpen,
    onClose,
    projectTitle,
    projectSummary,
    nodes
}: AIChatSidebarProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [selectedModel, setSelectedModel] = useState('claude')
    const [showModelPicker, setShowModelPicker] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0]

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const context = generateAIContext(projectTitle, projectSummary, nodes)

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    model: selectedModel,
                    context
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mendapatkan respons')
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `❌ Ralat: ${error instanceof Error ? error.message : 'Sila cuba lagi.'}`,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleQuickAction = (prompt: string) => {
        sendMessage(prompt)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage(input)
        }
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`
        fixed top-0 right-0 h-full w-full sm:w-[400px] bg-slate-900 border-l border-slate-700
        z-50 flex flex-col transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                            style={{ backgroundColor: `${currentModel.color}30` }}
                        >
                            {currentModel.icon}
                        </div>
                        <div>
                            <h2 className="font-bold text-white">AI Assistant</h2>
                            <button
                                onClick={() => setShowModelPicker(!showModelPicker)}
                                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                            >
                                {currentModel.name} • {currentModel.description}
                                <span className="text-[10px]">▼</span>
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                {/* Model Picker Dropdown */}
                {showModelPicker && (
                    <div className="absolute top-16 left-4 right-4 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-10 overflow-hidden">
                        {AI_MODELS.map(model => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    setSelectedModel(model.id)
                                    setShowModelPicker(false)
                                }}
                                className={`
                  w-full flex items-center gap-3 p-3 hover:bg-slate-700 transition-colors
                  ${selectedModel === model.id ? 'bg-slate-700' : ''}
                `}
                            >
                                <span className="text-xl">{model.icon}</span>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white">{model.name}</div>
                                    <div className="text-xs text-slate-400">{model.description}</div>
                                </div>
                                {selectedModel === model.id && (
                                    <span className="ml-auto text-emerald-400">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                {messages.length === 0 && (
                    <div className="p-4 border-b border-slate-700">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Tindakan Pantas</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {AI_QUICK_ACTIONS.map(action => (
                                <button
                                    key={action.id}
                                    onClick={() => handleQuickAction(action.prompt)}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all text-left group"
                                >
                                    <span className="text-lg group-hover:scale-110 transition-transform">
                                        {action.icon}
                                    </span>
                                    <span className="text-xs text-white">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center">
                            <div>
                                <div className="text-5xl mb-4">🤖</div>
                                <h3 className="text-lg font-bold text-white mb-2">Hai! Saya AI Assistant</h3>
                                <p className="text-sm text-slate-400 max-w-[280px]">
                                    Saya akan membantu anda merancang projek.
                                    Pilih tindakan pantas atau taip soalan anda!
                                </p>
                            </div>
                        </div>
                    ) : (
                        messages.map(message => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                  max-w-[85%] rounded-2xl px-4 py-3 
                  ${message.role === 'user'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                        : 'bg-slate-800 text-white border border-slate-700'}
                `}>
                                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                                    <div className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-white/60' : 'text-slate-500'}`}>
                                        {message.timestamp.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Typing Indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                    <div className="flex items-end gap-2">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Taip mesej anda..."
                                rows={1}
                                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 pr-12 text-sm text-white resize-none focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                style={{ maxHeight: '120px' }}
                            />
                        </div>
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading}
                            className={`
                p-3 rounded-xl font-bold transition-all
                ${input.trim() && !isLoading
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 hover:scale-105'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
              `}
                        >
                            <span className="text-lg">➤</span>
                        </button>
                    </div>

                    {/* Context indicator */}
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <span>🎯</span>
                        <span>Konteks: {nodes.length} nodes</span>
                        <span>•</span>
                        <span style={{ color: currentModel.color }}>{currentModel.icon} {currentModel.name}</span>
                    </div>
                </div>
            </div>
        </>
    )
}
