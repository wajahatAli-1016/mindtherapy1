"use client"
import { useState } from 'react';
import styles from './dashboard.module.css';
import aiImage from '../../../public/generative.png';

export default function ConversationCard({ conversation, onClose }) {
  const [expandedMessages, setExpandedMessages] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getConversationDuration = (startedAt, endedAt) => {
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

  if (!conversation) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.conversationCardModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.conversationCardHeader}>
            <div className={styles.conversationCardTitle}>
              <h2>💬 {conversation.conversationTitle || 'Conversation'}</h2>
              <div className={styles.conversationCardMeta}>
                <span className={styles.conversationCardDate}>
                  {formatDate(conversation.startedAt)}
                </span>
                <span className={styles.conversationCardDuration}>
                  Duration: {getConversationDuration(conversation.startedAt, conversation.endedAt)}
                </span>
                <span className={styles.conversationCardCount}>
                  {conversation.messages?.length || 0} messages
                </span>
              </div>
            </div>
            <button onClick={onClose} className={styles.closeBtn}>
              ✕
            </button>
          </div>
        </div>
        
        <div className={styles.conversationCardContent}>
          {conversation.summary && (
            <div className={styles.conversationCardSummary}>
              <h4>📋 Summary</h4>
              <p>{conversation.summary}</p>
            </div>
          )}

          {conversation.tags && conversation.tags.length > 0 && (
            <div className={styles.conversationCardTags}>
              <h4>🏷️ Tags</h4>
              <div className={styles.tagsContainer}>
                {conversation.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.conversationCardMessages}>
            <div className={styles.conversationCardMessagesHeader}>
              <h4>💭 Messages</h4>
              <button
                onClick={() => setExpandedMessages(!expandedMessages)}
                className={styles.expandButton}
              >
                {expandedMessages ? 'Show Less' : 'Show All'}
              </button>
            </div>
            
            <div className={styles.conversationCardMessagesList}>
              {conversation.messages && conversation.messages.length > 0 ? (
                (expandedMessages ? conversation.messages : conversation.messages.slice(-5)).map((message, index) => (
                  <div
                    key={index}
                    className={`${styles.conversationCardMessage} ${
                      message.role === 'user' ? styles.userMessage : styles.aiMessage
                    }`}
                  >
                    <div className={styles.conversationCardMessageHeader}>
                      <div className={styles.conversationCardMessageSender}>
                        {message.role === 'user' ? (
                          <span className={styles.userIcon}>👤 You</span>
                        ) : (
                          <span className={styles.aiIcon}>
                            <img src={aiImage.src} alt="AI" width={16} height={16} />
                            AI Assistant
                          </span>
                        )}
                      </div>
                      <span className={styles.conversationCardMessageTime}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div className={styles.conversationCardMessageContent}>
                      {message.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.conversationCardNoMessages}>
                  <p>No messages in this conversation</p>
                </div>
              )}
            </div>

            {!expandedMessages && conversation.messages && conversation.messages.length > 5 && (
              <div className={styles.conversationCardShowMore}>
                <p>Showing last 5 messages. Click "Show All" to see the full conversation.</p>
              </div>
            )}
          </div>

          {conversation.sessionId && (
            <div className={styles.conversationCardSessionInfo}>
              <h4>📊 Session Information</h4>
              <div className={styles.conversationCardSessionDetails}>
                <span>Session ID: #{conversation.sessionId._id ? conversation.sessionId._id.slice(-6) : 'N/A'}</span>
                <span>Started: {conversation.sessionId.startedAt ? formatDate(conversation.sessionId.startedAt) : 'N/A'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 