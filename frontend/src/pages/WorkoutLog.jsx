import { useEffect, useState } from 'react';
import { workoutsApi, exercisesApi, templatesApi } from '../api/client';
import Spinner from '../components/Spinner';

export default function WorkoutLog() {
  const [activeTab, setActiveTab] = useState('log');
  const [exercises, setExercises] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateEntries, setTemplateEntries] = useState([]);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedSession, setExpandedSession] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [monthSessions, setMonthSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const workoutDates = new Set(monthSessions.map(s => s.date));
  const sessions = monthSessions.filter(s => s.date === viewDate);

  useEffect(() => {
    Promise.allSettled([
      exercisesApi.getAll().then(setExercises),
      templatesApi.getAll().then(setTemplates),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadMonthWorkouts();
  }, [calendarMonth]);

  async function loadMonthWorkouts() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const from = new Date(year, month, 1).toISOString().split('T')[0];
    const to = new Date(year, month + 1, 0).toISOString().split('T')[0];
    setMonthSessions(await workoutsApi.getAll(from, to));
  }

  async function loadData() {
    loadMonthWorkouts();
    templatesApi.getAll().then(setTemplates);
  }

  function addEntry() {
    setEntries([...entries, {
      exercise: { id: exercises[0]?.id },
      sets: [{ setNumber: 1, reps: 10, weightKg: 0, durationMinutes: null, distanceKm: null }],
    }]);
  }

  function removeEntry(index) {
    setEntries(entries.filter((_, i) => i !== index));
  }

  function updateExercise(entryIndex, exerciseId) {
    const updated = [...entries];
    updated[entryIndex].exercise = { id: parseInt(exerciseId) };
    setEntries(updated);
  }

  function addSet(entryIndex) {
    const updated = [...entries];
    const sets = updated[entryIndex].sets;
    const lastSet = sets[sets.length - 1];
    sets.push({
      setNumber: sets.length + 1,
      reps: lastSet?.reps || 10,
      weightKg: lastSet?.weightKg || 0,
      durationMinutes: lastSet?.durationMinutes || null,
      distanceKm: lastSet?.distanceKm || null,
    });
    setEntries(updated);
  }

  function removeSet(entryIndex, setIndex) {
    const updated = [...entries];
    updated[entryIndex].sets = updated[entryIndex].sets
      .filter((_, i) => i !== setIndex)
      .map((s, i) => ({ ...s, setNumber: i + 1 }));
    setEntries(updated);
  }

  function updateSet(entryIndex, setIndex, field, value) {
    const updated = [...entries];
    updated[entryIndex].sets[setIndex][field] = parseFloat(value);
    setEntries(updated);
  }

  function startEdit(session) {
    setEditingId(session.id);
    setSessionName(session.name);
    setWorkoutDate(session.date);
    setEntries(
      session.entries.map((e) => ({
        exercise: { id: e.exercise?.id },
        sets: e.sets.map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps,
          weightKg: s.weightKg,
        })),
      }))
    );
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setSessionName('');
    setWorkoutDate(new Date().toISOString().split('T')[0]);
    setEntries([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await workoutsApi.update(editingId, { name: sessionName, date: workoutDate, entries });
    } else {
      await workoutsApi.create({
        name: sessionName,
        date: workoutDate,
        entries,
      });
    }
    cancelForm();
    loadData();
  }

  async function handleApplyTemplate(templateId) {
    await templatesApi.apply(templateId);
    loadData();
  }

  async function handleDelete(id) {
    await workoutsApi.delete(id);
    loadData();
  }

  async function handleRepeatPrevious() {
    if (!sessionName.trim()) return;
    const last = await workoutsApi.getLast(sessionName);
    if (last && last.entries) {
      setEntries(last.entries.map((e) => ({
        exercise: { id: e.exercise?.id },
        sets: e.sets.map((s) => ({ setNumber: s.setNumber, reps: s.reps, weightKg: s.weightKg, durationMinutes: s.durationMinutes, distanceKm: s.distanceKm })),
      })));
    }
  }

  function addTemplateEntry() {
    setTemplateEntries([...templateEntries, {
      exercise: { id: exercises[0]?.id },
      sets: [{ setNumber: 1, reps: 10, weightKg: 0, durationMinutes: null, distanceKm: null }],
    }]);
  }

  function removeTemplateEntry(index) {
    setTemplateEntries(templateEntries.filter((_, i) => i !== index));
  }

  function updateTemplateExercise(entryIndex, exerciseId) {
    const updated = [...templateEntries];
    updated[entryIndex].exercise = { id: parseInt(exerciseId) };
    setTemplateEntries(updated);
  }

  function addTemplateSet(entryIndex) {
    const updated = [...templateEntries];
    const sets = updated[entryIndex].sets;
    const lastSet = sets[sets.length - 1];
    sets.push({ setNumber: sets.length + 1, reps: lastSet?.reps || 10, weightKg: lastSet?.weightKg || 0, durationMinutes: lastSet?.durationMinutes || null, distanceKm: lastSet?.distanceKm || null });
    setTemplateEntries(updated);
  }

  function removeTemplateSet(entryIndex, setIndex) {
    const updated = [...templateEntries];
    updated[entryIndex].sets = updated[entryIndex].sets.filter((_, i) => i !== setIndex).map((s, i) => ({ ...s, setNumber: i + 1 }));
    setTemplateEntries(updated);
  }

  function updateTemplateSet(entryIndex, setIndex, field, value) {
    const updated = [...templateEntries];
    updated[entryIndex].sets[setIndex][field] = parseFloat(value);
    setTemplateEntries(updated);
  }

  async function handleTemplateSubmit(e) {
    e.preventDefault();
    await templatesApi.create({ name: templateName, entries: templateEntries });
    setShowTemplateForm(false);
    setTemplateName('');
    setTemplateEntries([]);
    loadData();
  }

  async function handleDeleteTemplate(id) {
    await templatesApi.delete(id);
    loadData();
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Log Workout</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('log')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'log' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Log Workout
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'templates' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            My Templates
          </button>
        </div>
      </div>

      {activeTab === 'templates' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Create reusable workout presets</p>
            <button
              onClick={() => setShowTemplateForm(!showTemplateForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              {showTemplateForm ? 'Cancel' : '+ New Template'}
            </button>
          </div>

          {showTemplateForm && (
            <form onSubmit={handleTemplateSubmit} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name (e.g., Push Day)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4 text-sm"
                required
              />
              {templateEntries.map((entry, entryIdx) => (
                <div key={entryIdx} className="border border-gray-200 rounded-lg p-3 mb-3">
                  <div className="flex gap-2 items-center mb-2">
                    <select
                      value={entry.exercise.id}
                      onChange={(e) => updateTemplateExercise(entryIdx, e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                    >
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
                    <button type="button" onClick={() => removeTemplateEntry(entryIdx)} className="text-red-500 text-sm">Remove</button>
                  </div>
                  <div className="flex gap-2 items-center mb-1 text-xs font-medium text-gray-500 ml-2">
                    <span className="w-10">Set</span>
                    <span className="w-16 text-center">Reps</span>
                    <span className="w-20 text-center">Weight (kg)</span>
                    <span className="w-20 text-center">Min</span>
                    <span className="w-20 text-center">Dist (km)</span>
                    <span className="w-6"></span>
                  </div>
                  {entry.sets.map((set, setIdx) => (
                    <div key={setIdx} className="flex gap-2 items-center mb-1 ml-2">
                      <span className="w-10 text-sm text-gray-500">{set.setNumber}</span>
                      <input type="number" value={set.reps} onChange={(e) => updateTemplateSet(entryIdx, setIdx, 'reps', e.target.value)} className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center" min="0" />
                      <input type="number" value={set.weightKg} onChange={(e) => updateTemplateSet(entryIdx, setIdx, 'weightKg', e.target.value)} className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center" step="0.5" />
                      <input type="number" value={set.durationMinutes || ''} onChange={(e) => updateTemplateSet(entryIdx, setIdx, 'durationMinutes', e.target.value || null)} className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center" placeholder="-" min="0" step="0.01" />
                      <input type="number" value={set.distanceKm || ''} onChange={(e) => updateTemplateSet(entryIdx, setIdx, 'distanceKm', e.target.value || null)} className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center" placeholder="-" step="0.1" min="0" />
                      <button type="button" onClick={() => removeTemplateSet(entryIdx, setIdx)} className="text-red-400 text-xs w-6">X</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addTemplateSet(entryIdx)} className="text-indigo-500 text-xs font-medium ml-2 mt-1">+ Add Set</button>
                </div>
              ))}
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={addTemplateEntry} className="text-indigo-600 text-sm font-medium">+ Add Exercise</button>
                <button type="submit" className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Save Template</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <div className="flex gap-3">
                    <button onClick={() => { handleApplyTemplate(template.id); setActiveTab('log'); }} className="text-indigo-500 text-xs hover:text-indigo-700">Apply</button>
                    <button onClick={() => handleDeleteTemplate(template.id)} className="text-red-400 text-xs hover:text-red-600">Delete</button>
                  </div>
                </div>
                {template.entries && template.entries.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {template.entries.map((entry, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        <span className="font-medium text-gray-700">{entry.exercise?.name}</span>
                        <span className="text-gray-400 ml-2">
                          {entry.sets?.length} sets: {entry.sets?.map(s => {
                          let parts = [];
                          if (s.reps) parts.push(`${s.reps}x${s.weightKg}kg`);
                          if (s.durationMinutes) parts.push(`${s.durationMinutes}min`);
                          if (s.distanceKm) parts.push(`${s.distanceKm}km`);
                          return parts.join(' ') || `${s.reps}x${s.weightKg}kg`;
                        }).join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'log' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              {templates.length > 0 && !showForm && templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleApplyTemplate(t.id)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs hover:bg-indigo-100"
                >
                  {t.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => showForm ? cancelForm() : setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              {showForm ? 'Cancel' : '+ New Workout'}
            </button>
          </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-700">{editingId ? 'Edit Workout' : 'New Workout'}</h3>
            {!editingId && (
              <button type="button" onClick={handleRepeatPrevious} className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                Repeat Previous
              </button>
            )}
          </div>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Workout name (e.g., Push Day)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {entries.map((entry, entryIdx) => (
            <div key={entryIdx} className="border border-gray-200 rounded-lg p-3 mb-3">
              <div className="flex gap-2 items-center mb-2">
                <select
                  value={entry.exercise.id}
                  onChange={(e) => updateExercise(entryIdx, e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                >
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
                <button type="button" onClick={() => removeEntry(entryIdx)} className="text-red-500 text-sm">Remove</button>
              </div>

              <div className="flex gap-2 items-center mb-1 text-xs font-medium text-gray-500 ml-2">
                <span className="w-10">Set</span>
                <span className="w-16 text-center">Reps</span>
                <span className="w-20 text-center">Weight (kg)</span>
                <span className="w-20 text-center">Min</span>
                <span className="w-20 text-center">Dist (km)</span>
                <span className="w-6"></span>
              </div>

              {entry.sets.map((set, setIdx) => (
                <div key={setIdx} className="flex gap-2 items-center mb-1 ml-2">
                  <span className="w-10 text-sm text-gray-500">{set.setNumber}</span>
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) => updateSet(entryIdx, setIdx, 'reps', e.target.value)}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center"
                    min="0"
                  />
                  <input
                    type="number"
                    value={set.weightKg}
                    onChange={(e) => updateSet(entryIdx, setIdx, 'weightKg', e.target.value)}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center"
                    step="0.5"
                  />
                  <input
                    type="number"
                    value={set.durationMinutes || ''}
                    onChange={(e) => updateSet(entryIdx, setIdx, 'durationMinutes', e.target.value || null)}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center"
                    placeholder="-"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    value={set.distanceKm || ''}
                    onChange={(e) => updateSet(entryIdx, setIdx, 'distanceKm', e.target.value || null)}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center"
                    placeholder="-"
                    step="0.1"
                    min="0"
                  />
                  <button type="button" onClick={() => removeSet(entryIdx, setIdx)} className="text-red-400 text-xs w-6">X</button>
                </div>
              ))}

              <button type="button" onClick={() => addSet(entryIdx)} className="text-indigo-500 text-xs font-medium ml-2 mt-1">
                + Add Set
              </button>
            </div>
          ))}

          <div className="flex gap-3 mt-4">
            <button type="button" onClick={addEntry} className="text-indigo-600 text-sm font-medium">
              + Add Exercise
            </button>
            <button type="submit" className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              {editingId ? 'Update Workout' : 'Save Workout'}
            </button>
          </div>
        </form>
      )}

      {(() => {
        const today = new Date().toISOString().split('T')[0];
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOffset = (firstDay.getDay() + 6) % 7;
        const daysInMonth = lastDay.getDate();

        const mondayOfWeek = new Date();
        mondayOfWeek.setDate(mondayOfWeek.getDate() - ((mondayOfWeek.getDay() + 6) % 7));
        const weekStart = mondayOfWeek.toISOString().split('T')[0];
        const weekDays = [];
        for (let i = 0; i < 6; i++) {
          const d = new Date(mondayOfWeek);
          d.setDate(d.getDate() + i);
          weekDays.push(d.toISOString().split('T')[0]);
        }
        const weekLogged = weekDays.filter(d => workoutDates.has(d)).length;

        return (
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm mb-4 max-w-md">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="px-2 py-0.5 bg-gray-100 rounded text-xs hover:bg-gray-200">←</button>
              <h3 className="text-xs font-semibold text-gray-700">
                {calendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </h3>
              <button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="px-2 py-0.5 bg-gray-100 rounded text-xs hover:bg-gray-200">→</button>
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
                const dayOfWeek = new Date(year, month, day).getDay();
                const isSunday = dayOfWeek === 0;
                const isPast = dateStr < today;
                const isToday = dateStr === today;
                const isSelected = dateStr === viewDate;
                const hasWorkout = workoutDates.has(dateStr);

                let bgColor = '';
                if (hasWorkout) bgColor = 'bg-green-100 text-green-700';
                else if (isSunday) bgColor = 'bg-gray-100 text-gray-400';
                else if (isPast) bgColor = 'bg-red-50 text-red-400';
                else bgColor = 'bg-gray-50 text-gray-500';

                return (
                  <button
                    key={day}
                    onClick={() => setViewDate(dateStr)}
                    className={`py-1 rounded text-[11px] font-medium flex items-center justify-center ${bgColor} ${isSelected ? 'ring-2 ring-indigo-500' : ''} ${isToday ? 'ring-1 ring-indigo-300' : ''} hover:opacity-80`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex gap-2 text-[10px] text-gray-500">
                <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded bg-green-100 border border-green-300" />Logged</span>
                <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded bg-red-50 border border-red-200" />Missed</span>
                <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded bg-gray-100 border border-gray-300" />Rest</span>
              </div>
              <span className="text-xs font-semibold text-indigo-600">{weekLogged}/6 <span className="text-[10px] font-normal text-gray-400">this week</span></span>
            </div>
          </div>
        );
      })()}

      <div className="space-y-3">
        {sessions.length === 0 && (
          <p className="text-gray-400 text-sm">No workouts logged for this date.</p>
        )}
        {sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs">{expandedSession === session.id ? '▼' : '▶'}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{session.name}</h3>
                  <p className="text-xs text-gray-400">{session.entries?.length || 0} exercises</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={(e) => { e.stopPropagation(); startEdit(session); }} className="text-indigo-500 text-xs hover:text-indigo-700">Edit</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }} className="text-red-400 text-xs hover:text-red-600">Delete</button>
              </div>
            </div>
            {expandedSession === session.id && session.entries && session.entries.length > 0 && (
              <div className="px-4 pb-4 space-y-2">
                {session.entries.map((entry, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="font-medium text-gray-700 text-sm mb-1">{entry.exercise?.name}</p>
                    <div className="grid grid-cols-5 text-xs font-medium text-gray-400 mb-1 ml-2">
                      <span>Set</span>
                      <span className="text-center">Reps</span>
                      <span className="text-center">Weight</span>
                      <span className="text-center">Min</span>
                      <span className="text-center">Dist</span>
                    </div>
                    {entry.sets?.map((set, sIdx) => (
                      <div key={sIdx} className="grid grid-cols-5 text-sm text-gray-600 ml-2">
                        <span>{set.setNumber}</span>
                        <span className="text-center">{set.reps || '-'}</span>
                        <span className="text-center">{set.weightKg || '-'}</span>
                        <span className="text-center">{set.durationMinutes || '-'}</span>
                        <span className="text-center">{set.distanceKm || '-'}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
}
