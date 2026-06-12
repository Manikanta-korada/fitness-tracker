import { useEffect, useState } from 'react';
import { templatesApi, exercisesApi } from '../api/client';

export default function WorkoutTemplates() {
  const [templates, setTemplates] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [t, e] = await Promise.all([templatesApi.getAll(), exercisesApi.getAll()]);
    setTemplates(t);
    setExercises(e);
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

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await templatesApi.create({ name, entries });
      setShowForm(false);
      setName('');
      setEntries([]);
      loadData();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await templatesApi.delete(id);
      loadData();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workout Templates</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ New Template'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name (e.g., Push Day)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4 text-sm"
            required
          />

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
            <button type="button" onClick={addEntry} className="text-indigo-600 text-sm font-medium">+ Add Exercise</button>
            <button type="submit" disabled={saving} className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Template'}</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              <button onClick={() => handleDelete(template.id)} disabled={deletingId === template.id} className="text-red-400 text-xs hover:text-red-600 disabled:opacity-50">{deletingId === template.id ? 'Deleting...' : 'Delete'}</button>
            </div>
            {template.entries && template.entries.length > 0 && (
              <div className="mt-3 space-y-2">
                {template.entries.map((entry, idx) => (
                  <div key={idx} className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">{entry.exercise?.name}</span>
                    <span className="text-gray-400 ml-2">
                      {entry.sets?.length} sets: {entry.sets?.map(s => `${s.reps}x${s.weightKg}kg`).join(', ')}
                    </span>
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
