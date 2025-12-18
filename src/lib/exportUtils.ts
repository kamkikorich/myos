import { FlowNode, Project, NODE_TYPES } from '../types/index'

export interface ExportData {
  version: string
  exportedAt: string
  project: {
    title: string
    summary: string
    platform: string
    nodeCount: number
  }
  nodes: Array<{
    id: string
    type: string
    label: string
    icon: string
    content: string
  }>
}

// Generate structured JSON data
export function generateExportJSON(
  title: string,
  summary: string,
  nodes: FlowNode[]
): ExportData {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    project: {
      title: title || 'Projek Tanpa Tajuk',
      summary: summary || 'Tiada ringkasan',
      platform: 'web',
      nodeCount: nodes.length
    },
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type,
      label: NODE_TYPES[node.type].label,
      icon: NODE_TYPES[node.type].icon,
      content: node.content
    }))
  }
}

// Generate beautiful Markdown report for AI
export function generateBlueprintMarkdown(
  title: string,
  summary: string,
  nodes: FlowNode[]
): string {
  const data = generateExportJSON(title, summary, nodes)
  const now = new Date()
  const dateStr = now.toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Group nodes by type
  const nodesByType: Record<string, typeof data.nodes> = {}
  data.nodes.forEach(node => {
    if (!nodesByType[node.type]) nodesByType[node.type] = []
    nodesByType[node.type].push(node)
  })

  let markdown = `# 🎯 ${data.project.title}

> **Blueprint Projek** - Dijana oleh AI FlowChart Builder
> 📅 ${dateStr}

---

## 📋 Ringkasan Eksekutif

${data.project.summary}

**Statistik Projek:**
- 📊 Jumlah Nodes: ${data.project.nodeCount}
- 🌐 Platform: ${data.project.platform}

---

## 🏗️ Struktur Projek

`

  // Add visual node list
  if (data.nodes.length > 0) {
    markdown += `### Semua Komponen\n\n`
    
    Object.entries(nodesByType).forEach(([type, typeNodes]) => {
      const nodeInfo = NODE_TYPES[type as keyof typeof NODE_TYPES]
      markdown += `#### ${nodeInfo.icon} ${nodeInfo.label}\n\n`
      
      typeNodes.forEach((node, idx) => {
        markdown += `**${idx + 1}. ${node.content || '(Belum diisi)'}**\n\n`
      })
    })
  } else {
    markdown += `> ⚠️ Tiada nodes dalam projek ini.\n\n`
  }

  markdown += `---

## 💡 Perincian Setiap Node

`

  // Detailed node information
  data.nodes.forEach((node, idx) => {
    markdown += `### ${idx + 1}. ${node.icon} ${node.label}

\`\`\`
${node.content || '(Tiada kandungan)'}
\`\`\`

`
  })

  // Add JSON data for AI processing
  markdown += `---

## 📦 Blueprint Data (JSON)

Data struktur untuk pemprosesan AI:

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

---

## 🤖 Arahan untuk AI

Ini adalah blueprint projek yang dijana oleh AI FlowChart Builder. 
Sila analisis struktur projek dan berikan:

1. **Analisis Kelayakan** - Adakah projek ini boleh dilaksanakan?
2. **Cadangan Penambahbaikan** - Apa yang boleh ditambah?
3. **Langkah Seterusnya** - Apakah langkah pembangunan?
4. **Anggaran Masa** - Berapa lama untuk siapkan?
5. **Teknologi Cadangan** - Stack teknologi yang sesuai

---

*Dijana oleh BlueprintOS v1.0 • AI FlowChart Builder*
`

  return markdown
}

// Download file function
export function downloadBlueprint(
  title: string,
  summary: string,
  nodes: FlowNode[]
): void {
  const markdown = generateBlueprintMarkdown(title, summary, nodes)
  const filename = `${title || 'blueprint'}-${Date.now()}.blueprint.md`
  
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Copy to clipboard function
export async function copyBlueprintToClipboard(
  title: string,
  summary: string,
  nodes: FlowNode[]
): Promise<boolean> {
  const markdown = generateBlueprintMarkdown(title, summary, nodes)
  
  try {
    await navigator.clipboard.writeText(markdown)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}
