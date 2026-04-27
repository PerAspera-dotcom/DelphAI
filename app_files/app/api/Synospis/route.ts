import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, LevelFormat, BorderStyle
} from 'docx'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type Message = { role: 'user' | 'assistant'; content: string }

type Synopsis = {
  topic: string
  summary: string
  position: string
  evolution: string
  supporting_frameworks: { framework: string; author: string; point: string }[]
  challenging_frameworks: { framework: string; author: string; point: string }[]
  key_tensions: string[]
  unresolved: string
  reading_recommendations: { title: string; author: string; year: string; relevance: string }[]
  sources_cited: { author: string; work: string; year: string }[]
}

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = await req.json() as { messages: Message[], language: string }

    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'Correspondent' : 'DelphAI'}: ${m.content}`)
      .join('\n\n')

    const summaryResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You generate structured synopses of philosophical conversations. Return ONLY valid JSON with no markdown, no backticks, no extra text. The JSON must exactly match the schema provided.`,
      messages: [{
        role: 'user',
        content: `Analyse this philosophical conversation and return a JSON object with this exact structure:
{
  "topic": "The main philosophical topic in 5 words or fewer",
  "summary": "2-3 sentence overview of the conversation arc",
  "position": "The correspondent's main position as it emerged through the dialogue",
  "evolution": "How their thinking shifted, refined, or deepened during the conversation. If unchanged, say so.",
  "supporting_frameworks": [
    { "framework": "Framework or thinker name", "author": "Author name", "point": "Key insight that supported the position" }
  ],
  "challenging_frameworks": [
    { "framework": "Framework or thinker name", "author": "Author name", "point": "Key challenge raised against the position" }
  ],
  "key_tensions": ["Tension 1 in one sentence", "Tension 2 in one sentence"],
  "unresolved": "The main unresolved question or tension remaining at the end",
  "reading_recommendations": [
    { "title": "Book Title", "author": "Author Name", "year": "Year", "relevance": "One sentence on relevance" }
  ],
  "sources_cited": [
    { "author": "Author Name", "work": "Work Title", "year": "Year" }
  ]
}

Include 3 supporting frameworks, 3 challenging frameworks, 2-3 key tensions, and 3 reading recommendations. Extract all sources cited in the conversation for sources_cited. Respond in ${language}.

CONVERSATION:
${conversationText}`
      }]
    })

    const rawJson = summaryResponse.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')

    let synopsis: Synopsis
    try {
      synopsis = JSON.parse(rawJson)
    } catch {
      return NextResponse.json({ error: 'Failed to parse synopsis' }, { status: 500 })
    }

    const date = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })

    const divider = new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '4a6741', space: 1 } },
      spacing: { after: 200 }
    })

    const sectionHeading = (text: string) => new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text, color: '4a6741', bold: true, size: 26, font: 'Georgia' })],
      spacing: { before: 320, after: 120 }
    })

    const bodyText = (text: string) => new Paragraph({
      children: [new TextRun({ text, size: 22, font: 'Georgia' })],
      spacing: { after: 160 },
      alignment: AlignmentType.JUSTIFIED
    })

    const bulletItem = (text: string) => new Paragraph({
      numbering: { reference: 'bullets', level: 0 },
      children: [new TextRun({ text, size: 22, font: 'Georgia' })],
      spacing: { after: 100 }
    })

    const frameworkItem = (f: { framework: string; author: string; point: string }) =>
      new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: `${f.framework}`, bold: true, size: 22, font: 'Georgia' }),
          new TextRun({ text: ` (${f.author}) — `, italics: true, size: 22, font: 'Georgia' }),
          new TextRun({ text: f.point, size: 22, font: 'Georgia' }),
        ],
        spacing: { after: 120 }
      })

    const sourceItem = (s: { author: string; work: string; year: string }) =>
      new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: `${s.author}`, bold: true, size: 22, font: 'Georgia' }),
          new TextRun({ text: `, ${s.work}`, italics: true, size: 22, font: 'Georgia' }),
          new TextRun({ text: ` (${s.year})`, size: 22, font: 'Georgia' }),
        ],
        spacing: { after: 100 }
      })

    const recItem = (r: { title: string; author: string; year: string; relevance: string }) =>
      new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text: `${r.title}`, italics: true, size: 22, font: 'Georgia' }),
          new TextRun({ text: ` — ${r.author} (${r.year}): `, bold: true, size: 22, font: 'Georgia' }),
          new TextRun({ text: r.relevance, size: 22, font: 'Georgia' }),
        ],
        spacing: { after: 120 }
      })

    const doc = new Document({
      numbering: {
        config: [{
          reference: 'bullets',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }]
        }]
      },
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'DelphAI', bold: true, size: 14, color: '4a6741', font: 'Georgia' })],
            spacing: { after: 80 }
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: `Conversation Synopsis: ${synopsis.topic}`, bold: true, size: 40, font: 'Georgia', color: '2c2c2a' })],
            spacing: { before: 0, after: 160 }
          }),
          new Paragraph({
            children: [new TextRun({ text: date, size: 20, color: '888780', font: 'Georgia', italics: true })],
            spacing: { after: 320 }
          }),
          divider,

          sectionHeading('Overview'),
          bodyText(synopsis.summary),
          bodyText(`Correspondent's position: ${synopsis.position}`),
          bodyText(`Evolution of thinking: ${synopsis.evolution}`),

          sectionHeading('Frameworks in support'),
          ...synopsis.supporting_frameworks.map(frameworkItem),

          sectionHeading('Frameworks in challenge'),
          ...synopsis.challenging_frameworks.map(frameworkItem),

          sectionHeading('Key tensions'),
          ...synopsis.key_tensions.map(t => bulletItem(t)),

          sectionHeading('Unresolved'),
          bodyText(synopsis.unresolved),

          divider,
          sectionHeading('Reading recommendations'),
          ...synopsis.reading_recommendations.map(recItem),

          sectionHeading('Sources cited'),
          ...(synopsis.sources_cited.length > 0
            ? synopsis.sources_cited.map(sourceItem)
            : [bodyText('No specific sources cited in this conversation.')]),
        ]
      }]
    })

    const buffer = await Packer.toBuffer(doc)
    const uint8 = new Uint8Array(buffer)

    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="DelphAI_Synopsis_${synopsis.topic.replace(/\s+/g, '_')}.docx"`,
      }
    })
  } catch (error) {
    console.error('Synopsis error:', error)
    return NextResponse.json({ error: 'Something went wrong generating the synopsis.' }, { status: 500 })
  }
}
