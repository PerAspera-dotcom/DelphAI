'use client'
 
import { useState, useRef, useEffect } from 'react'
import styles from './page.module.css'
 
type Message = { role: 'user' | 'assistant'; content: string }
type Mode = 'philosopher' | 'reader'
type Suggestions = { affirmative: string; negative: string; more: string[] }
 
const FIXED_SUGGESTION: Record<string, string> = {
  English: 'What is wrong with this world?',
  Dutch: 'Wat is er mis met deze wereld?',
  French: "Qu'est-ce qui ne va pas dans ce monde?",
  German: 'Was stimmt nicht mit dieser Welt?',
}
 
const SUGGESTION_POOL: Record<string, string[]> = {
  English: ['What is time?','What is meaning?','What is value?','Why does something feel right or wrong?','What is justice?','What is the self?','Is free will real?','What is consciousness?','Why do we fear death?','What do we owe each other?','Can we ever truly know anything?','What makes a life well-lived?','Why is there something rather than nothing?','What is beauty?','Is happiness the point of life?','What is truth?','Why do good people do bad things?','What is power?','Can violence ever be justified?','What is love?','Why do humans need meaning?','Is morality invented or discovered?'],
  Dutch: ['Wat is tijd?','Wat is betekenis?','Wat is waarde?','Waarom voelt iets goed of fout?','Wat is rechtvaardigheid?','Wat is het zelf?','Is vrije wil echt?','Wat is bewustzijn?','Waarom zijn we bang voor de dood?','Wat zijn we elkaar verschuldigd?','Kunnen we ooit iets echt weten?','Wat maakt een leven de moeite waard?','Waarom bestaat er iets in plaats van niets?','Wat is schoonheid?','Is geluk het doel van het leven?','Wat is waarheid?','Waarom doen goede mensen slechte dingen?','Wat is macht?','Kan geweld ooit gerechtvaardigd zijn?','Wat is liefde?','Waarom hebben mensen betekenis nodig?','Is moraliteit uitgevonden of ontdekt?'],
  French: ["Qu'est-ce que le temps?","Qu'est-ce que le sens?","Qu'est-ce que la valeur?",'Pourquoi quelque chose semble-t-il juste ou faux?',"Qu'est-ce que la justice?","Qu'est-ce que le soi?",'Le libre arbitre est-il réel?',"Qu'est-ce que la conscience?",'Pourquoi craignons-nous la mort?','Que nous devons-nous mutuellement?','Peut-on jamais vraiment savoir quelque chose?',"Qu'est-ce qui rend une vie bien vécue?","Pourquoi y a-t-il quelque chose plutôt que rien?","Qu'est-ce que la beauté?",'Le bonheur est-il le but de la vie?',"Qu'est-ce que la vérité?",'Pourquoi les bonnes personnes font-elles de mauvaises choses?',"Qu'est-ce que le pouvoir?",'La violence peut-elle jamais être justifiée?',"Qu'est-ce que l'amour?",'Pourquoi les humains ont-ils besoin de sens?','La moralité est-elle inventée ou découverte?'],
  German: ['Was ist Zeit?','Was ist Bedeutung?','Was ist Wert?','Warum fühlt sich etwas richtig oder falsch an?','Was ist Gerechtigkeit?','Was ist das Selbst?','Ist freier Wille real?','Was ist Bewusstsein?','Warum fürchten wir den Tod?','Was schulden wir einander?','Können wir jemals wirklich etwas wissen?','Was macht ein Leben lebenswert?','Warum gibt es etwas statt nichts?','Was ist Schönheit?','Ist Glück der Sinn des Lebens?','Was ist Wahrheit?','Warum tun gute Menschen schlechte Dinge?','Was ist Macht?','Kann Gewalt jemals gerechtfertigt sein?','Was ist Liebe?','Warum brauchen Menschen Bedeutung?','Ist Moral erfunden oder entdeckt?'],
}
 
