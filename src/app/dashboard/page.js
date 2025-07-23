"use client"
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../dashboard/dashboard.module.css';
import mind from '../../../public/mind.png'
import Chatbot from './chatbot';
import ConversationHistory from './conversationHistory';
import AiImg from '../../../public/generative.png'

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moodData, setMoodData] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [wordCloud, setWordCloud] = useState([]);
  const [showQuickJournal, setShowQuickJournal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [conversationToLoad, setConversationToLoad] = useState(null);
  const [quickEntry, setQuickEntry] = useState({ title: '', content: '', mood: 3 });
  const [submitting, setSubmitting] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [showSessionEndedNotification, setShowSessionEndedNotification] = useState(false);
  const [showNewSessionNotification, setShowNewSessionNotification] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchDashboardData();
      checkSessionStatus();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/journal');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
        
        // Process data for widgets
        processMoodData(data);
        processWordCloud(data);
        generateAiInsights(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSessionStatus = async () => {
    try {
      const response = await fetch('/api/session/status');
      if (response.ok) {
        const data = await response.json();
        setSessionStatus(data);
        
        // Show notification only if:
        // 1. There's a session that has ended (not for new users with no sessions)
        // 2. The session has meaningful activity (messageLog entries)
        // 3. The notification hasn't been shown yet
        if (data.hasActiveSession && !data.canChat && !data.isActive && data.hasActivity && !showSessionEndedNotification) {
          setShowSessionEndedNotification(true);
        }
      }
    } catch (error) {
      console.error('Error checking session status:', error);
    }
  };

  const processMoodData = (entries) => {
    // Group entries by week and calculate average mood
    const weeklyData = {};
    entries.forEach(entry => {
      const date = new Date(entry.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { total: 0, count: 0 };
      }
      weeklyData[weekKey].total += entry.mood || 3;
      weeklyData[weekKey].count += 1;
    });

    const moodTrend = Object.entries(weeklyData).map(([date, data]) => ({
      date,
      mood: Math.round(data.total / data.count * 10) / 10
    })).slice(-4); // Last 4 weeks

    setMoodData(moodTrend);
  };

  const processWordCloud = (entries) => {
    // Extract common words from journal entries
    const words = entries.flatMap(entry => 
      (entry.content + ' ' + entry.title)
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
    );

    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const wordCloudData = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({
        text: word,
        value: count,
        size: Math.max(12, Math.min(32, 12 + count * 2))
      }));

    setWordCloud(wordCloudData);
  };

  const generateAiInsights = (entries) => {
    // Generate insights based on recent entries
    const recentEntries = entries.slice(0, 5);
    const insights = [];

    if (recentEntries.length > 0) {
      const totalMood = recentEntries.reduce((sum, entry) => sum + (entry.mood || 3), 0);
      const avgMood = totalMood / recentEntries.length;

      if (avgMood > 4) {
        insights.push({
          type: 'positive',
          message: 'You seem to be in a positive mood lately! 🌟',
          icon: '😊'
        });
      } else if (avgMood < 3) {
        insights.push({
          type: 'supportive',
          message: 'Remember, it\'s okay to have difficult days. You\'re doing great! 💪',
          icon: '🤗'
        });
      }

      if (recentEntries.length >= 3) {
        insights.push({
          type: 'achievement',
          message: `You've written ${recentEntries.length} entries recently. Consistency is key! 📝`,
          icon: '📈'
        });
      }

      const hasAiSummaries = recentEntries.filter(entry => entry.aiSummary).length;
      if (hasAiSummaries > 0) {
        insights.push({
          type: 'ai',
          message: 'Your AI summaries are helping you gain deeper insights into your thoughts! 🤖',
          icon: '🧠'
        });
      }
    }

    setAiInsights(insights);
  };

  const handleQuickJournal = async (e) => {
    e.preventDefault();
    if (!quickEntry.title.trim() || !quickEntry.content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quickEntry,
          mood: parseInt(quickEntry.mood)
        }),
      });

      if (response.ok) {
        setQuickEntry({ title: '', content: '', mood: 3 });
        setShowQuickJournal(false);
        fetchDashboardData(); // Refresh dashboard data
      }
    } catch (error) {
      console.error('Error creating quick entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodEmoji = (mood) => {
    const emojis = ['😢', '😔', '😐', '🙂', '😊'];
    return emojis[Math.min(Math.max(Math.round(mood) - 1, 0), 4)];
  };

  const getMoodColor = (mood) => {
    if (mood >= 4) return '#4ade80'; // Green
    if (mood >= 3) return '#fbbf24'; // Yellow
    return '#f87171'; // Red
  };

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await fetch('/api/session/history');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setSessionsLoading(false);
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
        <div className={styles.loading}>Loading your mind therapy dashboard...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}><img src={mind.src} alt="Mind Garden" className={styles.mindImage} /> Mind Garden Dashboard</h1>
          <p className={styles.subtitle}>Welcome back, {session.user.name}!</p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => setShowQuickJournal(true)}
            className={styles.quickJournalBtn}
          >
            ✏️ Quick Journal
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={styles.signOutBtn}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Quick Journal Modal */}
      {showQuickJournal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Quick Journal Entry</h2>
              <button
                onClick={() => setShowQuickJournal(false)}
                className={styles.closeBtn}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickJournal} className={styles.quickJournalForm}>
              <input
                type="text"
                placeholder="Entry title..."
                value={quickEntry.title}
                onChange={(e) => setQuickEntry({ ...quickEntry, title: e.target.value })}
                className={styles.quickTitle}
                required
              />
              <textarea
                placeholder="How are you feeling today?"
                value={quickEntry.content}
                onChange={(e) => setQuickEntry({ ...quickEntry, content: e.target.value })}
                className={styles.quickContent}
                rows={4}
                required
              />
              <div className={styles.moodSelector}>
                <label>How's your mood today?</label>
                <div className={styles.moodOptions}>
                  {[1, 2, 3, 4, 5].map(mood => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setQuickEntry({ ...quickEntry, mood })}
                      className={`${styles.moodOption} ${quickEntry.mood === mood ? styles.selected : ''}`}
                      style={{ backgroundColor: quickEntry.mood === mood ? getMoodColor(mood) : 'transparent' }}
                    >
                      {getMoodEmoji(mood)}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowQuickJournal(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !quickEntry.title.trim() || !quickEntry.content.trim()}
                  className={styles.saveBtn}
                >
                  {submitting ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sessions Modal */}
      {showSessionsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.sessionsModal}>
            <div className={styles.modalHeader}>
              <h2>📊 Session History</h2>
              <button
                onClick={() => {
                  setShowSessionsModal(false);
                  setSelectedSession(null);
                }}
                className={styles.closeBtn}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.sessionsModalContent}>
              {sessionsLoading ? (
                <div className={styles.sessionsLoading}>
                  <p>Loading sessions...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className={styles.sessionsEmpty}>
                  <h3>No sessions yet</h3>
                  <p>Start journaling or tracking your mood to create your first session!</p>
                </div>
              ) : (
                <div className={styles.sessionsList}>
                  {sessions.map((sessionItem) => (
                    <div key={sessionItem._id} className={styles.sessionModalCard}>
                      <div className={styles.sessionModalHeader}>
                        <div className={styles.sessionModalInfo}>
                          <h4>Session #{sessionItem._id.slice(-6)}</h4>
                          <p className={styles.sessionModalDate}>
                            {formatDate(sessionItem.startedAt)}
                          </p>
                          <span className={styles.sessionModalDuration}>
                            Duration: {getSessionDuration(sessionItem.startedAt, sessionItem.endedAt)}
                          </span>
                        </div>
                        <div className={styles.sessionModalStatus}>
                          <span className={`${styles.sessionStatusBadge} ${sessionItem.isActive ? styles.active : styles.completed}`}>
                            {sessionItem.isActive ? 'Active' : 'Completed'}
                          </span>
                        </div>
                      </div>

                      <div className={styles.sessionModalActions}>
                        <span className={styles.sessionModalCount}>
                          {sessionItem.messageLog.length} activities
                        </span>
                        <button
                          onClick={() => setSelectedSession(selectedSession === sessionItem._id ? null : sessionItem._id)}
                          className={styles.sessionModalViewBtn}
                        >
                          {selectedSession === sessionItem._id ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>

                      {selectedSession === sessionItem._id && (
                        <div className={styles.sessionModalDetails}>
                          <h5>Session Activities:</h5>
                          <div className={styles.sessionModalMessageLog}>
                            {sessionItem.messageLog.length === 0 ? (
                              <p className={styles.sessionModalNoMessages}>No activities recorded</p>
                            ) : (
                              sessionItem.messageLog.map((message, index) => (
                                <div key={index} className={styles.sessionModalMessageItem}>
                                  <div className={styles.sessionModalMessageHeader}>
                                    <span className={styles.sessionModalMessageIcon}>
                                      {getMessageTypeIcon(message.type)}
                                    </span>
                                    <span className={styles.sessionModalMessageType}>
                                      {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                                    </span>
                                    <span className={styles.sessionModalMessageTime}>
                                      {formatDate(message.timestamp)}
                                    </span>
                                  </div>
                                  <p className={styles.sessionModalMessageContent}>{message.content}</p>
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
        </div>
      )}

      {/* Chatbot */}
      <Chatbot 
        isOpen={showChatbot} 
        onClose={() => {
          setShowChatbot(false);
          setConversationToLoad(null);
        }} 
        conversationToLoad={conversationToLoad}
      />

      {/* Conversation History */}
      <ConversationHistory 
        isOpen={showConversationHistory} 
        onClose={() => setShowConversationHistory(false)}
        onLoadConversation={() => {}} // No longer needed since we use card format
      />

      {/* Session Ended Notification */}
      {showSessionEndedNotification && (
        <div className={styles.notificationOverlay}>
          <div className={styles.notification}>
            <div className={styles.notificationHeader}>
              <span className={styles.notificationIcon}>🎯</span>
              <h3>Session Completed</h3>
              <button
                onClick={() => setShowSessionEndedNotification(false)}
                className={styles.notificationClose}
              >
                ✕
              </button>
            </div>
            <div className={styles.notificationContent}>
              <p>Your therapy session has been completed! You can read previous conversations, but you'll need to start a new session to chat with the AI again.</p>
              <div className={styles.notificationActions}>
                <button
                  onClick={() => setShowSessionEndedNotification(false)}
                  className={styles.notificationBtn}
                >
                  Got it
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/session/status', { method: 'POST' });
                      if (response.ok) {
                        setShowSessionEndedNotification(false);
                        checkSessionStatus();
                        setShowNewSessionNotification(true);
                        // Auto-hide notification after 3 seconds
                        setTimeout(() => setShowNewSessionNotification(false), 3000);
                      }
                    } catch (error) {
                      console.error('Error starting session:', error);
                    }
                  }}
                  className={styles.notificationBtn}
                >
                  Start New Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Session Started Notification */}
      {showNewSessionNotification && (
        <div className={styles.notificationOverlay}>
          <div className={`${styles.notification} ${styles.successNotification}`}>
            <div className={styles.notificationHeader}>
              <span className={styles.notificationIcon}>🎉</span>
              <h3>New Session Started!</h3>
              <button
                onClick={() => setShowNewSessionNotification(false)}
                className={styles.notificationClose}
              >
                ✕
              </button>
            </div>
            <div className={styles.notificationContent}>
              <p>Your new therapy session has been created successfully! You can now chat with the AI and continue your journey.</p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className={styles.dashboardGrid}>
        {/* Mood Trend Chart */}
        <div className={styles.widget}>
          <div className={styles.widgetHeader}>
            <h3>📊 Mood Trend</h3>
            <span className={styles.widgetSubtitle}>Weekly average</span>
           
          </div>
          <Link href="/mood" className={styles.viewAllLink}>
              Check your mood...
            </Link>
          </div>

        {/* Word Cloud */}
        <div className={styles.widget}>
          <div className={styles.widgetHeader}>
            <h3>☁️ Word Cloud</h3>
            <span className={styles.widgetSubtitle}>Most used words</span>
          </div>
          <div className={styles.wordCloud}>
            {wordCloud.length > 0 ? (
              <div className={styles.cloudContainer}>
                {wordCloud.map((word, index) => (
                  <span
                    key={index}
                    className={styles.cloudWord}
                    style={{
                      fontSize: `${word.size}px`,
                      opacity: 0.3 + (word.value / Math.max(...wordCloud.map(w => w.value))) * 0.7
                    }}
                  >
                    {word.text}
                  </span>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No words to display</p>
                <p>Write more entries to see your word cloud!</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className={styles.widget}>
          <div className={styles.widgetHeader}>
            <h3> AI Insights</h3>
            <span className={styles.widgetSubtitle}>Personal observations</span>
          </div>
          <div className={styles.aiInsights}>
            {aiInsights.length > 0 ? (
              <div className={styles.insightsList}>
                {aiInsights.map((insight, index) => (
                  <div key={index} className={`${styles.insight} ${styles[insight.type]}`}>
                    <span className={styles.insightIcon}>{insight.icon}</span>
                    <p>{insight.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No insights yet</p>
                <p>Keep journaling to get personalized insights!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.widget}>
          <div className={styles.widgetHeader}>
            <h3>⚡ Quick Actions</h3>
            <span className={styles.widgetSubtitle}>Get started quickly</span>
          </div>
          <div className={styles.quickActions}>
            <Link href="/journal" className={styles.actionBtn}>
              <span className={styles.actionIcon}>📝</span>
              <span>View All Entries</span>
            </Link>
            <button
              onClick={() => setShowQuickJournal(true)}
              className={styles.actionBtn}
            >
              <span className={styles.actionIcon}>✏️</span>
              <span>Quick Journal</span>
            </button>
            <button 
              onClick={() => {
                setShowSessionsModal(true);
                fetchSessions();
              }}
              className={styles.actionBtn}
            >
              <span className={styles.actionIcon}>📊</span>
              <span>View Sessions</span>
            </button>
            <button 
              onClick={() => setShowChatbot(true)}
              className={styles.actionBtn}
            >
              <span className={styles.actionIcon}><img src={AiImg.src} alt="AI" width={20} height={20} /></span>
              <span>AI Chatbot</span>
            </button>
            <button 
              onClick={() => setShowConversationHistory(true)}
              className={styles.actionBtn}
            >
              <span className={styles.actionIcon}>💬</span>
              <span>Chat History</span>
            </button>
            <button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/session/status', { method: 'POST' });
                  if (response.ok) {
                    setShowNewSessionNotification(true);
                    // Auto-hide notification after 3 seconds
                    setTimeout(() => setShowNewSessionNotification(false), 3000);
                  }
                } catch (error) {
                  console.error('Error starting session:', error);
                  alert('Error starting session');
                }
              }}
              className={styles.actionBtn}
            >
              <span className={styles.actionIcon}>🔄</span>
              <span>Start New Session</span>
            </button>
          </div>
        </div>

        {/* Recent Entries */}
        <div className={styles.widget}>
          <div className={styles.widgetHeader}>
            <h3>📖 Recent Entries</h3>
            <Link href="/journal" className={styles.viewAllLink}>
              View All
            </Link>
          </div>
          <div className={styles.recentEntries}>
            {entries.slice(0, 3).map((entry) => (
              <div key={entry._id} className={styles.recentEntry}>
                <div className={styles.entryInfo}>
                  <h4>{entry.title}</h4>
                  <p>{entry.content.substring(0, 100)}...</p>
                  <span className={styles.entryDate}>
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {entry.mood && (
                  <span className={styles.entryMood}>
                    {getMoodEmoji(entry.mood)}
                  </span>
                )}
              </div>
            ))}
            {entries.length === 0 && (
              <div className={styles.emptyState}>
                <p>No entries yet</p>
                <p>Start your journaling journey today!</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Widget */}
        <div className={styles.widget}>
          <div className={styles.widgetHeader}>
            <h3>📈 Your Stats</h3>
            <span className={styles.widgetSubtitle}>This month</span>
          </div>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{entries.length}</span>
              <span className={styles.statLabel}>Total Entries</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {entries.filter(e => e.aiSummary).length}
              </span>
              <span className={styles.statLabel}>AI Summaries</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {entries.length > 0 ? Math.round(entries.reduce((sum, e) => sum + (e.mood || 3), 0) / entries.length * 10) / 10 : 0}
              </span>
              <span className={styles.statLabel}>Avg Mood</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {entries.length > 0 ? Math.round(entries.reduce((sum, e) => sum + e.content.length, 0) / 1000 * 10) / 10 : 0}k
              </span>
              <span className={styles.statLabel}>Words Written</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 