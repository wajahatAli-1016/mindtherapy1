"use client"
import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';

export default function ConversationHistory({ isOpen, onClose, onLoadConversation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, currentPage]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chatbot/history?page=${currentPage}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await fetch(`/api/chatbot/history?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        onLoadConversation(data.conversation);
        onClose();
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const deleteConversation = async (conversationId) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const response = await fetch(`/api/chatbot/history?conversationId=${conversationId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchConversations();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const getMessagePreview = (messages) => {
    if (!messages || messages.length === 0) return 'No messages';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : '');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.sessionsModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>💬 Chatbot Conversations</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>
        
        <div className={styles.sessionsModalContent}>
          {loading ? (
            <div className={styles.sessionsLoading}>
              <p>Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className={styles.sessionsEmpty}>
              <h3>No conversations yet</h3>
              <p>Start chatting with the AI to create your first conversation!</p>
            </div>
          ) : (
            <div className={styles.sessionsList}>
              {conversations.map((conversation) => (
                <div key={conversation._id} className={styles.sessionModalCard}>
                  <div className={styles.sessionModalHeader}>
                    <div className={styles.sessionModalInfo}>
                      <h4>{conversation.conversationTitle}</h4>
                      <p className={styles.sessionModalDate}>
                        {formatDate(conversation.startedAt)}
                      </p>
                      <span className={styles.sessionModalDuration}>
                        Duration: {getConversationDuration(conversation.startedAt, conversation.endedAt)}
                      </span>
                      <span className={styles.sessionModalCount}>
                        {conversation.messages?.length || 0} messages
                      </span>
                    </div>
                    <div className={styles.sessionModalStatus}>
                      <span className={`${styles.sessionStatusBadge} ${conversation.isActive ? styles.active : styles.completed}`}>
                        {conversation.isActive ? 'Active' : 'Completed'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.sessionModalActions}>
                    <button
                      onClick={() => loadConversation(conversation._id)}
                      className={styles.sessionModalViewBtn}
                    >
                      Load Conversation
                    </button>
                    <button
                      onClick={() => deleteConversation(conversation._id)}
                      className={styles.sessionModalDeleteBtn}
                    >
                      Delete
                    </button>
                  </div>

                  {conversation.sessionId && (
                    <div className={styles.sessionModalSessionInfo}>
                      <span className={styles.sessionModalSessionLabel}>
                        Session: #{conversation.sessionId._id ? conversation.sessionId._id.slice(-6) : 'N/A'}
                      </span>
                      <span className={styles.sessionModalSessionDate}>
                        {conversation.sessionId.startedAt ? formatDate(conversation.sessionId.startedAt) : 'N/A'}
                      </span>
                    </div>
                  )}

                  {conversation.summary && (
                    <div className={styles.sessionModalSummary}>
                      <h5>Summary:</h5>
                      <p>{conversation.summary}</p>
                    </div>
                  )}

                  {conversation.tags && conversation.tags.length > 0 && (
                    <div className={styles.sessionModalTags}>
                      {conversation.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={styles.paginationBtn}
              >
                Previous
              </button>
              <span className={styles.paginationInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={styles.paginationBtn}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 