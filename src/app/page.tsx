'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface FlowNode {
  id: string
  type: 'process' | 'decision' | 'terminal' | 'data' | 'document'
  label: string
  x: number
  y: number
  color: string
}

interface FlowEdge {
  id: string
  from: string
  to: string
  fromSide: 'bottom' | 'right' | 'left'
  toSide: 'top' | 'left' | 'right'
}

const COLORS = {
  yellow: '#FFD93D',
  blue: '#6C9BCF',
  purple: '#B19CD9',
  pink: '#FFB6C1',
  green: '#90EE90',
  orange: '#FFB347',
}

const SHAPES = [
  { type: 'terminal', label: 'Terminal', icon: '⬭', desc: 'Start/End' },
  { type: 'process', label: 'Process', icon: '▭', desc: 'Action' },
  { type: 'decision', label: 'Decision', icon: '◇', desc: 'Yes/No' },
  { type: 'data', label: 'Data', icon: '▱', desc: 'Input' },
  { type: 'document', label: 'Document', icon: '📄', desc: 'Doc' },
]

export default function Home() {
  const [nodes, setNodes] = useState<FlowNode[]>([])
  const [edges, setEdges] = useState<FlowEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState('#6C9BCF')
  const [connectMode, setConnectMode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Grid snap
  const snap = (value: number) => Math.round(value / 20) * 20

  // Add node
  const addNode = (type: string) => {
    const newNode: FlowNode = {
      id: `n${Date.now()}`,
      type: type as FlowNode['type'],
      label: SHAPES.find(s => s.type === type)?.label || 'Node',
      x: 400 + Math.random() * 100,
      y: 200 + nodes.length * 100,
      color: selectedColor,
    }
    setNodes([...nodes, newNode])
  }

  // Drag handlers
  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    setDraggedNode(nodeId)
    setDragOffset({ x: e.clientX - node.x, y: e.clientY - node.y })
    setSelectedNode(nodeId)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedNode) return
    const x = snap(e.clientX - dragOffset.x)
    const y = snap(e.clientY - dragOffset.y)
    setNodes(prev => prev.map(n => n.id === draggedNode ? { ...n, x, y } : n))
  }, [draggedNode, dragOffset])

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Connect nodes
  const handleConnect = (nodeId: string) => {
    if (!connectMode) {
      setConnectMode(nodeId)
    } else if (connectMode !== nodeId) {
      setEdges([...edges, {
        id: `e${Date.now()}`,
        from: connectMode,
        to: nodeId,
        fromSide: 'bottom',
        toSide: 'top'
      }])
      setConnectMode(null)
    }
  }

  // Delete
  const deleteSelected = () => {
    if (!selectedNode) return
    setNodes(nodes.filter(n => n.id !== selectedNode))
    setEdges(edges.filter(e => e.from !== selectedNode && e.to !== selectedNode))
    setSelectedNode(null)
  }

  // Update label
  const updateLabel = (id: string, label: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, label } : n))
  }

  // Generate with AI
  const generateFlowchart = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Create flowchart JSON for: "${prompt}". Return ONLY JSON: {"nodes":[{"id":"1","type":"terminal","label":"Start","x":400,"y":100,"color":"#90EE90"}],"edges":[{"id":"e1","from":"1","to":"2","fromSide":"bottom","toSide":"top"}]}. Types: terminal, process, decision, data, document. Colors: #FFD93D, #6C9BCF, #B19CD9, #FFB6C1, #90EE90. Space y by 120.` }],
          model: 'claude', context: ''
        })
      })
      const data = await res.json()
      const match = (data.message || '').match(/\{[\s\S]*\}/)
      if (match) {
        const flow = JSON.parse(match[0])
        setNodes(flow.nodes || [])
        setEdges(flow.edges || [])
      }
    } catch (e) { console.error(e) }
    setIsGenerating(false)
  }

  // Render edge path
  const getEdgePath = (edge: FlowEdge) => {
    const from = nodes.find(n => n.id === edge.from)
    const to = nodes.find(n => n.id === edge.to)
    if (!from || !to) return ''

    const fromX = from.x, fromY = from.y + 40
    const toX = to.x, toY = to.y - 20
    const midY = (fromY + toY) / 2

    return `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`
  }

  // Render node shape
  const renderShape = (node: FlowNode) => {
    const isSelected = selectedNode === node.id
    const isConnecting = connectMode === node.id

    return (
      <g
        key={node.id}
        transform={`translate(${node.x}, ${node.y})`}
        onMouseDown={(e) => handleMouseDown(node.id, e as unknown as React.MouseEvent)}
        onClick={() => handleConnect(node.id)}
        style={{ cursor: draggedNode ? 'grabbing' : 'grab' }}
      >
        {/* Shape */}
        {node.type === 'decision' ? (
          <polygon
            points="0,-40 60,0 0,40 -60,0"
            fill={node.color}
            stroke={isSelected ? '#FF6B6B' : isConnecting ? '#4ECDC4' : '#333'}
            strokeWidth={isSelected || isConnecting ? 3 : 2}
          />
        ) : node.type === 'terminal' ? (
          <rect
            x="-70" y="-25" width="140" height="50" rx="25"
            fill={node.color}
            stroke={isSelected ? '#FF6B6B' : isConnecting ? '#4ECDC4' : '#333'}
            strokeWidth={isSelected || isConnecting ? 3 : 2}
          />
        ) : node.type === 'data' ? (
          <polygon
            points="-60,-25 70,-25 50,25 -80,25"
            fill={node.color}
            stroke={isSelected ? '#FF6B6B' : isConnecting ? '#4ECDC4' : '#333'}
            strokeWidth={isSelected || isConnecting ? 3 : 2}
          />
        ) : node.type === 'document' ? (
          <path
            d="M-60,-25 L60,-25 L60,15 Q0,35 -60,15 Z"
            fill={node.color}
            stroke={isSelected ? '#FF6B6B' : isConnecting ? '#4ECDC4' : '#333'}
            strokeWidth={isSelected || isConnecting ? 3 : 2}
          />
        ) : (
          <rect
            x="-70" y="-25" width="140" height="50" rx="5"
            fill={node.color}
            stroke={isSelected ? '#FF6B6B' : isConnecting ? '#4ECDC4' : '#333'}
            strokeWidth={isSelected || isConnecting ? 3 : 2}
          />
        )}

        {/* Label */}
        <foreignObject x="-65" y="-20" width="130" height="40">
          <input
            value={node.label}
            onChange={(e) => updateLabel(node.id, e.target.value)}
            className="w-full h-full bg-transparent text-center font-bold text-sm focus:outline-none"
            style={{ color: '#333' }}
            onClick={(e) => e.stopPropagation()}
          />
        </foreignObject>

        {/* Connection points */}
        <circle cx="0" cy="40" r="6" fill={isConnecting ? '#4ECDC4' : '#666'} stroke="#fff" strokeWidth="2" />
        <circle cx="0" cy="-40" r="6" fill="#666" stroke="#fff" strokeWidth="2" style={{ display: node.type === 'decision' ? 'block' : 'none' }} />
      </g>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Toolbar */}
      <div className="w-20 bg-white border-r border-gray-200 p-2 flex flex-col gap-2">
        <div className="text-center text-xs text-gray-500 mb-2">Shapes</div>
        {SHAPES.map(shape => (
          <button
            key={shape.type}
            onClick={() => addNode(shape.type)}
            className="p-2 hover:bg-gray-100 rounded-lg flex flex-col items-center transition-all"
            title={shape.desc}
          >
            <span className="text-2xl">{shape.icon}</span>
            <span className="text-[10px] text-gray-500">{shape.label}</span>
          </button>
        ))}

        <div className="border-t border-gray-200 my-2 pt-2">
          <div className="text-center text-xs text-gray-500 mb-2">Colors</div>
          <div className="grid grid-cols-2 gap-1">
            {Object.values(COLORS).map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full mx-auto ${selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-lg">FlowChart Builder</span>
          </div>

          <div className="flex items-center gap-2">
            {selectedNode && (
              <button onClick={deleteSelected} className="px-3 py-1.5 bg-red-500 text-white rounded text-sm">
                🗑️ Delete
              </button>
            )}
            <button onClick={() => { setNodes([]); setEdges([]) }} className="px-3 py-1.5 bg-gray-200 rounded text-sm">
              Clear
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto" ref={canvasRef}>
          <svg
            width="2000"
            height="1200"
            className="bg-white"
            style={{ backgroundImage: 'linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            onClick={() => { setSelectedNode(null); setConnectMode(null) }}
          >
            {/* Edges */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
              </marker>
            </defs>
            {edges.map(edge => (
              <path
                key={edge.id}
                d={getEdgePath(edge)}
                fill="none"
                stroke="#333"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            ))}

            {/* Nodes */}
            {nodes.map(renderShape)}
          </svg>
        </div>
      </div>

      {/* Right Panel - AI */}
      <div className="w-72 bg-white border-l border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-purple-500">🤖</span>
          <span className="font-bold">AI Generate</span>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your flowchart..."
          className="w-full h-24 p-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-purple-500"
        />

        <button
          onClick={generateFlowchart}
          disabled={isGenerating}
          className="w-full mt-2 py-2 bg-purple-500 text-white rounded-lg font-bold text-sm hover:bg-purple-600 disabled:opacity-50"
        >
          {isGenerating ? '⏳ Generating...' : '✨ Generate flowchart'}
        </button>

        <div className="mt-6 text-xs text-gray-500">
          <p className="font-bold mb-2">Tips:</p>
          <ul className="space-y-1">
            <li>• Click shape to add</li>
            <li>• Drag to move</li>
            <li>• Click node → click another to connect</li>
            <li>• Select and delete</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
