'use client'

import { useState, useRef, useCallback } from 'react'

interface FlowNode {
  id: string
  type: 'process' | 'decision' | 'start' | 'end' | 'data'
  label: string
  x: number
  y: number
}

interface FlowEdge {
  id: string
  from: string
  to: string
  label?: string
}

interface ProjectState {
  planning: string
  issues: string
  outputType: 'mobile' | 'web' | 'hybrid'
  nodes: FlowNode[]
  edges: FlowEdge[]
}

const AI_MODELS = [
  { id: 'claude', name: 'Claude Opus 4', icon: '🧠', color: 'from-amber-500 to-orange-500', desc: 'Best for complex reasoning' },
  { id: 'codex', name: 'OpenAI Codex', icon: '💻', color: 'from-green-500 to-emerald-500', desc: 'Best for code generation' },
  { id: 'deepseek', name: 'DeepSeek', icon: '🔍', color: 'from-blue-500 to-cyan-500', desc: 'Best for analysis' },
]

const SHAPE_PALETTE = [
  { type: 'start', icon: '⬭', label: 'Start/End', color: 'bg-green-500' },
  { type: 'process', icon: '▭', label: 'Process', color: 'bg-blue-500' },
  { type: 'decision', icon: '◇', label: 'Decision', color: 'bg-yellow-400' },
  { type: 'data', icon: '▱', label: 'Data', color: 'bg-purple-500' },
]

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const [project, setProject] = useState<ProjectState>({
    planning: '',
    issues: '',
    outputType: 'web',
    nodes: [],
    edges: []
  })
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [showAIPanel, setShowAIPanel] = useState(false)

  // Add node to canvas
  const addNode = (type: string) => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: type as FlowNode['type'],
      label: type === 'decision' ? 'Condition?' : type.charAt(0).toUpperCase() + type.slice(1),
      x: 300 + Math.random() * 100,
      y: 100 + project.nodes.length * 80,
    }
    setProject(p => ({ ...p, nodes: [...p.nodes, newNode] }))
  }

  // Handle node drag
  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDraggedNode(nodeId)
    setSelectedNode(nodeId)
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setProject(p => ({
      ...p,
      nodes: p.nodes.map(n => n.id === draggedNode ? { ...n, x, y } : n)
    }))
  }, [draggedNode])

  const handleMouseUp = () => {
    setDraggedNode(null)
  }

  // Connect nodes
  const startConnect = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConnectingFrom(nodeId)
  }

  const endConnect = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (connectingFrom && connectingFrom !== nodeId) {
      const newEdge: FlowEdge = {
        id: `edge-${Date.now()}`,
        from: connectingFrom,
        to: nodeId,
      }
      setProject(p => ({ ...p, edges: [...p.edges, newEdge] }))
    }
    setConnectingFrom(null)
  }

  // Delete selected node
  const deleteSelected = () => {
    if (!selectedNode) return
    setProject(p => ({
      ...p,
      nodes: p.nodes.filter(n => n.id !== selectedNode),
      edges: p.edges.filter(e => e.from !== selectedNode && e.to !== selectedNode)
    }))
    setSelectedNode(null)
  }

  // Update node label
  const updateNodeLabel = (nodeId: string, label: string) => {
    setProject(p => ({
      ...p,
      nodes: p.nodes.map(n => n.id === nodeId ? { ...n, label } : n)
    }))
  }

  // Generate flowchart with AI
  const generateFlowchart = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Generate a flowchart JSON for: "${prompt}". Return ONLY JSON:
{"nodes":[{"id":"1","type":"start","label":"Start","x":300,"y":50}],"edges":[{"from":"1","to":"2"}]}
Types: start, end, process, decision, data. Space y by 100.`
          }],
          model: selectedModel,
          context: ''
        })
      })
      const data = await response.json()
      const jsonMatch = (data.message || '').match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const flowData = JSON.parse(jsonMatch[0])
        setProject(p => ({ ...p, nodes: flowData.nodes || [], edges: flowData.edges || [] }))
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Analyze project
  const analyzeProject = async () => {
    setShowAIPanel(true)
    setAiSuggestion('Analyzing...')
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Analyze this project as a senior software architect. Give specific, actionable suggestions:

Planning: ${project.planning || 'Not specified'}
Issues: ${project.issues || 'Not specified'}
Output: ${project.outputType}
Flowchart: ${project.nodes.map(n => `${n.type}: ${n.label}`).join(' → ')}

Give 5 specific improvements for best-in-class implementation.`
          }],
          model: selectedModel,
          context: ''
        })
      })
      const data = await response.json()
      setAiSuggestion(data.message || 'No suggestions available.')
    } catch (error) {
      setAiSuggestion('Error analyzing project.')
    }
  }

  const getNodeStyle = (type: string, isSelected: boolean) => {
    const base = 'absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move transition-all shadow-lg'
    const selected = isSelected ? 'ring-4 ring-amber-400 scale-110' : ''
    switch (type) {
      case 'start':
      case 'end':
        return `${base} ${selected} bg-green-500 rounded-full px-6 py-3 min-w-[100px] text-center`
      case 'decision':
        return `${base} ${selected} bg-yellow-400 w-28 h-28`
      case 'data':
        return `${base} ${selected} bg-purple-500 px-6 py-3 min-w-[120px] text-center skew-x-[-10deg]`
      default:
        return `${base} ${selected} bg-blue-500 rounded-lg px-6 py-3 min-w-[120px] text-center`
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-xl">⚡</div>
            <div>
              <h1 className="text-lg font-bold">AI FlowChart Builder</h1>
              <p className="text-xs text-slate-400">Like LucidChart + Whimsical AI</p>
            </div>
          </div>

          {/* AI Model Selector */}
          <div className="flex gap-2">
            {AI_MODELS.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${selectedModel === model.id
                    ? `bg-gradient-to-r ${model.color} scale-105`
                    : 'bg-slate-700 hover:bg-slate-600'
                  }`}
              >
                <span className="mr-1">{model.icon}</span>
                {model.name}
              </button>
            ))}
          </div>

          <button onClick={analyzeProject} className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg font-bold hover:scale-105 transition-all">
            🤖 Analyze
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-72 bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto">
          {/* Shape Palette */}
          <div className="mb-6">
            <h3 className="font-bold mb-3 text-amber-400">🎨 Shapes</h3>
            <div className="grid grid-cols-2 gap-2">
              {SHAPE_PALETTE.map(shape => (
                <button
                  key={shape.type}
                  onClick={() => addNode(shape.type)}
                  className={`${shape.color} p-3 rounded-lg text-center hover:scale-105 transition-all`}
                >
                  <span className="text-2xl block">{shape.icon}</span>
                  <span className="text-xs">{shape.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">Click to add • Drag to move • Click connector to link</p>
          </div>

          {/* AI Generate */}
          <div className="mb-6 bg-slate-700 rounded-xl p-3">
            <h3 className="font-bold mb-2 text-amber-400">✨ AI Generate</h3>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateFlowchart()}
              placeholder="Describe your process..."
              className="w-full bg-slate-600 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={generateFlowchart}
              disabled={isGenerating}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-bold text-sm hover:scale-105 transition-all disabled:opacity-50"
            >
              {isGenerating ? '⏳' : '🚀'} Generate
            </button>
          </div>

          {/* Planning */}
          <div className="mb-4">
            <h3 className="font-bold mb-2 text-amber-400">📋 Planning</h3>
            <textarea
              value={project.planning}
              onChange={(e) => setProject(p => ({ ...p, planning: e.target.value }))}
              placeholder="Your project plan..."
              className="w-full bg-slate-700 rounded-lg p-2 h-24 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Issues */}
          <div className="mb-4">
            <h3 className="font-bold mb-2 text-rose-400">🔧 Issues</h3>
            <textarea
              value={project.issues}
              onChange={(e) => setProject(p => ({ ...p, issues: e.target.value }))}
              placeholder="Problems to solve..."
              className="w-full bg-slate-700 rounded-lg p-2 h-24 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Output Type */}
          <div>
            <h3 className="font-bold mb-2 text-blue-400">📱 Output</h3>
            <div className="flex gap-2">
              {['mobile', 'web', 'hybrid'].map(t => (
                <button
                  key={t}
                  onClick={() => setProject(p => ({ ...p, outputType: t as 'mobile' | 'web' | 'hybrid' }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize ${project.outputType === t ? 'bg-blue-500' : 'bg-slate-700'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-auto">
          {/* Toolbar */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            {selectedNode && (
              <button onClick={deleteSelected} className="px-3 py-2 bg-red-500 rounded-lg text-sm font-bold hover:bg-red-400">
                🗑️ Delete
              </button>
            )}
            <button
              onClick={() => setProject(p => ({ ...p, nodes: [], edges: [] }))}
              className="px-3 py-2 bg-slate-700 rounded-lg text-sm font-bold hover:bg-slate-600"
            >
              🗑️ Clear
            </button>
          </div>

          <div
            ref={canvasRef}
            className="w-full h-full min-h-[600px] bg-slate-900 relative"
            style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => { setSelectedNode(null); setConnectingFrom(null) }}
          >
            {project.nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <p className="text-6xl mb-4">🎨</p>
                  <p className="text-xl font-bold">Click shapes to add</p>
                  <p className="text-sm">or use AI to generate</p>
                </div>
              </div>
            )}

            {/* Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
                </marker>
              </defs>
              {project.edges.map(edge => {
                const from = project.nodes.find(n => n.id === edge.from)
                const to = project.nodes.find(n => n.id === edge.to)
                if (!from || !to) return null
                return (
                  <line key={edge.id} x1={from.x} y1={from.y + 30} x2={to.x} y2={to.y - 30}
                    stroke="#f59e0b" strokeWidth="3" markerEnd="url(#arrow)" />
                )
              })}
            </svg>

            {/* Nodes */}
            {project.nodes.map(node => (
              <div
                key={node.id}
                className={getNodeStyle(node.type, selectedNode === node.id)}
                style={{ left: node.x, top: node.y }}
                onMouseDown={(e) => handleMouseDown(node.id, e)}
              >
                {node.type === 'decision' ? (
                  <div className="absolute inset-0 bg-yellow-400 rotate-45 rounded-lg" />
                ) : null}
                <input
                  value={node.label}
                  onChange={(e) => updateNodeLabel(node.id, e.target.value)}
                  className={`relative z-10 bg-transparent text-center font-bold focus:outline-none w-full ${node.type === 'decision' ? 'text-black text-sm' : 'text-white'
                    }`}
                  onClick={(e) => e.stopPropagation()}
                />
                {/* Connect handles */}
                <div
                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full cursor-crosshair ${connectingFrom === node.id ? 'bg-green-400 scale-150' : 'bg-amber-400'
                    }`}
                  onMouseDown={(e) => startConnect(node.id, e)}
                  onMouseUp={(e) => endConnect(node.id, e)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI Panel */}
        {showAIPanel && (
          <div className="w-96 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-amber-400">🤖 AI Suggestions</h3>
              <button onClick={() => setShowAIPanel(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
              {aiSuggestion}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
