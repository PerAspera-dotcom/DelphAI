import styles from '../../page.module.css';
import { DelphAILogo, PhilosopherLogo, ReaderLogo, SeanceLogo } from './logos';

type ModeGateProps = {
  onSelectPhilosopher: () => void;
  onSelectReader: () => void;
  onSelectSeance: () => void;
};

export function ModeGate({ onSelectPhilosopher, onSelectReader, onSelectSeance }: ModeGateProps) {
  return (
    <div className={styles.modeGate}>
      <div className={styles.modeGateHeader}>
        <DelphAILogo size={40} />
        <div className={styles.modeGateTitle}>
          Delph<span>AI</span>
        </div>
        <p className={styles.modeGateSubtitle}>Choose how you want to engage</p>
      </div>
      <div className={styles.modeCards}>
        <button type='button' className={styles.modeCard} onClick={onSelectPhilosopher}>
          <PhilosopherLogo size={52} />
          <div className={styles.modeCardTitle}>Philosopher mode</div>
          <div className={styles.modeCardDesc}>
            A Socratic dialogue that challenges your thinking. You form positions and defend them against philosophical
            frameworks from all traditions.
          </div>
          <div className={styles.modeCardNote}>Type your own answer at any point to engage directly.</div>
        </button>
        <button type='button' className={styles.modeCard} onClick={onSelectReader}>
          <ReaderLogo size={52} />
          <div className={styles.modeCardTitle}>Reader mode</div>
          <div className={styles.modeCardDesc}>
            A guided exploration of your topic. DelphAI leads you through frameworks and perspectives — you navigate
            with suggested responses.
          </div>
          <div className={styles.modeCardNote}>Type your own response at any point to switch to Philosopher mode.</div>
        </button>
        <button type='button' className={`${styles.modeCard} ${styles.modeCardSeance}`} onClick={onSelectSeance}>
          <SeanceLogo size={52} />
          <div className={styles.modeCardTitle}>Séance mode</div>
          <div className={styles.modeCardDesc}>
            Summon a philosopher from history and converse with them directly. DelphAI embodies their voice, style, and
            thinking based on their known works.
          </div>
          <div className={styles.modeCardNote}>Type your own statement at any point to switch to Philosopher mode.</div>
        </button>
      </div>
    </div>
  );
}
