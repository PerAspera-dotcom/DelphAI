import styles from '../../page.module.css';
import type { Mode } from '../../lib/delphai/types';
import { DelphAILogo } from './logos';

type ChatHeaderProps = {
  activeMode: Mode;
  language: string;
  onLanguageChange: (language: string) => void;
  fontSize: number;
  minFontSize: number;
  maxFontSize: number;
  onDecreaseFontSize: () => void;
  onIncreaseFontSize: () => void;
  showSynopsis: boolean;
  downloading: boolean;
  onDownloadSynopsis: () => void;
  selectedPhilosopher?: string | null;
  modeBadgeClass?: string;
};

export function ChatHeader({
  activeMode,
  language,
  onLanguageChange,
  fontSize,
  minFontSize,
  maxFontSize,
  onDecreaseFontSize,
  onIncreaseFontSize,
  showSynopsis,
  downloading,
  onDownloadSynopsis,
  selectedPhilosopher,
  modeBadgeClass,
}: ChatHeaderProps) {
  const modeLabel =
    activeMode === 'seance' && selectedPhilosopher
      ? selectedPhilosopher
      : activeMode === 'reader'
        ? language === 'Dutch'
          ? 'Lezermodus'
          : language === 'French'
            ? 'Mode lecture'
            : language === 'German'
              ? 'Lesemodus'
              : 'Reader mode'
        : activeMode === 'seance'
          ? language === 'Dutch'
            ? 'Séancemodus'
            : language === 'French'
              ? 'Mode séance'
              : language === 'German'
                ? 'Séance-Modus'
                : 'Séance mode'
          : language === 'Dutch'
            ? 'Filosofenmodus'
            : language === 'French'
              ? 'Mode philosophe'
              : language === 'German'
                ? 'Philosophenmodus'
                : 'Philosopher mode';

  const synopsisLabel = downloading
    ? '...'
    : language === 'Dutch'
      ? 'Download samenvatting'
      : language === 'French'
        ? 'Télécharger le résumé'
        : language === 'German'
          ? 'Zusammenfassung herunterladen'
          : 'Download synopsis';

  const langFieldLabel =
    language === 'Dutch' ? 'Taal' : language === 'French' ? 'Langue' : language === 'German' ? 'Sprache' : 'Language';

  const fontSizeLabel =
    language === 'Dutch'
      ? 'Tekstgrootte'
      : language === 'French'
        ? 'Taille du texte'
        : language === 'German'
          ? 'Textgröße'
          : 'Text size';

  const decreaseLabel =
    language === 'Dutch'
      ? 'Tekst verkleinen'
      : language === 'French'
        ? 'Réduire le texte'
        : language === 'German'
          ? 'Text verkleinern'
          : 'Decrease text size';

  const increaseLabel =
    language === 'Dutch'
      ? 'Tekst vergroten'
      : language === 'French'
        ? 'Agrandir le texte'
        : language === 'German'
          ? 'Text vergrößern'
          : 'Increase text size';

  const badgeClass = modeBadgeClass ?? styles.modeBadgePhilosopher;

  return (
    <header className={styles.header}>
      <DelphAILogo size={32} />
      <div className={styles.logoText}>
        Delph<span>AI</span>
      </div>
      <div className={`${styles.modeBadge} ${badgeClass}`}>
        {modeLabel}
      </div>
      <div className={styles.headerEnd}>
        <div className={styles.fontSizeWrap}>
          <span className={styles.fontSizeLabel}>{fontSizeLabel}</span>
          <div className={styles.fontSizeControl} aria-label={fontSizeLabel}>
            <button
              type='button'
              className={styles.fontSizeBtn}
              onClick={onDecreaseFontSize}
              disabled={fontSize <= minFontSize}
              aria-label={decreaseLabel}
              title={decreaseLabel}
            >
              A-
            </button>
            <span className={styles.fontSizeValue} aria-hidden='true'>
              {fontSize}
            </span>
            <button
              type='button'
              className={styles.fontSizeBtn}
              onClick={onIncreaseFontSize}
              disabled={fontSize >= maxFontSize}
              aria-label={increaseLabel}
              title={increaseLabel}
            >
              A+
            </button>
          </div>
        </div>
        <div className={styles.langSelectWrap}>
          <label htmlFor='delphai-interface-lang' className={styles.langSelectLabel}>
            {langFieldLabel}
          </label>
          <select
            id='delphai-interface-lang'
            className={styles.langSelect}
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            <option value='English'>English</option>
            <option value='Dutch'>Nederlands</option>
            <option value='French'>Français</option>
            <option value='German'>Deutsch</option>
          </select>
        </div>
        {showSynopsis && (
          <button type='button' className={styles.synopsisBtn} onClick={onDownloadSynopsis} disabled={downloading}>
            {synopsisLabel}
          </button>
        )}
      </div>
    </header>
  );
}
