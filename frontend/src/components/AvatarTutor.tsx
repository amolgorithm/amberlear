import React, { useEffect, useRef, useState } from 'react';
import StreamingAvatar, { 
  AvatarQuality, 
  StreamingEvents, 
  TaskType 
} from "@heygen/streaming-avatar";

const AvatarTutor = ({ isSpeaking, currentText }: { isSpeaking: boolean, currentText: string }) => {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<StreamingAvatar | null>(null);

  // 1. Fetch Token logic from your doc
  async function fetchAccessToken(): Promise<string> {
    const apiKey = import.meta.env.VITE_HEYGEN_API_KEY;
    const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: { "x-api-key": apiKey },
    });
    const { data } = await response.json();
    return data.token;
  }

  // 2. Start Session (The "Wake Up" function)
  const startSession = async () => {
    setLoading(true);
    try {
      const token = await fetchAccessToken();
      avatarRef.current = new StreamingAvatar({ token });

      // LISTEN FOR THE STREAM (Crucial Step from Docs)
      avatarRef.current.on(StreamingEvents.STREAM_READY, (event) => {
        if (event.detail && videoRef.current) {
          videoRef.current.srcObject = event.detail;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.error);
          };
          setInitialized(true);
        }
      });

      // Initialize with "Amber" or "Wayne"
      await avatarRef.current.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: "Amber_Predictable_Public", 
      });

    } catch (error) {
      console.error("Wake up failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Speak logic
  useEffect(() => {
    if (isSpeaking && currentText && avatarRef.current && initialized) {
      avatarRef.current.speak({
        text: currentText,
        task_type: TaskType.TALK
      });
    }
  }, [isSpeaking, currentText, initialized]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
      {!initialized ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
          <button 
            onClick={startSession}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold transition-all"
          >
            {loading ? "Connecting to Amber..." : "Wake Up Tutor"}
          </button>
          {loading && <p className="text-slate-400 mt-4 animate-pulse text-sm">Setting up WebRTC Stream...</p>}
        </div>
      ) : null}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default AvatarTutor;