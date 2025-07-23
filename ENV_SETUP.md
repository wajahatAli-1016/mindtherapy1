# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory of your project with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/mindgarden

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Groq AI API
GROQ_API_KEY=your-groq-api-key-here
```

## Environment Variables Explained

### Database
- `MONGODB_URI`: Your MongoDB connection string
- Default: `mongodb://localhost:27017/mindgarden`

### NextAuth Authentication
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js (generate a random string)
- `NEXTAUTH_URL`: Your application URL
- Default: `http://localhost:3000`

### Groq AI API
- `GROQ_API_KEY`: Your Groq API key for AI feedback generation
- Get your key from: https://console.groq.com/

## Setup Instructions

1. Create `.env.local` file in the project root
2. Copy the environment variables above
3. Replace placeholder values with your actual configuration
4. Restart your development server

## Security Notes

- Never commit `.env.local` to version control
- Keep your API keys secure
- Use different keys for development and production
- The `.env.local` file is already in `.gitignore`

## Testing AI Integration

After setting up the environment variables:

1. Start your development server: `npm run dev`
2. Create a journal entry
3. Click "🤖 Get AI Feedback" button
4. You should receive personalized AI feedback from Groq

## Fallback System

If the Groq API is unavailable or fails:
- The system will automatically fall back to hardcoded feedback
- Users will still receive supportive responses
- No functionality will be lost 