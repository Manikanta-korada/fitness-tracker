const API_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

async function fetchWithRetry(url, options, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || i === retries) return res;
    } catch (err) {
      if (i === retries) throw err;
    }
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
}

const SYSTEM_PROMPT = `You are a nutrition expert. Parse the user's food description into individual food items with estimated nutritional information.

Rules:
- Return a JSON array of food items
- Each item has: name (string), calories (integer, kcal), proteinG (number), carbsG (number), fatG (number)
- Use standard serving sizes if quantity isn't specified (e.g., "dal" = 1 bowl/150ml, "rice" = 1 cup cooked, "chapati" = 1 medium)
- For Indian foods, use accurate Indian nutritional data
- Be conservative with estimates - slightly underestimate rather than overestimate
- If a quantity is specified (e.g., "2 eggs", "200g chicken"), use that exact quantity
- Return ONLY the JSON array, no other text

Example input: "2 eggs, 1 chapati, dal 1 bowl"
Example output: [{"name":"Eggs (2)","calories":156,"proteinG":12.6,"carbsG":1.1,"fatG":10.6},{"name":"Chapati (1)","calories":120,"proteinG":3.1,"carbsG":20.0,"fatG":3.5},{"name":"Dal (1 bowl)","calories":150,"proteinG":9.0,"carbsG":20.0,"fatG":4.5}]`;

export async function parseFood(text) {
  if (!API_KEY) {
    throw new Error('API key not configured. Add VITE_GROQ_API_KEY to your .env.local file.');
  }

  const isGroq = API_KEY.startsWith('gsk_');

  if (isGroq) {
    return parseFoodGroq(text);
  }
  return parseFoodGemini(text);
}

async function parseFoodGroq(text) {
  const response = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Parse this: ${text}` },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response from Groq');
  }

  const parsed = JSON.parse(content);
  let items;
  if (Array.isArray(parsed)) {
    items = parsed;
  } else if (parsed.items || parsed.foods || parsed.meals) {
    items = parsed.items || parsed.foods || parsed.meals;
  } else if (parsed.name && parsed.calories !== undefined) {
    items = [parsed];
  } else {
    const firstValue = Object.values(parsed)[0];
    items = Array.isArray(firstValue) ? firstValue : [parsed];
  }

  return normalizeResults(items);
}

async function parseFoodGemini(text) {
  const response = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nParse this: ${text}` }] }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('No response from Gemini');
  }

  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error('Unexpected response format');
  }

  return normalizeResults(parsed);
}

function normalizeResults(items) {
  return items.map(item => ({
    name: item.name || 'Unknown',
    calories: Math.round(item.calories || 0),
    proteinG: Math.round((item.proteinG || item.protein_g || item.protein || 0) * 10) / 10,
    carbsG: Math.round((item.carbsG || item.carbs_g || item.carbs || 0) * 10) / 10,
    fatG: Math.round((item.fatG || item.fat_g || item.fat || 0) * 10) / 10,
  }));
}

export async function suggestWorkout(recentSessions, muscleRec) {
  if (!API_KEY) {
    throw new Error('API key not configured.');
  }

  const recentSummary = recentSessions.slice(0, 7).map(s =>
    `${s.date}: ${s.name} (${s.entries?.map(e => e.exercise?.name).filter(Boolean).join(', ')})`
  ).join('\n');

  const prompt = `You are a fitness coach. Based on the user's recent workout history, suggest today's workout.

Recent workouts (last 7 sessions):
${recentSummary || 'No recent workouts'}

${muscleRec ? `Muscle group that needs training most: ${muscleRec.muscleGroup} (not trained in ${muscleRec.daysSinceLastTrained} days)` : ''}

Return a JSON object with:
- name: workout name (e.g. "Push Day", "Leg Day", "Back & Biceps")
- reason: one sentence why this workout (e.g. "You haven't trained chest in 4 days")
- exercises: array of objects with { name, sets, reps, notes }

Keep it to 4-6 exercises. Use realistic sets/reps. Notes should be brief tips.`;

  const response = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are a knowledgeable fitness coach. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No response');

  return JSON.parse(content);
}
