import React, { useEffect, useRef, useState } from 'react';
import StreamingAvatar, { 
  AvatarQuality, 
  StreamingEvents, 
  TaskType 
} from "@heygen/streaming-avatar";

interface AvatarTutorProps {
  isSpeaking: boolean;
  currentText: string;
}

const AvatarTutor: React.FC<AvatarTutorProps> = ({ isSpeaking, currentText }) => {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<StreamingAvatar | null>(null);

  // Fetch token from YOUR backend
  const fetchAccessToken = async (): Promise<string> => {
    const token = localStorage.getItem('amberlear_token');
    
    // Changed from localhost:5000 to match your backend port
    const response = await fetch('http://localhost:3001/api/chat/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend token error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return data.token;
  };

  const startSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from backend
      const token = await fetchAccessToken();
      console.log('✓ Got token from backend');
      
      // Create avatar instance
      const avatar = new StreamingAvatar({ token });
      avatarRef.current = avatar;

      // Set up event listeners
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log('✓ Stream ready');
        if (event.detail && videoRef.current) {
          videoRef.current.srcObject = event.detail;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
              .then(() => {
                console.log('✓ Video playing');
                setInitialized(true);
                setLoading(false);
              })
              .catch(err => {
                console.error('Video play error:', err);
                setError(`Video play failed: ${err.message}`);
                setLoading(false);
              });
          };
        }
      });

      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        setInitialized(false);
      });

      // Start the avatar - following the docs example exactly
      console.log('Starting avatar...');
      const sessionData = await avatar.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: 'Wayne_20240711', // From the docs
      });
      
      console.log('✓ Avatar started, session:', sessionData.session_id);
      setSessionId(sessionData.session_id);

    } catch (err: any) {
      console.error("❌ Avatar failed:", err);
      setError(err.message || 'Unknown error');
      setLoading(false);
    }
  };

  const stopSession = async () => {
    if (avatarRef.current) {
      try {
        await avatarRef.current.stopAvatar();
        console.log('Session stopped');
      } catch (err) {
        console.error('Stop error:', err);
      }
      avatarRef.current = null;
      setSessionId(null);
      setInitialized(false);
    }
  };

  // Speak when currentText changes
  useEffect(() => {
    const speak = async () => {
      if (isSpeaking && currentText && avatarRef.current && initialized) {
        try {
          console.log('Speaking:', currentText.substring(0, 30) + '...');
          await avatarRef.current.speak({
            text: currentText,
            task_type: TaskType.TALK
          });
        } catch (err) {
          console.error('Speak error:', err);
        }
      }
    };
    speak();
  }, [isSpeaking, currentText, initialized]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (avatarRef.current) {
        avatarRef.current.stopAvatar().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Video element - ALWAYS present */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          initialized ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Overlay when not initialized */}
      {!initialized && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 z-10 p-6">
          {error ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-red-400">Connection Error</h3>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 max-w-md">
                <p className="text-sm text-red-300">{error}</p>
              </div>
              <button
                onClick={startSession}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white px-8 py-3 rounded-full font-bold transition-all"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-xl font-semibold text-white">Connecting...</h3>
              <p className="text-sm text-gray-400">Starting avatar session</p>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">🎓</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Ready to Learn</h3>
                <p className="text-gray-400">Start your AI tutor session</p>
              </div>
              <button
                onClick={startSession}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-10 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Wake Up Tutor
              </button>
            </div>
          )}
        </div>
      )}

      {/* Session controls */}
      {initialized && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={stopSession}
            className="bg-red-500/90 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium backdrop-blur-sm transition-all"
          >
            End Session
          </button>
        </div>
      )}

      {/* Speaking indicator */}
      {initialized && isSpeaking && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-green-500/50">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-green-300 font-medium">Speaking...</span>
        </div>
      )}
    </div>
  );
};

export default AvatarTutor;