const WELCOME_POOL: Record<string, string[]> = {
  English: ['A friendly voice in the forest of the mind.','Where the abyss also talks back.','Where does your mind take us today?','Putting the AI back in Aesop.','Can you ask Alexander to get out of our sun?','The first step out of the basement or the first step back into it.'],
  Dutch: ['Een vriendelijke stem in het woud van de geest.','Waar de afgrond ook terugpraat.','Waarheen brengen jouw gedachten ons vandaag?','De eerste stap uit de kelder of de eerste stap terug naar binnen.','Denken is het begin van alles.','Waar vragen groter worden dan antwoorden.'],
  French: ["Une voix amicale dans la forêt de l'esprit.","Où l'abîme répond aussi.","Où votre esprit nous emmène-t-il aujourd'hui?",'Le premier pas hors du sous-sol ou le premier pas pour y retourner.',"Penser, c'est le début de tout.",'Là où les questions deviennent plus grandes que les réponses.'],
  German: ['Eine freundliche Stimme im Wald des Geistes.','Wo der Abgrund auch zurückspricht.','Wohin nimmt uns dein Geist heute?','Der erste Schritt aus dem Keller oder der erste Schritt herein.','Denken ist der Anfang von allem.','Wo Fragen größer werden als Antworten.'],
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
 
function parseSuggestions(text: string): { clean: string; suggestions: Suggestions | null } {
  const match = text.match(/\[SUGGESTIONS\]([\s\S]*?)\[\/SUGGESTIONS\]/i)
  if (!match) return { clean: text, suggestions: null }
  const clean = text.replace(match[0], '').trim()
  try {
    const suggestions = JSON.parse(match[1].trim())
    return { clean, suggestions }
  } catch {
    return { clean, suggestions: null }
  }
}
 
function formatInline(text: string): React.ReactNode[] {
  return text.split(/(\*[^*\n]+\*)/g).map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className={styles.concept}>{part.slice(1, -1)}</em>
    }
    return <span key={i}>{part}</span>
  })
}
 
function AIMessage({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0
  for (const line of lines) {
    const l = line.trim()
    if (!l) continue
    if (/^(Further reading|Counter-Pressure|Tension Analysis|Diagnostic Question|Restated Position|Philosophical Lineage|Verdere lectuur|Lecture complémentaire|Weiterlesen|Neuformulierung|Philosophische Einordnung|Gegendruck|Spannungsanalyse|Diagnosefrage|Position restituée|Lignée philosophique|Contre-pression|Analyse des tensions|Question diagnostique)[:.]?$/i.test(l)) {
      elements.push(<div key={key++} className={styles.sectionHeading}>{l.replace(/:$/, '')}</div>)
      continue
    }
    if (l.startsWith('•') || (l.startsWith('*') && l.length > 2 && !l.endsWith('*'))) {
      elements.push(<div key={key++} className={styles.bulletItem}>{formatInline(l.replace(/^[•*]\s*/, ''))}</div>)
      continue
    }
    if (/^\d+\./.test(l)) {
      elements.push(<div key={key++} className={styles.bulletItem}>{formatInline(l)}</div>)
      continue
    }
    elements.push(<p key={key++} className={styles.aiPara}>{formatInline(l)}</p>)
  }
  return <div className={styles.aiText}>{elements}</div>
}
 
function PhilosopherLogo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="#4a6741" strokeWidth="1.5"/>
      <path d="M24 6 L24 42" stroke="#4a6741" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.3"/>
      <path d="M6 24 L42 24" stroke="#4a6741" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.3"/>
      <path d="M16 34 Q16 27 24 26 Q32 27 32 34" fill="none" stroke="#4a6741" strokeWidth="1.3"/>
      <path d="M18 30 L30 30" stroke="#4a6741" strokeWidth="1" strokeLinecap="round"/>
      <path d="M24 26 L24 30" stroke="#4a6741" strokeWidth="1" strokeLinecap="round"/>
      <path d="M18 30 Q16 33 14 33 Q16 33 18 33" stroke="#4a6741" strokeWidth="0.9" strokeLinecap="round"/>
      <path d="M30 30 Q32 33 34 33 Q32 33 30 33" stroke="#4a6741" strokeWidth="0.9" strokeLinecap="round"/>
      <circle cx="16" cy="33" r="1.2" fill="#4a6741" opacity="0.7"/>
      <circle cx="32" cy="33" r="1.2" fill="#4a6741" opacity="0.4"/>
      <circle cx="24" cy="19" r="5" fill="none" stroke="#4a6741" strokeWidth="1.3"/>
    </svg>
  )
}
 
