import mongoose, { Schema } from 'mongoose';
import { ISession } from '../types';

const sessionSchema = new Schema<ISession>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    adaptations: [String],
    voiceUrl: String,
  }],
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: Date,
  topicsCovered: [String],
  emotionalMetrics: {
    frustrationDetected: {
      type: Boolean,
      default: false,
    },
    confidenceChange: {
      type: Number,
      default: 0,
    },
  },
});

export default mongoose.model<ISession>('Session', sessionSchema);