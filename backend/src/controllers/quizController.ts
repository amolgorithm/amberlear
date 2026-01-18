import { Request, Response } from 'express';
import Quiz from '../models/Quiz';
import { v4 as uuidv4 } from 'uuid';

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { subject, materialId } = req.query;

    const query: any = { userId };
    if (subject) query.subject = subject;
    if (materialId) query.materialId = materialId;

    const quizzes = await Quiz.find(query).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
};

export const getQuizById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const quiz = await Quiz.findOne({ _id: id, userId });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to get quiz' });
  }
};

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, subject, topics, questions, settings, materialId } = req.body;

    const quiz = new Quiz({
      userId,
      materialId,
      title,
      subject,
      topics,
      questions: questions.map((q: any) => ({
        ...q,
        id: uuidv4(),
      })),
      settings: settings || {
        shuffleQuestions: true,
        showCorrectAnswers: true,
        allowRetake: true,
      },
      attempts: [],
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};

export const startQuizAttempt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const quiz = await Quiz.findOne({ _id: id, userId });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const attemptId = uuidv4();
    quiz.attempts.push({
      attemptId,
      startTime: new Date(),
      answers: [],
      score: 0,
    });

    await quiz.save();

    res.json({ 
      attemptId,
      questions: quiz.questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
      })),
    });
  } catch (error) {
    console.error('Start quiz attempt error:', error);
    res.status(500).json({ error: 'Failed to start quiz attempt' });
  }
};

export const submitQuizAnswer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { attemptId, questionId, answer, timeSpent } = req.body;

    const quiz = await Quiz.findOne({ _id: id, userId });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const attempt = quiz.attempts.find(a => a.attemptId === attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

    attempt.answers.push({
      questionId,
      answer,
      isCorrect,
      timeSpent: timeSpent || 0,
    });

    await quiz.save();

    res.json({ 
      isCorrect,
      explanation: quiz.settings.showCorrectAnswers ? question.explanation : undefined,
    });
  } catch (error) {
    console.error('Submit quiz answer error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
};

export const finishQuizAttempt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { attemptId } = req.body;

    const quiz = await Quiz.findOne({ _id: id, userId });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const attempt = quiz.attempts.find(a => a.attemptId === attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    attempt.endTime = new Date();
    
    const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
    attempt.score = (correctAnswers / quiz.questions.length) * 100;

    await quiz.save();

    res.json({ 
      score: attempt.score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      timeSpent: attempt.answers.reduce((sum, a) => sum + a.timeSpent, 0),
    });
  } catch (error) {
    console.error('Finish quiz attempt error:', error);
    res.status(500).json({ error: 'Failed to finish quiz attempt' });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const quiz = await Quiz.findOneAndDelete({ _id: id, userId });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
};