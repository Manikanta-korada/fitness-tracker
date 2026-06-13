import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dietApi, workoutsApi, targetsApi, waterApi, sleepApi, progressApi, healthNotesApi } from '../api/client';
import { suggestWorkout, generateCoachSummary } from '../lib/gemini';
import { getDailyQuote } from '../lib/quotes';
import Spinner from '../components/Spinner';

export default function Dashboard() {
  const [dietLogs, setDietLogs] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [targets, setTargets] = useState(null);
  const [waterLogs, setWaterLogs] = useState([]);
  const [waterWeekly, setWaterWeekly] = useState([]);
  const [sleepLogs, setSleepLogs] = useState([]);
  const [mealRecs, setMealRecs] = useState([]);
  const [muscleRec, setMuscleRec] = useState(null);
  const [weeklyStreak, setWeeklyStreak] = useState(null);
  const [streak, setStreak] = useState(null);
  const [coachSummary, setCoachSummary] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [healthNotes, setHealthNotes] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.allSettled([
      dietApi.getByDate(today).then(setDietLogs),
      workoutsApi.getAll(today, today).then(setWorkouts),
      targetsApi.get().then(setTargets),
      waterApi.getByDate(today).then(setWaterLogs),
      sleepApi.getByDate(today).then(setSleepLogs),
      progressApi.getMealRecommendations().then(setMealRecs),
      progressApi.getMuscleGroupRecommendation().then(setMuscleRec),
      progressApi.getWeeklyStreak().then(setWeeklyStreak),
      healthNotesApi.getByDate(today).then(setHealthNotes),
      waterApi.getTrend(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], today).then(setWaterWeekly),
    ]).finally(() => setLoading(false));
    progressApi.getWeeklySummary().then(setWeeklySummary).catch(() => {});
    progressApi.getStreak().then(setStreak).catch(() => {});
  }, []);

  const totalCalories = dietLogs.reduce((sum, l) => sum + l.calories, 0);
  const totalProtein = dietLogs.reduce((sum, l) => sum + l.proteinG, 0);
  const totalCarbs = dietLogs.reduce((sum, l) => sum + l.carbsG, 0);
  const totalFat = dietLogs.reduce((sum, l) => sum + l.fatG, 0);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p className="text-sm italic text-gray-400 mb-8">"{getDailyQuote().text}" — <span className="not-italic">{getDailyQuote().author}</span></p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <ProgressRing
          label="Calories"
          value={totalCalories}
          target={targets?.calorieTarget}
          unit="kcal"
          color="#f97316"
        />
        <ProgressRing
          label="Protein"
          value={parseFloat(totalProtein.toFixed(1))}
          target={targets?.proteinTargetG}
          unit="g"
          color="#3b82f6"
        />
        <ProgressRing
          label="Carbs"
          value={parseFloat(totalCarbs.toFixed(1))}
          target={targets?.carbsTargetG}
          unit="g"
          color="#10b981"
        />
        <ProgressRing
          label="Fat"
          value={parseFloat(totalFat.toFixed(1))}
          target={targets?.fatTargetG}
          unit="g"
          color="#8b5cf6"
        />
        <ProgressRing
          label="Water"
          value={waterLogs.reduce((s, w) => s + w.amountMl, 0)}
          target={targets?.waterTargetMl}
          unit="ml"
          color="#06b6d4"
        />
      </div>

      {weeklySummary && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Weekly Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryItem
              label="Avg Calories"
              value={weeklySummary.thisWeek.avgCalories}
              prev={weeklySummary.lastWeek.avgCalories}
              unit="kcal"
            />
            <SummaryItem
              label="Avg Protein"
              value={weeklySummary.thisWeek.avgProtein}
              prev={weeklySummary.lastWeek.avgProtein}
              unit="g"
            />
            <SummaryItem
              label="Workouts"
              value={weeklySummary.thisWeek.workoutDays}
              prev={weeklySummary.lastWeek.workoutDays}
              unit="days"
            />
            <SummaryItem
              label="Avg Sleep"
              value={weeklySummary.thisWeek.avgSleepHours}
              prev={weeklySummary.lastWeek.avgSleepHours}
              unit="hrs"
            />
            <SummaryItem
              label="Avg Weight"
              value={weeklySummary.thisWeek.avgWeight}
              prev={weeklySummary.lastWeek.avgWeight}
              unit="kg"
            />
          </div>
          {!coachSummary && (
            <button
              onClick={async () => {
                setCoachLoading(true);
                try {
                  const summary = await generateCoachSummary(weeklySummary, streak);
                  setCoachSummary(summary);
                } catch {}
                setCoachLoading(false);
              }}
              disabled={coachLoading}
              className="mt-4 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 disabled:opacity-50"
            >
              {coachLoading ? 'Analyzing...' : 'Get AI Coach Feedback'}
            </button>
          )}
          {coachSummary && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-green-700 mb-1">What went well</p>
                <p className="text-xs text-green-600">{coachSummary.highlight}</p>
              </div>
              <div className="bg-orange-50 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-orange-700 mb-1">To improve</p>
                <p className="text-xs text-orange-600">{coachSummary.improve}</p>
              </div>
              <div className="bg-blue-50 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-blue-700 mb-1">Tip for next week</p>
                <p className="text-xs text-blue-600">{coachSummary.tip}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {streak && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Logging Streak</h3>
            {streak.currentStreak > 0 ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl">{streak.currentStreak > 7 ? '🔥' : streak.currentStreak > 2 ? '⚡' : '💪'}</span>
                  <p className="text-2xl font-bold text-indigo-600">{streak.currentStreak}<span className="text-sm font-normal text-gray-500 ml-1">days</span></p>
                </div>
                {streak.longestStreak > streak.currentStreak && (
                  <p className="text-xs text-gray-400 mt-2">Best: {streak.longestStreak} days</p>
                )}
                {!streak.todayLogged && (
                  <p className="text-xs text-orange-600 font-medium mt-2">Log today to keep your streak!</p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">No active streak</p>
                <p className="text-xs text-indigo-600 font-medium mt-2">Log a meal or workout to start!</p>
                {streak.longestStreak > 0 && (
                  <p className="text-xs text-gray-400 mt-1">Your best: {streak.longestStreak} days</p>
                )}
              </>
            )}
          </div>
        )}

        {muscleRec && muscleRec.muscleGroup && (
          <TrainNextCard muscleRec={muscleRec} />
        )}

        {mealRecs.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Meal Suggestions</h3>
            <p className="text-xs text-gray-500 mb-2">{mealRecs[0]?.reason}</p>
            <ul className="space-y-1">
              {mealRecs.slice(0, 3).map((rec) => (
                <li key={rec.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{rec.name}</span>
                  <span className="text-gray-400">{rec.calories} kcal · {rec.proteinG}g P</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Meals</h2>
          {dietLogs.length === 0 ? (
            <p className="text-gray-400 text-sm">No meals logged yet today.</p>
          ) : (
            <div className="space-y-3">
              {['Pre-Workout', 'Post-Workout', 'Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Miscellaneous']
                .map((type) => ({ type, entries: dietLogs.filter((l) => l.mealType === type) }))
                .filter((g) => g.entries.length > 0)
                .map(({ type, entries }) => (
                  <div key={type}>
                    <p className="text-xs font-semibold text-indigo-500 mb-1">{type}</p>
                    <ul className="space-y-1">
                      {entries.map((log) => (
                        <li key={log.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{log.meal?.name || log.customName}</span>
                          <span className="text-gray-500">{log.calories} kcal</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              {dietLogs.filter((l) => !l.mealType).length > 0 && (
                <ul className="space-y-1">
                  {dietLogs.filter((l) => !l.mealType).map((log) => (
                    <li key={log.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{log.meal?.name || log.customName}</span>
                      <span className="text-gray-500">{log.calories} kcal</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Workouts</h2>
          {workouts.length === 0 ? (
            <p className="text-gray-400 text-sm">No workouts logged yet today.</p>
          ) : (
            <ul className="space-y-2">
              {workouts.map((w) => (
                <li key={w.id} className="text-sm">
                  <span className="font-medium text-gray-700">{w.name}</span>
                  <span className="text-gray-400 ml-2">({w.entries?.length || 0} exercises)</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {healthNotes.length > 0 && (
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Health Notes</h2>
          <ul className="space-y-2">
            {healthNotes.map((n) => (
              <li key={n.id} className={`rounded-lg px-4 py-2 ${
                n.severity === 'serious' ? 'bg-red-50' : n.severity === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
              }`}>
                <span className={`text-sm font-medium ${
                  n.severity === 'serious' ? 'text-red-700' : n.severity === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                }`}>{n.note}</span>
                <span className={`ml-2 text-xs ${
                  n.severity === 'serious' ? 'text-red-400' : n.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                }`}>({n.severity})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sleep + Water Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Last Night's Sleep</h2>
          {sleepLogs.length > 0 ? (
            <div className="bg-purple-50 rounded-lg px-4 py-3">
              <p className="text-2xl font-bold text-purple-700">
                {Math.floor(sleepLogs[0].durationMinutes / 60)}h {sleepLogs[0].durationMinutes % 60}m
              </p>
              <p className="text-xs text-purple-500 mt-1">Bed: {sleepLogs[0].bedtime} → Wake: {sleepLogs[0].wakeTime}</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No sleep logged yet today.</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Water Intake</h2>
          <div className="flex gap-4">
            <div className="bg-blue-50 rounded-lg px-4 py-3 flex-1">
              <p className="text-xs text-blue-600">Water</p>
              <p className="text-xl font-bold text-blue-700">
                {waterLogs.filter(w => w.type === 'Water').reduce((s, w) => s + w.amountMl, 0)} <span className="text-xs font-normal">ml</span>
              </p>
            </div>
            <div className="bg-green-50 rounded-lg px-4 py-3 flex-1">
              <p className="text-xs text-green-600">Coconut Water</p>
              <p className="text-xl font-bold text-green-700">
                {waterLogs.filter(w => w.type === 'Coconut Water').reduce((s, w) => s + w.amountMl, 0)} <span className="text-xs font-normal">ml</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Water Intake (Last 7 Days)</h2>
          {waterWeekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={waterWeekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="ml" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="water" fill="#3b82f6" name="Water" />
                <Bar dataKey="coconutWater" fill="#10b981" name="Coconut Water" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No water data yet this week.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ label, value, target, unit, color }) {
  const percentage = target ? Math.min((value / target) * 100, 100) : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const isOver = target && value > target;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48" cy="48" r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="8"
          />
          <circle
            cx="48" cy="48" r={radius}
            fill="none"
            stroke={isOver ? '#ef4444' : color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{Math.round(percentage)}%</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-700 mt-2">{label}</p>
      <p className="text-xs text-gray-500">
        {value} / {target || '—'} {unit}
      </p>
    </div>
  );
}

function SummaryItem({ label, value, prev, unit }) {
  if (value === null || value === undefined) return null;
  const diff = prev != null && prev !== 0 ? value - prev : null;
  const showDiff = diff !== null && diff !== 0;
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900">
        {value}<span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>
      </p>
      {showDiff && (
        <p className={`text-xs font-medium ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {diff > 0 ? '↑' : '↓'} {Math.abs(Math.round(diff * 10) / 10)} vs last week
        </p>
      )}
    </div>
  );
}

function TrainNextCard({ muscleRec }) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSuggest() {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const recentSessions = await workoutsApi.getAll(from, today);
      const result = await suggestWorkout(recentSessions, muscleRec);
      setSuggestion(result);
    } catch {
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Train Next</h3>
      <p className="text-lg font-bold text-orange-600">{muscleRec.muscleGroup}</p>
      <p className="text-xs text-gray-500 mt-1">Not trained in {muscleRec.daysSinceLastTrained} days</p>
      {!suggestion && (
        <button
          onClick={handleSuggest}
          disabled={loading}
          className="mt-3 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'AI Suggest Workout'}
        </button>
      )}
      {suggestion && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-600">{suggestion.name}</p>
          {suggestion.exercises?.slice(0, 5).map((ex, idx) => (
            <div key={idx} className="flex justify-between text-xs">
              <span className="text-gray-700">{ex.name}</span>
              <span className="text-gray-400">{ex.sets}×{ex.reps}</span>
            </div>
          ))}
          <button onClick={() => setSuggestion(null)} className="text-xs text-gray-400 hover:text-gray-600 mt-1">Dismiss</button>
        </div>
      )}
    </div>
  );
}
