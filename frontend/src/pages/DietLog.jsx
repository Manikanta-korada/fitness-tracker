import { useEffect, useState } from 'react';
import { dietApi, mealsApi, targetsApi, waterApi, sleepApi } from '../api/client';

const MEAL_TYPES = ['Breakfast', 'Pre-Workout', 'Lunch', 'Snacks', 'Post-Workout', 'Dinner'];

export default function DietLog() {
  const [logs, setLogs] = useState([]);
  const [meals, setMeals] = useState([]);
  const [targets, setTargets] = useState(null);
  const [selectedMealId, setSelectedMealId] = useState('');
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState('Breakfast');
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [waterLogs, setWaterLogs] = useState([]);
  const [waterType, setWaterType] = useState('Water');
  const [waterAmount, setWaterAmount] = useState('');
  const [sleepLogs, setSleepLogs] = useState([]);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  async function loadData() {
    const [l, m, t, w, s] = await Promise.all([
      dietApi.getByDate(selectedDate),
      mealsApi.getAll(),
      targetsApi.get(),
      waterApi.getByDate(selectedDate),
      sleepApi.getByDate(selectedDate),
    ]);
    setLogs(l);
    setMeals(m);
    setTargets(t);
    setWaterLogs(w);
    setSleepLogs(s);
  }

  async function handleAddMeal(e) {
    e.preventDefault();
    if (customMode) {
      await dietApi.create({
        date: selectedDate,
        mealType,
        customName,
        calories: parseInt(customCalories),
        proteinG: parseFloat(customProtein),
        carbsG: parseFloat(customCarbs),
        fatG: parseFloat(customFat),
        servings: 1,
      });
      setCustomName('');
      setCustomCalories('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
    } else {
      await dietApi.create({
        date: selectedDate,
        mealType,
        meal: { id: parseInt(selectedMealId) },
        servings: parseFloat(servings),
      });
    }
    loadData();
  }

  async function handleDelete(id) {
    await dietApi.delete(id);
    loadData();
  }

  async function handleAddWater(e) {
    e.preventDefault();
    await waterApi.create({
      date: selectedDate,
      type: waterType,
      amountMl: parseInt(waterAmount),
    });
    setWaterAmount('');
    loadData();
  }

  async function handleDeleteWater(id) {
    await waterApi.delete(id);
    loadData();
  }

  async function handleAddSleep(e) {
    e.preventDefault();
    await sleepApi.create({ date: selectedDate, bedtime, wakeTime });
    loadData();
  }

  async function handleDeleteSleep(id) {
    await sleepApi.delete(id);
    loadData();
  }

  function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }

  const totalCalories = logs.reduce((sum, l) => sum + l.calories, 0);
  const totalProtein = logs.reduce((sum, l) => sum + l.proteinG, 0);
  const totalCarbs = logs.reduce((sum, l) => sum + l.carbsG, 0);
  const totalFat = logs.reduce((sum, l) => sum + l.fatG, 0);

  const selectedMeal = meals.find((m) => m.id === parseInt(selectedMealId));

  const logsByType = MEAL_TYPES.map((type) => ({
    type,
    entries: logs.filter((l) => l.mealType === type),
  })).filter((g) => g.entries.length > 0);

  const uncategorized = logs.filter((l) => !l.mealType || !MEAL_TYPES.includes(l.mealType));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Diet Log</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(new Date(new Date(selectedDate).getTime() - 86400000).toISOString().split('T')[0])}
            className="px-2 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
          >←</button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => setSelectedDate(new Date(new Date(selectedDate).getTime() + 86400000).toISOString().split('T')[0])}
            className="px-2 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
          >→</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <MiniStat label="Calories" value={totalCalories} target={targets?.calorieTarget} unit="kcal" />
        <MiniStat label="Protein" value={totalProtein.toFixed(1)} target={targets?.proteinTargetG} unit="g" />
        <MiniStat label="Carbs" value={totalCarbs.toFixed(1)} target={targets?.carbsTargetG} unit="g" />
        <MiniStat label="Fat" value={totalFat.toFixed(1)} target={targets?.fatTargetG} unit="g" />
      </div>

      <form onSubmit={handleAddMeal} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex gap-3 mb-4 items-center">
          <button
            type="button"
            onClick={() => setCustomMode(false)}
            className={`text-sm px-3 py-1 rounded-lg ${!customMode ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
          >
            From Library
          </button>
          <button
            type="button"
            onClick={() => setCustomMode(true)}
            className={`text-sm px-3 py-1 rounded-lg ${customMode ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
          >
            Custom Entry
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Meal Type</label>
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMealType(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  mealType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {!customMode ? (
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Meal</label>
              <select
                value={selectedMealId}
                onChange={(e) => setSelectedMealId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              >
                <option value="">Select a meal...</option>
                {meals.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.calories} kcal)
                  </option>
                ))}
              </select>
              {selectedMeal && (
                <p className="text-xs text-gray-400 mt-1">
                  P: {selectedMeal.proteinG}g | C: {selectedMeal.carbsG}g | F: {selectedMeal.fatG}g
                </p>
              )}
            </div>
            <div className="w-24">
              <label className="block text-xs text-gray-500 mb-1">Servings</label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                min="0.25"
                step="0.25"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              Add
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Meal name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Calories (kcal)</label>
                <input type="number" value={customCalories} onChange={(e) => setCustomCalories(e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
                <input type="number" value={customProtein} onChange={(e) => setCustomProtein(e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" step="0.1" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
                <input type="number" value={customCarbs} onChange={(e) => setCustomCarbs(e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" step="0.1" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
                <input type="number" value={customFat} onChange={(e) => setCustomFat(e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" step="0.1" required />
              </div>
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Add</button>
          </div>
        )}
      </form>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{selectedDate === new Date().toISOString().split('T')[0] ? "Today's Meals" : `Meals for ${selectedDate}`}</h2>
        </div>
        {logs.length === 0 ? (
          <p className="p-4 text-gray-400 text-sm">No meals logged yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {logsByType.map(({ type, entries }) => (
              <div key={type} className="p-4">
                <h3 className="text-sm font-semibold text-indigo-600 mb-2">{type}</h3>
                <ul className="space-y-2">
                  {entries.map((log) => (
                    <li key={log.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{log.meal?.name || log.customName}</p>
                        <p className="text-xs text-gray-400">
                          {log.calories} kcal | P: {log.proteinG}g | C: {log.carbsG}g | F: {log.fatG}g
                        </p>
                      </div>
                      <button onClick={() => handleDelete(log.id)} className="text-red-400 text-xs hover:text-red-600">Remove</button>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
                  Subtotal: {entries.reduce((s, l) => s + l.calories, 0)} kcal |
                  P: {entries.reduce((s, l) => s + l.proteinG, 0).toFixed(1)}g |
                  C: {entries.reduce((s, l) => s + l.carbsG, 0).toFixed(1)}g |
                  F: {entries.reduce((s, l) => s + l.fatG, 0).toFixed(1)}g
                </p>
              </div>
            ))}
            {uncategorized.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Other</h3>
                <ul className="space-y-2">
                  {uncategorized.map((log) => (
                    <li key={log.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{log.meal?.name || log.customName}</p>
                        <p className="text-xs text-gray-400">
                          {log.calories} kcal | P: {log.proteinG}g | C: {log.carbsG}g | F: {log.fatG}g
                        </p>
                      </div>
                      <button onClick={() => handleDelete(log.id)} className="text-red-400 text-xs hover:text-red-600">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Sleep Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-6">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Sleep</h2>
        </div>
        <div className="p-4">
          {sleepLogs.length === 0 ? (
            <form onSubmit={handleAddSleep} className="flex gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bedtime</label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Wake Time</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                Log Sleep
              </button>
            </form>
          ) : (
            <div className="space-y-2">
              {sleepLogs.map((s) => (
                <div key={s.id} className="flex justify-between items-center bg-purple-50 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-lg font-bold text-purple-700">{formatDuration(s.durationMinutes)}</p>
                    <p className="text-xs text-purple-500">Bed: {s.bedtime} → Wake: {s.wakeTime}</p>
                  </div>
                  <button onClick={() => handleDeleteSleep(s.id)} className="text-red-400 text-xs hover:text-red-600">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Water Intake Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-6">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Water Intake</h2>
        </div>
        <div className="p-4">
          <form onSubmit={handleAddWater} className="flex gap-3 items-end mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select
                value={waterType}
                onChange={(e) => setWaterType(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="Water">Water</option>
                <option value="Coconut Water">Coconut Water</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Amount (ml)</label>
              <input
                type="number"
                value={waterAmount}
                onChange={(e) => setWaterAmount(e.target.value)}
                placeholder="250"
                min="1"
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              Add
            </button>
          </form>

          <div className="flex gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg px-4 py-2">
              <p className="text-xs text-blue-600">Water</p>
              <p className="text-lg font-bold text-blue-700">
                {waterLogs.filter(w => w.type === 'Water').reduce((s, w) => s + w.amountMl, 0)} <span className="text-xs font-normal">ml</span>
              </p>
            </div>
            <div className="bg-green-50 rounded-lg px-4 py-2">
              <p className="text-xs text-green-600">Coconut Water</p>
              <p className="text-lg font-bold text-green-700">
                {waterLogs.filter(w => w.type === 'Coconut Water').reduce((s, w) => s + w.amountMl, 0)} <span className="text-xs font-normal">ml</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-700">
                {waterLogs.reduce((s, w) => s + w.amountMl, 0)} <span className="text-xs font-normal">ml</span>
              </p>
            </div>
          </div>

          {waterLogs.length > 0 && (
            <ul className="space-y-1">
              {waterLogs.map((w) => (
                <li key={w.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{w.type} — {w.amountMl} ml</span>
                  <button onClick={() => handleDeleteWater(w.id)} className="text-red-400 text-xs hover:text-red-600">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, target, unit }) {
  const percentage = target ? Math.min((parseFloat(value) / target) * 100, 100) : 0;
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}<span className="text-xs font-normal text-gray-400 ml-1">{unit}</span></p>
      {target && (
        <div className="mt-1">
          <div className="h-1.5 bg-gray-100 rounded-full">
            <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${percentage}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">/ {target}</p>
        </div>
      )}
    </div>
  );
}
