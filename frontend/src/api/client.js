const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204 || options.method === 'DELETE') return null;
  return res.json();
}

export const exercisesApi = {
  getAll: () => request('/exercises'),
  create: (exercise) => request('/exercises', { method: 'POST', body: JSON.stringify(exercise) }),
  delete: (id) => request(`/exercises/${id}`, { method: 'DELETE' }),
};

export const mealsApi = {
  getAll: () => request('/meals'),
  create: (meal) => request('/meals', { method: 'POST', body: JSON.stringify(meal) }),
  update: (id, meal) => request(`/meals/${id}`, { method: 'PUT', body: JSON.stringify(meal) }),
  delete: (id) => request(`/meals/${id}`, { method: 'DELETE' }),
};

export const workoutsApi = {
  getAll: (from, to) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return request(`/workouts${qs ? '?' + qs : ''}`);
  },
  getById: (id) => request(`/workouts/${id}`),
  create: (session) => request('/workouts', { method: 'POST', body: JSON.stringify(session) }),
  update: (id, session) => request(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(session) }),
  delete: (id) => request(`/workouts/${id}`, { method: 'DELETE' }),
};

export const templatesApi = {
  getAll: () => request('/workout-templates'),
  create: (template) => request('/workout-templates', { method: 'POST', body: JSON.stringify(template) }),
  apply: (id) => request(`/workout-templates/${id}/apply`, { method: 'POST' }),
  delete: (id) => request(`/workout-templates/${id}`, { method: 'DELETE' }),
};

export const dietApi = {
  getByDate: (date) => request(`/diet?date=${date}`),
  create: (entry) => request('/diet', { method: 'POST', body: JSON.stringify(entry) }),
  delete: (id) => request(`/diet/${id}`, { method: 'DELETE' }),
};

export const progressApi = {
  getWeight: () => request('/progress/weight'),
  logWeight: (entry) => request('/progress/weight', { method: 'POST', body: JSON.stringify(entry) }),
  getExercise: (id) => request(`/progress/exercise/${id}`),
  getCalories: (from, to) => request(`/progress/calories?from=${from}&to=${to}`),
  getMacros: (from, to) => request(`/progress/macros?from=${from}&to=${to}`),
  getMealBreakdown: (from, to) => request(`/progress/meal-breakdown?from=${from}&to=${to}`),
  getWorkoutFrequency: (from, to) => request(`/progress/workout-frequency?from=${from}&to=${to}`),
  getMuscleVolume: (from, to) => request(`/progress/muscle-volume?from=${from}&to=${to}`),
};

export const targetsApi = {
  get: () => request('/targets'),
  update: (targets) => request('/targets', { method: 'PUT', body: JSON.stringify(targets) }),
};

export const waterApi = {
  getByDate: (date) => request(`/water?date=${date}`),
  create: (entry) => request('/water', { method: 'POST', body: JSON.stringify(entry) }),
  delete: (id) => request(`/water/${id}`, { method: 'DELETE' }),
  getTrend: (from, to) => request(`/water/trend?from=${from}&to=${to}`),
};

export const sleepApi = {
  getByDate: (date) => request(`/sleep?date=${date}`),
  create: (entry) => request('/sleep', { method: 'POST', body: JSON.stringify(entry) }),
  delete: (id) => request(`/sleep/${id}`, { method: 'DELETE' }),
  getTrend: (from, to) => request(`/sleep/trend?from=${from}&to=${to}`),
};
