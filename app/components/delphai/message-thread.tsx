import styles from '../../page.module.css';
import type { Message, Mode, Suggestions } from '../../lib/delphai/types';
import { AIMessage } from './ai-message';

type MessageThreadProps = {
  messages: Message[];
  suggestionMap: Record<number, Suggestions>;
  language: string;
  activeMode: Mode;
  loading: boolean;
  onSend: (text: string, isCustomInReader: boolean) => void;
  onSuggestionClick: (text: string) => void;
};

export function MessageThread({
  messages,
  suggestionMap,
  language,
  activeMode,
  loading,
  onSend,
  onSuggestionClick,
}: MessageThreadProps) {
  const userMeta =
    language === 'Dutch' ? 'Jij' : language === 'French' ? 'Vous' : language === 'German' ? 'Sie' : 'You';

  const frameworksPrompt =
    language === 'Dutch'
      ? 'Laat me andere filosofische kaders zien'
      : language === 'French'
        ? "Montrez-moi d'autres cadres philosophiques"
        : language === 'German'
          ? 'Zeig mir andere philosophische Rahmen'
          : 'Show me different frameworks';

  const frameworksLabel =
    language === 'Dutch'
      ? 'Andere kaders'
      : language === 'French'
        ? 'Autres cadres'
        : language === 'German'
          ? 'Andere Rahmen'
          : 'Show me different frameworks';

  const selectResponseLabel =
    language === 'Dutch'
      ? 'Kies een antwoord'
      : language === 'French'
        ? 'Choisissez une réponse'
        : language === 'German'
          ? 'Wählen Sie eine Antwort'
          : 'Select a response';

  const customNote =
    language === 'Dutch'
      ? 'Of typ je eigen antwoord om naar Filosofenmodus te schakelen'
      : language === 'French'
        ? 'Ou tapez votre propre réponse pour passer en mode Philosophe'
        : language === 'German'
          ? 'Oder geben Sie Ihre eigene Antwort ein, um in den Philosophenmodus zu wechseln'
          : 'Or type your own response to switch to Philosopher mode';

  return (
    <>
      {messages.map((msg, i) => {
        if (msg.role === 'user') {
          return (
            <div key={i} className={`${styles.msg} ${styles.user}`}>
              <span className={styles.meta}>{userMeta}</span>
              <div className={`${styles.bubble} ${styles.userBubble}`}>
                {msg.content.replace(' [READER_SUGGESTION]', '')}
              </div>
            </div>
          );
        }
        const sugs = suggestionMap[i];
        return (
          <div key={i} className={`${styles.msg} ${styles.ai}`}>
            <span className={styles.meta}>DelphAI</span>
            <div
              className={`${styles.bubble} ${styles.aiBubble} ${activeMode === 'reader' ? styles.readerBubble : ''}`}
            >
              <AIMessage content={msg.content} />
            </div>
            {activeMode === 'philosopher' && i === messages.length - 1 && messages.length >= 2 && (
              <div className={styles.altFrameworksBtn}>
                <button
                  type='button'
                  className={`${styles.readerSugBtn} ${styles.readerSugFrameworks}`}
                  onClick={() => onSend(frameworksPrompt, false)}
                >
                  {frameworksLabel}
                </button>
              </div>
            )}
            {sugs && activeMode === 'reader' && i === messages.length - 1 && (
              <div className={styles.readerSuggestions}>
                <div className={styles.readerSugLabel}>{selectResponseLabel}</div>
                <button
                  type='button'
                  className={`${styles.readerSugBtn} ${styles.readerSugAffirm}`}
                  onClick={() => onSuggestionClick(sugs.affirmative)}
                >
                  {sugs.affirmative}
                </button>
                <button
                  type='button'
                  className={`${styles.readerSugBtn} ${styles.readerSugNegate}`}
                  onClick={() => onSuggestionClick(sugs.negative)}
                >
                  {sugs.negative}
                </button>
                {sugs.more.map((m, j) => (
                  <button
                    key={j}
                    type='button'
                    className={`${styles.readerSugBtn} ${styles.readerSugMore}`}
                    onClick={() => onSuggestionClick(m)}
                  >
                    {m}
                  </button>
                ))}
                <button
                  type='button'
                  className={`${styles.readerSugBtn} ${styles.readerSugFrameworks}`}
                  onClick={() => onSuggestionClick(frameworksPrompt)}
                >
                  {frameworksLabel}
                </button>
                <div className={styles.readerSugCustomNote}>{customNote}</div>
              </div>
            )}
          </div>
        );
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
    </>
  );
}
