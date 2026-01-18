import mongoose, { Schema } from 'mongoose';
import { IProgressGraph } from '../types';

const progressGraphSchema = new Schema<IProgressGraph>({
  userId: {
    type: String,
    required: true,
    unique: true,
    ref: 'User',
  },
  nodes: [{
    id: String,
    name: String,
    subject: String,
    mastery: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    status: {
      type: String,
      enum: ['locked', 'learning', 'mastered'],
      default: 'locked',
    },
    prerequisites: [String],
    lastStudied: Date,
    timeSpent: {
      type: Number,
      default: 0,
    },
  }],
  edges: [{
    from: String,
    to: String,
    strength: Number,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IProgressGraph>('ProgressGraph', progressGraphSchema);