import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  adaptations?: string[];
  voiceUrl?: string;
}

export function useTutorChat(userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          sendMessage(transcript);
          setIsListening(false);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);
  
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);
  
  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    
    try {
      const token = localStorage.getItem('amberlear_token');
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          message: content,
          currentTopic: 'general',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.text,
        timestamp: new Date(),
        adaptations: data.adaptations,
        voiceUrl: data.voiceUrl,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Play voice response
      if (data.voiceUrl) {
        playVoiceResponse(data.voiceUrl, data.text);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };
  
  const playVoiceResponse = (audioUrl: string, text: string) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    setIsSpeaking(true);
    setCurrentSubtitle(text);
    
    // Animate subtitles word by word
    const words = text.split(' ');
    let wordIndex = 0;
    const wordsPerSecond = 2.5; // Average speaking speed
    const intervalMs = 1000 / wordsPerSecond;
    
    const subtitleInterval = setInterval(() => {
      if (wordIndex < words.length) {
        const displayWords = words.slice(Math.max(0, wordIndex - 10), wordIndex + 1);
        setCurrentSubtitle(displayWords.join(' ') + (wordIndex < words.length - 1 ? '...' : ''));
        wordIndex++;
      } else {
        clearInterval(subtitleInterval);
      }
    }, intervalMs);
    
    audio.onended = () => {
      setIsSpeaking(false);
      setCurrentSubtitle('');
      audioRef.current = null;
      clearInterval(subtitleInterval);
    };
    
    audio.onerror = () => {
      console.error('Audio playback error');
      setIsSpeaking(false);
      setCurrentSubtitle('');
      audioRef.current = null;
      clearInterval(subtitleInterval);
    };
    
    audio.play().catch((error) => {
      console.error('Failed to play audio:', error);
      setIsSpeaking(false);
      setCurrentSubtitle('');
      clearInterval(subtitleInterval);
    });
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  return {
    messages,
    isSpeaking,
    isListening,
    currentSubtitle,
    sendMessage,
    startListening,
    stopListening,
  };
}