function ReaderLogo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="#4a6741" strokeWidth="1.5"/>
      <path d="M24 6 L24 42" stroke="#4a6741" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.3"/>
      <path d="M6 24 L42 24" stroke="#4a6741" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.3"/>
      <circle cx="24" cy="15" r="4.5" fill="none" stroke="#4a6741" strokeWidth="1.3"/>
      <path d="M13 30 L24 27 L35 30 L35 38 L24 35 L13 38 Z" fill="none" stroke="#4a6741" strokeWidth="1.3"/>
      <path d="M24 27 L24 35" stroke="#4a6741" strokeWidth="1" opacity="0.6"/>
      <path d="M16 31 L22 29.5" stroke="#4a6741" strokeWidth="0.7" opacity="0.5"/>
      <path d="M16 33 L22 31.5" stroke="#4a6741" strokeWidth="0.7" opacity="0.5"/>
      <path d="M16 35 L22 33.5" stroke="#4a6741" strokeWidth="0.7" opacity="0.5"/>
      <path d="M26 29.5 L32 31" stroke="#4a6741" strokeWidth="0.7" opacity="0.5"/>
      <path d="M26 31.5 L32 33" stroke="#4a6741" strokeWidth="0.7" opacity="0.5"/>
      <path d="M26 33.5 L32 35" stroke="#4a6741" strokeWidth="0.7" opacity="0.5"/>
      <path d="M19 22 Q14 26 13 30" fill="none" stroke="#4a6741" strokeWidth="1.2"/>
      <path d="M29 22 Q34 26 35 30" fill="none" stroke="#4a6741" strokeWidth="1.2"/>
    </svg>
  )
}
 
function DelphAILogo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
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
 
