import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  messageLog: {
    type: [{
      type: {
        type: String,
        enum: ['journal', 'mood', 'feedback', 'chatbot'],
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
    }],
    default: []
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ startedAt: -1 });

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session; 