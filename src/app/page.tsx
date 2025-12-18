'use client'

import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { FlowNode as FlowNodeType, NodeType } from '../types/index'
import FlowNode from '../components/FlowNode'
import NodePalette from '../components/NodePalette'
import ExportButton from '../components/ExportButton'
import TemplateSelector from '../components/TemplateSelector'
import AIChatSidebar from '../components/AIChatSidebar'
import { ProjectTemplate } from '../lib/templates'

export default function Home() {
  const [projectTitle, setProjectTitle] = useState('')
  const [projectSummary, setProjectSummary] = useState('')
  const [nodes, setNodes] = useState<FlowNodeType[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [hasSavedProject, setHasSavedProject] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)

  // Check for saved project on load
  useEffect(() => {
    const saved = localStorage.getItem('blueprintos-project')
    if (saved) {
      setHasSavedProject(true)
    }
  }, [])

  const addNode = (type: NodeType) => {
    const newNode: FlowNodeType = {
      id: nanoid(),
      type,
      content: '',
      x: 100 + (nodes.length % 3) * 320,
      y: 100 + Math.floor(nodes.length / 3) * 200,
    }
    setNodes([...nodes, newNode])
  }

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id))
    if (selectedNode === id) setSelectedNode(null)
  }

  const updateNode = (id: string, content: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, content } : n))
  }

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setProjectTitle(template.defaultTitle)
    setProjectSummary(template.defaultSummary)

    const newNodes: FlowNodeType[] = template.nodes.map((node, idx) => ({
      id: nanoid(),
      type: node.type,
      content: node.content,
      x: 100 + (idx % 3) * 320,
      y: 100 + Math.floor(idx / 3) * 200,
    }))
    setNodes(newNodes)
  }

  const handleSave = () => {
    const projectData = {
      title: projectTitle,
      summary: projectSummary,
      nodes: nodes,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('blueprintos-project', JSON.stringify(projectData))
    setShowSaveSuccess(true)
    setHasSavedProject(true)
    setTimeout(() => setShowSaveSuccess(false), 2000)
  }

  const handleLoad = () => {
    const saved = localStorage.getItem('blueprintos-project')
    if (saved) {
      const projectData = JSON.parse(saved)
      setProjectTitle(projectData.title || '')
      setProjectSummary(projectData.summary || '')
      setNodes(projectData.nodes || [])
    }
  }

  const handleNewProject = () => {
    if (nodes.length > 0) {
      if (confirm('Projek semasa akan dipadam. Teruskan?')) {
        setProjectTitle('')
        setProjectSummary('')
        setNodes([])
        setShowTemplates(true)
      }
    } else {
      setShowTemplates(true)
    }
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-200 to-orange-300 bg-clip-text text-transparent">
                AI FlowChart Builder
              </h1>
              <p className="text-xs text-slate-500">Powered by Claude • Codex • DeepSeek</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* New Project */}
            <button
              onClick={handleNewProject}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-slate-700 hover:bg-slate-600 text-white transition-all hover:scale-105"
            >
              <span>✨</span>
              <span className="hidden sm:inline">Projek Baru</span>
            </button>

            {/* Template Button */}
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white shadow-lg shadow-violet-500/30 transition-all hover:scale-105"
            >
              <span>🎨</span>
              <span className="hidden sm:inline">Template</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 ${showSaveSuccess
                ? 'bg-green-500 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
            >
              <span>{showSaveSuccess ? '✅' : '💾'}</span>
              <span className="hidden sm:inline">{showSaveSuccess ? 'Tersimpan!' : 'Simpan'}</span>
            </button>

            {/* Load Button */}
            {hasSavedProject && (
              <button
                onClick={handleLoad}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-slate-700 hover:bg-slate-600 text-white transition-all hover:scale-105"
              >
                <span>📂</span>
                <span className="hidden sm:inline">Muat</span>
              </button>
            )}

            {/* Export Button */}
            <ExportButton
              title={projectTitle}
              summary={projectSummary}
              nodes={nodes}
            />

            {/* AI Chat Button */}
            <button
              onClick={() => setShowAIChat(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white shadow-lg shadow-pink-500/30 transition-all hover:scale-105 animate-pulse"
            >
              <span>🤖</span>
              <span className="hidden sm:inline">AI Chat</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-72 bg-slate-900/50 backdrop-blur border-r border-slate-700 p-4 overflow-y-auto">
          {/* Project Info */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📋</span> Maklumat Projek
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="🎯 Tajuk projek..."
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <textarea
                value={projectSummary}
                onChange={(e) => setProjectSummary(e.target.value)}
                placeholder="📝 Ringkasan projek..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none transition-all"
              />
            </div>
          </div>

          {/* Node Stats */}
          {nodes.length > 0 && (
            <div className="mb-6 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Jumlah Nodes:</span>
                <span className="font-bold text-amber-400">{nodes.length}</span>
              </div>
            </div>
          )}

          <NodePalette onAddNode={addNode} />

          {/* Tips for Kids */}
          <div className="mt-6 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div>
                <h4 className="font-bold text-amber-300 text-sm">Tips</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Klik pada butang di atas untuk tambah idea baru!
                  Bila siap, tekan "Export untuk AI" 🚀
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 p-6 overflow-auto">
          {nodes.length === 0 ? (
            /* Welcome Screen */
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="text-8xl mb-6 animate-bounce">🚀</div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Selamat Datang!
                </h2>
                <p className="text-slate-400 mb-8">
                  Mari rancang projek hebat anda. Pilih template untuk mula dengan cepat,
                  atau tambah node satu persatu dari panel kiri.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
                  >
                    <span>🎨</span> Pilih Template
                  </button>
                  <button
                    onClick={() => addNode('title')}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-slate-700 hover:bg-slate-600 text-white transition-all hover:scale-105"
                  >
                    <span>➕</span> Mula Kosong
                  </button>
                </div>

                {hasSavedProject && (
                  <button
                    onClick={handleLoad}
                    className="mt-6 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 mx-auto"
                  >
                    <span>📂</span> Muat Projek Tersimpan
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Nodes Grid */
            <div className="flex flex-wrap gap-4">
              {nodes.map(node => (
                <FlowNode
                  key={node.id}
                  node={node}
                  isSelected={selectedNode === node.id}
                  onSelect={setSelectedNode}
                  onDelete={deleteNode}
                  onUpdate={updateNode}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* AI Chat Sidebar */}
      <AIChatSidebar
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        projectTitle={projectTitle}
        projectSummary={projectSummary}
        nodes={nodes}
      />
    </div>
  )
}
