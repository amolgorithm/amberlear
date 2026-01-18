import { ILearningProfile, IAdaptiveContext } from '../types';
import { AdaptiveEngine } from './adaptiveEngine';
import { config } from '../config/env';

export class AIService {
  private static readonly SYSTEM_PROMPT = `You are an adaptive AI tutor for AMBERLEAR, a personalized learning platform.

Your core responsibilities:
1. Teach based on the user's learning profile and preferences
2. Adapt your explanations to their cognitive style
3. Monitor emotional state and adjust accordingly
4. Use learning simulations, not just explanations
5. Track what works and what doesn't

You are NOT a generic chatbot. You are a persistent tutor who remembers everything about this learner.

IMPORTANT: Keep responses conversational and natural for voice synthesis. Avoid excessive technical jargon unless appropriate for the user's level.`;

  static async generateResponse(
    userMessage: string,
    context: IAdaptiveContext
  ): Promise<{
    text: string;
    adaptations: string[];
  }> {
    const analysis = AdaptiveEngine.analyzeUserState(
      context.userProfile,
      context.recentMessages
    );
    
    // Build context-aware prompt
    const prompt = this.buildAdaptivePrompt(
      userMessage,
      context,
      analysis.recommendedApproach
    );
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${config.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${this.SYSTEM_PROMPT}\n\n${prompt}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, I had trouble generating a response.';
      
      return {
        text,
        adaptations: analysis.adaptations,
      };
    } catch (error) {
      console.error('AI Service error:', error);
      throw new Error('Failed to generate AI response');
    }
  }
  
  private static buildAdaptivePrompt(
    userMessage: string,
    context: IAdaptiveContext,
    approach: string
  ): string {
    const profile = context.userProfile;
    
    return `LEARNER CONTEXT:
- Current topic: ${context.currentTopic}
- Education level: ${profile.educationLevel}
- Learning preferences: ${approach}
- Visual preference: ${(profile.cognitivePreferences.visualVsVerbal * 100).toFixed(0)}%
- Current confidence: ${(profile.emotionalState.confidence * 100).toFixed(0)}%
- Frustration level: ${(profile.emotionalState.frustrationLevel * 100).toFixed(0)}%

RECENT CONVERSATION:
${context.recentMessages.slice(-3).join('\n')}

PERFORMANCE METRICS:
- Accuracy: ${(context.performanceMetrics.accuracy * 100).toFixed(0)}%
- Engagement: ${(context.performanceMetrics.engagement * 100).toFixed(0)}%

USER MESSAGE: ${userMessage}

Respond as their adaptive tutor, considering their profile and current state. Use the "${approach}" teaching approach. Keep your response conversational and suitable for voice synthesis.`;
  }
}