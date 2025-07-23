"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './entry.module.css';

export default function JournalEntryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [showSessionEndedModal, setShowSessionEndedModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchEntry();
      checkSessionStatus();
    }
  }, [status, router, params.id]);

  const checkSessionStatus = async () => {
    try {
      const response = await fetch('/api/session/status');
      if (response.ok) {
        const data = await response.json();
        setSessionStatus(data);
      }
    } catch (error) {
      console.error('Error checking session status:', error);
    }
  };

  const fetchEntry = async () => {
    try {
      const response = await fetch(`/api/journal/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setEntry(data);
        setEditData({ title: data.title, content: data.content });
      } else {
        router.push('/journal');
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      router.push('/journal');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editData.title.trim() || !editData.content.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/journal/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedEntry = await response.json();
        setEntry(updatedEntry.entry);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/journal/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/journal');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setDeleting(false);
    }
  };

  const generateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const response = await fetch(`/api/journal/${params.id}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setEntry(data.entry);
        
        // Check if session ended after generating summary
        if (data.sessionEnded) {
          setShowSessionEndedModal(true);
          // Update session status
          checkSessionStatus();
        }
      } else {
        console.error('Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setGeneratingSummary(false);
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

  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading entry...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Entry not found</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/journal" className={styles.backLink}>
          ← Back to Journal
        </Link>
        <div className={styles.actions}>
          {sessionStatus && (
            <div className={styles.sessionStatus}>
              <span className={`${styles.statusIndicator} ${sessionStatus.canChat ? styles.active : styles.inactive}`}>
                {sessionStatus.canChat ? '🟢 Active Session' : '🔴 Session Ended'}
              </span>
            </div>
          )}
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className={styles.editBtn}
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={styles.deleteBtn}
              >
                {deleting ? 'Deleting...' : '🗑️ Delete'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.entryContainer}>
        {editing ? (
          <div className={styles.editForm}>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className={styles.editTitle}
              placeholder="Entry title..."
            />
            <textarea
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              className={styles.editContent}
              placeholder="Write your thoughts..."
              rows={15}
            />
            <div className={styles.editActions}>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditData({ title: entry.title, content: entry.content });
                }}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editData.title.trim() || !editData.content.trim()}
                className={styles.saveBtn}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.entryContent}>
            <div className={styles.entryHeader}>
              <h1 className={styles.entryTitle}>{entry.title}</h1>
              <span className={styles.entryDate}>
                {formatDate(entry.createdAt)}
              </span>
            </div>
            
            <div className={styles.content}>
              {entry.content.split('\n').map((paragraph, index) => (
                <p key={index} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>

            {entry.aiSummary && (
              <div className={styles.aiSummary}>
                <div className={styles.aiHeader}>
                  <span className={styles.aiIcon}>🤖</span>
                  <h3>AI Summary</h3>
                  <button
                    onClick={generateSummary}
                    disabled={generatingSummary}
                    className={styles.regenerateBtn}
                  >
                    {generatingSummary ? '🔄 Regenerating...' : '🔄 Regenerate'}
                  </button>
                </div>
                <p>{entry.aiSummary}</p>
              </div>
            )}

            {!entry.aiSummary && (
              <div className={styles.aiSummaryPrompt}>
                <div className={styles.aiHeader}>
                  <span className={styles.aiIcon}>🤖</span>
                  <h3>AI Summary</h3>
                </div>
                <p>No AI summary available yet.</p>
                <button
                  onClick={generateSummary}
                  disabled={generatingSummary}
                  className={styles.generateBtn}
                >
                  {generatingSummary ? '🔄 Generating...' : '🤖 Generate AI Summary'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Ended Modal */}
      {showSessionEndedModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSessionEndedModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>🎯 Session Completed!</h2>
              <button
                onClick={() => setShowSessionEndedModal(false)}
                className={styles.closeBtn}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.sessionEndedMessage}>
                <p>🎉 Congratulations! Your therapy session has been completed.</p>
                <p>You've received AI feedback on your journal entry, which marks the end of this session.</p>
                <div className={styles.sessionEndedInfo}>
                  <h4>What happens now?</h4>
                  <ul>
                    <li>✅ You can read your AI summary and previous conversations</li>
                    <li>🔒 You cannot start new chatbot conversations until you begin a new session</li>
                    <li>📝 You can continue journaling and tracking your mood</li>
                    <li>🔄 Start a new session when you're ready for more AI therapy</li>
                  </ul>
                </div>
                <div className={styles.modalActions}>
                  <button
                    onClick={() => setShowSessionEndedModal(false)}
                    className={styles.continueBtn}
                  >
                    Continue Reading
                  </button>
                  <Link href="/dashboard" className={styles.dashboardBtn}>
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 