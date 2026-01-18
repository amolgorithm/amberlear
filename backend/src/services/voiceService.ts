import { config } from '../config/env';

export class VoiceService {
  static async generateVoice(
    text: string,
    parameters: {
      stability: number;
      warmth: number;
      speed: number;
    }
  ): Promise<string | null> {
    if (!config.elevenLabsApiKey) {
      console.warn('ElevenLabs API key not configured');
      return null;
    }
    
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': config.elevenLabsApiKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: parameters.stability,
              similarity_boost: parameters.warmth,
              speed: parameters.speed,
            },
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Voice generation failed');
      }
      
      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      
      return `data:audio/mpeg;base64,${base64Audio}`;
    } catch (error) {
      console.error('Voice generation error:', error);
      return null;
    }
  }
}