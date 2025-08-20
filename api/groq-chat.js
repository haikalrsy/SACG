// api/groq-chat.js
// Vercel serverless function untuk handle Groq API calls (JavaScript file)

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed' 
    });
  }

  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Validate environment variable
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'API key not configured' 
      });
    }

    const { messages, model = "llama-3.1-8b-instant", temperature = 0.7, max_tokens = 500 } = req.body;

    // Validate request body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Messages array is required' 
      });
    }

    // Validate messages format
    for (const message of messages) {
      if (!message.role || !message.content) {
        return res.status(400).json({ 
          error: 'Invalid message format',
          message: 'Each message must have role and content' 
        });
      }
    }

    // Rate limiting check (basic implementation)
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`Request from IP: ${userIP}`);

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: Math.min(Math.max(temperature, 0), 2), // Clamp between 0-2
        max_tokens: Math.min(Math.max(max_tokens, 1), 1000), // Clamp between 1-1000
        stream: false
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API Error:', {
        status: groqResponse.status,
        statusText: groqResponse.statusText,
        error: errorText
      });

      // Handle specific Groq API errors
      if (groqResponse.status === 401) {
        return res.status(500).json({ 
          error: 'Authentication failed',
          message: 'API key authentication failed' 
        });
      } else if (groqResponse.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.' 
        });
      } else if (groqResponse.status === 400) {
        return res.status(400).json({ 
          error: 'Bad request',
          message: 'Invalid request parameters' 
        });
      }

      return res.status(groqResponse.status).json({ 
        error: 'Groq API error',
        message: 'Failed to get response from AI service'
      });
    }

    const data = await groqResponse.json();

    // Validate response from Groq
    if (!data.choices || !data.choices.length) {
      console.error('Invalid Groq response:', data);
      return res.status(500).json({ 
        error: 'Invalid AI response',
        message: 'No response generated' 
      });
    }

    // Log usage for monitoring
    console.log('Successfully processed request:', {
      model,
      tokensUsed: data.usage?.total_tokens || 'unknown',
      responseTime: Date.now()
    });

    // Return successful response
    return res.status(200).json(data);

  } catch (error) {
    console.error('API Error:', error);

    // Handle different types of errors
    if (error.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'Request timeout',
        message: 'Request was cancelled or timed out' 
      });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Service unavailable',
        message: 'AI service is temporarily unavailable' 
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
}