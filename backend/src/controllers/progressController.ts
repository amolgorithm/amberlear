import { Request, Response } from 'express';
import ProgressGraph from '../models/ProgressGraph';
import { ProgressTracker } from '../services/progressTracker';

export const getProgress = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const graph = await ProgressGraph.findOne({ userId });
    if (!graph) {
      return res.status(404).json({ error: 'Progress not found' });
    }
    
    res.json(graph);
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

export const updateTopicMastery = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { topicId, performance } = req.body;
    
    await ProgressTracker.updateMastery(userId, topicId, performance);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mastery update error:', error);
    res.status(500).json({ error: 'Failed to update mastery' });
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const recommended = await ProgressTracker.getRecommendedTopics(userId);
    
    res.json({ recommendations: recommended });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};