import { useState } from 'react';
import styles from '../../page.module.css';
import { DelphAILogo } from './logos';

type PhilosopherGateProps = {
  language: string;
  onConfirm: (philosopher: string) => void;
  onBack: () => void;
};

export function PhilosopherGate({ language, onConfirm, onBack }: PhilosopherGateProps) {
  const [input, setInput] = useState('');

  const title =
    language === 'Dutch'
      ? 'Wie wil je oproepen?'
      : language === 'French'
        ? 'Qui souhaitez-vous invoquer?'
        : language === 'German'
          ? 'Wen möchten Sie beschwören?'
          : 'Who do you wish to summon?';

  const placeholder =
    language === 'Dutch'
      ? 'Naam van de filosoof...'
      : language === 'French'
        ? 'Nom du philosophe...'
        : language === 'German'
          ? 'Name des Philosophen...'
          : 'Name of the philosopher...';

  const disclaimer =
    language === 'Dutch'
      ? 'DelphAI roept deze geest op op basis van beschikbare kennis over hun werk, stijl en ideeën. Interpretaties kunnen soms afwijken van de historische werkelijkheid.'
      : language === 'French'
        ? "DelphAI invoque cet esprit sur la base des connaissances disponibles sur leur œuvre, leur style et leurs idées. Les interprétations peuvent parfois s'écarter de la réalité historique."
        : language === 'German'
          ? 'DelphAI beschwört diesen Geist auf der Grundlage verfügbarer Kenntnisse über sein Werk, seinen Stil und seine Ideen. Interpretationen können manchmal von der historischen Realität abweichen.'
          : 'DelphAI summons this spirit based on available knowledge of their work, style, and ideas. Interpretations may sometimes depart from historical reality.';

  const confirmLabel =
    language === 'Dutch'
      ? 'Oproepen'
      : language === 'French'
        ? 'Invoquer'
        : language === 'German'
          ? 'Beschwören'
          : 'Summon';

  const backLabel =
    language === 'Dutch'
      ? 'Terug'
      : language === 'French'
        ? 'Retour'
        : language === 'German'
          ? 'Zurück'
          : 'Back';

  return (
    <div className={styles.philosopherGate}>
      <DelphAILogo size={44} />
      <div className={styles.philosopherGateTitle}>{title}</div>
      <input
        className={styles.philosopherInput}
        type='text'
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim()) onConfirm(input.trim());
        }}
        autoFocus
      />
      <p className={styles.philosopherDisclaimer}>{disclaimer}</p>
      <div className={styles.philosopherGateBtns}>
        <button
          type='button'
          className={styles.philosopherConfirmBtn}
          onClick={() => input.trim() && onConfirm(input.trim())}
          disabled={!input.trim()}
        >
          {confirmLabel}
        </button>
        <button type='button' className={styles.philosopherBackBtn} onClick={onBack}>
          {backLabel}
        </button>
      </div>
    </div>
  );
}
