import { Request, Response } from 'express';
import { ConnectorService } from '../services/connectorService';
import { google } from 'googleapis';

export const getConnectors = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const connectors = await ConnectorService.getConnectors(userId);
    res.json(connectors);
  } catch (error) {
    console.error('Get connectors error:', error);
    res.status(500).json({ error: 'Failed to get connectors' });
  }
};

export const getOAuthUrl = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    if (type === 'google-drive') {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      const scopes = [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
      ];

      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
      });

      res.json({ url });
    } else if (type === 'notion') {
      const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${process.env.NOTION_CLIENT_ID}&response_type=code&owner=user&redirect_uri=${process.env.NOTION_REDIRECT_URI}`;
      res.json({ url: notionAuthUrl });
    } else {
      res.status(400).json({ error: 'Unsupported connector type' });
    }
  } catch (error) {
    console.error('OAuth URL error:', error);
    res.status(500).json({ error: 'Failed to generate OAuth URL' });
  }
};

export const connectGoogleDrive = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { code } = req.body;

    const connector = await ConnectorService.connectGoogleDrive(userId, code);
    
    // Trigger initial sync
    await ConnectorService.syncGoogleDrive(userId);

    res.json(connector);
  } catch (error) {
    console.error('Connect Google Drive error:', error);
    res.status(500).json({ error: 'Failed to connect Google Drive' });
  }
};

export const connectNotion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { accessToken } = req.body;

    const connector = await ConnectorService.connectNotion(userId, accessToken);
    
    // Trigger initial sync
    await ConnectorService.syncNotion(userId);

    res.json(connector);
  } catch (error) {
    console.error('Connect Notion error:', error);
    res.status(500).json({ error: 'Failed to connect Notion' });
  }
};

export const disconnectConnector = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { type } = req.params;

    const connector = await ConnectorService.disconnectConnector(userId, type);
    res.json(connector);
  } catch (error) {
    console.error('Disconnect connector error:', error);
    res.status(500).json({ error: 'Failed to disconnect connector' });
  }
};

export const syncConnector = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { type } = req.params;

    let materials;
    if (type === 'google_drive') {
      materials = await ConnectorService.syncGoogleDrive(userId);
    } else if (type === 'notion') {
      materials = await ConnectorService.syncNotion(userId);
    } else {
      return res.status(400).json({ error: 'Unsupported connector type' });
    }

    res.json({ 
      success: true, 
      materialsImported: materials.length,
      materials 
    });
  } catch (error) {
    console.error('Sync connector error:', error);
    res.status(500).json({ error: 'Failed to sync connector' });
  }
};