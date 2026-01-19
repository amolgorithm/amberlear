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
  
  const recognitionRef = useRef<any>(null);
  
  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Heard:', transcript);
        sendMessage(transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);
  
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Start listening error:', err);
      }
    }
  }, [isListening]);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);
  
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
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
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  return {
    messages,
    isSpeaking,
    isListening,
    currentSubtitle,
    currentResponse, // This is what the avatar should speak
    sendMessage,
    startListening,
    stopListening,
  };
}