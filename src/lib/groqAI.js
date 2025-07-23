// Groq AI API utility functions

const GROQ_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Generate AI feedback for journal entries
export async function generateJournalFeedback(title, content, mood) {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured');
    }

    const moodEmojis = ['😢', '😔', '😐', '🙂', '😊'];
    const moodEmoji = moodEmojis[Math.min(Math.max(Math.round(mood) - 1, 0), 4)];
    
    const moodDescriptions = {
      1: 'very sad/difficult',
      2: 'somewhat down',
      3: 'neutral/okay',
      4: 'pretty good',
      5: 'very happy/excellent'
    };

    const systemPrompt = `You are a compassionate and supportive AI therapist assistant. Your role is to provide thoughtful, empathetic feedback to users based on their journal entries and mood. 

Guidelines:
- Be warm, supportive, and encouraging
- Acknowledge their feelings and experiences
- Provide gentle insights and observations
- Keep responses concise but meaningful (2-3 sentences)
- Focus on emotional support and validation
- Avoid giving medical advice
- Use a caring, therapeutic tone

The user's mood level is ${mood} (${moodDescriptions[mood]}), indicated by ${moodEmoji}.`;

    const userPrompt = `Please provide supportive feedback for this journal entry:

Title: ${title}
Content: ${content}
Mood: ${moodEmoji} (${moodDescriptions[mood]})

Please respond with a caring, therapeutic message that acknowledges their feelings and provides gentle support.`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Using Llama 3 model
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from Groq API');
    }

    const aiFeedback = data.choices[0].message.content.trim();
    
    return `💭 AI Feedback:\n\n${aiFeedback}\n\nYour mood: ${moodEmoji} (${moodDescriptions[mood]})`;

  } catch (error) {
    console.error('Error generating AI feedback:', error);
    
    // Fallback to hardcoded feedback if AI fails
    return generateFallbackFeedback(title, content, mood);
  }
}

// Fallback hardcoded feedback function
function generateFallbackFeedback(title, content, mood) {
  const moodEmojis = ['😢', '😔', '😐', '🙂', '😊'];
  const moodEmoji = moodEmojis[Math.min(Math.max(Math.round(mood) - 1, 0), 4)];
  
  const moodDescriptions = {
    1: 'very sad/difficult',
    2: 'somewhat down',
    3: 'neutral/okay',
    4: 'pretty good',
    5: 'very happy/excellent'
  };

  const fallbackResponses = {
    1: [
      "I can see you're going through a really tough time. Your feelings are completely valid, and it's okay to not be okay. Remember that difficult emotions are temporary visitors, not permanent residents. You're showing incredible strength by writing about your experiences.",
      "It sounds like you're carrying a heavy emotional burden right now. Your vulnerability in sharing this is truly courageous. Remember that seeking support from others is a sign of strength, not weakness. You don't have to face this alone.",
      "I hear the pain and struggle in your words. Your feelings are real and important. It's okay to take things one day at a time, or even one moment at a time. You're doing better than you think you are."
    ],
    2: [
      "I can sense that you're feeling a bit down today. Your emotions are telling you something important about what you need. Consider what might help you feel a little better - maybe some gentle self-care or reaching out to someone you trust.",
      "It sounds like you're having a challenging day. Remember that it's perfectly normal to have ups and downs. Your feelings are valid, and this too shall pass. Be kind to yourself during this time.",
      "I can see you're going through a rough patch. Your willingness to acknowledge these feelings is a positive step. Sometimes the simple act of writing about our struggles can help us process them better."
    ],
    3: [
      "You seem to be in a neutral state today, which is perfectly fine. Sometimes being okay is exactly what we need. Your balanced perspective shows emotional maturity. Consider what might help you move toward feeling even better.",
      "It sounds like you're in a stable, middle-ground emotional place. This can be a good foundation for reflection and growth. Your entry shows thoughtful self-awareness.",
      "You appear to be in a calm, centered state. This neutral energy can be perfect for making thoughtful decisions or simply being present with your thoughts."
    ],
    4: [
      "I can feel the positive energy in your words! You seem to be in a good place, and that's wonderful to see. Your optimism and positive outlook are shining through. Keep nurturing these good feelings.",
      "It sounds like you're having a pretty good day! Your positive mood is contagious. Remember to savor these moments and perhaps share some of this good energy with others.",
      "You're radiating positive vibes! Your entry shows a healthy, balanced emotional state. This is a great time to engage in activities that bring you joy or connect with loved ones."
    ],
    5: [
      "Wow! You're absolutely radiating joy and positivity! Your happiness is infectious and beautiful to witness. This is the perfect time to channel this energy into creative projects or helping others feel good too.",
      "You're in such a wonderful, elevated state! Your positive energy is truly inspiring. Consider using this momentum to set positive intentions or goals for the future.",
      "Your happiness is absolutely shining through! This is a magical time to celebrate your good feelings and perhaps spread some of this joy to others who might need it."
    ]
  };

  const moodResponses = fallbackResponses[mood] || fallbackResponses[3];
  const randomResponse = moodResponses[Math.floor(Math.random() * moodResponses.length)];
  
  return `💭 AI Feedback:\n\n${randomResponse}\n\nYour mood: ${moodEmoji} (${moodDescriptions[mood]})`;
} 