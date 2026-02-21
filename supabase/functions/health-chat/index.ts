const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const systemPrompt = `You are HealthSphere AI, a professional healthcare assistant. You provide helpful, accurate, and empathetic health guidance.

IMPORTANT GUIDELINES:
1. Always be empathetic and supportive
2. Never diagnose conditions - recommend consulting healthcare professionals
3. Provide general health information and wellness tips
4. For emergencies, always recommend calling emergency services (911)
5. Assess health concerns and provide a risk level in your response

RISK LEVELS:
- LOW
- MEDIUM
- HIGH
- CRITICAL

Format your response like: [RISK:LOW]

Be concise but thorough.`; // Add a system prompt

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: "Invalid request: 'messages' missing or not an array",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Convert OpenAI-style messages to single prompt
    const userPrompt = messages
      .map(
        (m: { role: string; content: string }) =>
          `${m.role.toUpperCase()}: ${m.content}`,
      )
      .join('\n');

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
        }),
      },
    );

    if (!geminiResponse.ok) {
      const text = await geminiResponse.text();
      console.error('Gemini error:', geminiResponse.status, text);

      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const geminiData = await geminiResponse.json();
    const aiText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response generated';

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: { content: aiText },
          },
        ],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    console.error('Server error:', err);

    // Safely get the error message
    const message = err instanceof Error ? err.message : String(err);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
