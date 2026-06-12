import { useEffect, useState } from 'react';
import { dietApi, mealsApi, targetsApi, waterApi, sleepApi, healthNotesApi, progressApi } from '../api/client';
import Spinner from '../components/Spinner';

const MEAL_TYPES = ['Pre-Workout', 'Post-Workout', 'Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Miscellaneous'];

export default function DietLog() {
  const [logs, setLogs] = useState([]);
  const [meals, setMeals] = useState([]);
  const [targets, setTargets] = useState(null);
  const [recentMeals, setRecentMeals] = useState([]);
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
  const [healthNotes, setHealthNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [noteSeverity, setNoteSeverity] = useState('info');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [monthCalories, setMonthCalories] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [waterSubmitting, setWaterSubmitting] = useState(false);
  const [sleepSubmitting, setSleepSubmitting] = useState(false);
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [copyingYesterday, setCopyingYesterday] = useState(false);
  const [quickAddingIdx, setQuickAddingIdx] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saveToLibrary, setSaveToLibrary] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  useEffect(() => {
    loadMonthCalories();
  }, [calendarMonth]);

  async function loadData() {
    setLoading(true);
    const [l, m, t, w, s] = await Promise.allSettled([
      dietApi.getByDate(selectedDate),
      mealsApi.getAll(),
      targetsApi.get(),
      waterApi.getByDate(selectedDate),
      sleepApi.getByDate(selectedDate),
    ]);
    setLogs(l.status === 'fulfilled' ? l.value : []);
    setMeals(m.status === 'fulfilled' ? m.value : []);
    setTargets(t.status === 'fulfilled' ? t.value : null);
    setWaterLogs(w.status === 'fulfilled' ? w.value : []);
    setSleepLogs(s.status === 'fulfilled' ? s.value : []);
    setLoading(false);
    dietApi.getRecent().then(setRecentMeals).catch(() => {});
    healthNotesApi.getByDate(selectedDate).then(setHealthNotes).catch(() => {});
  }

  async function loadMonthCalories() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const from = new Date(year, month, 1).toISOString().split('T')[0];
    const to = new Date(year, month + 1, 0).toISOString().split('T')[0];
    const data = await progressApi.getCalories(from, to);
    const map = {};
    data.forEach(d => { map[d.date] = d.calories; });
    setMonthCalories(map);
  }

  async function handleAddNote(e) {
    e.preventDefault();
    setNoteSubmitting(true);
    try {
      await healthNotesApi.create({ date: selectedDate, note: noteText, severity: noteSeverity });
      setNoteText('');
      setNoteSeverity('info');
      loadData();
    } finally {
      setNoteSubmitting(false);
    }
  }

  async function handleDeleteNote(id) {
    setDeletingId(id);
    try {
      await healthNotesApi.delete(id);
      loadData();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopyYesterday() {
    setCopyingYesterday(true);
    try {
      const yesterday = new Date(new Date(selectedDate).getTime() - 86400000).toISOString().split('T')[0];
      await dietApi.copyDay(yesterday, selectedDate);
      loadData();
    } finally {
      setCopyingYesterday(false);
    }
  }

  async function handleAddMeal(e) {
    e.preventDefault();
    if (customMode) {
      const cal = parseInt(customCalories);
      const prot = parseFloat(customProtein);
      const carb = parseFloat(customCarbs);
      const fat = parseFloat(customFat);
      if (!customName.trim() || isNaN(cal) || isNaN(prot) || isNaN(carb) || isNaN(fat)) return;
      if (cal < 0 || prot < 0 || carb < 0 || fat < 0) return;
    } else {
      if (!selectedMealId) return;
      const srv = parseFloat(servings);
      if (isNaN(srv) || srv <= 0) return;
    }
    setSubmitting(true);
    try {
      if (customMode) {
        const cal = parseInt(customCalories);
        const prot = parseFloat(customProtein);
        const carb = parseFloat(customCarbs);
        const f = parseFloat(customFat);
        if (saveToLibrary) {
          const created = await mealsApi.create({ name: customName.trim(), calories: cal, proteinG: prot, carbsG: carb, fatG: f });
          await dietApi.create({ date: selectedDate, mealType, meal: { id: created.id }, servings: 1 });
        } else {
          await dietApi.create({ date: selectedDate, mealType, customName: customName.trim(), calories: cal, proteinG: prot, carbsG: carb, fatG: f, servings: 1 });
        }
        setCustomName('');
        setCustomCalories('');
        setCustomProtein('');
        setCustomCarbs('');
        setCustomFat('');
        setSaveToLibrary(false);
      } else {
        await dietApi.create({
          date: selectedDate,
          mealType,
          meal: { id: parseInt(selectedMealId) },
          servings: parseFloat(servings),
        });
        setSelectedMealId('');
        setServings(1);
      }
      loadData();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await dietApi.delete(id);
      loadData();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAddWater(e) {
    e.preventDefault();
    const amount = parseInt(waterAmount);
    if (isNaN(amount) || amount < 1 || amount > 5000) return;
    setWaterSubmitting(true);
    try {
      await waterApi.create({
        date: selectedDate,
        type: waterType,
        amountMl: amount,
      });
      setWaterAmount('');
      loadData();
    } finally {
      setWaterSubmitting(false);
    }
  }

  async function handleDeleteWater(id) {
    setDeletingId(id);
    try {
      await waterApi.delete(id);
      loadData();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAddSleep(e) {
    e.preventDefault();
    setSleepSubmitting(true);
    try {
      await sleepApi.create({ date: selectedDate, bedtime, wakeTime });
      loadData();
    } finally {
      setSleepSubmitting(false);
    }
  }

  async function handleDeleteSleep(id) {
    setDeletingId(id);
    try {
      await sleepApi.delete(id);
      loadData();
    } finally {
      setDeletingId(null);
    }
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

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Log Meal</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {selectedDate === new Date().toISOString().split('T')[0]
              ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
              : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={handleCopyYesterday}
          disabled={copyingYesterday}
          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 disabled:opacity-50"
        >
          {copyingYesterday ? 'Copying...' : 'Copy Yesterday'}
        </button>
      </div>

      {(() => {
        const today = new Date().toISOString().split('T')[0];
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOffset = (firstDay.getDay() + 6) % 7;
        const daysInMonth = lastDay.getDate();
        const calorieTarget = targets?.calorieTarget || 0;

        return (
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm mb-4 max-w-md">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} aria-label="Previous month" className="px-2 py-0.5 bg-gray-100 rounded text-xs hover:bg-gray-200">&larr;</button>
              <h3 className="text-xs font-semibold text-gray-700">
                {calendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </h3>
              <button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} aria-label="Next month" className="px-2 py-0.5 bg-gray-100 rounded text-xs hover:bg-gray-200">&rarr;</button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} className="text-[10px] text-center text-gray-400 font-medium">{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isPast = dateStr < today;
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;
                const dayCals = monthCalories[dateStr];
                const hasData = dayCals !== undefined;

                let bgColor = '';
                if (hasData && calorieTarget > 0 && dayCals >= calorieTarget) bgColor = 'bg-green-100 text-green-700';
                else if (hasData) bgColor = 'bg-red-50 text-red-400';
                else if (isPast) bgColor = 'bg-gray-100 text-gray-400';
                else bgColor = 'bg-gray-50 text-gray-500';

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`py-1 rounded text-[11px] font-medium flex items-center justify-center ${bgColor} ${isSelected ? 'ring-2 ring-indigo-500' : ''} ${isToday ? 'ring-1 ring-indigo-300' : ''} hover:opacity-80`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex gap-2 text-[10px] text-gray-500">
                <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded bg-green-100 border border-green-300" />Target met</span>
                <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded bg-red-50 border border-red-200" />Below target</span>
                <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded bg-gray-100 border border-gray-300" />Not logged</span>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MiniStat label="Calories" value={totalCalories} target={targets?.calorieTarget} unit="kcal" />
        <MiniStat label="Protein" value={totalProtein.toFixed(1)} target={targets?.proteinTargetG} unit="g" />
        <MiniStat label="Carbs" value={totalCarbs.toFixed(1)} target={targets?.carbsTargetG} unit="g" />
        <MiniStat label="Fat" value={totalFat.toFixed(1)} target={targets?.fatTargetG} unit="g" />
      </div>

      {recentMeals.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">Quick Add (Recent)</p>
          <div className="flex flex-wrap gap-2">
            {recentMeals.slice(0, 6).map((rec, idx) => (
              <button
                key={idx}
                type="button"
                disabled={quickAddingIdx === idx}
                onClick={async () => {
                  setQuickAddingIdx(idx);
                  try {
                    if (rec.mealId) {
                      await dietApi.create({ date: selectedDate, mealType, meal: { id: rec.mealId }, servings: 1 });
                    } else {
                      await dietApi.create({ date: selectedDate, mealType, customName: rec.name, calories: rec.calories, proteinG: rec.proteinG, carbsG: 0, fatG: 0, servings: 1 });
                    }
                    loadData();
                  } finally {
                    setQuickAddingIdx(null);
                  }
                }}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 disabled:opacity-50"
              >
                {quickAddingIdx === idx ? 'Adding...' : <>{rec.name} <span className="text-gray-400">({rec.calories} kcal)</span></>}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleAddMeal} className="bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex gap-3 mb-4 items-center" role="tablist" aria-label="Meal entry mode">
          <button
            type="button"
            role="tab"
            aria-selected={!customMode}
            onClick={() => setCustomMode(false)}
            className={`text-sm px-3 py-1 rounded-lg ${!customMode ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
          >
            From Library
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={customMode}
            onClick={() => setCustomMode(true)}
            className={`text-sm px-3 py-1 rounded-lg ${customMode ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
          >
            Custom Entry
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1" id="meal-type-label">Meal Type</label>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="meal-type-label">
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
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
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
            <div className="flex gap-3 items-end">
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
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Meal name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Calories (kcal)</label>
                <input type="number" value={customCalories} onChange={(e) => setCustomCalories(e.target.value)} placeholder="0" min="0" step="1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
                <input type="number" value={customProtein} onChange={(e) => setCustomProtein(e.target.value)} placeholder="0" min="0" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
                <input type="number" value={customCarbs} onChange={(e) => setCustomCarbs(e.target.value)} placeholder="0" min="0" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
                <input type="number" value={customFat} onChange={(e) => setCustomFat(e.target.value)} placeholder="0" min="0" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToLibrary}
                  onChange={(e) => setSaveToLibrary(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-xs text-gray-600">Save to Meal Library</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add'}
            </button>
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
                      <button onClick={() => handleDelete(log.id)} disabled={deletingId === log.id} className="text-red-400 text-xs hover:text-red-600 disabled:opacity-50">{deletingId === log.id ? 'Removing...' : 'Remove'}</button>
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
                      <button onClick={() => handleDelete(log.id)} disabled={deletingId === log.id} className="text-red-400 text-xs hover:text-red-600 disabled:opacity-50">{deletingId === log.id ? 'Removing...' : 'Remove'}</button>
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
            <form onSubmit={handleAddSleep} className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div>
                <label htmlFor="bedtime-input" className="block text-xs text-gray-500 mb-1">Bedtime</label>
                <input
                  id="bedtime-input"
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="waketime-input" className="block text-xs text-gray-500 mb-1">Wake Time</label>
                <input
                  id="waketime-input"
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sleepSubmitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {sleepSubmitting ? 'Logging...' : 'Log Sleep'}
              </button>
            </form>
          ) : (
            <div className="space-y-2">
              {sleepLogs.map((s) => (
                <div key={s.id} className="flex justify-between items-center bg-purple-50 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-lg font-bold text-purple-700">{formatDuration(s.durationMinutes)}</p>
                    <p className="text-xs text-purple-500">Bed: {s.bedtime} &rarr; Wake: {s.wakeTime}</p>
                  </div>
                  <button onClick={() => handleDeleteSleep(s.id)} disabled={deletingId === s.id} className="text-red-400 text-xs hover:text-red-600 disabled:opacity-50">{deletingId === s.id ? 'Removing...' : 'Remove'}</button>
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
          <form onSubmit={handleAddWater} className="flex flex-col sm:flex-row gap-3 sm:items-end mb-4">
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
                max="5000"
                step="1"
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={waterSubmitting}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {waterSubmitting ? 'Adding...' : 'Add'}
            </button>
          </form>

          <div className="flex flex-wrap gap-3 mb-4">
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
                  <span className="text-gray-600">{w.type} &mdash; {w.amountMl} ml</span>
                  <button onClick={() => handleDeleteWater(w.id)} disabled={deletingId === w.id} className="text-red-400 text-xs hover:text-red-600 disabled:opacity-50">{deletingId === w.id ? 'Removing...' : 'Remove'}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Health Notes Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-6">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Health Notes</h2>
        </div>
        <div className="p-4">
          <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-3 sm:items-end mb-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Note</label>
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g., Felt dizzy after workout..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Severity</label>
              <select
                value={noteSeverity}
                onChange={(e) => setNoteSeverity(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="serious">Serious</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={noteSubmitting}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {noteSubmitting ? 'Adding...' : 'Add'}
            </button>
          </form>

          {healthNotes.length > 0 && (
            <ul className="space-y-2">
              {healthNotes.map((n) => (
                <li key={n.id} className={`flex justify-between items-center rounded-lg px-4 py-3 ${
                  n.severity === 'serious' ? 'bg-red-50' : n.severity === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
                }`}>
                  <div>
                    <p className={`text-sm font-medium ${
                      n.severity === 'serious' ? 'text-red-700' : n.severity === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                    }`}>{n.note}</p>
                    <span className={`text-xs ${
                      n.severity === 'serious' ? 'text-red-500' : n.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                    }`}>{n.severity}</span>
                  </div>
                  <button onClick={() => handleDeleteNote(n.id)} disabled={deletingId === n.id} className="text-red-400 text-xs hover:text-red-600 disabled:opacity-50">{deletingId === n.id ? 'Removing...' : 'Remove'}</button>
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
