import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    mood: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    aiSummary: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
journalEntrySchema.index({ userId: 1, createdAt: -1 });

const JournalEntry = mongoose.models.JournalEntry || mongoose.model('JournalEntry', journalEntrySchema);

export default JournalEntry; 