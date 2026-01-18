import ProgressGraph from '../models/ProgressGraph';
import { IProgressNode } from '../types';

export class ProgressTracker {
  static async updateMastery(
    userId: string,
    topicId: string,
    performance: number
  ): Promise<void> {
    const graph = await ProgressGraph.findOne({ userId });
    if (!graph) return;
    
    const node = graph.nodes.find(n => n.id === topicId);
    if (!node) return;
    
    // Weighted update: 70% old mastery + 30% new performance
    const newMastery = (node.mastery * 0.7) + (performance * 0.3);
    node.mastery = Math.min(newMastery, 1);
    
    // Update status
    if (node.mastery >= 0.8) {
      node.status = 'mastered';
    } else if (node.mastery >= 0.3) {
      node.status = 'learning';
    }
    
    node.lastStudied = new Date();
    
    await graph.save();
    
    // Unlock dependent nodes
    await this.unlockDependentNodes(userId, topicId);
  }
  
  private static async unlockDependentNodes(
    userId: string,
    masteredTopicId: string
  ): Promise<void> {
    const graph = await ProgressGraph.findOne({ userId });
    if (!graph) return;
    
    const masteredNode = graph.nodes.find(n => n.id === masteredTopicId);
    if (!masteredNode || masteredNode.status !== 'mastered') return;
    
    // Find nodes that depend on this one
    const dependentEdges = graph.edges.filter(e => e.from === masteredTopicId);
    
    for (const edge of dependentEdges) {
      const dependentNode = graph.nodes.find(n => n.id === edge.to);
      if (!dependentNode) continue;
      
      // Check if all prerequisites are mastered
      const allPrereqsMastered = dependentNode.prerequisites.every(prereqId => {
        const prereqNode = graph.nodes.find(n => n.id === prereqId);
        return prereqNode && prereqNode.status === 'mastered';
      });
      
      if (allPrereqsMastered && dependentNode.status === 'locked') {
        dependentNode.status = 'learning';
      }
    }
    
    await graph.save();
  }
  
  static async getRecommendedTopics(userId: string): Promise<IProgressNode[]> {
    const graph = await ProgressGraph.findOne({ userId });
    if (!graph) return [];
    
    // Find topics currently in "learning" state with mastery < 0.7
    const learningTopics = graph.nodes.filter(
      n => n.status === 'learning' && n.mastery < 0.7
    );
    
    // Sort by: lowest mastery first (needs most work)
    return learningTopics.sort((a, b) => a.mastery - b.mastery).slice(0, 3);
  }
}