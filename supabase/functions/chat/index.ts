// ================= CORS =================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ================= SYSTEM PROMPT =================
const systemPrompt = `
You are HealthSphere AI, a professional healthcare assistant.

You are allowed to:
- Read and analyze medical reports and lab results.
- Explain values in simple language.
- Identify whether values appear normal, borderline, or abnormal.
- Assess whether findings appear low concern, moderate concern, or high concern based only on visible values.

You must NOT:
- Give a final medical diagnosis.
- Prescribe medication.
- Replace a doctor.

Always:
- Be empathetic and supportive.
- Clearly explain findings.
- Recommend consulting a healthcare professional for confirmation.
- Provide a risk level in this exact format at the top:

[RISK:LOW]
[RISK:MEDIUM]
[RISK:HIGH]
[RISK:CRITICAL]

Then give a structured explanation:
1. Summary
2. Abnormal Findings (if any)
3. What It Might Indicate (general explanation only)
4. Suggested Next Steps

Be clear and medically responsible but do analyze the visible report data.
`;

// ================= SERVER =================
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const { messages, image } = await req.json();

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

    // ================= BUILD GEMINI CONTENT =================
    const geminiContents: any[] = [];

    // Add system prompt as first user message
    geminiContents.push({
      role: 'user',
      parts: [{ text: systemPrompt }],
    });

    // If image exists → send text + image together
    if (image && image.mimeType && image.data) {
      geminiContents.push({
        role: 'user',
        parts: [
          {
            text:
              messages[messages.length - 1]?.content ||
              'Analyze this medical report.',
          },
          {
            inline_data: {
              mime_type: image.mimeType,
              data: image.data,
            },
          },
        ],
      });
    } else {
      // Text only fallback
      geminiContents.push(
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      );
    }

    // ================= CALL GEMINI =================
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
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

    let aiText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response generated';

    // Ensure risk label exists
    if (!aiText.includes('[RISK:')) {
      aiText =
        '[RISK:LOW]\n\n' +
        aiText +
        '\n\n⚠️ Please consult a healthcare professional for confirmation.';
    }

    // ================= RETURN RESPONSE =================
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
