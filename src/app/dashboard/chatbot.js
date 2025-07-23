"use client"
import { useState, useRef, useEffect } from 'react';
import styles from './dashboard.module.css';
import aiImage from '../../../public/generative.png'

export default function Chatbot({ isOpen, onClose, conversationToLoad = null }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [canChat, setCanChat] = useState(true);
  const [sessionStatus, setSessionStatus] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      checkSessionStatus();
      
      if (conversationToLoad) {
        // Load existing conversation
        setConversationId(conversationToLoad._id);
        const loadedMessages = conversationToLoad.messages.map((msg, index) => ({
          id: index + 1,
          type: msg.role === 'user' ? 'user' : 'ai',
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(loadedMessages);
      } else if (messages.length === 0) {
        // Add welcome message when chatbot opens
        setMessages([
          {
            id: 1,
            type: 'ai',
            content: "Hello! I'm your AI therapy assistant. I'm here to listen, support, and help you process your thoughts and feelings. How are you doing today?",
            timestamp: new Date()
          }
        ]);
        // Reset conversation ID for new conversation
        setConversationId(null);
      }
    }
  }, [isOpen, conversationToLoad]);

  const checkSessionStatus = async () => {
    try {
      const response = await fetch('/api/session/status');
      if (response.ok) {
        const data = await response.json();
        setSessionStatus(data);
        setCanChat(data.canChat);
        
        if (!data.canChat && messages.length === 1) {
          // Add session status message
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'ai',
            content: "Your current session has ended. You can read previous conversations, but you'll need to start a new session to chat with me again.",
            timestamp: new Date()
          }]);
        }
      }
    } catch (error) {
      console.error('Error checking session status:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !canChat) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          conversationId: conversationId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Store conversation ID for future messages
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }
      } else {
        const errorData = await response.json();
        if (errorData.error === 'SESSION_REQUIRED') {
          setCanChat(false);
          const errorMessage = {
            id: Date.now() + 1,
            type: 'ai',
            content: "Your session has ended. You can read previous conversations, but you'll need to start a new session to chat with me again.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        } else if (errorData.error === 'AI_SERVICE_ERROR') {
          const errorMessage = {
            id: Date.now() + 1,
            type: 'ai',
            content: errorData.response || "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        } else {
          throw new Error('Failed to get AI response');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClose = async () => {
    // End conversation if it exists and is active
    if (conversationId) {
      try {
        await fetch('/api/chatbot/end', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conversationId }),
        });
      } catch (error) {
        console.error('Error ending conversation:', error);
      }
    }
    onClose();
  };

  const startNewSession = async () => {
    try {
      const response = await fetch('/api/session/status', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setCanChat(true);
        setSessionStatus(data);
        
        // Add session started message
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'ai',
          content: "Great! A new session has started. You can now chat with me again!",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error starting new session:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.chatbotOverlay} onClick={onClose}>
      <div className={styles.chatbotModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.chatbotHeader}>
          <div className={styles.chatbotTitle}>
            <span className={styles.chatbotIcon}><img src={aiImage.src} alt="AI" width={20} height={20} /></span>
            <h3>AI Therapy Assistant</h3>
            {sessionStatus && (
              <div className={styles.sessionStatus}>
                <span className={`${styles.statusIndicator} ${canChat ? styles.active : styles.inactive}`}>
                  {canChat ? '🟢 Active Session' : '🔴 Session Ended'}
                </span>
              </div>
            )}
          </div>
          <button onClick={handleClose} className={styles.chatbotCloseBtn}>
            ✕
          </button>
        </div>

        <div className={styles.chatbotMessages}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.chatbotMessage} ${
                message.type === 'user' ? styles.userMessage : styles.aiMessage
              }`}
            >
              <div className={styles.messageContent}>
                {message.content}
              </div>
              <div className={styles.messageTime}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className={`${styles.chatbotMessage} ${styles.aiMessage}`}>
              <div className={styles.messageContent}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.chatbotInput}>
          {!canChat && (
            <div className={styles.sessionWarning}>
              <p>Your session has ended. Start a new session to continue chatting.</p>
              <button onClick={startNewSession} className={styles.startSessionBtn}>
                Start New Session
              </button>
            </div>
          )}
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={canChat ? "Type your message here..." : "Session ended - cannot send messages"}
            className={styles.chatbotTextarea}
            rows={1}
            disabled={isLoading || !canChat}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading || !canChat}
            className={styles.chatbotSendBtn}
          >
            <span>Send</span>
            <span className={styles.sendIcon}>➤</span>
          </button>
        </div>
      </div>
    </div>
  );
} 