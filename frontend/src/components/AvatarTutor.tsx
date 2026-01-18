import React, { useEffect, useRef, useState } from 'react';

interface AvatarTutorProps {
  isSpeaking: boolean;
  currentText: string;
  emotionalState: {
    confidence: number;
    warmth: number;
  };
  visemes?: Array<{
    time: number;
    value: string;
  }>;
}

const AvatarTutor: React.FC<AvatarTutorProps> = ({
  isSpeaking,
  currentText,
  emotionalState,
  visemes = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentViseme, setCurrentViseme] = useState<string>('A');
  const animationFrameRef = useRef<number>();
  
  // Animate mouth based on visemes or simple animation when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setCurrentViseme('A'); // Neutral mouth
      return;
    }
    
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      if (visemes.length > 0) {
        // Use actual viseme data if available
        const currentVisemeData = visemes.find(
          (v, i) => elapsed >= v.time && (i === visemes.length - 1 || elapsed < visemes[i + 1].time)
        );
        if (currentVisemeData) {
          setCurrentViseme(currentVisemeData.value);
        }
      } else {
        // Simple animation cycle when no viseme data
        const cycle = ['A', 'E', 'O', 'A'];
        const index = Math.floor((elapsed * 4) % cycle.length);
        setCurrentViseme(cycle[index]);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpeaking, visemes]);
  
  // Draw avatar on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw avatar
    drawAvatar(ctx, width, height, currentViseme, emotionalState, isSpeaking);
  }, [currentViseme, emotionalState, isSpeaking]);
  
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={500}
        className="w-full rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20"
      />
      
      {isSpeaking && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1 bg-purple-400 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 30 + 10}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  viseme: string,
  emotionalState: { confidence: number; warmth: number },
  isSpeaking: boolean
) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Head
  ctx.fillStyle = '#F3D5B5';
  ctx.beginPath();
  ctx.ellipse(centerX, centerY - 50, 100, 120, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes
  const eyeY = centerY - 80;
  const eyeOpenness = emotionalState.confidence;
  
  // Left eye
  ctx.fillStyle = '#2D2D2D';
  ctx.beginPath();
  ctx.ellipse(centerX - 35, eyeY, 15, 18 * eyeOpenness, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Right eye
  ctx.beginPath();
  ctx.ellipse(centerX + 35, eyeY, 15, 18 * eyeOpenness, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye shine
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(centerX - 30, eyeY - 5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX + 40, eyeY - 5, 5, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyebrows
  const eyebrowY = centerY - 110;
  const eyebrowAngle = (emotionalState.warmth - 0.5) * 0.3;
  
  ctx.strokeStyle = '#8B6F47';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  
  // Left eyebrow
  ctx.beginPath();
  ctx.moveTo(centerX - 60, eyebrowY);
  ctx.lineTo(centerX - 20, eyebrowY + eyebrowAngle * 10);
  ctx.stroke();
  
  // Right eyebrow
  ctx.beginPath();
  ctx.moveTo(centerX + 60, eyebrowY);
  ctx.lineTo(centerX + 20, eyebrowY + eyebrowAngle * 10);
  ctx.stroke();
  
  // Mouth based on viseme
  drawMouth(ctx, centerX, centerY + 20, viseme, isSpeaking);
  
  // Hair
  ctx.fillStyle = '#4A3728';
  ctx.beginPath();
  ctx.ellipse(centerX, centerY - 130, 110, 80, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  
  // Body/Shoulders
  ctx.fillStyle = '#6B46C1';
  ctx.beginPath();
  ctx.moveTo(centerX - 120, height - 20);
  ctx.lineTo(centerX - 100, centerY + 80);
  ctx.lineTo(centerX + 100, centerY + 80);
  ctx.lineTo(centerX + 120, height - 20);
  ctx.closePath();
  ctx.fill();
  
  // Glow effect when speaking
  if (isSpeaking) {
    const gradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 200);
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}

function drawMouth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  viseme: string,
  isSpeaking: boolean
) {
  ctx.fillStyle = '#C4867C';
  ctx.strokeStyle = '#8B4F47';
  ctx.lineWidth = 2;
  
  switch (viseme) {
    case 'A': // Open mouth (ah)
      ctx.beginPath();
      ctx.ellipse(x, y + 5, 20, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
      
    case 'E': // Smile (ee)
      ctx.beginPath();
      ctx.arc(x, y, 30, 0.2, Math.PI - 0.2);
      ctx.stroke();
      break;
      
    case 'O': // Round mouth (oh)
      ctx.beginPath();
      ctx.ellipse(x, y + 5, 15, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
      
    case 'M': // Closed lips (mmm)
      ctx.beginPath();
      ctx.moveTo(x - 20, y);
      ctx.lineTo(x + 20, y);
      ctx.stroke();
      break;
      
    case 'F': // Teeth on lip (fff)
      ctx.beginPath();
      ctx.moveTo(x - 20, y - 5);
      ctx.lineTo(x + 20, y - 5);
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.fillRect(x - 15, y - 10, 30, 5);
      break;
      
    case 'T': // Tongue visible (th)
      ctx.beginPath();
      ctx.arc(x, y, 25, 0.3, Math.PI - 0.3);
      ctx.stroke();
      ctx.fillStyle = '#E89BA3';
      ctx.beginPath();
      ctx.ellipse(x, y + 5, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    default: // Neutral
      ctx.beginPath();
      ctx.arc(x, y, 25, 0.1, Math.PI - 0.1);
      ctx.stroke();
  }
}

export default AvatarTutor;