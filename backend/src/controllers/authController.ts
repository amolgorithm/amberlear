import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import LearningProfile from '../models/LearningProfile';
import ProgressGraph from '../models/ProgressGraph';
import { config } from '../config/env';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      email,
      name,
      passwordHash,
    });
    await user.save();
    
    // Create learning profile
    const profile = new LearningProfile({
      userId: user._id.toString(),
      subjects: [],
      goals: [],
    });
    await profile.save();
    
    // Create progress graph with initial nodes
    const progressGraph = new ProgressGraph({
      userId: user._id.toString(),
      nodes: [],
      edges: [],
    });
    await progressGraph.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};