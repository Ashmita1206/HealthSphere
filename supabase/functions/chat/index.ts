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
`;

// ================= SERVER =================
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    // ✅ Safe JSON parsing
    const body = await req.json().catch(() => null);

    if (!body || !body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: 'messages' missing" }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { messages, image } = body;

    // ✅ Get API key
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // ================= BUILD CONVERSATION =================
    const conversation = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }),
    );

    // ✅ Attach image if present
    if (image && image.mimeType && image.data) {
      conversation.push({
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
    }

    const requestBody = {
      contents: conversation,
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
    };

    // ================= CALL GEMINI =================
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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

    // ✅ Ensure risk label
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

    const stack = err instanceof Error ? err.stack : null;

    return new Response(
      JSON.stringify({
        error: message,
        stack: stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
