'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './page.module.css'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const FIXED_SUGGESTION: Record<string, string> = {
  English: 'What is wrong with this world?',
  Dutch: 'Wat is er mis met deze wereld?',
  French: "Qu'est-ce qui ne va pas dans ce monde?",
  German: 'Was stimmt nicht mit dieser Welt?',
}

const SUGGESTION_POOL: Record<string, string[]> = {
  English: [
    'What is time?', 'What is meaning?', 'What is value?',
    'Why does something feel right or wrong?', 'What is justice?',
    'What is the self?', 'Is free will real?', 'What is consciousness?',
    'Why do we fear death?', 'What do we owe each other?',
    'Can we ever truly know anything?', 'What makes a life well-lived?',
    'Why is there something rather than nothing?', 'What is beauty?',
    'Is happiness the point of life?', 'What is truth?',
    'Why do good people do bad things?', 'What is power?',
    'Can violence ever be justified?', 'What is love?',
    'Why do humans need meaning?', 'Is morality invented or discovered?',
  ],
  Dutch: [
    'Wat is tijd?', 'Wat is betekenis?', 'Wat is waarde?',
    'Waarom voelt iets goed of fout?', 'Wat is rechtvaardigheid?',
    'Wat is het zelf?', 'Is vrije wil echt?', 'Wat is bewustzijn?',
    'Waarom zijn we bang voor de dood?', 'Wat zijn we elkaar verschuldigd?',
    'Kunnen we ooit iets echt weten?', 'Wat maakt een leven de moeite waard?',
    'Waarom bestaat er iets in plaats van niets?', 'Wat is schoonheid?',
    'Is geluk het doel van het leven?', 'Wat is waarheid?',
    'Waarom doen goede mensen slechte dingen?', 'Wat is macht?',
    'Kan geweld ooit gerechtvaardigd zijn?', 'Wat is liefde?',
    'Waarom hebben mensen betekenis nodig?', 'Is moraliteit uitgevonden of ontdekt?',
  ],
  French: [
    "Qu'est-ce que le temps?", "Qu'est-ce que le sens?", "Qu'est-ce que la valeur?",
    'Pourquoi quelque chose semble-t-il juste ou faux?', "Qu'est-ce que la justice?",
    "Qu'est-ce que le soi?", 'Le libre arbitre est-il réel?', "Qu'est-ce que la conscience?",
    'Pourquoi craignons-nous la mort?', 'Que nous devons-nous mutuellement?',
    'Peut-on jamais vraiment savoir quelque chose?', "Qu'est-ce qui rend une vie bien vécue?",
    "Pourquoi y a-t-il quelque chose plutôt que rien?", "Qu'est-ce que la beauté?",
    'Le bonheur est-il le but de la vie?', "Qu'est-ce que la vérité?",
    'Pourquoi les bonnes personnes font-elles de mauvaises choses?', "Qu'est-ce que le pouvoir?",
    'La violence peut-elle jamais être justifiée?', "Qu'est-ce que l'amour?",
    'Pourquoi les humains ont-ils besoin de sens?', 'La moralité est-elle inventée ou découverte?',
  ],
  German: [
    'Was ist Zeit?', 'Was ist Bedeutung?', 'Was ist Wert?',
    'Warum fühlt sich etwas richtig oder falsch an?', 'Was ist Gerechtigkeit?',
    'Was ist das Selbst?', 'Ist freier Wille real?', 'Was ist Bewusstsein?',
    'Warum fürchten wir den Tod?', 'Was schulden wir einander?',
    'Können wir jemals wirklich etwas wissen?', 'Was macht ein Leben lebenswert?',
    'Warum gibt es etwas statt nichts?', 'Was ist Schönheit?',
    'Ist Glück der Sinn des Lebens?', 'Was ist Wahrheit?',
    'Warum tun gute Menschen schlechte Dinge?', 'Was ist Macht?',
    'Kann Gewalt jemals gerechtfertigt sein?', 'Was ist Liebe?',
    'Warum brauchen Menschen Bedeutung?', 'Ist Moral erfunden oder entdeckt?',
  ],
}

const WELCOME_POOL: Record<string, string[]> = {
  English: [
    'A friendly voice in the forest of the mind.',
    'Where the abyss also talks back.',
    'Where does your mind take us today?',
    'Putting the AI back in Aesop.',
    'Can you ask Alexander to get out of our sun?',
    'The first step out of the basement or the first step back into it.',
  ],
  Dutch: [
    'Een vriendelijke stem in het woud van de geest.',
    'Waar de afgrond ook terugpraat.',
    'Waar neemt jouw geest ons vandaag naartoe?',
    'De eerste stap uit de kelder of de eerste stap terug erin.',
    'Denken is het begin van alles.',
    'Waar vragen groter worden dan antwoorden.',
  ],
  French: [
    "Une voix amicale dans la forêt de l'esprit.",
    "Où l'abîme répond aussi.",
    "Où votre esprit nous emmène-t-il aujourd'hui?",
    'Le premier pas hors du sous-sol ou le premier pas pour y retourner.',
    'Penser, c\'est le début de tout.',
    'Là où les questions deviennent plus grandes que les réponses.',
  ],
  German: [
    'Eine freundliche Stimme im Wald des Geistes.',
    'Wo der Abgrund auch zurückspricht.',
    'Wohin nimmt uns dein Geist heute?',
    'Der erste Schritt aus dem Keller oder der erste Schritt zurück.',
    'Denken ist der Anfang von allem.',
    'Wo Fragen größer werden als Antworten.',
  ],
}

