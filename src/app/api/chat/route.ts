import { NextRequest, NextResponse } from 'next/server'

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 20 // requests per minute
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
        return true
    }

    if (record.count >= RATE_LIMIT) {
        return false
    }

    record.count++
    return true
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'anonymous'
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Terlalu banyak permintaan. Cuba lagi selepas seminit.' },
                { status: 429 }
            )
        }

        const { messages, model, context } = await request.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages diperlukan' },
                { status: 400 }
            )
        }

        // Build system message with context
        const systemMessage = context || 'Anda adalah AI assistant yang membantu merancang projek digital.'

        let response: Response
        let assistantMessage: string

        switch (model) {
            case 'claude':
                response = await callClaude(systemMessage, messages)
                assistantMessage = await parseClaude(response)
                break

            case 'codex':
                response = await callOpenAI(systemMessage, messages)
                assistantMessage = await parseOpenAI(response)
                break

            case 'deepseek':
                response = await callDeepSeek(systemMessage, messages)
                assistantMessage = await parseDeepSeek(response)
                break

            default:
                // Default to Claude
                response = await callClaude(systemMessage, messages)
                assistantMessage = await parseClaude(response)
        }

        return NextResponse.json({
            message: assistantMessage,
            model: model || 'claude'
        })

    } catch (error) {
        console.error('AI Chat Error:', error)
        return NextResponse.json(
            { error: 'Gagal mendapatkan respons AI. Sila cuba lagi.' },
            { status: 500 }
        )
    }
}

// Claude API
async function callClaude(systemPrompt: string, messages: Array<{ role: string; content: string }>) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

    return fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-opus-4-20250514',
            max_tokens: 2048,
            system: systemPrompt,
            messages: messages.map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content
            }))
        })
    })
}

async function parseClaude(response: Response): Promise<string> {
    const responseText = await response.text()
    console.log('Claude API Response Status:', response.status)
    console.log('Claude API Response:', responseText)

    if (!response.ok) {
        throw new Error(`Claude API error (${response.status}): ${responseText}`)
    }

    const data = JSON.parse(responseText)
    return data.content[0].text
}

// OpenAI API (Codex)
async function callOpenAI(systemPrompt: string, messages: Array<{ role: string; content: string }>) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

    return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            max_tokens: 2048
        })
    })
}

async function parseOpenAI(response: Response): Promise<string> {
    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI API error: ${error}`)
    }
    const data = await response.json()
    return data.choices[0].message.content
}

// DeepSeek API
async function callDeepSeek(systemPrompt: string, messages: Array<{ role: string; content: string }>) {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured')

    return fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            max_tokens: 2048
        })
    })
}

async function parseDeepSeek(response: Response): Promise<string> {
    if (!response.ok) {
        const error = await response.text()
        throw new Error(`DeepSeek API error: ${error}`)
    }
    const data = await response.json()
    return data.choices[0].message.content
}
