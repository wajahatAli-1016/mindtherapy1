// AI utility functions for journal entries

// Simple rate limiting - track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

/**
 * Generate an AI summary of a journal entry
 * @param {string} title - The journal entry title
 * @param {string} content - The journal entry content
 * @returns {Promise<string>} - The generated summary
 */
export async function generateJournalSummary(title, content) {
    try {
        // Check if OpenAI API key is available
        if (!process.env.OPENAI_API_KEY) {
            console.log('OpenAI API key not found, skipping AI summary');
            return null;
        }

        // Simple rate limiting
        const now = Date.now();
        if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
            console.log('Rate limiting: waiting before next request');
            await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - (now - lastRequestTime)));
        }
        lastRequestTime = Date.now();

        const prompt = `Please provide a brief, empathetic summary of this journal entry in 2-3 sentences. Focus on the emotional tone and key themes:

Title: ${title}
Content: ${content}

Summary:`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a compassionate AI assistant that helps summarize personal journal entries with empathy and understanding.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 150,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a few minutes.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenAI API key.');
            } else if (response.status === 402) {
                throw new Error('Payment required. Please add credits to your OpenAI account.');
            } else {
                throw new Error(`OpenAI API error: ${response.status}`);
            }
        }

        const data = await response.json();
        const summary = data.choices[0]?.message?.content?.trim();
        
        return summary || null;
    } catch (error) {
        console.error('Error generating AI summary:', error);
        return null;
    }
}

/**
 * Generate insights and suggestions based on journal content
 * @param {string} content - The journal entry content
 * @returns {Promise<string>} - Generated insights
 */
export async function generateInsights(content) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return null;
        }

        const prompt = `Based on this journal entry, provide 1-2 gentle, supportive insights or suggestions for self-reflection:

${content}

Insights:`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a supportive mental health assistant that provides gentle, encouraging insights for personal growth.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 200,
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a few minutes.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenAI API key.');
            } else if (response.status === 402) {
                throw new Error('Payment required. Please add credits to your OpenAI account.');
            } else {
                throw new Error(`OpenAI API error: ${response.status}`);
            }
        }

        const data = await response.json();
        const insights = data.choices[0]?.message?.content?.trim();
        
        return insights || null;
    } catch (error) {
        console.error('Error generating insights:', error);
        return null;
    }
}

/**
 * Generate comprehensive AI feedback based on journal entry with mood and emoji
 * @param {string} title - The journal entry title
 * @param {string} content - The journal entry content
 * @param {number} mood - The mood rating (1-5)
 * @param {string} emoji - The selected mood emoji
 * @returns {Promise<string>} - Generated feedback
 */
export async function generateJournalFeedback(title, content, mood, emoji) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.log('OpenAI API key not found, skipping AI feedback');
            return null;
        }

        // Simple rate limiting
        const now = Date.now();
        if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
            console.log('Rate limiting: waiting before next request');
            await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - (now - lastRequestTime)));
        }
        lastRequestTime = Date.now();

        const moodDescriptions = {
            1: 'very sad/difficult',
            2: 'somewhat down',
            3: 'neutral/okay',
            4: 'pretty good',
            5: 'very happy/excellent'
        };

        const prompt = `As a compassionate AI therapist, provide personalized feedback for this journal entry. Consider the user's mood (${moodDescriptions[mood]} - ${emoji}) and the content they've shared.

Title: ${title}
Content: ${content}
Mood: ${mood}/5 (${emoji})

Please provide:
1. A brief empathetic reflection on their entry
2. Gentle insights about their emotional state
3. Supportive suggestions or encouragement
4. A positive affirmation

Keep it warm, supportive, and under 200 words. Focus on emotional validation and gentle guidance.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a compassionate AI therapist that provides warm, supportive feedback for personal journal entries. Always be empathetic, validating, and encouraging. Focus on emotional support and gentle guidance.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a few minutes.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenAI API key.');
            } else if (response.status === 402) {
                throw new Error('Payment required. Please add credits to your OpenAI account.');
            } else {
                throw new Error(`OpenAI API error: ${response.status}`);
            }
        }

        const data = await response.json();
        const feedback = data.choices[0]?.message?.content?.trim();
        
        return feedback || null;
    } catch (error) {
        console.error('Error generating AI feedback:', error);
        return null;
    }
} 