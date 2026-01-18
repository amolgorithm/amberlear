import { Request, Response } from 'express';
import LearningMaterial from '../models/LearningMaterial';
import { MaterialAnalyzer } from '../services/materialAnalyzer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const getMaterials = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { category, subject, status } = req.query;

    const query: any = { userId };
    if (category) query.category = category;
    if (subject) query.subject = subject;
    if (status) query['progress.status'] = status;

    const materials = await LearningMaterial.find(query).sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ error: 'Failed to get materials' });
  }
};

export const getMaterialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const material = await LearningMaterial.findOne({ _id: id, userId });
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ error: 'Failed to get material' });
  }
};

function determineType(ext: string): string {
  const typeMap: Record<string, string> = {
    '.pdf': 'pdf',
    '.doc': 'document',
    '.docx': 'document',
    '.txt': 'notes',
    '.md': 'notes',
  };
  return typeMap[ext] || 'document';
}

export const uploadMaterial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const file = req.file;
    const { title, category, subject, topics } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file content if it's a PDF or text file
    let content;
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (fileExt === '.txt') {
      content = fs.readFileSync(file.path, 'utf-8');
    }
    // For PDF, you'd use a library like pdf-parse

    const material = new LearningMaterial({
      userId,
      connectorId: 'local_upload',
      externalId: uuidv4(),
      title: title || file.originalname,
      type: determineType(fileExt),
      category: category || 'study_material',
      subject,
      topics: topics ? JSON.parse(topics) : [],
      content: content ? { text: content } : undefined,
      metadata: {
        source: 'local_upload',
        fileSize: file.size,
      },
      analysis: {
        analyzed: false,
      },
      progress: {
        status: 'not_started',
        completionPercentage: 0,
        timeSpent: 0,
      },
    });

    await material.save();

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    res.status(201).json(material);
  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({ error: 'Failed to upload material' });
  }
};

export const updateMaterialProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { status, completionPercentage, timeSpent, notes } = req.body;

    const material = await LearningMaterial.findOne({ _id: id, userId });
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (status) material.progress.status = status;
    if (completionPercentage !== undefined) {
      material.progress.completionPercentage = completionPercentage;
    }
    if (timeSpent !== undefined) {
      material.progress.timeSpent += timeSpent;
    }
    if (notes) material.progress.notes = notes;

    material.progress.lastAccessed = new Date();

    await material.save();
    res.json(material);
  } catch (error) {
    console.error('Update material progress error:', error);
    res.status(500).json({ error: 'Failed to update material progress' });
  }
};

export const analyzeMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const material = await MaterialAnalyzer.analyzeMaterial(id);
    res.json(material);
  } catch (error) {
    console.error('Analyze material error:', error);
    res.status(500).json({ error: 'Failed to analyze material' });
  }
};

export const generateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const questions = await MaterialAnalyzer.generateQuizFromMaterial(id);
    res.json({ questions });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const material = await LearningMaterial.findOneAndDelete({ _id: id, userId });
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
};