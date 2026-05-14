import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dietApi, workoutsApi, targetsApi, waterApi, sleepApi, progressApi, healthNotesApi } from '../api/client';

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
  const [healthNotes, setHealthNotes] = useState([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    dietApi.getByDate(today).then(setDietLogs);
    workoutsApi.getAll(today, today).then(setWorkouts);
    targetsApi.get().then(setTargets);
    waterApi.getByDate(today).then(setWaterLogs);
    sleepApi.getByDate(today).then(setSleepLogs);
    progressApi.getMealRecommendations().then(setMealRecs).catch(() => {});
    progressApi.getMuscleGroupRecommendation().then(setMuscleRec).catch(() => {});
    progressApi.getWeeklyStreak().then(setWeeklyStreak).catch(() => {});
    healthNotesApi.getByDate(today).then(setHealthNotes).catch(() => {});
    const weekFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    waterApi.getTrend(weekFrom, today).then(setWaterWeekly);
  }, []);

  const waterNutrients = waterLogs.reduce((acc, w) => ({
    calories: acc.calories + (w.calories || 0),
    proteinG: acc.proteinG + (w.proteinG || 0),
    carbsG: acc.carbsG + (w.carbsG || 0),
    fatG: acc.fatG + (w.fatG || 0),
  }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });

  const totalCalories = dietLogs.reduce((sum, l) => sum + l.calories, 0) + waterNutrients.calories;
  const totalProtein = dietLogs.reduce((sum, l) => sum + l.proteinG, 0) + waterNutrients.proteinG;
  const totalCarbs = dietLogs.reduce((sum, l) => sum + l.carbsG, 0) + waterNutrients.carbsG;
  const totalFat = dietLogs.reduce((sum, l) => sum + l.fatG, 0) + waterNutrients.fatG;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <p className="text-gray-500 mb-8">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Calories"
          value={totalCalories}
          target={targets?.calorieTarget}
          unit="kcal"
          color="bg-orange-50 text-orange-700"
        />
        <StatCard
          label="Protein"
          value={totalProtein.toFixed(1)}
          target={targets?.proteinTargetG}
          unit="g"
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Carbs"
          value={totalCarbs.toFixed(1)}
          target={targets?.carbsTargetG}
          unit="g"
          color="bg-green-50 text-green-700"
        />
        <StatCard
          label="Fat"
          value={totalFat.toFixed(1)}
          target={targets?.fatTargetG}
          unit="g"
          color="bg-purple-50 text-purple-700"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {weeklyStreak && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Weekly Streak</h3>
            <p className="text-2xl font-bold text-indigo-600">{weeklyStreak.daysLogged}/{weeklyStreak.totalDays} <span className="text-sm font-normal text-gray-500">days</span></p>
            <div className="flex gap-1 mt-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full ${i < weeklyStreak.daysLogged ? 'bg-indigo-500' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
        )}

        {muscleRec && muscleRec.muscleGroup && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Train Next</h3>
            <p className="text-lg font-bold text-orange-600">{muscleRec.muscleGroup}</p>
            <p className="text-xs text-gray-500 mt-1">Not trained in {muscleRec.daysSinceLastTrained} days</p>
          </div>
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

function StatCard({ label, value, target, unit, color }) {
  return (
    <div className={`rounded-xl p-5 ${color}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">
        {value} <span className="text-sm font-normal">{unit}</span>
      </p>
      {target && (
        <p className="text-xs mt-1 opacity-60">Target: {target} {unit}</p>
      )}
    </div>
  );
}
