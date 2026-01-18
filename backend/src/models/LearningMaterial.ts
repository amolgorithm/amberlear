import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningMaterial extends Document {
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

const learningMaterialSchema = new Schema<ILearningMaterial>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  connectorId: {
    type: String,
    required: true,
    ref: 'Connector',
  },
  externalId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['pdf', 'document', 'video', 'quiz', 'assignment', 'notes', 'textbook'],
    required: true,
  },
  category: {
    type: String,
    enum: ['study_material', 'assignment', 'test', 'reference', 'practice'],
    required: true,
  },
  subject: String,
  topics: [String],
  content: {
    text: String,
    summary: String,
    keyPoints: [String],
  },
  metadata: {
    source: {
      type: String,
      required: true,
    },
    url: String,
    fileSize: Number,
    pageCount: Number,
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    estimatedTime: Number,
  },
  analysis: {
    analyzed: {
      type: Boolean,
      default: false,
    },
    concepts: [String],
    prerequisites: [String],
    difficulty: Number,
    qualityScore: Number,
  },
  progress: {
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'reviewed'],
      default: 'not_started',
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    lastAccessed: Date,
    timeSpent: {
      type: Number,
      default: 0,
    },
    notes: String,
  },
}, {
  timestamps: true,
});

learningMaterialSchema.index({ userId: 1, category: 1 });
learningMaterialSchema.index({ userId: 1, subject: 1 });
learningMaterialSchema.index({ userId: 1, 'progress.status': 1 });

export default mongoose.model<ILearningMaterial>('LearningMaterial', learningMaterialSchema);