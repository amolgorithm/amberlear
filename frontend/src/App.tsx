import React, { useState } from 'react';
import { Mic, MicOff, BookOpen, User, MessageSquare, X } from 'lucide-react';
import AvatarTutor from './components/AvatarTutor';
import { useAuth } from './hooks/useAuth';
import { useTutorChat } from './hooks/useTutorChat';

function App() {
  const { user, login, register, logout } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <AuthScreen onLogin={login} onRegister={register} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header user={user} onLogout={logout} />
      <VoiceFirstInterface userId={user.id} />
    </div>
  );
}

function Header({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-purple-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AMBERLEAR
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-300">{user.name}</span>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function VoiceFirstInterface({ userId }: { userId: string }) {
  const {
    messages,
    isSpeaking,
    isListening,
    currentSubtitle,
    currentResponse,
    sendMessage,
    startListening,
    stopListening,
  } = useTutorChat(userId);
  
  const [chatOpen, setChatOpen] = useState(false);
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Main Avatar Section - Full Width */}
        <div className="space-y-4">
          <AvatarTutor
            isSpeaking={isSpeaking}
            currentText={currentResponse}
          />
          
          {/* Subtitle Display */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 min-h-[100px] flex items-center justify-center">
            <p className="text-gray-300 text-center text-lg leading-relaxed max-w-4xl">
              {currentSubtitle || (isSpeaking ? '...' : 'Ready to help you learn! Click the microphone to speak.')}
            </p>
          </div>
          
          {/* Voice Control Center */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6">
              <h2 className="text-2xl font-bold text-white">Voice Control</h2>
              
              {/* Large Mic Button */}
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking}
                className={`relative group ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                } ${isSpeaking ? 'opacity-50 cursor-not-allowed' : ''} 
                p-12 rounded-full transition-all shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 disabled:transform-none disabled:hover:shadow-none`}
                title={isListening ? 'Stop listening' : 'Start speaking'}
              >
                {isListening ? (
                  <MicOff className="w-16 h-16 text-white" />
                ) : (
                  <Mic className="w-16 h-16 text-white" />
                )}
                
                {/* Pulse rings when listening */}
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" />
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-30" />
                  </>
                )}
              </button>
              
              {/* Status Text */}
              <div className="text-center">
                {isListening && (
                  <p className="text-xl text-red-300 font-semibold animate-pulse">
                    🎤 Listening...
                  </p>
                )}
                {isSpeaking && (
                  <p className="text-xl text-green-300 font-semibold">
                    🗣️ Tutor is speaking...
                  </p>
                )}
                {!isListening && !isSpeaking && (
                  <p className="text-lg text-gray-400">
                    Click the microphone to ask a question
                  </p>
                )}
              </div>
              
              {/* Instructions */}
              <div className="bg-black/30 rounded-lg p-4 max-w-2xl">
                <p className="text-sm text-gray-300 text-center">
                  <strong className="text-purple-300">How to use:</strong> Click the microphone, 
                  speak your question, then release. The tutor will respond with voice and visuals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Sidebar - Minimized by Default */}
      <ChatSidebar 
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        messages={messages}
        onSendMessage={sendMessage}
      />
    </div>
  );
}

function ChatSidebar({ 
  isOpen, 
  onToggle, 
  messages,
  onSendMessage 
}: { 
  isOpen: boolean;
  onToggle: () => void;
  messages: any[];
  onSendMessage: (text: string) => void;
}) {
  const [inputText, setInputText] = useState('');
  
  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <>
      {/* Toggle Button - Always Visible */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all z-50"
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {messages.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </button>
      
      {/* Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-gray-800 border-l border-gray-700 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">Chat History</h3>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 px-6">
                <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Your conversation history will appear here</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.adaptations && msg.adaptations.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {msg.adaptations.map((adapt: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-purple-300"
                          >
                            {adapt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-gray-700 bg-gray-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-sm"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Or use voice control for hands-free interaction
            </p>
          </div>
        </div>
      </div>
      
      {/* Overlay when chat is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
}

function AuthScreen({ onLogin, onRegister }: { onLogin: any; onRegister: any }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await onLogin(formData.email, formData.password);
    } else {
      await onRegister(formData.email, formData.name, formData.password);
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AMBERLEAR
        </h1>
        <p className="text-gray-400 mt-2">Your AI-powered learning companion</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            required
          />
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          required
        />
        
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all"
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      
      <p className="text-center mt-6 text-gray-400">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-purple-400 hover:text-purple-300 font-semibold"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}

export default App;