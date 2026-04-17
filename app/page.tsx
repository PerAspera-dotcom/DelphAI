'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './page.module.css'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const FIXED_SUGGESTION = 'What is wrong with this world?'

const SUGGESTION_POOL = [
  'What is time?',
  'What is meaning?',
  'What is value?',
  'Why does something feel right or wrong?',
  'What is justice?',
  'What is the self?',
  'Is free will real?',
  'What is consciousness?',
  'Why do we fear death?',
  'What do we owe each other?',
  'Can we ever truly know anything?',
  'What makes a life well-lived?',
  'Why is there something rather than nothing?',
  'What is beauty?',
  'Is happiness the point of life?',
  'What is truth?',
  'Why do good people do bad things?',
  'What is power?',
  'Can violence ever be justified?',
  'What is love?',
  'Why do humans need meaning?',
  'Is morality invented or discovered?',
]

const WELCOME_POOL = [
  'A friendly voice in the forest of the mind.',
  'Where the abyss also talks back.',
  'Where does your mind take us today?',
  'Putting the AI back in Aesop.',
  'Can you ask Alexander to get out of our sun?',
  'The first step out of the basement or the first step back into it.',
]

function getRandomSuggestions(count: number): string[] {
  const shuffled = [...SUGGESTION_POOL].sort(() => Math.random() - 0.5)
  return [FIXED_SUGGESTION, ...shuffled.slice(0, count)]
}

function getRandomWelcome(): string {
  return WELCOME_POOL[Math.floor(Math.random() * WELCOME_POOL.length)]
}

// Parse structured response into sections
type Section = { heading: string; content: string } | { question: string }

function parseResponse(text: string): Section[] {
  const HEADINGS = [
    'Position',
    'Frameworks in agreement',
    'Frameworks in challenge',
    'Challenges to your reasoning',
    'The question',
  ]

  const sections: Section[] = []
  let remaining = text

  for (let i = 0; i < HEADINGS.length; i++) {
    const heading = HEADINGS[i]
    const nextHeading = HEADINGS[i + 1]
    const pattern = new RegExp(`\\*{1,2}${heading}\\*{1,2}`, 'i')
    const match = remaining.match(pattern)
    if (!match || match.index === undefined) continue

    const start = match.index + match[0].length
    let end = remaining.length

    if (nextHeading) {
      const nextPattern = new RegExp(`\\*{1,2}${nextHeading}\\*{1,2}`, 'i')
      const nextMatch = remaining.match(nextPattern)
      if (nextMatch && nextMatch.index !== undefined) {
        end = nextMatch.index
      }
    }

    const content = remaining.slice(start, end).trim()

    if (heading === 'The question') {
      sections.push({ question: content })
    } else {
      sections.push({ heading, content })
    }
  }

  // If no structure found, return raw
  if (sections.length === 0) {
    sections.push({ heading: '', content: text })
  }

  return sections
}

function formatText(text: string) {
  return text.split(/(\*[^*\n]+\*)/g).map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className={styles.concept}>{part.slice(1, -1)}</em>
    }
    return part.split('\n\n').map((line, j) => (
      <span key={`${i}-${j}`}>
        {j > 0 && <><br /><br /></>}
        {line}
      </span>
    ))
  })
}

