'use client';

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { isTypedQuestion } from '../is-typed-question';
import { parseSuggestions } from '../parse-suggestions';
import { getRandomSuggestions, getRandomWelcome } from '../suggestions';
import type { Message, Mode, Suggestions } from '../types';

const POSITION_MARKER_REGEX =
  /\b(i think|i believe|i feel|i consider|in my view|ik denk|ik geloof|ik voel|je pense|je crois|ich denke|ich glaube|i would say|i argue)\b/i;

export function useDelphaiChat() {
  const [ageVerified, setAgeVerified] = useState<boolean | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestionMap, setSuggestionMap] = useState<Record<number, Suggestions>>({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [suggestions, setSuggestions] = useState(() => getRandomSuggestions(4, 'English'));
  const [welcomeText, setWelcomeText] = useState(() => getRandomWelcome('English'));
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const [activeMode, setActiveMode] = useState<Mode>('philosopher');
  const chatRef = useRef<HTMLDivElement>(null);
  const filledFromSuggestionRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevLanguageRef = useRef('English');
  const [fontSize, setFontSize] = useState(15);
  const minFontSize = 13;
  const maxFontSize = 20;

  useEffect(() => {
    setSuggestions(getRandomSuggestions(4, language));
    setWelcomeText(getRandomWelcome(language));
    const prev = prevLanguageRef.current;
    prevLanguageRef.current = language;
    if (prev === language || messages.length === 0) return;
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, language }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.messages && Array.isArray(data.messages)) setMessages(data.messages);
      })
      .catch(() => {});
  }, [language]);

  useEffect(() => {
    if (!chatRef.current) return;
    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    chatRef.current.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  }, [messages, loading]);

  function handleInput(e: ChangeEvent<HTMLTextAreaElement>) {
    filledFromSuggestionRef.current = false;
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const isCustom = (activeMode === 'reader' || activeMode === 'seance') && !filledFromSuggestionRef.current;
      filledFromSuggestionRef.current = false;
      send(input, isCustom);
    }
  }

  function fill(text: string) {
    filledFromSuggestionRef.current = true;
    setInput(text);
    textareaRef.current?.focus();
  }

  function decreaseFontSize() {
    setFontSize((prev) => Math.max(minFontSize, prev - 1));
  }

  function increaseFontSize() {
    setFontSize((prev) => Math.min(maxFontSize, prev + 1));
  }

  async function downloadSynopsis() {
    if (messages.length < 2) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/synopsis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, language, philosopher: selectedPhilosopher }),
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedPhilosopher
        ? `DelphAI_Seance_${selectedPhilosopher.replace(/\s+/g, '_')}.html`
        : 'DelphAI_Synopsis.html';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not generate synopsis. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  async function send(text: string, isCustomInReader: boolean = false) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const switchToPhilosopher =
      isCustomInReader && POSITION_MARKER_REGEX.test(trimmed) && !isTypedQuestion(trimmed);
    const sendMode: Mode = switchToPhilosopher ? 'philosopher' : activeMode || mode || 'philosopher';
    if (switchToPhilosopher) setActiveMode('philosopher');

    const messageContent = sendMode === 'reader' || sendMode === 'seance' ? trimmed + ' [READER_SUGGESTION]' : trimmed;

    const newMessages: Message[] = [...messages, { role: 'user', content: messageContent }];
    setMessages(newMessages);
    setInput('');
    setSuggestionsVisible(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          language,
          mode: sendMode,
          philosopher: selectedPhilosopher,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const { clean, suggestions: sugs } = parseSuggestions(data.text);
      const aiIndex = newMessages.length;
      setMessages([...newMessages, { role: 'assistant', content: clean }]);
      if (sugs && (sendMode === 'reader' || sendMode === 'seance')) {
        setSuggestionMap((prev) => ({ ...prev, [aiIndex]: sugs }));
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleSuggestionClick(text: string) {
    filledFromSuggestionRef.current = true;
    send(text, false);
  }

  function selectPhilosopherMode() {
    setMode('philosopher');
    setActiveMode('philosopher');
    setSelectedPhilosopher(null);
  }

  function selectReaderMode() {
    setMode('reader');
    setActiveMode('reader');
    setSelectedPhilosopher(null);
  }

  function selectSeanceMode() {
    setMode('seance');
    setActiveMode('seance');
    setSelectedPhilosopher(null);
  }

  function confirmPhilosopher(philosopher: string) {
    setSelectedPhilosopher(philosopher);
  }

  function goBackToModeGate() {
    setMode(null);
    setSelectedPhilosopher(null);
    setMessages([]);
    setSuggestionMap({});
    setSuggestionsVisible(true);
  }

  return {
    activeMode,
    ageVerified,
    chatRef,
    decreaseFontSize,
    downloading,
    downloadSynopsis,
    fill,
    fontSize,
    goBackToModeGate,
    handleInput,
    handleKey,
    handleSuggestionClick,
    confirmPhilosopher,
    input,
    language,
    loading,
    maxFontSize,
    messages,
    minFontSize,
    mode,
    selectPhilosopherMode,
    selectReaderMode,
    selectSeanceMode,
    selectedPhilosopher,
    send,
    setAgeVerified,
    setLanguage,
    increaseFontSize,
    suggestionMap,
    suggestions,
    suggestionsVisible,
    textareaRef,
    welcomeText,
  };
}
