import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import chatRoutes from './routes/chat.routes';
import progressRoutes from './routes/progress.routes';
import connectorRoutes from './routes/connector.routes';
import materialRoutes from './routes/material.routes';
import quizRoutes from './routes/quiz.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/connectors', connectorRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/quizzes', quizRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🧠 AMBERLEAR API Server                            ║
║                                                       ║
║   Status: Running                                     ║
║   Port: ${PORT}                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║   Database: Connected                                 ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

startServer();

// ============================================================================
// backend/src/types/index.ts - UPDATED WITH NEW TYPES
// ============================================================================
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

export interface IConnector {
  userId: string;
  type: 'google_drive' | 'notion' | 'canvas' | 'github' | 'local_upload';
  status: 'connected' | 'disconnected' | 'error';
  credentials: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
  settings: {
    autoSync: boolean;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
    folderIds?: string[];
    notionDatabases?: string[];
  };
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILearningMaterial {
  _id: string;
  userId: string;
  connectorId: string;
  externalId: string;
  title: string;
  type: 'pdf' | 'document' | 'video' | 'quiz' | 'assignment' | 'notes' | 'textbook';
  category: 'study_material' | 'assignment' | 'test' | 'reference' | 'practice';
  subject?: string;
  topics: string[];
  content?: {
    text?: string;
    summary?: string;
    keyPoints?: string[];
  };
  metadata: {
    source: string;
    url?: string;
    fileSize?: number;
    pageCount?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: number;
  };
  analysis: {
    analyzed: boolean;
    concepts?: string[];
    prerequisites?: string[];
    difficulty?: number;
    qualityScore?: number;
  };
  progress: {
    status: 'not_started' | 'in_progress' | 'completed' | 'reviewed';
    completionPercentage: number;
    lastAccessed?: Date;
    timeSpent: number;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuiz {
  _id: string;
  userId: string;
  materialId?: string;
  title: string;
  subject: string;
  topics: string[];
  questions: Array<{
    id: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation?: string;
    difficulty: number;
  }>;
  settings: {
    timeLimit?: number;
    shuffleQuestions: boolean;
    showCorrectAnswers: boolean;
    allowRetake: boolean;
  };
  attempts: Array<{
    attemptId: string;
    startTime: Date;
    endTime?: Date;
    answers: Array<{
      questionId: string;
      answer: string;
      isCorrect: boolean;
      timeSpent: number;
    }>;
    score: number;
    feedback?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
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