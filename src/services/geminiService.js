export async function getGeminiAIResponse(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Replace with your Gemini API key
  console.log('Gemini API Key:', apiKey);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error('Failed to get AI response');
  const data = await response.json();
  console.log('Gemini API response:', data); // <-- Add this line
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no answer.';
}