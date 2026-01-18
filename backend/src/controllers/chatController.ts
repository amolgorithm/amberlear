import { Request, Response } from 'express';
import LearningProfile from '../models/LearningProfile';
import Session from '../models/Session';
import { AIService } from '../services/aiService';
import { VoiceService } from '../services/voiceService';
import { AdaptiveEngine } from '../services/adaptiveEngine';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const { message, currentTopic } = req.body;
    
    // Get user profile
    const profile = await LearningProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Get recent session
    let session = await Session.findOne({ 
      userId, 
      endTime: { $exists: false } 
    }).sort({ startTime: -1 });
    
    if (!session) {
      session = new Session({
        userId,
        messages: [],
        topicsCovered: [],
      });
    }
    
    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });
    
    // Build context
    const context = {
      userProfile: profile,
      currentTopic: currentTopic || 'general',
      recentMessages: session.messages.slice(-5).map(m => m.content),
      performanceMetrics: {
        accuracy: 0.7,
        speed: 0.8,
        engagement: 0.9,
      },
    };
    
    // Generate AI response
    const aiResponse = await AIService.generateResponse(message, context);
    
    // Generate voice if enabled
    let voiceAudioUrl: string | undefined;
    if (profile.voiceSettings.enabled) {
      const analysis = AdaptiveEngine.analyzeUserState(profile, context.recentMessages);
      const voiceResponse = await VoiceService.generateVoice(
        aiResponse.text,
        analysis.voiceParameters
      );
      
      // Extract the audioUrl from the VoiceResponse object
      if (voiceResponse) {
        voiceAudioUrl = voiceResponse.audioUrl;
      }
    }
    
    // Add assistant message
    session.messages.push({
      role: 'assistant',
      content: aiResponse.text,
      timestamp: new Date(),
      adaptations: aiResponse.adaptations,
      voiceUrl: voiceAudioUrl,
    });
    
    await session.save();
    
    res.json({
      text: aiResponse.text,
      voiceUrl: voiceAudioUrl,
      adaptations: aiResponse.adaptations,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};