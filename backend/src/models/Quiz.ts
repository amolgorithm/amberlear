import mongoose, { Schema } from 'mongoose';

export interface IQuiz {
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

const quizSchema = new Schema<IQuiz>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  materialId: {
    type: String,
    ref: 'LearningMaterial',
  },
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  topics: [String],
  questions: [{
    id: String,
    type: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'short_answer', 'essay'],
      required: true,
    },
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    difficulty: Number,
  }],
  settings: {
    timeLimit: Number,
    shuffleQuestions: {
      type: Boolean,
      default: true,
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true,
    },
    allowRetake: {
      type: Boolean,
      default: true,
    },
  },
  attempts: [{
    attemptId: String,
    startTime: Date,
    endTime: Date,
    answers: [{
      questionId: String,
      answer: String,
      isCorrect: Boolean,
      timeSpent: Number,
    }],
    score: Number,
    feedback: String,
  }],
}, {
  timestamps: true,
});

quizSchema.index({ userId: 1, subject: 1 });

export default mongoose.model<IQuiz>('Quiz', quizSchema);