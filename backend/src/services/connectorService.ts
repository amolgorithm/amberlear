import { google } from 'googleapis';
import { Client as NotionClient } from '@notionhq/client';
import Connector from '../models/Connector';
import LearningMaterial from '../models/LearningMaterial';

export class ConnectorService {
  // Google Drive Integration
  static async connectGoogleDrive(userId: string, authCode: string) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    try {
      const { tokens } = await oauth2Client.getToken(authCode);
      
      const connector = await Connector.findOneAndUpdate(
        { userId, type: 'google_drive' },
        {
          userId,
          type: 'google_drive',
          status: 'connected',
          credentials: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
          },
          lastSync: new Date(),
        },
        { upsert: true, new: true }
      );

      return connector;
    } catch (error) {
      console.error('Google Drive connection error:', error);
      throw new Error('Failed to connect Google Drive');
    }
  }

  static async syncGoogleDrive(userId: string) {
    const connector = await Connector.findOne({ userId, type: 'google_drive' });
    if (!connector || connector.status !== 'connected') {
      throw new Error('Google Drive not connected');
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: connector.credentials.accessToken,
      refresh_token: connector.credentials.refreshToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      // Query for PDF and document files
      const response = await drive.files.list({
        q: "mimeType='application/pdf' or mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'",
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime)',
        pageSize: 100,
      });

      const files = response.data.files || [];
      const materials = [];

      for (const file of files) {
        // Check if already imported
        const existing = await LearningMaterial.findOne({
          userId,
          externalId: file.id!,
        });

        if (existing) continue;

        // Categorize based on filename
        const category = this.categorizeFile(file.name!);
        const type = this.determineFileType(file.mimeType!);

        const material = new LearningMaterial({
          userId,
          connectorId: connector._id,
          externalId: file.id!,
          title: file.name!,
          type,
          category,
          topics: this.extractTopics(file.name!),
          metadata: {
            source: 'google_drive',
            url: `https://drive.google.com/file/d/${file.id}`,
            fileSize: file.size ? parseInt(file.size) : undefined,
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
        materials.push(material);
      }

      connector.lastSync = new Date();
      await connector.save();

      return materials;
    } catch (error) {
      console.error('Google Drive sync error:', error);
      connector.status = 'error';
      await connector.save();
      throw error;
    }
  }

  // Notion Integration
  static async connectNotion(userId: string, accessToken: string) {
    try {
      const notion = new NotionClient({ auth: accessToken });
      
      // Test connection by listing databases
      await notion.search({
        filter: { property: 'object', value: 'database' },
      });

      const connector = await Connector.findOneAndUpdate(
        { userId, type: 'notion' },
        {
          userId,
          type: 'notion',
          status: 'connected',
          credentials: {
            accessToken,
          },
          lastSync: new Date(),
        },
        { upsert: true, new: true }
      );

      return connector;
    } catch (error) {
      console.error('Notion connection error:', error);
      throw new Error('Failed to connect Notion');
    }
  }

  static async syncNotion(userId: string) {
    const connector = await Connector.findOne({ userId, type: 'notion' });
    if (!connector || connector.status !== 'connected') {
      throw new Error('Notion not connected');
    }

    const notion = new NotionClient({ 
      auth: connector.credentials.accessToken 
    });

    try {
      const response = await notion.search({
        filter: { property: 'object', value: 'page' },
      });

      const materials = [];

      for (const page of response.results) {
        if (page.object !== 'page') continue;

        const existing = await LearningMaterial.findOne({
          userId,
          externalId: page.id,
        });

        if (existing) continue;

        const title = this.extractNotionTitle(page);
        const category = this.categorizeFile(title);

        const material = new LearningMaterial({
          userId,
          connectorId: connector._id,
          externalId: page.id,
          title,
          type: 'notes',
          category,
          topics: [],
          metadata: {
            source: 'notion',
            url: (page as any).url,
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
        materials.push(material);
      }

      connector.lastSync = new Date();
      await connector.save();

      return materials;
    } catch (error) {
      console.error('Notion sync error:', error);
      connector.status = 'error';
      await connector.save();
      throw error;
    }
  }

  // Helper methods
  private static categorizeFile(filename: string): string {
    const lower = filename.toLowerCase();
    
    if (lower.includes('test') || lower.includes('exam') || lower.includes('quiz')) {
      return 'test';
    }
    if (lower.includes('assignment') || lower.includes('homework') || lower.includes('hw')) {
      return 'assignment';
    }
    if (lower.includes('practice') || lower.includes('exercise')) {
      return 'practice';
    }
    if (lower.includes('textbook') || lower.includes('book')) {
      return 'reference';
    }
    
    return 'study_material';
  }

  private static determineFileType(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
    if (mimeType.includes('video')) return 'video';
    return 'document';
  }

  private static extractTopics(filename: string): string[] {
    // Simple topic extraction from filename
    const topics: string[] = [];
    const lower = filename.toLowerCase();
    
    const subjects = ['math', 'calculus', 'algebra', 'physics', 'chemistry', 'biology', 'cs', 'programming'];
    subjects.forEach(subject => {
      if (lower.includes(subject)) {
        topics.push(subject);
      }
    });
    
    return topics;
  }

  private static extractNotionTitle(page: any): string {
    try {
      const titleProp = page.properties.title || page.properties.Name;
      if (titleProp && titleProp.title && titleProp.title[0]) {
        return titleProp.title[0].plain_text;
      }
    } catch (e) {
      // Ignore
    }
    return 'Untitled';
  }

  static async disconnectConnector(userId: string, type: string) {
    const connector = await Connector.findOne({ userId, type });
    if (!connector) {
      throw new Error('Connector not found');
    }

    connector.status = 'disconnected';
    connector.credentials = {};
    await connector.save();

    return connector;
  }

  static async getConnectors(userId: string) {
    return await Connector.find({ userId });
  }
}
