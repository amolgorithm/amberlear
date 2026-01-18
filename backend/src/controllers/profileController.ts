import { Request, Response } from 'express';
import LearningProfile from '../models/LearningProfile';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const profile = await LearningProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const profile = await LearningProfile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true }
    );
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const updateCognitivePreferences = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;
    
    const profile = await LearningProfile.findOneAndUpdate(
      { userId },
      { $set: { cognitivePreferences: preferences } },
      { new: true }
    );
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};