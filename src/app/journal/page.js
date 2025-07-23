"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './journal.module.css';
import { ensureActiveSession } from '@/lib/sessionManager';
import mind from '../../../public/mind.png'

export default function JournalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 3 });
  const [submitting, setSubmitting] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchEntries();
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

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/journal');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEntry,
          mood: parseInt(newEntry.mood)
        }),
      });

      if (response.ok) {
        setNewEntry({ title: '', content: '', mood: 3 });
        setShowNewEntry(false);
        fetchEntries();
      }
    } catch (error) {
      console.error('Error creating entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const generateSummary = async (entryId) => {
    setGeneratingSummary(entryId);
    try {
      const response = await fetch(`/api/journal/${entryId}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        fetchEntries(); // Refresh the entries to show the new feedback
      } else {
        console.error('Failed to generate feedback');
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
    } finally {
      setGeneratingSummary(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodEmoji = (mood) => {
    const emojis = ['😢', '😔', '😐', '🙂', '😊'];
    return emojis[Math.min(Math.max(Math.round(mood) - 1, 0), 4)];
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your journal...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <img src={mind.src} alt="Mind Garden" className={styles.mindImage} />
          MindGarden Journal
        </h1>
        <p className={styles.subtitle}>Nurture your thoughts and feelings</p>
      </div>

      <div className={styles.actions}>
        <button
          onClick={() => setShowNewEntry(!showNewEntry)}
          className={styles.newEntryBtn}
        >
          {showNewEntry ? '✕ Cancel' : '✏️ New Entry'}
        </button>
        <Link href="/dashboard" className={styles.backBtn}>
          ← Back to Dashboard
        </Link>
      </div>

      {showNewEntry && (
        <div className={styles.newEntryForm}>
          <form onSubmit={handleSubmit}>
          <div className={styles.moodSelector}>
              <label>How's your mood today?</label>
              <div className={styles.moodOptions}>
                {[1, 2, 3, 4, 5].map(mood => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setNewEntry({ ...newEntry, mood })}
                    className={`${styles.moodOption} ${newEntry.mood === mood ? styles.selected : ''}`}
                  >
                    {getMoodEmoji(mood)}
                  </button>
                ))}
              </div>
            </div>
            
            <input
              type="text"
              placeholder="Entry title..."
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              className={styles.titleInput}
              maxLength={100}
            />
            <textarea
              placeholder="Write your thoughts, feelings, or experiences here..."
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              className={styles.contentInput}
              rows={8}
            />
            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={submitting || !newEntry.title.trim() || !newEntry.content.trim()}
                className={styles.submitBtn}
              >
                {submitting ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.entriesContainer}>
        {entries.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h3>No journal entries yet</h3>
            <p>Start your journey by writing your first entry</p>
            <button
              onClick={() => setShowNewEntry(true)}
              className={styles.startWritingBtn}
            >
              Start Writing
            </button>
          </div>
        ) : (
          <div className={styles.entriesGrid}>
            {entries.map((entry) => (
              <div key={entry._id} className={styles.entryCard}>
                <div className={styles.entryHeader}>
                  <h3 className={styles.entryTitle}>{entry.title}</h3>
                  <div className={styles.entryMeta}>
                    <span className={styles.entryDate}>
                      {formatDate(entry.createdAt)}
                    </span>
                    {entry.mood && (
                      <span className={styles.entryMood}>
                        {getMoodEmoji(entry.mood)}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.entryContent}>
                  {entry.content.length > 200
                    ? `${entry.content.substring(0, 200)}...`
                    : entry.content}
                </div>
                {entry.aiSummary && (
                  <div className={styles.aiSummary}>
                    {/* <span className={styles.aiLabel}>💭 AI Feedback: </span> */}
                    <p>{entry.aiSummary}</p>
                  </div>
                )}
                <div className={styles.entryActions}>
                  <Link
                    href={`/journal/${entry._id}`}
                    className={styles.viewBtn}
                  >
                    Read Full Entry
                  </Link>
                  {!entry.aiSummary && (
                                    <button
                  onClick={() => generateSummary(entry._id)}
                  disabled={generatingSummary === entry._id}
                  className={styles.generateSummaryBtn}
                >
                  {generatingSummary === entry._id ? '🤖 AI Generating...' : '🤖 Get AI Feedback'}
                </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 