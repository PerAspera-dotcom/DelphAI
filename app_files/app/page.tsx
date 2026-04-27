'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import styles from './page.module.css';
import { AgeGate } from './components/delphai/age-gate';
import { ChatComposer } from './components/delphai/chat-composer';
import { ChatHeader } from './components/delphai/chat-header';
import { ModeGate } from './components/delphai/mode-gate';
import { MessageThread } from './components/delphai/message-thread';
import { WelcomePanel } from './components/delphai/welcome-panel';
import { useDelphaiChat } from './lib/delphai/hooks/use-delphai-chat';

const MIN_CHAT_FONT_SIZE = 13;
const DEFAULT_CHAT_FONT_SIZE = 15;
const MAX_CHAT_FONT_SIZE = 20;

export default function Home() {
  const chat = useDelphaiChat();
  const [chatFontSize, setChatFontSize] = useState(DEFAULT_CHAT_FONT_SIZE);

  const decreaseFontSize = () => {
    setChatFontSize((size) => Math.max(MIN_CHAT_FONT_SIZE, size - 1));
  };

  const increaseFontSize = () => {
    setChatFontSize((size) => Math.min(MAX_CHAT_FONT_SIZE, size + 1));
  };

  if (chat.ageVerified === null) {
    return (
      <AgeGate
        variant='commitment'
        onAgree={() => chat.setAgeVerified(true)}
        onDecline={() => chat.setAgeVerified(false)}
      />
    );
  }

  if (chat.ageVerified === false) {
    return <AgeGate variant='declined' />;
  }

  if (chat.mode === null) {
    return (
      <ModeGate
        onSelectPhilosopher={chat.selectPhilosopherMode}
        onSelectReader={chat.selectReaderMode}
      />
    );
  }

  return (
    <div className={styles.app} style={{ '--chat-font-size': `${chatFontSize}px` } as CSSProperties}>
      <ChatHeader
        activeMode={chat.activeMode}
        language={chat.language}
        onLanguageChange={chat.setLanguage}
        fontSize={chatFontSize}
        minFontSize={MIN_CHAT_FONT_SIZE}
        maxFontSize={MAX_CHAT_FONT_SIZE}
        onDecreaseFontSize={decreaseFontSize}
        onIncreaseFontSize={increaseFontSize}
        showSynopsis={chat.messages.length >= 2}
        downloading={chat.downloading}
        onDownloadSynopsis={chat.downloadSynopsis}
      />

      <div className={styles.chat} ref={chat.chatRef}>
        <WelcomePanel
          language={chat.language}
          welcomeText={chat.welcomeText}
          fontSize={chatFontSize}
          suggestionsVisible={chat.suggestionsVisible}
          suggestions={chat.suggestions}
          onPickSuggestion={chat.fill}
        />

        <MessageThread
          messages={chat.messages}
          suggestionMap={chat.suggestionMap}
          language={chat.language}
          activeMode={chat.activeMode}
          loading={chat.loading}
          fontSize={chatFontSize}
          onSend={chat.send}
          onSuggestionClick={chat.handleSuggestionClick}
        />
      </div>

      <ChatComposer
        textareaRef={chat.textareaRef}
        input={chat.input}
        language={chat.language}
        loading={chat.loading}
        activeMode={chat.activeMode}
        fontSize={chatFontSize}
        onChange={chat.handleInput}
        onKeyDown={chat.handleKey}
        onSend={chat.send}
      />
    </div>
  );
}
