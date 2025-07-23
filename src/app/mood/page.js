"use client"
import styles from './mood.module.css'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ensureActiveSession } from '@/lib/sessionManager';
import mind from '../../../public/mind.png'

export default function MoodTracker() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [mood, setMood] = useState(null);
    const [intensity, setIntensity] = useState(5);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [submittedMood, setSubmittedMood] = useState(null);
    const [submittedIntensity, setSubmittedIntensity] = useState(5);
      const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  
    const moodOptions = [
      { emoji: '😊', label: 'happy' },
      { emoji: '😢', label: 'sad' },
      { emoji: '😡', label: 'angry' },
      { emoji: '😴', label: 'tired' },
      { emoji: '😌', label: 'calm' }
    ];

    const getMoodMessage = (mood, intensity) => {
      const messages = {
        happy: {
          low: "It's wonderful that you're feeling happy! Even small moments of joy are worth celebrating. Consider sharing this positive energy with someone you care about.",
          moderate: "Your happiness is shining through! This is a great time to engage in activities you love or connect with friends and family.",
          high: "Wow! You're radiating pure joy! This is the perfect moment to channel this energy into creative projects or helping others feel good too."
        },
        sad: {
          low: "It's okay to feel a little down. Remember that emotions are temporary visitors. Try doing something gentle for yourself today.",
          moderate: "I can see you're going through a tough time. Remember that it's okay to not be okay. Consider reaching out to someone you trust.",
          high: "I'm here for you during this difficult time. Your feelings are valid, and it's important to be kind to yourself. Don't hesitate to seek support."
        },
        angry: {
          low: "A little frustration is normal. Try taking a few deep breaths or stepping away for a moment to help you feel more centered.",
          moderate: "Your anger is telling you something important. Try to identify what's really bothering you and address it constructively.",
          high: "Strong emotions can be overwhelming. Consider using healthy outlets like exercise, journaling, or talking to someone you trust."
        },
        tired: {
          low: "A bit of tiredness is natural. Try to listen to your body and give yourself permission to rest when needed.",
          moderate: "You seem quite tired. Remember that rest is not a luxury but a necessity. Consider taking a short break or nap.",
          high: "You're clearly exhausted. Please prioritize rest and self-care. Your body is asking for a break - honor that request."
        },
        calm: {
          low: "A gentle sense of calm is lovely. This is a good time for reflection or quiet activities that bring you peace.",
          moderate: "Your calm energy is beautiful. This balanced state is perfect for making thoughtful decisions or enjoying peaceful moments.",
          high: "You're in such a peaceful state! This deep calm is wonderful for meditation, creative work, or simply being present."
        }
      };

      let intensityLevel = 'moderate';
      if (intensity <= 3) intensityLevel = 'low';
      else if (intensity >= 8) intensityLevel = 'high';

      return messages[mood][intensityLevel];
    };



    const closeModal = () => {
      setShowModal(false);
      setModalMessage('');
      setSubmittedMood(null);
      setSubmittedIntensity(5);
    };

      // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      initializeSession();
    }
  }, [status, router]);

  const initializeSession = async () => {
    try {
      const sessionResult = await ensureActiveSession();
      if (sessionResult.success) {
        setCurrentSession(sessionResult.session);
        console.log('Session initialized:', sessionResult.session._id);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

    if (status === 'loading') {
      return (
        <div className={styles.container}>
          <div className={styles.loading}>Loading your mood tracker...</div>
        </div>
      );
    }

    const fetchMoods = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/mood?limit=10');
        if (!response.ok) {
          throw new Error('Failed to fetch moods');
        }
        const data = await response.json();
        setMoods(data.moods);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching moods:', err);
      } finally {
        setLoading(false);
      }
    };



    // Refresh moods after successful submission
    const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
        await fetch('/api/mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mood, intensity, note })
        });
        
        // Store submitted values for modal display
        setSubmittedMood(mood);
        setSubmittedIntensity(intensity);
        
        // Generate and show personalized message
        const message = getMoodMessage(mood, intensity);
        setModalMessage(message);
        setShowModal(true);
        
        // Reset form after submission
        setMood(null);
        setIntensity(5);
        setNote('');
        
        // Refresh moods list
        fetchMoods();
      } finally {
        setIsSubmitting(false);
      }
    };
  
        return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <img src={mind.src} alt="Mind Garden" className={styles.mindImage} />
            MindGarden Mood Tracker
          </h1>
          <p className={styles.subtitle}>Track your emotional journey</p>
        </div>

        <div className={styles.actions}>
          <Link href="/dashboard" className={styles.backBtn}>
            ← Back to Dashboard
          </Link>
        </div>

        <div className={styles.moodContainer}>
          <div className={styles.moodTracker}>
          <h3 className={styles.moodTitle}>🌤️ How are you feeling today?</h3>
          
          <div className={styles.moodOptions}>
            {moodOptions.map((option) => (
              <button
                key={option.label}
                className={`${styles.moodBtn} ${mood === option.label ? styles.selected : ''}`}
                onClick={() => setMood(option.label)}
              >
                <span>{option.emoji}</span>
                <span className={styles.moodLabel}>{option.label}</span>
              </button>
            ))}
          </div>

          {mood && (
            <>
              <div className={styles.intensitySlider}>
                <div className={styles.intensityLabel}>
                  <span>Intensity:</span>
                  <div>
                    <span className={styles.intensityValue}>{intensity}/10</span>
                    <span className={`${styles.intensityLevel} ${
                      intensity >= 8 ? styles.high : 
                      intensity >= 6 ? styles.moderate : 
                      styles.low
                    }`}>
                      {intensity >= 8 ? 'Very High' : 
                       intensity >= 6 ? 'High' : 
                       intensity >= 4 ? 'Moderate' : 'Low'}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className={styles.intensityRange}
                  style={{
                    background: `linear-gradient(to right, #6b7280 0%, #6b7280 ${(intensity-1)*11.1}%, #e5e7eb ${(intensity-1)*11.1}%, #e5e7eb 100%)`
                  }}
                />
                <div className={styles.intensityLabels}>
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <textarea
                placeholder="What's on your mind? (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={styles.moodTextarea}
              />

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={styles.moodButton}
              >
                {isSubmitting ? 'Saving...' : 'Save Mood Entry'}
              </button>
            </>
          )}
        </div>

        {/* Show History Button */}
        <div className={styles.historyButtonContainer}>
          <button 
            className={styles.historyButton}
            onClick={() => {
              if (!showHistory) {
                fetchMoods();
              }
              setShowHistory(!showHistory);
            }}
          >
            {showHistory ? 'Hide History' : 'Show History'}
            <span className={styles.historyButtonIcon}>
              {showHistory ? '↑' : '↓'}
            </span>
          </button>
        </div>

        {/* Mood Message Modal */}
        {showModal && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <span className={styles.modalEmoji}>
                  {moodOptions.find(option => option.label === submittedMood)?.emoji}
                </span>
                <h3 className={styles.modalTitle}>Mood Reflection</h3>
              </div>
              
              <div className={styles.modalMoodInfo}>
                <span className={styles.modalMoodLabel}>{submittedMood}</span>
                <span className={styles.modalIntensity}>
                  Intensity: {submittedIntensity}/10
                </span>
              </div>
              
              <div className={styles.modalMessage}>
                {modalMessage}
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  className={`${styles.modalButton} ${styles.secondary}`}
                  onClick={closeModal}
                >
                  Close
                </button>
                <button 
                  className={`${styles.modalButton} ${styles.primary}`}
                  onClick={() => {
                    closeModal();
                    // Optionally navigate to journal or dashboard
                  }}
                >
                  Journal This
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mood History Section */}
        {showHistory && (
          <div className={styles.moodHistory}>
            <h3 className={styles.historyTitle}>Recent Moods</h3>
            
            {loading && (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading your mood history...</p>
              </div>
            )}
            
            {error && (
              <div className={styles.errorState}>
                <p>Error loading moods: {error}</p>
                <button onClick={fetchMoods} className={styles.retryButton}>
                  Try Again
                </button>
              </div>
            )}
            
            {!loading && !error && moods.length === 0 && (
              <div className={styles.emptyState}>
                <p>No mood entries yet. Start tracking your mood above!</p>
              </div>
            )}
            
            {!loading && !error && moods.length > 0 && (
              <div className={styles.moodList}>
                {moods.map((moodEntry) => (
                  <div key={moodEntry._id} className={styles.moodCard}>
                    <div className={styles.moodCardHeader}>
                      <span className={styles.moodCardEmoji}>
                        {moodOptions.find(option => option.label === moodEntry.mood)?.emoji}
                      </span>
                      <div className={styles.moodCardInfo}>
                        <span className={styles.moodCardLabel}>
                          {moodEntry.mood}
                        </span>
                        <span className={styles.moodCardIntensity}>
                          Intensity: {moodEntry.intensity}/10
                        </span>
                      </div>
                      <span className={styles.moodCardDate}>
                        {new Date(moodEntry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {moodEntry.note && (
                      <p className={styles.moodCardNote}>{moodEntry.note}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    );
  }