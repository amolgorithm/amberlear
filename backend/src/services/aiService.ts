import { ILearningProfile, IAdaptiveContext } from '../types';
import { AdaptiveEngine } from './adaptiveEngine';

export class AIService {
  private static readonly SYSTEM_PROMPT = `You are an adaptive AI tutor for AMBERLEAR, a personalized learning platform.

Your core responsibilities:
1. Teach based on the user's learning profile and preferences
2. Adapt your explanations to their cognitive style
3. Monitor emotional state and adjust accordingly
4. Use learning simulations, not just explanations
5. Track what works and what doesn't

You are NOT a generic chatbot. You are a persistent tutor who remembers everything about this learner.`;

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
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            { role: 'user', content: prompt }
          ],
          system: this.SYSTEM_PROMPT,
        }),
      });
      
      const data = await response.json();
      const text = data.content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text)
        .join('\n');
      
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

Respond as their adaptive tutor, considering their profile and current state. Use the "${approach}" teaching approach.`;
  }
}