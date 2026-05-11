import { useEffect, useState } from 'react';
import { workoutsApi, exercisesApi, templatesApi } from '../api/client';

export default function WorkoutLog() {
  const [sessions, setSessions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [s, e, t] = await Promise.all([
      workoutsApi.getAll(),
      exercisesApi.getAll(),
      templatesApi.getAll(),
    ]);
    setSessions(s);
    setExercises(e);
    setTemplates(t);
  }

  function addEntry() {
    setEntries([...entries, {
      exercise: { id: exercises[0]?.id },
      sets: [{ setNumber: 1, reps: 10, weightKg: 0 }],
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workout Log</h1>
        <button
          onClick={() => showForm ? cancelForm() : setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ New Workout'}
        </button>
      </div>

      {templates.length > 0 && !showForm && (
        <div className="mb-6 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick start from template:</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleApplyTemplate(t.id)}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{editingId ? 'Edit Workout' : 'New Workout'}</h3>
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
                    min="1"
                  />
                  <input
                    type="number"
                    value={set.weightKg}
                    onChange={(e) => updateSet(entryIdx, setIdx, 'weightKg', e.target.value)}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center"
                    step="0.5"
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

      <div className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{session.name}</h3>
                <p className="text-xs text-gray-400">{session.date}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => startEdit(session)} className="text-indigo-500 text-xs hover:text-indigo-700">Edit</button>
                <button onClick={() => handleDelete(session.id)} className="text-red-400 text-xs hover:text-red-600">Delete</button>
              </div>
            </div>
            {session.entries && session.entries.length > 0 && (
              <div className="mt-3 space-y-2">
                {session.entries.map((entry, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="font-medium text-gray-700 text-sm mb-1">{entry.exercise?.name}</p>
                    <div className="grid grid-cols-3 text-xs font-medium text-gray-400 mb-1 ml-2">
                      <span>Set</span>
                      <span className="text-center">Reps</span>
                      <span className="text-center">Weight (kg)</span>
                    </div>
                    {entry.sets?.map((set, sIdx) => (
                      <div key={sIdx} className="grid grid-cols-3 text-sm text-gray-600 ml-2">
                        <span>{set.setNumber}</span>
                        <span className="text-center">{set.reps}</span>
                        <span className="text-center">{set.weightKg}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
