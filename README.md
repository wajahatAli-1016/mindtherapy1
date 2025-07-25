# 🌱 MindGarden - Your Mental Health Companion

A therapeutic journaling and mood tracking application with AI-powered insights to support your mental health journey.

## ✨ Features

- **📝 Therapeutic Journaling**: Write and reflect on your thoughts with AI-powered summaries
- **😊 Mood Tracking**: Monitor your emotional patterns over time
- **🤖 AI Chatbot**: Get therapeutic support and guidance through AI conversations
- **📊 Session Management**: Track your therapy sessions with automatic session ending
- **📈 Insights Dashboard**: Visualize your mental health journey with charts and analytics
- **🔐 Secure Authentication**: Safe and private user accounts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Groq API key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindgarden.git
   cd mindgarden
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **AI Integration**: Groq API
- **Styling**: CSS Modules
- **Deployment**: Vercel (recommended)

## 📱 Usage

1. **Sign up** for a new account or **login** with existing credentials
2. **Start journaling** by creating new entries with mood tracking
3. **Chat with AI** for therapeutic support and guidance
4. **Track your progress** through the dashboard analytics
5. **Review your journey** with AI-generated insights and summaries

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |
| `NEXTAUTH_URL` | Your application URL | Yes |
| `GROQ_API_KEY` | Groq API key for AI features | Yes |

### Database Setup

The application uses MongoDB with the following collections:
- `users` - User accounts and authentication
- `journalentries` - Journal entries with AI summaries
- `moods` - Mood tracking data
- `sessions` - Therapy session management
- `chatbotconversations` - AI chat history

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- NextAuth.js for secure authentication
- Groq for AI capabilities
- MongoDB for reliable data storage

---

**Made with ❤️ for mental health awareness and support**#   m i n d t h e r a p y 1  
 