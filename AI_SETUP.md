# AI Summary Setup for MindGarden

This guide explains how to set up the AI summary functionality for your journal entries.

## Prerequisites

1. An OpenAI API key
2. A `.env.local` file in your project root

## Setup Instructions

### 1. Get a Groq API Key

1. Go to [Groq's console](https://console.groq.com/)
2. Sign up or log in to your account
3. Navigate to the API keys section
4. Create a new API key
5. Copy the API key (it starts with `gsk_`)

### 2. Create Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here-make-it-long-and-random
NEXTAUTH_URL=http://localhost:3000

# MongoDB Connection
MONGODB_URI=mongodb://127.0.0.1:27017/mindgarden

# Groq AI API Key
GROQ_API_KEY=your-groq-api-key-here
```

### 3. Generate a Secure Secret

For the `NEXTAUTH_SECRET`, you can generate a secure random string:

```bash
# On macOS/Linux
openssl rand -base64 32

# Or use an online generator
# https://generate-secret.vercel.app/32
```

### 4. Restart Your Development Server

After adding the environment variables, restart your development server:

```bash
npm run dev
```

## How It Works

### Automatic AI Summaries

When you create a new journal entry, the system will automatically generate an AI summary in the background. The summary focuses on:

- Emotional tone and themes
- Key insights from your writing
- Empathetic understanding of your thoughts

### Manual AI Summary Generation

For existing entries without summaries, you can:

1. **From the Journal List**: Click the "🤖 Generate AI Summary" button on any entry card
2. **From Individual Entry Page**: Click the "🤖 Generate AI Summary" button at the bottom of the entry

### Regenerating Summaries

If you want a different summary for an existing entry:

1. Go to the individual entry page
2. Click the "🔄 Regenerate" button in the AI Summary section

## Features

- **Asynchronous Processing**: AI summaries are generated in the background, so your journal creation isn't slowed down
- **Error Handling**: If AI generation fails, your journal entry is still saved
- **Responsive Design**: Works on both desktop and mobile devices
- **User-Friendly**: Clear buttons and loading states

## Troubleshooting

### AI Summary Not Generating

1. **Check API Key**: Ensure your `GROQ_API_KEY` is correct and has sufficient credits
2. **Check Console**: Look for error messages in your browser's developer console
3. **Check Server Logs**: Look for error messages in your terminal where the dev server is running

### Common Issues

- **"Groq API key not found"**: Make sure your `.env.local` file is in the project root
- **"Failed to generate AI summary"**: Check your Groq API key and account status
- **"Unauthorized"**: Make sure you're logged in to your account

## Cost Considerations

- Groq offers fast and cost-effective AI processing
- Each summary typically uses 50-150 tokens
- Monitor your usage at [Groq's console](https://console.groq.com/)

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- Your API key is only used server-side and never exposed to the client 