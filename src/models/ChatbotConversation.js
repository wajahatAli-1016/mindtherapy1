import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const chatbotConversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: false // Optional, for linking to therapy sessions
  },
  messages: {
    type: [messageSchema],
    default: []
  },
  conversationTitle: {
    type: String,
    default: 'Chatbot Conversation'
  },
  summary: {
    type: String,
    default: null
  },
  mood: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  tags: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatbotConversationSchema.index({ userId: 1, isActive: 1 });
chatbotConversationSchema.index({ startedAt: -1 });
chatbotConversationSchema.index({ sessionId: 1 });

// Virtual for conversation duration
chatbotConversationSchema.virtual('duration').get(function() {
  if (!this.endedAt) return null;
  return this.endedAt - this.startedAt;
});

// Method to add a message to the conversation
chatbotConversationSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
    metadata
  });
  return this.save();
};

// Method to end the conversation
chatbotConversationSchema.methods.endConversation = function() {
  this.isActive = false;
  this.endedAt = new Date();
  return this.save();
};

// Static method to get user's conversation history
chatbotConversationSchema.statics.getUserConversations = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ startedAt: -1 })
    .limit(limit)
    .select('conversationTitle startedAt endedAt messages.length summary mood tags');
};

const ChatbotConversation = mongoose.models.ChatbotConversation || mongoose.model('ChatbotConversation', chatbotConversationSchema);

export default ChatbotConversation; 