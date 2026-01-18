import LearningMaterial from '../models/LearningMaterial';
import ProgressGraph from '../models/ProgressGraph';

export class MaterialAnalyzer {
  static async analyzeMaterial(materialId: string) {
    const material = await LearningMaterial.findById(materialId);
    if (!material) {
      throw new Error('Material not found');
    }

    try {
      // Use Claude to analyze the material
      const analysisPrompt = `Analyze this learning material:

Title: ${material.title}
Type: ${material.type}
Category: ${material.category}
${material.content?.text ? `Content Preview: ${material.content.text.substring(0, 1000)}...` : ''}

Provide:
1. Key concepts covered (list)
2. Prerequisites needed (list)
3. Difficulty level (0-1 scale)
4. Quality score (0-1 scale)
5. Estimated study time in minutes

Respond in JSON format only.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            { role: 'user', content: analysisPrompt }
          ],
        }),
      });

      const data = await response.json();
      const analysisText = data.content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text)
        .join('\n');

      const analysis = JSON.parse(analysisText.replace(/```json|```/g, '').trim());

      // Update material with analysis
      material.analysis = {
        analyzed: true,
        concepts: analysis.concepts || [],
        prerequisites: analysis.prerequisites || [],
        difficulty: analysis.difficulty || 0.5,
        qualityScore: analysis.qualityScore || 0.7,
      };

      material.metadata.estimatedTime = analysis.estimatedTime || 30;
      material.metadata.difficulty = this.mapDifficultyToLevel(analysis.difficulty);

      await material.save();

      // Update progress graph with new concepts
      await this.updateProgressGraphFromMaterial(material);

      return material;
    } catch (error) {
      console.error('Material analysis error:', error);
      material.analysis.analyzed = false;
      await material.save();
      throw error;
    }
  }

  private static mapDifficultyToLevel(difficulty: number): 'beginner' | 'intermediate' | 'advanced' {
    if (difficulty < 0.4) return 'beginner';
    if (difficulty < 0.7) return 'intermediate';
    return 'advanced';
  }

  private static async updateProgressGraphFromMaterial(material: ILearningMaterial) {
    const graph = await ProgressGraph.findOne({ userId: material.userId });
    if (!graph) return;

    // Add concepts as nodes if they don't exist
    if (material.analysis.concepts) {
      for (const concept of material.analysis.concepts) {
        const exists = graph.nodes.find(n => n.id === concept);
        if (!exists) {
          graph.nodes.push({
            id: concept,
            name: concept,
            subject: material.subject || 'General',
            mastery: 0,
            status: 'locked',
            prerequisites: material.analysis.prerequisites || [],
            timeSpent: 0,
          });
        }
      }

      await graph.save();
    }
  }

  static async generateQuizFromMaterial(materialId: string) {
    const material = await LearningMaterial.findById(materialId);
    if (!material) {
      throw new Error('Material not found');
    }

    const quizPrompt = `Based on this learning material, generate a quiz:

Title: ${material.title}
Concepts: ${material.analysis.concepts?.join(', ')}
Difficulty: ${material.metadata.difficulty}

Generate 10 questions covering the key concepts. Mix of:
- 6 multiple choice
- 2 true/false
- 2 short answer

For each question provide:
- question text
- type
- options (for multiple choice)
- correct answer
- brief explanation
- difficulty (0-1)

Respond in JSON format only as an array of questions.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            { role: 'user', content: quizPrompt }
          ],
        }),
      });

      const data = await response.json();
      const quizText = data.content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text)
        .join('\n');

      const questions = JSON.parse(quizText.replace(/```json|```/g, '').trim());

      return questions;
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw error;
    }
  }
}