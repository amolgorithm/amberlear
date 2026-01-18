import mongoose, { Schema } from 'mongoose';

export interface IConnector {
  userId: string;
  type: 'google_drive' | 'notion' | 'canvas' | 'github' | 'local_upload';
  status: 'connected' | 'disconnected' | 'error';
  credentials: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
  settings: {
    autoSync: boolean;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
    folderIds?: string[];
    notionDatabases?: string[];
  };
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const connectorSchema = new Schema<IConnector>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['google_drive', 'notion', 'canvas', 'github', 'local_upload'],
    required: true,
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'error'],
    default: 'disconnected',
  },
  credentials: {
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
  },
  settings: {
    autoSync: {
      type: Boolean,
      default: true,
    },
    syncFrequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily'],
      default: 'hourly',
    },
    folderIds: [String],
    notionDatabases: [String],
  },
  lastSync: Date,
}, {
  timestamps: true,
});

connectorSchema.index({ userId: 1, type: 1 }, { unique: true });

export default mongoose.model<IConnector>('Connector', connectorSchema);