function StructuredMessage({ content }: { content: string }) {
  const sections = parseResponse(content)
  return (
    <div className={styles.structured}>
      {sections.map((section, i) => {
        if ('question' in section) {
          return (
            <div key={i} className={styles.questionBlock}>
              <div className={styles.questionLabel}>The question</div>
              <div className={styles.questionText}>{formatText(section.question)}</div>
            </div>
          )
        }
        return (
          <div key={i} className={styles.section}>
            {section.heading && (
              <div className={styles.sectionHeading}>{section.heading}</div>
            )}
            <div className={styles.sectionContent}>{formatText(section.content)}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function Home() {
  const [ageVerified, setAgeVerified] = useState<boolean | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions] = useState(() => getRandomSuggestions(4))
  const [welcomeText] = useState(() => getRandomWelcome())
  const [suggestionsVisible, setSuggestionsVisible] = useState(true)
  const [language, setLanguage] = useState('English')
  const chatRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, loading])

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function fill(text: string) {
    setInput(text)
    textareaRef.current?.focus()
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setSuggestionsVisible(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, language }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setMessages([...newMessages, { role: 'assistant', content: data.text }])
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  if (ageVerified === null) {
    return (
      <div className={styles.ageGate}>
        <DelphAILogo size={52} />
        <blockquote className={styles.ageQuote}>
          "Few things are as dangerous as too grand an idea in too small a mind."
        </blockquote>
        <p className={styles.ageCommitment}>DelphAI is designed as a thinking companion, it can help you in gaining a deeper understanding of yourself and the world around you but it can make mistakes while doing so. Be mindful of its limitations.</p>
<p className={styles.ageQuestion}>Do you agree to engage with this tool in a critical way?</p>
        <div className={styles.ageBtns}>
          <button className={styles.ageYes} onClick={() => setAgeVerified(true)}>I agree</button>
          <button className={styles.ageNo} onClick={() => setAgeVerified(false)}>I don't agree</button>
        </div>
      </div>
    )
  }

  if (ageVerified === false) {
    return (
      <div className={styles.ageGate}>
        <DelphAILogo size={52} />
        <blockquote className={styles.ageQuote}>
          "Few things are as dangerous as too grand an idea in too small a mind."
        </blockquote>
        <p className={styles.ageUnder}>DelphAI is built for those who engage seriously. Come back when you&apos;re ready.</p>
      </div>
    )
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <DelphAILogo size={32} />
        <div className={styles.logoText}>Delph<span>AI</span></div>
        <select
          className={styles.langSelect}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="English">EN</option>
          <option value="Dutch">NL</option>
          <option value="French">FR</option>
          <option value="German">DE</option>
        </select>
      </header>

      <div className={styles.chat} ref={chatRef}>
        <div className={styles.welcomeBlock}>
          <div className={styles.welcomeText}>
            <span className={styles.welcomeLine}>Welcome to DelphAI,</span>
            <span className={styles.welcomeQ}>{welcomeText}</span>
          </div>
          {suggestionsVisible && (
            <div className={styles.suggestionsBlock}>
              <div className={styles.suggestionsLabel}>Suggestions to get you started</div>
              <div className={styles.suggestions}>
                {suggestions.map((s) => (
                  <button key={s} className={styles.sugBtn} onClick={() => fill(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} className={`${styles.msg} ${styles.user}`}>
                <span className={styles.meta}>You</span>
                <div className={`${styles.bubble} ${styles.userBubble}`}>{msg.content}</div>
              </div>
            )
          }
          return (
            <div key={i} className={`${styles.msg} ${styles.ai}`}>
              <span className={styles.meta}>DelphAI</span>
              <div className={`${styles.bubble} ${styles.aiBubble}`}>
                <StructuredMessage content={msg.content} />
              </div>
            </div>
          )
        })}

        {loading && (
          <div className={`${styles.msg} ${styles.ai}`}>
            <span className={styles.meta}>DelphAI</span>
            <div className={`${styles.bubble} ${styles.aiBubble} ${styles.thinking}`}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </div>
        )}
      </div>

      <div className={styles.bottom}>
        <div className={styles.row}>
          <textarea
            ref={textareaRef}
            className={styles.input}
            placeholder="Ask anything..."
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            rows={1}
          />
          <button className={styles.send} onClick={send} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

function DelphAILogo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" stroke="#4a6741" strokeWidth="1.5"/>
      <path d="M24 6 L24 42" stroke="#4a6741" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.4"/>
      <path d="M6 24 L42 24" stroke="#4a6741" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.4"/>
      <path d="M14 10 Q24 20 34 10" fill="none" stroke="#4a6741" strokeWidth="1.2"/>
      <path d="M14 38 Q24 28 34 38" fill="none" stroke="#4a6741" strokeWidth="1.2"/>
      <circle cx="24" cy="24" r="4" fill="none" stroke="#4a6741" strokeWidth="1.5"/>
      <circle cx="24" cy="24" r="1.5" fill="#4a6741"/>
    </svg>
  )
}
