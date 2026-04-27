import type { ChangeEvent, KeyboardEvent, RefObject } from 'react';
import styles from '../../page.module.css';
import type { Mode } from '../../lib/delphai/types';

type ChatComposerProps = {
  textareaRef: RefObject<HTMLTextAreaElement>;
  input: string;
  language: string;
  loading: boolean;
  activeMode: Mode;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: (text: string, isCustomInReader: boolean) => void;
};

export function ChatComposer({
  textareaRef,
  input,
  language,
  loading,
  activeMode,
  onChange,
  onKeyDown,
  onSend,
}: ChatComposerProps) {
  const placeholder =
    language === 'Dutch'
      ? 'Stel een vraag...'
      : language === 'French'
        ? 'Posez une question...'
        : language === 'German'
          ? 'Stell eine Frage...'
          : 'Ask anything...';

  const sendLabel =
    language === 'Dutch' ? 'Verstuur' : language === 'French' ? 'Envoyer' : language === 'German' ? 'Senden' : 'Send';

  return (
    <div className={styles.bottom}>
      <div className={styles.row}>
        <textarea
          ref={textareaRef}
          className={styles.input}
          placeholder={placeholder}
          value={input}
          onChange={onChange}
          onKeyDown={onKeyDown}
          rows={1}
        />
        <button
          type='button'
          className={styles.send}
          onClick={() => {
            if (activeMode === 'reader' && input.trim()) {
              onSend(input, true);
            } else {
              onSend(input, false);
            }
          }}
          disabled={loading || !input.trim()}
        >
          {sendLabel}
        </button>
      </div>
    </div>
  );
}
