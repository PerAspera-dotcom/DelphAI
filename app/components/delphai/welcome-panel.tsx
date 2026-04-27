import styles from '../../page.module.css';

type WelcomePanelProps = {
  language: string;
  welcomeText: string;
  suggestionsVisible: boolean;
  suggestions: string[];
  onPickSuggestion: (text: string) => void;
};

export function WelcomePanel({
  language,
  welcomeText,
  suggestionsVisible,
  suggestions,
  onPickSuggestion,
}: WelcomePanelProps) {
  const welcomeLine =
    language === 'Dutch'
      ? 'Welkom bij DelphAI,'
      : language === 'French'
        ? 'Bienvenue sur DelphAI,'
        : language === 'German'
          ? 'Willkommen bei DelphAI,'
          : 'Welcome to DelphAI,';

  const suggestionsLabel =
    language === 'Dutch'
      ? 'Suggesties om mee te beginnen'
      : language === 'French'
        ? 'Suggestions pour commencer'
        : language === 'German'
          ? 'Vorschläge zum Einstieg'
          : 'Suggestions to get you started';

  return (
    <div className={styles.welcomeBlock}>
      <div className={styles.welcomeText}>
        <span className={styles.welcomeLine}>{welcomeLine}</span>
        <span className={styles.welcomeQ}>{welcomeText}</span>
      </div>
      {suggestionsVisible && (
        <div className={styles.suggestionsBlock}>
          <div className={styles.suggestionsLabel}>{suggestionsLabel}</div>
          <div className={styles.suggestions}>
            {suggestions.map((s) => (
              <button key={s} type='button' className={styles.sugBtn} onClick={() => onPickSuggestion(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
