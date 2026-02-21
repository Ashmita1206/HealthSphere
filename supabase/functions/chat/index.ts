const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, accept',
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

Be concise but thorough.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: 'messages' missing" }),
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

    // ✅ Convert chat messages to Gemini format
    const geminiContents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ];

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiContents,
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);

      return new Response(JSON.stringify({ error: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await geminiResponse.json();

    const aiText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response generated';

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: aiText,
            },
          },
        ],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err: unknown) {
    console.error('Server error:', err);

    const message = err instanceof Error ? err.message : String(err);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
