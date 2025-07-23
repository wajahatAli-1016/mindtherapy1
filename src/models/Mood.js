import mongoose from 'mongoose';

const MoodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mood: {
        type: String,
        required: true
    },
    intensity:{
        type: Number,
        required:true,
    },
    note:{
        type:String,
        required:false
    },
    journalEntry: { type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' },
    createdAt:{
        type:Date,
        default:Date.now
    }
})
const Mood = mongoose.models.Mood || mongoose.model('Mood', MoodSchema);

export default Mood;