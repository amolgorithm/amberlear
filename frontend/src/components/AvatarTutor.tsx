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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<StreamingAvatar | null>(null);

  // FETCH TOKEN FROM YOUR BACKEND (Not HeyGen directly)
  const fetchAccessToken = async (): Promise<string> => {
    const response = await fetch('http://localhost:5000/api/get-heygen-token', {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Backend failed to provide token: ${response.status}`);
    }
    
    const data = await response.json();
    return data.token;
  };

  const startSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await fetchAccessToken();
      const avatar = new StreamingAvatar({ token });
      avatarRef.current = avatar;

      // Listen for the stream
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        if (event.detail && videoRef.current) {
          videoRef.current.srcObject = event.detail;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.error);
            setInitialized(true);
            setLoading(false);
          };
        }
      });

      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        setInitialized(false);
      });

      // START AVATAR
      await avatar.createStartAvatar({
        quality: AvatarQuality.Medium,
        avatarName: 'Wayne_20240711', // Documentation verified ID
      });

    } catch (err: any) {
      console.error("Avatar start failed:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const stopSession = async () => {
    if (avatarRef.current) {
      await avatarRef.current.stopAvatar();
      avatarRef.current = null;
      setInitialized(false);
    }
  };

  // Trigger speech when currentText changes
  useEffect(() => {
    if (isSpeaking && currentText && avatarRef.current && initialized) {
      avatarRef.current.speak({
        text: currentText,
        task_type: TaskType.TALK
      }).catch(console.error);
    }
  }, [isSpeaking, currentText, initialized]);

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        style={{ display: initialized ? 'block' : 'none' }}
      />

      {!initialized && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          {error ? (
            <div className="text-red-400">
              <p className="font-bold">Error: {error}</p>
              <button onClick={startSession} className="mt-4 bg-white/10 px-4 py-2 rounded">Retry</button>
            </div>
          ) : (
            <button
              onClick={startSession}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold transition-all"
            >
              {loading ? "Waking up..." : "Wake Up Tutor"}
            </button>
          )}
        </div>
      )}

      {initialized && (
        <button 
          onClick={stopSession}
          className="absolute bottom-4 right-4 bg-red-500/80 hover:bg-red-500 text-white text-xs px-3 py-1 rounded"
        >
          End Session
        </button>
      )}
    </div>
  );
};

export default AvatarTutor;