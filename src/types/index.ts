export type NodeType = 'title' | 'planning' | 'feature' | 'idea' | 'technical' | 'api' | 'database'

export interface FlowNode {
  id: string
  type: NodeType
  content: string
  x: number
  y: number
}

export interface Project {
  id: string
  title: string
  summary: string
  platform: 'mobile' | 'web' | 'hybrid'
  nodes: FlowNode[]
  createdAt: string
}

export const NODE_TYPES = {
  title: { label: 'Tajuk', color: '#f59e0b', icon: '🚀' },
  planning: { label: 'Planning', color: '#3b82f6', icon: '📋' },
  feature: { label: 'Feature', color: '#10b981', icon: '✨' },
  idea: { label: 'Idea', color: '#ec4899', icon: '💡' },
  technical: { label: 'Technical', color: '#ef4444', icon: '⚙️' },
  api: { label: 'API', color: '#8b5cf6', icon: '🔌' },
  database: { label: 'Database', color: '#06b6d4', icon: '🗄️' },
}