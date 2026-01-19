import React, { useState } from 'react';
import { Mic, MicOff, BookOpen, User, MessageSquare, X, AlertCircle } from 'lucide-react';
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
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      <Header user={user} onLogout={logout} />
      <VoiceFirstInterface userId={user.id} />
    </div>
  );
}

function Header({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex-shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-purple-400" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AMBERLEAR
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">{user.name}</span>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
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
    micError,
    sendMessage,
    startListening,
    stopListening,
  } = useTutorChat(userId);
  
  const [chatOpen, setChatOpen] = useState(false);
  
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-gray-950">
      {/* Avatar Container - Now flex-centered and padded */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0 relative">
        <div className="w-full h-full max-w-4xl max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-gray-800 bg-black/20">
          <AvatarTutor
            isSpeaking={isSpeaking}
            currentText={currentResponse}
          />
        </div>
      </div>
      
      {/* Controls overlay - Positioned relative to the layout, not absolute over video */}
      <div className="relative z-10 flex flex-col pointer-events-none">
        {/* Bottom controls */}
        <div className="pointer-events-auto bg-gradient-to-t from-gray-900 via-gray-900 to-transparent pt-4 pb-6 px-4">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Subtitle Display */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-3 border border-gray-700 min-h-[50px] flex items-center justify-center shadow-lg">
              <p className="text-gray-200 text-center text-sm md:text-base leading-relaxed">
                {currentSubtitle || (isSpeaking ? '...' : 'Ready to help you learn! Click the microphone to speak.')}
              </p>
            </div>
            
            {/* Voice Control Center */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between gap-4">
                {/* Status Text */}
                <div className="w-32">
                   {/* ... keep your micError / isListening logic ... */}
                </div>
                
                {/* Mic Button */}
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isSpeaking}
                  className={`relative ${
                    isListening ? 'bg-red-600' : 'bg-indigo-600'
                  } p-4 rounded-full transition-all z-20`}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <div className="w-32 text-right text-xs text-gray-500">
                  Chrome/Safari
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
          <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
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
          <div className="p-4 border-t border-gray-700 bg-gray-900 flex-shrink-0">
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
  
  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(formData.email, formData.password);
    } else {
      onRegister(formData.email, formData.name, formData.password);
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
      
      <div className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
        
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e as any)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
        
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all"
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </div>
      
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