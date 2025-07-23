// Session management utility functions

// Create a new session
export const createSession = async () => {
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, session: data.session };
    } else {
      console.error('Failed to create session');
      return { success: false, error: 'Failed to create session' };
    }
  } catch (error) {
    console.error('Error creating session:', error);
    return { success: false, error: error.message };
  }
};

// Get active session
export const getActiveSession = async () => {
  try {
    const response = await fetch('/api/session');
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, ...data };
    } else {
      console.error('Failed to get active session');
      return { success: false, error: 'Failed to get active session' };
    }
  } catch (error) {
    console.error('Error getting active session:', error);
    return { success: false, error: error.message };
  }
};

// Add message to session
export const addMessageToSession = async (sessionId, type, content, metadata = {}) => {
  try {
    const response = await fetch(`/api/session/${sessionId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        content,
        metadata
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, session: data.session };
    } else {
      console.error('Failed to add message to session');
      return { success: false, error: 'Failed to add message to session' };
    }
  } catch (error) {
    console.error('Error adding message to session:', error);
    return { success: false, error: error.message };
  }
};

// End session
export const endSession = async (sessionId) => {
  try {
    const response = await fetch('/api/session', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, session: data.session };
    } else {
      console.error('Failed to end session');
      return { success: false, error: 'Failed to end session' };
    }
  } catch (error) {
    console.error('Error ending session:', error);
    return { success: false, error: error.message };
  }
};

// Auto-create session if none exists
export const ensureActiveSession = async () => {
  try {
    const sessionData = await getActiveSession();
    
    if (sessionData.success && sessionData.hasActiveSession) {
      return { success: true, session: sessionData.session };
    } else {
      // Create new session if none exists
      const createResult = await createSession();
      return createResult;
    }
  } catch (error) {
    console.error('Error ensuring active session:', error);
    return { success: false, error: error.message };
  }
}; 