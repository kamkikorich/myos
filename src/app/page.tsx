'use client'

import { useState } from 'react'

interface FlowNode {
  id: string
  type: 'process' | 'decision' | 'start' | 'end'
  label: string
  x: number
  y: number
}

interface FlowEdge {
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

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [project, setProject] = useState<ProjectState>({
    planning: '',
    issues: '',
    outputType: 'web',
    nodes: [],
    edges: []
  })
  const [aiSuggestion, setAiSuggestion] = useState('')

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
            content: `Generate a flowchart for: "${prompt}". 
                        
Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
    "nodes": [
        {"id": "1", "type": "start", "label": "Start", "x": 300, "y": 50},
        {"id": "2", "type": "process", "label": "Step 1", "x": 300, "y": 150},
        {"id": "3", "type": "decision", "label": "Condition?", "x": 300, "y": 250},
        {"id": "4", "type": "end", "label": "End", "x": 300, "y": 350}
    ],
    "edges": [
        {"from": "1", "to": "2"},
        {"from": "2", "to": "3"},
        {"from": "3", "to": "4", "label": "Yes"}
    ]
}

Types: start (oval), end (oval), process (rectangle), decision (diamond).
Position nodes vertically with y increasing by 100 for each row.
Create meaningful labels based on the user's description.`
          }],
          model: 'claude',
          context: ''
        })
      })

      const data = await response.json()
      const content = data.message || data.content

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const flowData = JSON.parse(jsonMatch[0])
        setProject(prev => ({
          ...prev,
          nodes: flowData.nodes || [],
          edges: flowData.edges || []
        }))
      }
    } catch (error) {
      console.error('Error generating flowchart:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const analyzeProject = async () => {
    setShowAIChat(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Analyze this project and give improvement suggestions:

Planning: ${project.planning || 'Not specified'}
Issues to solve: ${project.issues || 'Not specified'}
Output type: ${project.outputType}
Flowchart nodes: ${project.nodes.map(n => n.label).join(', ') || 'None'}

Give 3-5 specific suggestions to improve this project.`
          }],
          model: 'claude',
          context: ''
        })
      })

      const data = await response.json()
      setAiSuggestion(data.message || data.content)
    } catch (error) {
      console.error('Error analyzing:', error)
    }
  }

  const getNodeStyle = (type: string) => {
    switch (type) {
      case 'start':
      case 'end':
        return 'bg-green-500 rounded-full px-6 py-3'
      case 'decision':
        return 'bg-yellow-400 rotate-45 w-24 h-24 flex items-center justify-center'
      case 'process':
      default:
        return 'bg-blue-500 rounded-lg px-6 py-3'
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-bold">AI FlowChart Builder</h1>
              <p className="text-xs text-slate-400">Powered by Claude Opus 4</p>
            </div>
          </div>
          <button
            onClick={analyzeProject}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg font-bold hover:scale-105 transition-all"
          >
            🤖 Analyze Project
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* AI Prompt Input */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            ✨ Generate Flowchart with AI
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateFlowchart()}
              placeholder="Describe your process... e.g., 'User login flow with email verification'"
              className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={generateFlowchart}
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50"
            >
              {isGenerating ? '⏳ Generating...' : '🚀 Generate'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Project Details */}
          <div className="space-y-4">
            {/* Planning */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="font-bold mb-2 text-amber-400">📋 Planning</h3>
              <textarea
                value={project.planning}
                onChange={(e) => setProject(p => ({ ...p, planning: e.target.value }))}
                placeholder="Describe your project plan..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 h-32 resize-none focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Issues */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="font-bold mb-2 text-rose-400">🔧 Issues to Solve</h3>
              <textarea
                value={project.issues}
                onChange={(e) => setProject(p => ({ ...p, issues: e.target.value }))}
                placeholder="What problems are you solving?"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 h-32 resize-none focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Output Type */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="font-bold mb-3 text-blue-400">📱 Output Type</h3>
              <div className="space-y-2">
                {['mobile', 'web', 'hybrid'].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="outputType"
                      value={type}
                      checked={project.outputType === type}
                      onChange={() => setProject(p => ({ ...p, outputType: type as 'mobile' | 'web' | 'hybrid' }))}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Flowchart Canvas */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="bg-slate-700 px-4 py-2 border-b border-slate-600 flex items-center gap-2">
              <span className="font-bold">📊 Flowchart Canvas</span>
              {project.nodes.length > 0 && (
                <span className="text-xs text-slate-400">({project.nodes.length} nodes)</span>
              )}
            </div>

            <div className="relative h-[500px] bg-slate-900 overflow-auto" style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              {project.nodes.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <p className="text-4xl mb-2">🎨</p>
                    <p>Enter a prompt above to generate a flowchart</p>
                  </div>
                </div>
              ) : (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {project.edges.map((edge, i) => {
                    const fromNode = project.nodes.find(n => n.id === edge.from)
                    const toNode = project.nodes.find(n => n.id === edge.to)
                    if (!fromNode || !toNode) return null
                    return (
                      <g key={i}>
                        <line
                          x1={fromNode.x}
                          y1={fromNode.y + 30}
                          x2={toNode.x}
                          y2={toNode.y - 30}
                          stroke="#f59e0b"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                        {edge.label && (
                          <text
                            x={(fromNode.x + toNode.x) / 2 + 10}
                            y={(fromNode.y + toNode.y) / 2}
                            fill="#94a3b8"
                            fontSize="12"
                          >
                            {edge.label}
                          </text>
                        )}
                      </g>
                    )
                  })}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
                    </marker>
                  </defs>
                </svg>
              )}

              {project.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-center font-bold shadow-lg ${getNodeStyle(node.type)}`}
                  style={{ left: node.x, top: node.y }}
                >
                  {node.type === 'decision' ? (
                    <span className="-rotate-45 block text-black text-sm">{node.label}</span>
                  ) : (
                    <span className="text-white">{node.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Suggestions Panel */}
        {showAIChat && aiSuggestion && (
          <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-amber-500/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-amber-400">🤖 AI Analysis & Suggestions</h3>
              <button onClick={() => setShowAIChat(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="prose prose-invert max-w-none whitespace-pre-wrap">
              {aiSuggestion}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
