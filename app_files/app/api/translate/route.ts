import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type Message = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = await req.json() as { messages: Message[], language: string }

    if (!messages.length) return NextResponse.json({ messages: [] })

    const formatted = messages
      .map((m, i) => `[${i}|${m.role}] ${m.content}`)
      .join('\n---\n')

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: `You are a translator. Translate the provided conversation messages into ${language}. 
Return ONLY a JSON array of objects with "role" and "content" fields, preserving the exact same order and roles.
Preserve all philosophical terms, author names, book titles, and section headings in ${language}.
Do not add any explanation or preamble — return only the JSON array.`,
      messages: [{
        role: 'user',
        content: `Translate these conversation messages to ${language}:\n\n${formatted}`
      }]
    })

    const raw = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')

    const clean = raw.replace(/```json|```/g, '').trim()
    const translated = JSON.parse(clean)

    return NextResponse.json({ messages: translated })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
