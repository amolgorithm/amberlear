export interface IUser {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICognitivePreferences {
  visualVsVerbal: number;
  stepByStepVsConceptual: number;
  pace: 'slow' | 'moderate' | 'fast';
  difficultyTolerance: number;
}

export interface IEmotionalState {
  confidence: number;
  frustrationLevel: number;
  recentSuccesses: number;
  dropOffPoints: string[];
}

export interface ILearningBehavior {
  timeSpentPerTopic: Record<string, number>;
  repetitionFrequency: Record<string, number>;
  mistakePatterns: Array<{
    topic: string;
    mistakes: string[];
    timestamp: Date;
  }>;
  responseLatency: number;
}

export interface ILearningProfile {
  userId: string;
  educationLevel: string;
  subjects: string[];
  goals: string[];
  cognitivePreferences: ICognitivePreferences;
  emotionalState: IEmotionalState;
  learningBehavior: ILearningBehavior;
  voiceSettings: {
    enabled: boolean;
    warmth: number;
    speed: number;
    stability: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgressNode {
  id: string;
  name: string;
  subject: string;
  mastery: number;
  status: 'locked' | 'learning' | 'mastered';
  prerequisites: string[];
  lastStudied?: Date;
  timeSpent: number;
}

export interface IProgressGraph {
  userId: string;
  nodes: IProgressNode[];
  edges: Array<{
    from: string;
    to: string;
    strength: number;
  }>;
  updatedAt: Date;
}

export interface ISession {
  userId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    adaptations?: string[];
    voiceUrl?: string;
  }>;
  startTime: Date;
  endTime?: Date;
  topicsCovered: string[];
  emotionalMetrics: {
    frustrationDetected: boolean;
    confidenceChange: number;
  };
}

export interface IAdaptiveContext {
  userProfile: ILearningProfile;
  currentTopic: string;
  recentMessages: string[];
  performanceMetrics: {
    accuracy: number;
    speed: number;
    engagement: number;
  };
}
