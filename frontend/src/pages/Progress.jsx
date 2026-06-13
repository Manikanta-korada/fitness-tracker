import { useEffect, useState, useRef } from 'react';
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
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetCalories, setTargetCalories] = useState('');
  const [targetProtein, setTargetProtein] = useState('');
  const [targetCarbs, setTargetCarbs] = useState('');
  const [targetFat, setTargetFat] = useState('');
  const [targetWater, setTargetWater] = useState('');
  const [waterMonthly, setWaterMonthly] = useState([]);
  const [macroData, setMacroData] = useState([]);
  const [workoutFrequency, setWorkoutFrequency] = useState([]);
  const [muscleVolume, setMuscleVolume] = useState([]);
  const [sleepTrend, setSleepTrend] = useState([]);
  const [personalRecords, setPersonalRecords] = useState([]);
  const [healthTimeline, setHealthTimeline] = useState([]);
  const [loaded, setLoaded] = useState({});
  const [loggingWeight, setLoggingWeight] = useState(false);
  const [savingTargets, setSavingTargets] = useState(false);
  const [rangeDays, setRangeDays] = useState(7);
  const reportRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [rangeDays]);

  async function loadData() {
    setLoaded({});
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    progressApi.getWeight().then(d => { setWeightData(d); setLoaded(p => ({...p, weight: true})); }).catch(() => setLoaded(p => ({...p, weight: true})));
    exercisesApi.getAll().then(d => { setExercises(d); setLoaded(p => ({...p, exercises: true})); }).catch(() => setLoaded(p => ({...p, exercises: true})));
    targetsApi.get().then(d => {
      setTargets(d);
      if (d) { setTargetCalories(d.calorieTarget || ''); setTargetProtein(d.proteinTargetG || ''); setTargetCarbs(d.carbsTargetG || ''); setTargetFat(d.fatTargetG || ''); setTargetWater(d.waterTargetMl || ''); }
      setLoaded(p => ({...p, targets: true}));
    }).catch(() => setLoaded(p => ({...p, targets: true})));
    sleepApi.getTrend(from, to).then(d => { setSleepTrend(d); setLoaded(p => ({...p, sleep: true})); }).catch(() => setLoaded(p => ({...p, sleep: true})));
    progressApi.getCalories(from, to).then(d => { setCalorieData(d); setLoaded(p => ({...p, calories: true})); }).catch(() => setLoaded(p => ({...p, calories: true})));
    progressApi.getMacros(from, to).then(d => { setMacroData(d); setLoaded(p => ({...p, macros: true})); }).catch(() => setLoaded(p => ({...p, macros: true})));
    progressApi.getWorkoutFrequency(from, to).then(d => { setWorkoutFrequency(d); setLoaded(p => ({...p, workoutFreq: true})); }).catch(() => setLoaded(p => ({...p, workoutFreq: true})));
    progressApi.getMuscleVolume(from, to).then(d => { setMuscleVolume(d); setLoaded(p => ({...p, muscleVol: true})); }).catch(() => setLoaded(p => ({...p, muscleVol: true})));
    waterApi.getTrend(from, to).then(d => { setWaterMonthly(d); setLoaded(p => ({...p, waterMonthly: true})); }).catch(() => setLoaded(p => ({...p, waterMonthly: true})));
    progressApi.getPersonalRecords().then(d => { setPersonalRecords(d); setLoaded(p => ({...p, records: true})); }).catch(() => setLoaded(p => ({...p, records: true})));
    healthNotesApi.getTrend(from, to).then(d => { setHealthTimeline(d); setLoaded(p => ({...p, health: true})); }).catch(() => setLoaded(p => ({...p, health: true})));
  }

  function CardSpinner() {
    return <div className="flex items-center justify-center py-8" role="status" aria-label="Loading"><div className="w-6 h-6 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  }

  function handleExportPDF() {
    window.print();
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
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0 || weight > 500) return;
    setLoggingWeight(true);
    try {
      await progressApi.logWeight({ weightKg: weight, date: weightDate });
      setNewWeight('');
      setWeightDate(new Date().toISOString().split('T')[0]);
      setWeightData(await progressApi.getWeight());
    } finally {
      setLoggingWeight(false);
    }
  }

  async function handleSaveTargets(e) {
    e.preventDefault();
    const cal = parseInt(targetCalories);
    const prot = parseFloat(targetProtein);
    const carbs = parseFloat(targetCarbs);
    const fat = parseFloat(targetFat);
    const water = parseInt(targetWater) || 0;
    if ([cal, prot, carbs, fat].some(v => isNaN(v) || v < 0)) return;
    setSavingTargets(true);
    try {
      await targetsApi.update({
        calorieTarget: cal,
        proteinTargetG: prot,
        carbsTargetG: carbs,
        fatTargetG: fat,
        waterTargetMl: water,
      });
      setShowTargetForm(false);
      setTargets(await targetsApi.get());
    } finally {
      setSavingTargets(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Progress</h1>
        <div className="flex gap-3 items-center">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            {[{ label: '7d', value: 7 }, { label: '30d', value: 30 }, { label: 'All', value: 9999 }].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setRangeDays(value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${rangeDays === value ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportPDF}
            className="text-sm text-white bg-indigo-600 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-700"
          >
            Download Report
          </button>
          <button
            onClick={() => setShowTargetForm(!showTargetForm)}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
          >
            {showTargetForm ? 'Cancel' : 'Edit Targets'}
          </button>
        </div>
      </div>

      {showTargetForm && (
        <form onSubmit={handleSaveTargets} className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Daily Targets</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-gray-500">Calories</label>
              <input type="number" value={targetCalories} onChange={(e) => setTargetCalories(e.target.value)} min="0" step="1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Protein (g)</label>
              <input type="number" value={targetProtein} onChange={(e) => setTargetProtein(e.target.value)} min="0" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Carbs (g)</label>
              <input type="number" value={targetCarbs} onChange={(e) => setTargetCarbs(e.target.value)} min="0" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Fat (g)</label>
              <input type="number" value={targetFat} onChange={(e) => setTargetFat(e.target.value)} min="0" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Water (ml)</label>
              <input type="number" value={targetWater} onChange={(e) => setTargetWater(e.target.value)} min="0" step="100" placeholder="3000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingTargets}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {savingTargets ? 'Saving...' : 'Save Targets'}
          </button>
        </form>
      )}

      {loaded.weight && loaded.calories && weightData.length >= 2 && calorieData.length >= 7 && (
        <TdeeCard weightData={weightData} calorieData={calorieData} />
      )}

      <div ref={reportRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Body Weight Chart */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Body Weight</h2>
          <form onSubmit={handleLogWeight} className="flex gap-2 mb-4">
            <input
              type="date"
              value={weightDate}
              onChange={(e) => setWeightDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              aria-label="Date for weight entry"
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
              required
            />
            <input
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Weight (kg)"
              step="0.1"
              min="0.1"
              max="500"
              aria-label="Body weight in kg"
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1"
              required
            />
            <button
              type="submit"
              disabled={loggingWeight}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
            >
              {loggingWeight ? 'Logging...' : 'Log'}
            </button>
          </form>
          {!loaded.weight ? <CardSpinner /> : weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData.filter(w => w.date >= new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}>
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
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Sleep Duration ({rangeDays} Days)</h2>
          {!loaded.sleep ? <CardSpinner /> : sleepTrend.length > 0 ? (
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
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Calorie Trend ({rangeDays} Days)</h2>
          {!loaded.calories ? <CardSpinner /> : calorieData.length > 0 ? (
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

        {/* Macros Trend */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Macros Trend ({rangeDays} Days)</h2>
          {!loaded.macros ? <CardSpinner /> : macroData.length > 0 ? (
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

        {/* Workout Frequency */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Workout Frequency (Per Week)</h2>
          {!loaded.workoutFreq ? <CardSpinner /> : workoutFrequency.length > 0 ? (
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
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Volume by Muscle Group ({rangeDays} Days)</h2>
          {!loaded.muscleVol ? <CardSpinner /> : muscleVolume.length > 0 ? (
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


        {/* Water Intake - Monthly Trend */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Water Intake Trend ({rangeDays} Days)</h2>
          {!loaded.waterMonthly ? <CardSpinner /> : waterMonthly.length > 0 ? (
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
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Exercise Progress</h2>
          <select
            value={selectedExercise}
            onChange={(e) => loadExerciseProgress(e.target.value)}
            aria-label="Select exercise to view progress"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 w-full sm:w-auto"
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
        {(loaded.records && personalRecords.length > 0) && (
          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm lg:col-span-2">
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
        {(loaded.health && healthTimeline.length > 0) && (
          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm lg:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-4">Health Timeline ({rangeDays} Days)</h2>
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

function TdeeCard({ weightData, calorieData }) {
  const last28Days = calorieData.slice(-28);
  if (last28Days.length < 7) return null;

  const avgCalories = Math.round(last28Days.reduce((s, d) => s + d.calories, 0) / last28Days.length);

  const firstDate = last28Days[0].date;
  const lastDate = last28Days[last28Days.length - 1].date;

  const weightsInRange = weightData.filter(w => w.date >= firstDate && w.date <= lastDate);
  if (weightsInRange.length < 2) return null;

  const startWeight = weightsInRange[0].weightKg;
  const endWeight = weightsInRange[weightsInRange.length - 1].weightKg;
  const weightChange = endWeight - startWeight;

  const days = Math.max(1, (new Date(lastDate) - new Date(firstDate)) / (1000 * 60 * 60 * 24));

  const dailyWeightChange = weightChange / days;
  const caloriesFromWeight = dailyWeightChange * 7700;

  const tdee = Math.round(avgCalories - caloriesFromWeight);
  const dailyBalance = Math.round(avgCalories - tdee);

  const status = dailyBalance > 50 ? 'surplus' : dailyBalance < -50 ? 'deficit' : 'maintenance';
  const statusColor = status === 'surplus' ? 'text-green-600' : status === 'deficit' ? 'text-red-600' : 'text-gray-600';
  const statusLabel = status === 'surplus' ? 'Surplus' : status === 'deficit' ? 'Deficit' : 'Maintenance';

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Your Daily Calorie Burn (TDEE)</h3>
      <p className="text-xs text-gray-400 mb-4">How many calories your body burns per day, calculated from your actual intake and weight changes. Eat above this to gain, below to lose.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500">You Burn</p>
          <p className="text-2xl font-bold text-gray-900">{tdee}<span className="text-xs font-normal text-gray-400 ml-1">kcal/day</span></p>
        </div>
        <div>
          <p className="text-xs text-gray-500">You Eat</p>
          <p className="text-lg font-bold text-gray-900">{avgCalories}<span className="text-xs font-normal text-gray-400 ml-1">kcal/day</span></p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Daily Balance</p>
          <p className={`text-lg font-bold ${statusColor}`}>
            {dailyBalance > 0 ? '+' : ''}{dailyBalance}<span className="text-xs font-normal ml-1">kcal</span>
          </p>
          <p className={`text-xs font-medium ${statusColor}`}>{statusLabel}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Weight Change</p>
          <p className="text-lg font-bold text-gray-900">
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}<span className="text-xs font-normal text-gray-400 ml-1">kg</span>
          </p>
          <p className="text-xs text-gray-400">over {Math.round(days)} days</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">Based on {last28Days.length} days of calorie data + {weightsInRange.length} weight entries</p>
    </div>
  );
}
