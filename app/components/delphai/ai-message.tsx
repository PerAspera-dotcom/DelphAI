import type { ReactNode } from 'react';
import styles from '../../page.module.css';

function formatInline(text: string): ReactNode[] {
  return text.split(/(\*[^*\n]+\*)/g).map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className={styles.concept}>
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function AIMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: ReactNode[] = [];
  let key = 0;
  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    if (
      /^(Further reading|Counter-Pressure|Tension Analysis|Diagnostic Question|Restated Position|Philosophical Lineage|Verdere lectuur|Lecture complémentaire|Weiterlesen|Neuformulierung|Philosophische Einordnung|Gegendruck|Spannungsanalyse|Diagnosefrage|Position restituée|Lignée philosophique|Contre-pression|Analyse des tensions|Question diagnostique)[:.]?$/i.test(
        l,
      )
    ) {
      elements.push(
        <div key={key++} className={styles.sectionHeading}>
          {l.replace(/:$/, '')}
        </div>,
      );
      continue;
    }
    if (l.startsWith('•') || (l.startsWith('*') && l.length > 2 && !l.endsWith('*'))) {
      elements.push(
        <div key={key++} className={styles.bulletItem}>
          {formatInline(l.replace(/^[•*]\s*/, ''))}
        </div>,
      );
      continue;
    }
    if (/^\d+\./.test(l)) {
      elements.push(
        <div key={key++} className={styles.bulletItem}>
          {formatInline(l)}
        </div>,
      );
      continue;
    }
    elements.push(
      <p key={key++} className={styles.aiPara}>
        {formatInline(l)}
      </p>,
    );
  }
  return <div className={styles.aiText}>{elements}</div>;
}