export default function Home() {
  const [ageVerified, setAgeVerified] = useState<boolean | null>(null)
  const [mode, setMode] = useState<Mode | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [suggestionMap, setSuggestionMap] = useState<Record<number, Suggestions>>({})
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [language, setLanguage] = useState('English')
  const [suggestions, setSuggestions] = useState(() => getRandomSuggestions(4, 'English'))
  const [welcomeText, setWelcomeText] = useState(() => getRandomWelcome('English'))
  const [suggestionsVisible, setSuggestionsVisible] = useState(true)
  const [activeMode, setActiveMode] = useState<Mode>('philosopher')
  const chatRef = useRef<HTMLDivElement>(null)
  const filledFromSuggestionRef = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevLanguageRef = useRef('English')
 
  useEffect(() => {
    setSuggestions(getRandomSuggestions(4, language))
    setWelcomeText(getRandomWelcome(language))
    const prev = prevLanguageRef.current
    prevLanguageRef.current = language
    if (prev === language || messages.length === 0) return
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, language }),
    }).then(r => r.json()).then(data => {
      if (data.messages && Array.isArray(data.messages)) setMessages(data.messages)
    }).catch(() => {})
  }, [language])
 
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])
 
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    filledFromSuggestionRef.current = false
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }
 
  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const isCustom = activeMode === 'reader' && !filledFromSuggestionRef.current
      filledFromSuggestionRef.current = false
      send(input, isCustom)
    }
  }
 
  function fill(text: string) {
    filledFromSuggestionRef.current = true
    setInput(text)
    textareaRef.current?.focus()
  }
 
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
      a.download = 'DelphAI_Synopsis.html'
      a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Could not generate synopsis. Please try again.') }
    finally { setDownloading(false) }
  }
 
  async function send(text: string, isCustomInReader: boolean = false) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
 
    const sendMode: Mode = isCustomInReader ? 'philosopher' : (activeMode || mode || 'philosopher')
    if (isCustomInReader) setActiveMode('philosopher')
 
    const newMessages: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(newMessages)
    setInput('')
    setSuggestionsVisible(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)
 
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, language, mode: sendMode }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
 
      const { clean, suggestions: sugs } = parseSuggestions(data.text)
      const aiIndex = newMessages.length
      setMessages([...newMessages, { role: 'assistant', content: clean }])
      if (sugs && sendMode === 'reader') {
        setSuggestionMap(prev => ({ ...prev, [aiIndex]: sugs }))
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }
 
  function handleSuggestionClick(text: string) {
    send(text, false)
  }
 
  function handleCustomInput() {
    if (!input.trim()) return
    send(input, activeMode === 'reader')
  }
 
  // Gate 1: Commitment
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
        <p className={styles.ageUnder}>DelphAI is built for those who engage seriously. Come back when you&apos;re ready.</p>
      </div>
    )
  }
 
  // Gate 2: Mode selection
  if (mode === null) {
    return (
      <div className={styles.modeGate}>
        <div className={styles.modeGateHeader}>
          <DelphAILogo size={40} />
          <div className={styles.modeGateTitle}>Delph<span>AI</span></div>
          <p className={styles.modeGateSubtitle}>Choose how you want to engage</p>
        </div>
        <div className={styles.modeCards}>
          <button className={styles.modeCard} onClick={() => { setMode('philosopher'); setActiveMode('philosopher') }}>
            <PhilosopherLogo size={52} />
            <div className={styles.modeCardTitle}>Philosopher mode</div>
            <div className={styles.modeCardDesc}>A Socratic dialogue that challenges your thinking. You form positions and defend them against philosophical frameworks from all traditions.</div>
            <div className={styles.modeCardNote}>Type your own answer at any point to engage directly.</div>
          </button>
          <button className={styles.modeCard} onClick={() => { setMode('reader'); setActiveMode('reader') }}>
            <ReaderLogo size={52} />
            <div className={styles.modeCardTitle}>Reader mode</div>
            <div className={styles.modeCardDesc}>A guided exploration of your topic. DelphAI leads you through frameworks and perspectives — you navigate with suggested responses.</div>
            <div className={styles.modeCardNote}>Type your own response at any point to switch to Philosopher mode.</div>
          </button>
        </div>
      </div>
    )
  }
 
  // Main chat
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <DelphAILogo size={32} />
        <div className={styles.logoText}>Delph<span>AI</span></div>
        <div className={`${styles.modeBadge} ${activeMode === 'reader' ? styles.modeBadgeReader : styles.modeBadgePhilosopher}`}>
          {activeMode === 'reader'
            ? (language === 'Dutch' ? 'Lezermodus' : language === 'French' ? 'Mode lecture' : language === 'German' ? 'Lesemodus' : 'Reader mode')
            : (language === 'Dutch' ? 'Filosofenmodus' : language === 'French' ? 'Mode philosophe' : language === 'German' ? 'Philosophenmodus' : 'Philosopher mode')}
        </div>
        <select className={styles.langSelect} value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="English">EN</option>
          <option value="Dutch">NL</option>
          <option value="French">FR</option>
          <option value="German">DE</option>
        </select>
        {messages.length >= 2 && (
          <button className={styles.synopsisBtn} onClick={downloadSynopsis} disabled={downloading}>
            {downloading ? '...' :
              language === 'Dutch' ? 'Download samenvatting' :
              language === 'French' ? 'Télécharger le résumé' :
              language === 'German' ? 'Zusammenfassung herunterladen' :
              'Download synopsis'}
          </button>
        )}
      </header>
 
      <div className={styles.chat} ref={chatRef}>
        <div className={styles.welcomeBlock}>
          <div className={styles.welcomeText}>
            <span className={styles.welcomeLine}>
              {language === 'Dutch' ? 'Welkom bij DelphAI,' : language === 'French' ? 'Bienvenue sur DelphAI,' : language === 'German' ? 'Willkommen bei DelphAI,' : 'Welcome to DelphAI,'}
            </span>
            <span className={styles.welcomeQ}>{welcomeText}</span>
          </div>
          {suggestionsVisible && (
            <div className={styles.suggestionsBlock}>
              <div className={styles.suggestionsLabel}>
                {language === 'Dutch' ? 'Suggesties om mee te beginnen' : language === 'French' ? 'Suggestions pour commencer' : language === 'German' ? 'Vorschläge zum Einstieg' : 'Suggestions to get you started'}
              </div>
              <div className={styles.suggestions}>
                {suggestions.map((s) => (
                  <button key={s} className={styles.sugBtn} onClick={() => fill(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
        </div>
 
        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} className={`${styles.msg} ${styles.user}`}>
                <span className={styles.meta}>{language === 'Dutch' ? 'Jij' : language === 'French' ? 'Vous' : language === 'German' ? 'Sie' : 'You'}</span>
                <div className={`${styles.bubble} ${styles.userBubble}`}>{msg.content}</div>
              </div>
            )
          }
          const sugs = suggestionMap[i]
          return (
            <div key={i} className={`${styles.msg} ${styles.ai}`}>
              <span className={styles.meta}>DelphAI</span>
              <div className={`${styles.bubble} ${styles.aiBubble} ${activeMode === 'reader' ? styles.readerBubble : ''}`}>
                <AIMessage content={msg.content} />
              </div>
              {sugs && activeMode === 'reader' && i === messages.length - 1 && (
                <div className={styles.readerSuggestions}>
                  <div className={styles.readerSugLabel}>
                    {language === 'Dutch' ? 'Kies een antwoord' : language === 'French' ? 'Choisissez une réponse' : language === 'German' ? 'Wählen Sie eine Antwort' : 'Select a response'}
                  </div>
                  <button className={`${styles.readerSugBtn} ${styles.readerSugAffirm}`} onClick={() => handleSuggestionClick(sugs.affirmative)}>{sugs.affirmative}</button>
                  <button className={`${styles.readerSugBtn} ${styles.readerSugNegate}`} onClick={() => handleSuggestionClick(sugs.negative)}>{sugs.negative}</button>
                  {sugs.more.map((m, j) => (
                    <button key={j} className={`${styles.readerSugBtn} ${styles.readerSugMore}`} onClick={() => handleSuggestionClick(m)}>{m}</button>
                  ))}
                  <div className={styles.readerSugCustomNote}>
                    {language === 'Dutch' ? 'Of typ je eigen antwoord om naar Filosofenmodus te schakelen' : language === 'French' ? 'Ou tapez votre propre réponse pour passer en mode Philosophe' : language === 'German' ? 'Oder geben Sie Ihre eigene Antwort ein, um in den Philosophenmodus zu wechseln' : 'Or type your own response to switch to Philosopher mode'}
                  </div>
                </div>
              )}
            </div>
          )
        })}
 
        {loading && (
          <div className={`${styles.msg} ${styles.ai}`}>
            <span className={styles.meta}>DelphAI</span>
            <div className={`${styles.bubble} ${styles.aiBubble} ${styles.thinking}`}>
              <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
            </div>
          </div>
        )}
      </div>
 
      <div className={styles.bottom}>
        <div className={styles.row}>
          <textarea
            ref={textareaRef}
            className={styles.input}
            placeholder={language === 'Dutch' ? 'Stel een vraag...' : language === 'French' ? 'Posez une question...' : language === 'German' ? 'Stell eine Frage...' : 'Ask anything...'}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            rows={1}
          />
          <button className={styles.send} onClick={() => { if (activeMode === 'reader' && input.trim()) { send(input, true) } else { send(input, false) } }} disabled={loading || !input.trim()}>
            {language === 'Dutch' ? 'Verstuur' : language === 'French' ? 'Envoyer' : language === 'German' ? 'Senden' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}