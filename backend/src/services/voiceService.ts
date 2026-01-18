import { config } from '../config/env';

export interface VoiceParameters {
  stability: number;
  warmth: number;
  speed: number;
}

export interface VoiceResponse {
  audioUrl: string;
  duration: number;
  visemes?: Array<{
    time: number;
    value: string;
  }>;
}

export class VoiceService {
  static async generateVoice(
    text: string,
    parameters: VoiceParameters
  ): Promise<VoiceResponse | null> {
    if (!config.elevenLabsApiKey) {
      console.warn('ElevenLabs API key not configured');
      return null;
    }
    
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${config.elevenLabsVoiceId}`,
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
            },
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Voice generation failed: ${response.statusText}`);
      }
      
      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      
      // Estimate duration (rough calculation: ~150 words per minute for speech)
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = (wordCount / 150) * 60; // in seconds
      
      return {
        audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
        duration: estimatedDuration,
        visemes: this.generateVisemeTimings(text, estimatedDuration),
      };
    } catch (error) {
      console.error('Voice generation error:', error);
      return null;
    }
  }
  
  /**
   * Generate approximate viseme (mouth shape) timings for lip sync
   * This is a simplified version - for production, use ElevenLabs' viseme API
   */
  private static generateVisemeTimings(
    text: string,
    duration: number
  ): Array<{ time: number; value: string }> {
    const words = text.split(/\s+/);
    const visemes: Array<{ time: number; value: string }> = [];
    const timePerWord = duration / words.length;
    
    words.forEach((word, index) => {
      const time = index * timePerWord;
      
      // Simple phoneme-to-viseme mapping
      const firstChar = word.toLowerCase()[0];
      let viseme = 'A'; // Default open mouth
      
      if (['m', 'p', 'b'].includes(firstChar)) {
        viseme = 'M'; // Closed lips
      } else if (['f', 'v'].includes(firstChar)) {
        viseme = 'F'; // Teeth on lower lip
      } else if (['th'].includes(word.toLowerCase().substring(0, 2))) {
        viseme = 'T'; // Tongue between teeth
      } else if (['o', 'u'].includes(firstChar)) {
        viseme = 'O'; // Round mouth
      } else if (['e', 'i'].includes(firstChar)) {
        viseme = 'E'; // Smile
      }
      
      visemes.push({ time, value: viseme });
    });
    
    return visemes;
  }
  
  /**
   * Stream voice generation for real-time responses
   */
  static async streamVoice(
    text: string,
    parameters: VoiceParameters,
    onChunk: (chunk: ArrayBuffer) => void
  ): Promise<void> {
    if (!config.elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }
    
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${config.elevenLabsVoiceId}/stream`,
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
            },
          }),
        }
      );
      
      if (!response.ok || !response.body) {
        throw new Error('Streaming failed');
      }
      
      const reader = response.body.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        onChunk(value.buffer);
      }
    } catch (error) {
      console.error('Voice streaming error:', error);
      throw error;
    }
  }
}