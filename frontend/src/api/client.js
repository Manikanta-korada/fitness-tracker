import { supabase } from '../lib/supabase';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (!import.meta.env.DEV) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  }
  const res = await fetch(`${BASE}${path}`, {
    headers,
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
  getByDate: (date) => request(`/workouts?date=${date}`),
  getCalendar: (from, to) => request(`/workouts/calendar?from=${from}&to=${to}`),
  getById: (id) => request(`/workouts/${id}`),
  create: (session) => request('/workouts', { method: 'POST', body: JSON.stringify(session) }),
  update: (id, session) => request(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(session) }),
  delete: (id) => request(`/workouts/${id}`, { method: 'DELETE' }),
  getLast: (name) => request(`/workouts/last?name=${encodeURIComponent(name)}`),
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
  copyDay: (from, to) => request(`/diet/copy?from=${from}&to=${to}`, { method: 'POST' }),
  getRecent: () => request('/diet/recent'),
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
  getMealRecommendations: () => request('/progress/recommendations/meals'),
  getMuscleGroupRecommendation: () => request('/progress/recommendations/muscle-group'),
  getWeeklyStreak: () => request('/progress/weekly-streak'),
  getPersonalRecords: () => request('/progress/personal-records'),
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

export const healthNotesApi = {
  getByDate: (date) => request(`/health-notes?date=${date}`),
  create: (note) => request('/health-notes', { method: 'POST', body: JSON.stringify(note) }),
  delete: (id) => request(`/health-notes/${id}`, { method: 'DELETE' }),
  getTrend: (from, to) => request(`/health-notes/trend?from=${from}&to=${to}`),
};
