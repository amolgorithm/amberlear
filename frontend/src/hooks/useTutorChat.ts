import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  adaptations?: string[];
}

export function useTutorChat(userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  
  // Speech Recognition Setup with better error handling
  useEffect(() => {
    // Check for HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setMicError('Speech recognition requires HTTPS or localhost');
      return;
    }

    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setMicError('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true; // Changed to true for better UX
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;
      
      recognitionRef.current.onstart = () => {
        console.log('✓ Speech recognition started');
        setIsListening(true);
        setMicError(null);
      };
      
      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        
        console.log('Heard:', transcript);
        
        // Only send if it's a final result
        if (result.isFinal) {
          console.log('Final transcript:', transcript);
          sendMessage(transcript);
        } else {
          // Show interim results as subtitle
          setCurrentSubtitle(`Listening: "${transcript}"...`);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        
        const errorMessages: Record<string, string> = {
          'no-speech': 'No speech detected. Please try again.',
          'audio-capture': 'Microphone not found. Please check permissions.',
          'not-allowed': 'Microphone access denied. Please allow microphone access.',
          'network': 'Network error. Please check your connection.',
          'aborted': 'Speech recognition aborted.',
        };
        
        setMicError(errorMessages[event.error] || `Error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        setCurrentSubtitle('');
      };

      console.log('✓ Speech recognition initialized');
      
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setMicError('Failed to initialize speech recognition');
    }
  }, []);
  
  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      setMicError('Speech recognition not available');
      return;
    }

    if (isListening) {
      console.log('Already listening');
      return;
    }

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      console.log('Starting speech recognition...');
      recognitionRef.current.start();
      setMicError(null);
      
    } catch (err: any) {
      console.error('Start listening error:', err);
      
      if (err.name === 'NotAllowedError') {
        setMicError('Microphone permission denied. Please allow access.');
      } else if (err.name === 'NotFoundError') {
        setMicError('No microphone found. Please connect a microphone.');
      } else {
        setMicError(`Error: ${err.message}`);
      }
    }
  }, [isListening]);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        console.log('Stopped listening');
      } catch (err) {
        console.error('Stop error:', err);
      }
    }
  }, [isListening]);
  
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Clear listening state
    setIsListening(false);
    setCurrentSubtitle('');
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
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
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.text,
        timestamp: new Date(),
        adaptations: data.adaptations,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Trigger avatar speech
      setCurrentResponse(data.text);
      setIsSpeaking(true);
      
      // Animate subtitles
      animateSubtitles(data.text);
      
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Can you try again?',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  
  const animateSubtitles = (text: string) => {
    const words = text.split(' ');
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < words.length) {
        const chunk = words.slice(Math.max(0, index - 8), index + 1).join(' ');
        setCurrentSubtitle(chunk + (index < words.length - 1 ? '...' : ''));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setCurrentSubtitle('');
          setIsSpeaking(false);
        }, 2000);
      }
    }, 400);
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);
  
  return {
    messages,
    isSpeaking,
    isListening,
    currentSubtitle,
    currentResponse,
    micError,
    sendMessage,
    startListening,
    stopListening,
  };
}