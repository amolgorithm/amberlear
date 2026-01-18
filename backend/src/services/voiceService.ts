import { config } from '../config/env';

export interface VoiceParameters {
  stability: number; // 0–1
  warmth: number;    // 0–1 (mapped to similarity_boost)
  speed: number;     // UNUSED (documented, future-proof)
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
    if (!config.elevenLabsApiKey || !config.elevenLabsVoiceId) {
      console.warn('ElevenLabs not configured');
      return null;
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${config.elevenLabsVoiceId}`,
        {
          method: 'POST',
          headers: {
            Accept: 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': config.elevenLabsApiKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2', // ✅ VALID
            voice_settings: {
              stability: clamp(parameters.stability),
              similarity_boost: clamp(parameters.warmth),
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(
          `ElevenLabs error ${response.status}: ${err}`
        );
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');

      const duration = estimateDuration(text);

      return {
        audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
        duration,
        visemes: this.generateVisemeTimings(text, duration),
      };
    } catch (error) {
      console.error('Voice generation error:', error);
      return null;
    }
  }

  /**
   * Streaming (correct endpoint + model)
   */
  static async streamVoice(
    text: string,
    parameters: VoiceParameters,
    onChunk: (chunk: Uint8Array) => void
  ): Promise<void> {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${config.elevenLabsVoiceId}/stream`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': config.elevenLabsApiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: clamp(parameters.stability),
            similarity_boost: clamp(parameters.warmth),
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok || !response.body) {
      throw new Error('ElevenLabs streaming failed');
    }

    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(value);
    }
  }

  // ---------------- HELPERS ----------------

  private static generateVisemeTimings(
    text: string,
    duration: number
  ): Array<{ time: number; value: string }> {
    const words = text.split(/\s+/);
    const timePerWord = duration / words.length;

    return words.map((word, i) => ({
      time: i * timePerWord,
      value: simpleViseme(word),
    }));
  }
}

// ---------------- UTILITIES ----------------

function clamp(v: number) {
  return Math.max(0, Math.min(1, v));
}

function estimateDuration(text: string): number {
  const words = text.split(/\s+/).length;
  return (words / 150) * 60;
}

function simpleViseme(word: string): string {
  const w = word.toLowerCase();
  if (/^(m|b|p)/.test(w)) return 'M';
  if (/^(f|v)/.test(w)) return 'F';
  if (/^(th)/.test(w)) return 'T';
  if (/^(o|u)/.test(w)) return 'O';
  if (/^(e|i)/.test(w)) return 'E';
  return 'A';
}
