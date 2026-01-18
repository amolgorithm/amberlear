import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, User, BookOpen } from 'lucide-react';
import AvatarTutor from './components/AvatarTutor';
import { useAuth } from './hooks/useAuth';
import { useTutorChat } from './hooks/useTutorChat';

function App() {
  const { user, login, register, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(true);
  
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
      <TutorInterface userId={user.id} />
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

function TutorInterface({ userId }: { userId: string }) {
  const {
    messages,
    isSpeaking,
    isListening,
    sendMessage,
    startListening,
    stopListening,
    currentSubtitle,
  } = useTutorChat(userId);
  
  const [inputText, setInputText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    await sendMessage(inputText);
    setInputText('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avatar Section */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <AvatarTutor
            isSpeaking={isSpeaking}
            currentText={currentSubtitle}
            emotionalState={{
              confidence: 0.7,
              warmth: 0.8,
            }}
          />
          
          {/* Subtitle Display */}
          <div className="mt-6 min-h-[80px] bg-gray-900 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-300 text-center italic">
              {currentSubtitle || (isSpeaking ? '...' : 'Ready to learn!')}
            </p>
          </div>
        </div>
        
        {/* Chat Section */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 flex flex-col">
          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[500px]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  {msg.adaptations && msg.adaptations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.adaptations.map((adapt, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-800 px-2 py-1 rounded-full text-purple-300"
                        >
                          {adapt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Input Section */}
          <div className="p-6 border-t border-gray-700">
            <div className="flex gap-3">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-3 rounded-full transition-all ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                Send
              </button>
              
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-3 rounded-full transition-all ${
                  voiceEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
            
            {isListening && (
              <p className="mt-2 text-sm text-purple-400 animate-pulse">
                Listening...
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <QuickAction
          icon="📚"
          title="Study Materials"
          description="Access your synced content"
        />
        <QuickAction
          icon="📊"
          title="Progress"
          description="Track your learning journey"
        />
        <QuickAction
          icon="⚙️"
          title="Settings"
          description="Customize your experience"
        />
      </div>
    </div>
  );
}

function QuickAction({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <button className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 text-left transition-colors">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </button>
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