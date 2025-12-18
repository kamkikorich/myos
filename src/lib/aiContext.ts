import { FlowNode, NODE_TYPES } from '../types/index'

// Generate context for AI to understand the project
export function generateAIContext(
    title: string,
    summary: string,
    nodes: FlowNode[]
): string {
    const nodeDescriptions = nodes.map(node => {
        const nodeType = NODE_TYPES[node.type]
        return `- ${nodeType.icon} ${nodeType.label}: ${node.content || '(kosong)'}`
    }).join('\n')

    return `
Anda adalah AI Planning Assistant untuk BlueprintOS.
Anda membantu pengguna merancang projek digital dengan cara yang mesra dan profesional.

## Projek Semasa
**Tajuk:** ${title || 'Belum dinamakan'}
**Ringkasan:** ${summary || 'Tiada ringkasan'}

## Nodes dalam Projek (${nodes.length} nodes)
${nodeDescriptions || 'Tiada nodes lagi'}

## Tugas Anda
1. Fahami projek pengguna dengan teliti
2. Beri cadangan penambahbaikan yang praktikal
3. Cadangkan features yang mungkin terlepas
4. Berikan langkah seterusnya yang jelas
5. Jawab dalam bahasa yang sama dengan pengguna

## Gaya Komunikasi
- Mesra seperti rakan sepasukan
- Ringkas tetapi bermaklumat
- Gunakan emoji untuk kejelasan
- Berikan contoh konkrit bila perlu
`
}

// System prompts for different AI actions
export const AI_QUICK_ACTIONS = [
    {
        id: 'analyze',
        label: 'Analisis Projek',
        icon: '🔍',
        prompt: 'Analisis projek saya dan berikan penilaian keseluruhan. Adakah ia feasible? Apa kekuatan dan kelemahannya?'
    },
    {
        id: 'suggest',
        label: 'Cadang Features',
        icon: '💡',
        prompt: 'Berdasarkan projek saya, cadangkan 5 features tambahan yang boleh menjadikannya lebih baik.'
    },
    {
        id: 'missing',
        label: 'Apa Kurang?',
        icon: '❓',
        prompt: 'Apa yang mungkin saya terlepas dalam perancangan projek ini? Adakah sesuatu yang kritikal tidak dimasukkan?'
    },
    {
        id: 'next-steps',
        label: 'Langkah Seterusnya',
        icon: '🚀',
        prompt: 'Berikan saya langkah seterusnya untuk memulakan pembangunan projek ini. Senaraikan dalam urutan prioriti.'
    },
    {
        id: 'tech-stack',
        label: 'Tech Stack',
        icon: '⚙️',
        prompt: 'Cadangkan tech stack terbaik untuk projek saya ini. Jelaskan mengapa setiap pilihan sesuai.'
    },
    {
        id: 'timeline',
        label: 'Anggaran Masa',
        icon: '⏱️',
        prompt: 'Berikan anggaran masa yang realistik untuk menyiapkan projek ini. Pecahkan mengikut fasa.'
    }
]

// Model configurations
export const AI_MODELS = [
    {
        id: 'claude',
        name: 'Claude',
        icon: '🟣',
        color: '#8b5cf6',
        description: 'Kreatif & Terperinci'
    },
    {
        id: 'codex',
        name: 'Codex',
        icon: '🟢',
        color: '#10b981',
        description: 'Fokus Kod'
    },
    {
        id: 'deepseek',
        name: 'DeepSeek',
        icon: '🔵',
        color: '#3b82f6',
        description: 'Pantas & Efisien'
    }
]
