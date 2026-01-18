import { ILearningProfile, IAdaptiveContext } from '../types';

export class AdaptiveEngine {
  static analyzeUserState(profile: ILearningProfile, recentMessages: string[]): {
    recommendedApproach: string;
    voiceParameters: any;
    adaptations: string[];
  } {
    const adaptations: string[] = [];
    
    // Analyze cognitive preferences
    if (profile.cognitivePreferences.visualVsVerbal > 0.6) {
      adaptations.push('visual-mode');
    }
    
    if (profile.cognitivePreferences.stepByStepVsConceptual > 0.6) {
      adaptations.push('step-by-step');
    }
    
    // Analyze emotional state
    if (profile.emotionalState.frustrationLevel > 0.5) {
      adaptations.push('slower-pace');
      adaptations.push('more-encouragement');
    }
    
    if (profile.emotionalState.confidence < 0.4) {
      adaptations.push('confidence-building');
    }
    
    // Determine voice parameters
    const voiceParameters = {
      stability: profile.emotionalState.frustrationLevel > 0.5 
        ? 0.8 
        : profile.voiceSettings.stability,
      warmth: profile.voiceSettings.warmth,
      speed: profile.emotionalState.frustrationLevel > 0.5 
        ? 0.9 
        : profile.voiceSettings.speed,
    };
    
    return {
      recommendedApproach: this.determineTeachingApproach(profile),
      voiceParameters,
      adaptations,
    };
  }
  
  private static determineTeachingApproach(profile: ILearningProfile): string {
    const prefs = profile.cognitivePreferences;
    
    if (prefs.stepByStepVsConceptual > 0.7) {
      return 'detailed-breakdown';
    } else if (prefs.stepByStepVsConceptual < 0.3) {
      return 'conceptual-overview';
    } else {
      return 'balanced';
    }
  }
  
  static updateEmotionalState(
    profile: ILearningProfile,
    messageAnalysis: {
      sentiment: number;
      complexity: number;
      responseTime: number;
    }
  ): Partial<ILearningProfile['emotionalState']> {
    const updates: Partial<ILearningProfile['emotionalState']> = {};
    
    // Update frustration based on response time and sentiment
    if (messageAnalysis.responseTime > 60000 && messageAnalysis.sentiment < 0) {
      updates.frustrationLevel = Math.min(
        (profile.emotionalState.frustrationLevel || 0) + 0.1,
        1
      );
    } else if (messageAnalysis.sentiment > 0.5) {
      updates.frustrationLevel = Math.max(
        (profile.emotionalState.frustrationLevel || 0) - 0.15,
        0
      );
    }
    
    // Update confidence based on success patterns
    if (messageAnalysis.sentiment > 0.7) {
      updates.confidence = Math.min(
        (profile.emotionalState.confidence || 0) + 0.05,
        1
      );
      updates.recentSuccesses = (profile.emotionalState.recentSuccesses || 0) + 1;
    }
    
    return updates;
  }
}