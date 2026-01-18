import mongoose, { Schema } from 'mongoose';
import { ILearningProfile } from '../types';

const learningProfileSchema = new Schema<ILearningProfile>({
  userId: {
    type: String,
    required: true,
    unique: true,
    ref: 'User',
  },
  educationLevel: {
    type: String,
    default: 'High School',
  },
  subjects: [{
    type: String,
  }],
  goals: [{
    type: String,
  }],
  cognitivePreferences: {
    visualVsVerbal: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
    },
    stepByStepVsConceptual: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
    },
    pace: {
      type: String,
      enum: ['slow', 'moderate', 'fast'],
      default: 'moderate',
    },
    difficultyTolerance: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  emotionalState: {
    confidence: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
    },
    frustrationLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    recentSuccesses: {
      type: Number,
      default: 0,
    },
    dropOffPoints: [{
      type: String,
    }],
  },
  learningBehavior: {
    timeSpentPerTopic: {
      type: Map,
      of: Number,
      default: {},
    },
    repetitionFrequency: {
      type: Map,
      of: Number,
      default: {},
    },
    mistakePatterns: [{
      topic: String,
      mistakes: [String],
      timestamp: Date,
    }],
    responseLatency: {
      type: Number,
      default: 0,
    },
  },
  voiceSettings: {
    enabled: {
      type: Boolean,
      default: true,
    },
    warmth: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1,
    },
    speed: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0,
    },
    stability: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1,
    },
  },
}, {
  timestamps: true,
});

export default mongoose.model<ILearningProfile>('LearningProfile', learningProfileSchema);