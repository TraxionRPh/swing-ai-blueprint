
// OpenAI service module
export const ALLOWED_MODEL = 'gpt-4o-mini';

export class OpenAI {
  private apiKey: string;

  constructor({ apiKey }: { apiKey: string }) {
    this.apiKey = apiKey;
  }

  async generateAnalysis(prompt: string) {
    return await generateAnalysis(prompt, this.apiKey);
  }
}

export async function generateAnalysis(prompt: string, OPENAI_API_KEY: string) {
  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: ALLOWED_MODEL,
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional golf coach and analyst specialized in providing performance analysis and practice plans. Always format your response as pure JSON without code blocks or markdown formatting.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!openAIResponse.ok) {
    const errorData = await openAIResponse.json();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const openAIData = await openAIResponse.json();
  return openAIData.choices[0].message.content;
}
