"use client";

import { useRef, useState, useCallback } from "react";

// Minimal typings for browsers that don't expose SpeechRecognition in lib.dom
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onresult: ((event: any) => void) | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onerror: ((event: any) => void) | null;
}

interface UseVoiceInputOptions {
  onTranscript: (text: string) => void;
  onListeningChange?: (listening: boolean) => void;
}

export function useVoiceInput({ onTranscript, onListeningChange }: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(
    () =>
      typeof window !== "undefined" &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startListening = useCallback(() => {
    if (!isSupported || typeof window === "undefined") return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      onListeningChange?.(true);
    };

    recognition.onresult = (event) => {
      const transcript = (event.results[0][0].transcript as string).trim();
      if (transcript) onTranscript(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      onListeningChange?.(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      onListeningChange?.(false);
    };

    recognition.start();
  }, [isSupported, onTranscript, onListeningChange]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isListening, isSupported, startListening, stopListening };
}
