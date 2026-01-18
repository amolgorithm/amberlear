# AMBERLEAR - AI-Powered Adaptive Learning Platform

> Your personal AI tutor with real-time voice interaction and animated avatar

## 🌟 Key Features

### Real-Time AI Tutor Avatar
- **Animated character** that talks to you with synchronized lip movements
- **Voice synthesis** powered by ElevenLabs
- **Live subtitles** showing what the tutor is saying
- **Emotional expressions** that adapt to your learning state

### Adaptive Learning Engine
- **Persistent learner profiles** that remember your preferences
- **Dynamic teaching strategies** based on your cognitive style
- **Emotional state tracking** to detect frustration and boost confidence
- **Progress visualization** across topics and subjects

### Multi-Platform Integration
- **Google Drive** - Automatically sync study materials
- **Notion** - Import your notes and databases
- **Canvas LMS** - Connect to your courses (optional)
- **Local uploads** - Add any PDF, document, or notes

### AI-Powered Features
- **Automatic material analysis** using Gemini AI
- **Quiz generation** from your study materials
- **Concept mapping** and prerequisite tracking
- **Personalized recommendations** based on your progress

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Gemini API key (from Google AI Studio)
- ElevenLabs API key (for voice synthesis)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd amberlear

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Setup Environment Variables

Create `backend/.env` file:

```env
# Server
PORT=3001
NODE_ENV=development

# Database - Get from MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amberlear

# Security
JWT_SECRET=your-super-secret-key-min-32-characters

# AI - Get from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key

# Voice - Get from https://elevenlabs.io
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Google Drive OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/connectors/google-drive/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Setup MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 Sandbox)
3. Create a database user (username/password)
4. Whitelist your IP: `0.0.0.0/0` (allow all for development)
5. Get your connection string and add to `.env`

### 4. Get API Keys

**Gemini API (Required - Free tier available):**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key
3. Copy to `GEMINI_API_KEY` in `.env`

**ElevenLabs API (Required for voice):**
1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Go to Profile → API Keys
3. Copy to `ELEVENLABS_API_KEY` in `.env`
4. Browse voices and update `ELEVENLABS_VOICE_ID` if desired

### 5. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit: **http://localhost:5173**

## 🎯 How It Works

### The Avatar Tutor Experience

1. **Sign up** and create your learning profile
2. **Talk or type** - Use voice input or text chat
3. **Watch the avatar** respond with synchronized lip movements
4. **See subtitles** in real-time as the tutor speaks
5. **Get adaptive responses** based on your learning style

### Behind the Scenes

```
User Input (Voice/Text)
    ↓
Gemini AI (Context-Aware Response)
    ↓
ElevenLabs (Voice Synthesis + Visemes)
    ↓
Avatar Animation (Lip Sync)
    ↓
Audio Playback + Subtitles
```

### Adaptive Teaching

The system tracks:
- **Response times** - Detects confusion
- **Success patterns** - Builds confidence
- **Mistake patterns** - Identifies knowledge gaps
- **Learning pace** - Adjusts difficulty
- **Emotional state** - Provides encouragement

## 📚 API Endpoints

### Authentication
```
POST /api/auth/register - Create account
POST /api/auth/login    - Sign in
POST /api/auth/refresh  - Refresh token
```

### Chat (Real-time Tutor)
```
POST /api/chat/message - Send message, get AI response with voice
```

### Learning Materials
```
GET    /api/materials           - List all materials
POST   /api/materials/upload    - Upload new material
POST   /api/materials/:id/analyze - AI analysis
POST   /api/materials/:id/quiz  - Generate quiz
PUT    /api/materials/:id/progress - Update progress
DELETE /api/materials/:id       - Remove material
```

### Progress Tracking
```
GET  /api/progress/:userId              - Get progress graph
POST /api/progress/:userId/mastery      - Update topic mastery
GET  /api/progress/:userId/recommendations - Get next topics
```

### Connectors
```
GET  /api/connectors                    - List connections
POST /api/connectors/google-drive/connect - Connect Google Drive
POST /api/connectors/:type/sync         - Sync materials
```

## 🎨 Customization

### Avatar Appearance

Edit `frontend/src/components/AvatarTutor.tsx`:

```typescript
// Change colors
ctx.fillStyle = '#F3D5B5';  // Skin tone
ctx.fillStyle = '#4A3728';  // Hair color
ctx.fillStyle = '#6B46C1';  // Clothing color
```

### Voice Settings

In `backend/.env`:
```env
# Try different voices from ElevenLabs
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Rachel (default)
# Or: EXAVITQu4vr4xnSDxMaL (Bella)
# Or: pNInz6obpgDQGcFmaJgB (Adam)
```

### Learning Profile Defaults

Edit `backend/src/models/LearningProfile.ts` to change default preferences.

## 🔧 Troubleshooting

### Voice not working?
- Check ElevenLabs API key is valid
- Ensure browser allows audio playback
- Check browser console for errors

### Avatar not animating?
- Verify canvas is rendering (check browser dev tools)
- Check that `isSpeaking` prop is updating

### Google Drive sync failing?
- Verify OAuth credentials in Google Console
- Check redirect URI matches exactly
- Ensure Google Drive API is enabled

### Gemini API errors?
- Verify API key is correct
- Check you haven't exceeded free tier limits
- Review rate limiting in Gemini console

## 📖 Development

### Backend Stack
- **Express.js** - REST API
- **MongoDB/Mongoose** - Data persistence
- **JWT** - Authentication
- **Gemini AI** - Conversational responses
- **ElevenLabs** - Voice synthesis

### Frontend Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Canvas API** - Avatar rendering
- **Web Speech API** - Voice input

### Project Structure

```
amberlear/
├── backend/
│   ├── src/
│   │   ├── config/       # DB, env config
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # MongoDB schemas
│   │   ├── services/     # AI, voice, adaption
│   │   ├── middleware/   # Auth, errors
│   │   └── routes/       # API routes
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/   # Avatar, UI components
    │   ├── hooks/        # useAuth, useTutorChat
    │   └── App.tsx       # Main application
    └── .env
```

## 🚀 Deployment

### Backend (Render, Railway, or Heroku)

1. Push to Git repository
2. Connect to hosting service
3. Set environment variables
4. Deploy!

### Frontend (Vercel or Netlify)

1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set API URL environment variable

## 🤝 Contributing

We welcome contributions! Areas for improvement:

- [ ] More avatar customization options
- [ ] Additional voice providers
- [ ] Enhanced viseme accuracy (ElevenLabs speech marks API)
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Spaced repetition algorithm
- [ ] Collaborative study sessions

## 📄 License

MIT License - See LICENSE file

## 🙏 Acknowledgments

- **Gemini AI** - Conversational intelligence
- **ElevenLabs** - Realistic voice synthesis
- **MongoDB** - Flexible data storage
- **Tailwind CSS** - Beautiful UI components

---

Questions? Open an issue or reach out!