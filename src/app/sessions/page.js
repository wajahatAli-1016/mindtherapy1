"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './sessions.module.css';
import mind from '../../../public/mind.png'


export default function SessionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchSessions();
    }
  }, [status, router]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/session/history');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
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

  const getSessionDuration = (startedAt, endedAt) => {
    if (!endedAt) return 'Active';
    const duration = new Date(endedAt) - new Date(startedAt);
    const minutes = Math.floor(duration / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'journal': return '📝';
      case 'mood': return '😊';
      case 'feedback': return '💭';
      case 'chatbot': return '🤖';
      default: return '📄';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your session history...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <img src={mind.src} alt="Mind Garden" className={styles.mindImage} />
          Session History
        </h1>
        <p className={styles.subtitle}>Your therapy session records</p>
      </div>

      <div className={styles.actions}>
        <Link href="/dashboard" className={styles.backBtn}>
          ← Back to Dashboard
        </Link>
      </div>

      <div className={styles.content}>
        {sessions.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No sessions yet</h3>
            <p>Start journaling or tracking your mood to create your first session!</p>
            <div className={styles.emptyActions}>
              <Link href="/journal" className={styles.emptyBtn}>
                Start Journaling
              </Link>
              <Link href="/mood" className={styles.emptyBtn}>
                Track Mood
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.sessionsGrid}>
            {sessions.map((sessionItem) => (
              <div key={sessionItem._id} className={styles.sessionCard}>
                <div className={styles.sessionHeader}>
                  <div className={styles.sessionInfo}>
                    <h3>Session #{sessionItem._id.slice(-6)}</h3>
                    <p className={styles.sessionDate}>
                      {formatDate(sessionItem.startedAt)}
                    </p>
                    <span className={styles.sessionDuration}>
                      Duration: {getSessionDuration(sessionItem.startedAt, sessionItem.endedAt)}
                    </span>
                  </div>
                  <div className={styles.sessionStatus}>
                    <span className={`${styles.statusBadge} ${sessionItem.isActive ? styles.active : styles.completed}`}>
                      {sessionItem.isActive ? 'Active' : 'Completed'}
                    </span>
                  </div>
                </div>

                <div className={styles.messageCount}>
                  <span>{sessionItem.messageLog.length} activities</span>
                </div>

                <div className={styles.sessionActions}>
                  <button
                    onClick={() => setSelectedSession(selectedSession === sessionItem._id ? null : sessionItem._id)}
                    className={styles.viewBtn}
                  >
                    {selectedSession === sessionItem._id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {selectedSession === sessionItem._id && (
                  <div className={styles.sessionDetails}>
                    <h4>Session Activities:</h4>
                    <div className={styles.messageLog}>
                      {sessionItem.messageLog.length === 0 ? (
                        <p className={styles.noMessages}>No activities recorded</p>
                      ) : (
                        sessionItem.messageLog.map((message, index) => (
                          <div key={index} className={styles.messageItem}>
                            <div className={styles.messageHeader}>
                              <span className={styles.messageIcon}>
                                {getMessageTypeIcon(message.type)}
                              </span>
                              <span className={styles.messageType}>
                                {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                              </span>
                              <span className={styles.messageTime}>
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                            <p className={styles.messageContent}>{message.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
