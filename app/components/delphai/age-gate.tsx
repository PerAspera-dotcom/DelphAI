import styles from '../../page.module.css';
import { DelphAILogo } from './logos';

type AgeGateCommitmentProps = {
  variant: 'commitment';
  onAgree: () => void;
  onDecline: () => void;
};

type AgeGateDeclinedProps = {
  variant: 'declined';
};

export type AgeGateProps = AgeGateCommitmentProps | AgeGateDeclinedProps;

export function AgeGate(props: AgeGateProps) {
  if (props.variant === 'declined') {
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
    );
  }

  return (
    <div className={styles.ageGate}>
      <DelphAILogo size={52} />
      <blockquote className={styles.ageQuote}>
        &ldquo;Few things are as dangerous as too grand an idea in too small a mind.&rdquo;
      </blockquote>
      <p className={styles.ageCommitment}>
        DelphAI is designed as a thinking companion, it can help you in gaining a deeper understanding of yourself and
        the world around you but it can make mistakes while doing so. Be mindful of its limitations.
      </p>
      <p className={styles.ageQuestion}>Do you agree to engage with this tool in a critical way?</p>
      <div className={styles.ageBtns}>
        <button className={styles.ageYes} type='button' onClick={props.onAgree}>
          I agree
        </button>
        <button className={styles.ageNo} type='button' onClick={props.onDecline}>
          I don&apos;t agree
        </button>
      </div>
    </div>
  );
}
