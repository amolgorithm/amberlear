import { Request, Response } from 'express';
import LearningProfile from '../models/LearningProfile';
import Session from '../models/Session';
import { AIService } from '../services/aiService';
import { VoiceService } from '../services/voiceService';
import { AdaptiveEngine } from '../services/adaptiveEngine';

// Define the shape of the HeyGen API response to fix TS18046
interface HeyGenTokenResponse {
  data: {
    token: string;
  };
}

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { userId, message, currentTopic } = req.body;
    
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
    
    // Generate voice if enabled (but don't fail if it errors)
    let voiceAudioUrl: string | undefined;
    if (profile.voiceSettings.enabled) {
      try {
        const analysis = AdaptiveEngine.analyzeUserState(profile, context.recentMessages);
        const voiceResponse = await VoiceService.generateVoice(
          aiResponse.text,
          analysis.voiceParameters
        );
        
        if (voiceResponse) {
          voiceAudioUrl = voiceResponse.audioUrl;
        }
      } catch (voiceError) {
        console.warn('Voice generation failed (non-critical):', voiceError instanceof Error ? voiceError.message : voiceError);
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

export const getHeyGenToken = async (req: Request, res: Response) => {
  try {
    const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: { 
        "x-api-key": process.env.HEYGEN_API_KEY as string,
        "Content-Type": "application/json"
      },
    });

    // Cast the response so TypeScript knows the structure
    const data = await response.json() as HeyGenTokenResponse;

    // This is now type-safe and won't crash nodemon
    res.json({ token: data.data.token }); 
  } catch (error) {
    console.error("HeyGen Token Error:", error);
    res.status(500).json({ error: "Failed to fetch avatar session token" });
  }
};