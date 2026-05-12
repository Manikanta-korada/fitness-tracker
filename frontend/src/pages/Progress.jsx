import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { progressApi, exercisesApi, targetsApi, waterApi, sleepApi, healthNotesApi } from '../api/client';

export default function Progress() {
  const [weightData, setWeightData] = useState([]);
  const [calorieData, setCalorieData] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [targets, setTargets] = useState(null);
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [targetProtein, setTargetProtein] = useState('');
  const [targetCarbs, setTargetCarbs] = useState('');
  const [targetFat, setTargetFat] = useState('');
  const [waterWeekly, setWaterWeekly] = useState([]);
  const [waterMonthly, setWaterMonthly] = useState([]);
  const [macroData, setMacroData] = useState([]);
  const [mealBreakdown, setMealBreakdown] = useState([]);
  const [workoutFrequency, setWorkoutFrequency] = useState([]);
  const [muscleVolume, setMuscleVolume] = useState([]);
  const [sleepTrend, setSleepTrend] = useState([]);
  const [personalRecords, setPersonalRecords] = useState([]);
  const [healthTimeline, setHealthTimeline] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [w, e, t] = await Promise.all([
      progressApi.getWeight(),
      exercisesApi.getAll(),
      targetsApi.get(),
    ]);
    setWeightData(w);
    setExercises(e);
    setTargets(t);
    if (t) {
      setTargetCalories(t.calorieTarget || '');
      setTargetProtein(t.proteinTargetG || '');
      setTargetCarbs(t.carbsTargetG || '');
      setTargetFat(t.fatTargetG || '');
    }

    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [cal, waterWeek, waterMonth, macros, mealBrkdwn, wkFreq, musVol, sleepData] = await Promise.all([
      progressApi.getCalories(from, to),
      waterApi.getTrend(weekFrom, to),
      waterApi.getTrend(from, to),
      progressApi.getMacros(from, to),
      progressApi.getMealBreakdown(from, to),
      progressApi.getWorkoutFrequency(from, to),
      progressApi.getMuscleVolume(from, to),
      sleepApi.getTrend(from, to),
    ]);
    setCalorieData(cal);
    setWaterWeekly(waterWeek);
    setWaterMonthly(waterMonth);
    setMacroData(macros);
    setMealBreakdown(mealBrkdwn);
    setWorkoutFrequency(wkFreq);
    setMuscleVolume(musVol);
    setSleepTrend(sleepData);
    progressApi.getPersonalRecords().then(setPersonalRecords).catch(() => {});
    healthNotesApi.getTrend(from, to).then(setHealthTimeline).catch(() => {});
  }

  async function loadExerciseProgress(exerciseId) {
    setSelectedExercise(exerciseId);
    if (exerciseId) {
      const data = await progressApi.getExercise(exerciseId);
      setExerciseData(data);
    }
  }

  async function handleLogWeight(e) {
    e.preventDefault();
    await progressApi.logWeight({ weightKg: parseFloat(newWeight) });
    setNewWeight('');
    setWeightData(await progressApi.getWeight());
  }

  async function handleSaveTargets(e) {
    e.preventDefault();
    await targetsApi.update({
      calorieTarget: parseInt(targetCalories),
      proteinTargetG: parseFloat(targetProtein),
      carbsTargetG: parseFloat(targetCarbs),
      fatTargetG: parseFloat(targetFat),
    });
    setShowTargetForm(false);
    setTargets(await targetsApi.get());
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
        <button
          onClick={() => setShowTargetForm(!showTargetForm)}
          className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
        >
          {showTargetForm ? 'Cancel' : 'Edit Targets'}
        </button>
      </div>

      {showTargetForm && (
        <form onSubmit={handleSaveTargets} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Daily Targets</h3>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500">Calories</label>
              <input type="number" value={targetCalories} onChange={(e) => setTargetCalories(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Protein (g)</label>
              <input type="number" value={targetProtein} onChange={(e) => setTargetProtein(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" step="0.1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Carbs (g)</label>
              <input type="number" value={targetCarbs} onChange={(e) => setTargetCarbs(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" step="0.1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Fat (g)</label>
              <input type="number" value={targetFat} onChange={(e) => setTargetFat(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" step="0.1" />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Save Targets</button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Body Weight Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Body Weight</h2>
          <form onSubmit={handleLogWeight} className="flex gap-2 mb-4">
            <input
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Weight (kg)"
              step="0.1"
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1"
              required
            />
            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm">Log</button>
          </form>
          {weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="weightKg" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No weight data yet.</p>
          )}
        </div>

        {/* Sleep Duration Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Sleep Duration (30 Days)</h2>
          {sleepTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sleepTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="h" domain={[0, 'auto']} />
                <Tooltip formatter={(value) => [`${value} hours`, 'Sleep']} />
                <Line type="monotone" dataKey="durationHours" stroke="#7c3aed" strokeWidth={2} dot={true} name="Hours Slept" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No sleep data yet.</p>
          )}
        </div>

        {/* Calorie Trend Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Calorie Trend (30 days)</h2>
          {calorieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No calorie data yet.</p>
          )}
        </div>

        {/* Macros Trend (30 days) */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Macros Trend (30 Days)</h2>
          {macroData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={macroData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="g" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="protein" stroke="#3b82f6" strokeWidth={2} dot={false} name="Protein (g)" />
                <Line type="monotone" dataKey="carbs" stroke="#10b981" strokeWidth={2} dot={false} name="Carbs (g)" />
                <Line type="monotone" dataKey="fat" stroke="#f59e0b" strokeWidth={2} dot={false} name="Fat (g)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No macro data yet.</p>
          )}
        </div>

        {/* Meal Type Calorie Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Calories by Meal Type (30 Days)</h2>
          {mealBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mealBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mealType" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit=" kcal" />
                <Tooltip />
                <Bar dataKey="calories" fill="#f97316" name="Calories (kcal)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No meal data yet.</p>
          )}
        </div>

        {/* Workout Frequency */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Workout Frequency (Per Week)</h2>
          {workoutFrequency.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={workoutFrequency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="workouts" fill="#6366f1" name="Workouts" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No workout data yet.</p>
          )}
        </div>

        {/* Muscle Group Volume */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Volume by Muscle Group (30 Days)</h2>
          {muscleVolume.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={muscleVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="muscleGroup" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="volume" fill="#10b981" name="Volume (kg x reps)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No workout volume data yet.</p>
          )}
        </div>

        {/* Water Intake - Weekly Bar Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Water Intake (Last 7 Days)</h2>
          {waterWeekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={waterWeekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="ml" />
                <Tooltip />
                <Legend />
                <Bar dataKey="water" fill="#3b82f6" name="Water (ml)" />
                <Bar dataKey="coconutWater" fill="#10b981" name="Coconut Water (ml)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No water data yet.</p>
          )}
        </div>

        {/* Water Intake - Monthly Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Water Intake Trend (30 Days)</h2>
          {waterMonthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={waterMonthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="ml" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2} dot={false} name="Water (ml)" />
                <Line type="monotone" dataKey="coconutWater" stroke="#10b981" strokeWidth={2} dot={false} name="Coconut Water (ml)" />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={false} name="Total (ml)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No water data yet.</p>
          )}
        </div>

        {/* Exercise Progress Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Exercise Progress</h2>
          <select
            value={selectedExercise}
            onChange={(e) => loadExerciseProgress(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4"
          >
            <option value="">Select an exercise...</option>
            {Object.entries(exercises.reduce((groups, ex) => {
              (groups[ex.muscleGroup] = groups[ex.muscleGroup] || []).push(ex);
              return groups;
            }, {})).map(([group, exs]) => (
              <optgroup key={group} label={group}>
                {exs.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {exerciseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={exerciseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="weightKg" stroke="#10b981" strokeWidth={2} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">{selectedExercise ? 'No data for this exercise yet.' : 'Select an exercise to view progress.'}</p>
          )}
        </div>

        {/* Personal Records */}
        {personalRecords.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-4">Personal Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(personalRecords.reduce((groups, pr) => {
                const g = pr.muscleGroup || 'Other';
                (groups[g] = groups[g] || []).push(pr);
                return groups;
              }, {})).map(([group, prs]) => (
                <div key={group}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{group}</h3>
                  <ul className="space-y-1">
                    {prs.map((pr) => (
                      <li key={pr.exerciseId} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-gray-700">{pr.exerciseName}</span>
                        <span className="font-bold text-indigo-600">{pr.maxWeightKg} kg</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Timeline */}
        {healthTimeline.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-4">Health Timeline (30 Days)</h2>
            <div className="space-y-3">
              {healthTimeline.map((n) => (
                <div key={n.id} className={`rounded-lg px-4 py-3 flex items-start gap-3 ${
                  n.severity === 'serious' ? 'bg-red-50' : n.severity === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
                }`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    n.severity === 'serious' ? 'bg-red-500' : n.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      n.severity === 'serious' ? 'text-red-700' : n.severity === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                    }`}>{n.note}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
