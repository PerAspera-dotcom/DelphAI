'use client';

import styles from './page.module.css';
import { AgeGate } from './components/delphai/age-gate';
import { ChatComposer } from './components/delphai/chat-composer';
import { ChatHeader } from './components/delphai/chat-header';
import { ModeGate } from './components/delphai/mode-gate';
import { MessageThread } from './components/delphai/message-thread';
import { WelcomePanel } from './components/delphai/welcome-panel';
import { useDelphaiChat } from './lib/delphai/hooks/use-delphai-chat';

export default function Home() {
  const chat = useDelphaiChat();

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
    <div className={styles.app}>
      <ChatHeader
        activeMode={chat.activeMode}
        language={chat.language}
        onLanguageChange={chat.setLanguage}
        showSynopsis={chat.messages.length >= 2}
        downloading={chat.downloading}
        onDownloadSynopsis={chat.downloadSynopsis}
      />

      <div className={styles.chat} ref={chat.chatRef}>
        <WelcomePanel
          language={chat.language}
          welcomeText={chat.welcomeText}
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
        onChange={chat.handleInput}
        onKeyDown={chat.handleKey}
        onSend={chat.send}
      />
    </div>
  );
}