function getRandomSuggestions(count: number, lang: string): string[] {
  const pool = SUGGESTION_POOL[lang] ?? SUGGESTION_POOL['English']
  const fixed = FIXED_SUGGESTION[lang] ?? FIXED_SUGGESTION['English']
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return [fixed, ...shuffled.slice(0, count)]
}

function getRandomWelcome(lang: string): string {
  const pool = WELCOME_POOL[lang] ?? WELCOME_POOL['English']
  return pool[Math.floor(Math.random() * pool.length)]
}

function formatText(text: string): React.ReactNode[] {
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

function AIMessage({ content }: { content: string }) {
  return (
    <div className={styles.aiText}>
      {formatText(content)}
    </div>
  )
}

export default function Home() {
  const [ageVerified, setAgeVerified] = useState<boolean | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('English')
  const [suggestions, setSuggestions] = useState(() => getRandomSuggestions(4, 'English'))
  const [welcomeText, setWelcomeText] = useState(() => getRandomWelcome('English'))
  const [suggestionsVisible, setSuggestionsVisible] = useState(true)
  const [downloading, setDownloading] = useState(false)

  async function downloadSynopsis() {
    if (messages.length < 2) return
    setDownloading(true)
    try {
      const res = await fetch('/api/synopsis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, language }),
      })
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'DelphAI_Synopsis.docx'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Could not generate synopsis. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const chatRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setSuggestions(getRandomSuggestions(4, language))
    setWelcomeText(getRandomWelcome(language))
  }, [language])

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
          &ldquo;Few things are as dangerous as too grand an idea in too small a mind.&rdquo;
        </blockquote>
        <p className={styles.ageCommitment}>
          DelphAI is designed as a thinking companion, it can help you in gaining a deeper
          understanding of yourself and the world around you but it can make mistakes while
          doing so. Be mindful of its limitations.
        </p>
        <p className={styles.ageQuestion}>Do you agree to engage with this tool in a critical way?</p>
        <div className={styles.ageBtns}>
          <button className={styles.ageYes} onClick={() => setAgeVerified(true)}>I agree</button>
          <button className={styles.ageNo} onClick={() => setAgeVerified(false)}>I don&apos;t agree</button>
        </div>
      </div>
    )
  }

  if (ageVerified === false) {
    return (
      <div className={styles.ageGate}>
        <DelphAILogo size={52} />
        <blockquote className={styles.ageQuote}>
          &ldquo;Few things are as dangerous as too grand an idea in too small a mind.&rdquo;
        </blockquote>
        <p className={styles.ageUnder}>
          DelphAI is built for those who engage seriously. Come back when you&apos;re ready.
        </p>
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
        {messages.length >= 2 && (
          <button
            className={styles.synopsisBtn}
            onClick={downloadSynopsis}
            disabled={downloading}
            title="Download conversation synopsis as Word document"
          >
            {downloading ? '...' : 'Download synopsis'}
          </button>
        )}
      </header>

      <div className={styles.chat} ref={chatRef}>
        <div className={styles.welcomeBlock}>
          <div className={styles.welcomeText}>
            <span className={styles.welcomeLine}>
              {language === 'Dutch' ? 'Welkom bij DelphAI,' :
               language === 'French' ? 'Bienvenue sur DelphAI,' :
               language === 'German' ? 'Willkommen bei DelphAI,' :
               'Welcome to DelphAI,'}
            </span>
            <span className={styles.welcomeQ}>{welcomeText}</span>
          </div>
          {suggestionsVisible && (
            <div className={styles.suggestionsBlock}>
              <div className={styles.suggestionsLabel}>
                {language === 'Dutch' ? 'Suggesties om mee te beginnen' :
                 language === 'French' ? 'Suggestions pour commencer' :
                 language === 'German' ? 'Vorschläge zum Einstieg' :
                 'Suggestions to get you started'}
              </div>
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
                <AIMessage content={msg.content} />
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
            placeholder={
              language === 'Dutch' ? 'Stel een vraag...' :
              language === 'French' ? 'Posez une question...' :
              language === 'German' ? 'Stell eine Frage...' :
              'Ask anything...'
            }
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
