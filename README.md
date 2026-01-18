# AMBERLEAR - Complete Installation Guide

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amberlear
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=sk-ant-your-key
ELEVENLABS_API_KEY=your-key
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/connectors/google-drive/callback
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. MongoDB Atlas Setup

1. Create account at mongodb.com/cloud/atlas
2. Create free cluster
3. Add database user
4. Whitelist IP: 0.0.0.0/0
5. Get connection string
6. Add to backend/.env

### 4. Google Drive OAuth Setup

1. Go to console.cloud.google.com
2. Create new project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add redirect URI: http://localhost:3001/api/connectors/google-drive/callback
6. Copy client ID and secret to .env

## 📚 Features

✅ Persistent learner profiles
✅ Adaptive teaching engine
✅ Progress tracking with mastery levels
✅ Google Drive integration
✅ Notion integration
✅ AI-powered material analysis
✅ Automatic quiz generation
✅ Voice synthesis (optional)
✅ Multi-platform connectors

## 🎯 Usage

1. Register account
2. Connect learning platforms (Google Drive, Notion)
3. Sync materials
4. Start learning - AI adapts to your style
5. Track progress across topics

## 🔧 API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Connectors
- GET /api/connectors
- POST /api/connectors/google-drive/connect
- POST /api/connectors/:type/sync

### Materials
- GET /api/materials
- POST /api/materials/upload
- POST /api/materials/:id/analyze
- POST /api/materials/:id/quiz

### Learning
- POST /api/chat/message
- GET /api/progress/:userId