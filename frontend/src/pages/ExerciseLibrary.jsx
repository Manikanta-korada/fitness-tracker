import { useEffect, useState } from 'react';
import { exercisesApi } from '../api/client';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Legs', 'Biceps', 'Triceps', 'Forearms', 'Core'];

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Chest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    setExercises(await exercisesApi.getAll());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await exercisesApi.create({ name, muscleGroup });
    setShowForm(false);
    setName('');
    setMuscleGroup('Chest');
    loadExercises();
  }

  async function handleDelete(id) {
    await exercisesApi.delete(id);
    loadExercises();
  }

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, ex) => {
    const group = ex.muscleGroup || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(ex);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exercise Library</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ Add Exercise'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Exercise name"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-3 text-sm"
            required
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Muscle Group</label>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            Save Exercise
          </button>
        </form>
      )}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search exercises..."
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-6"
      />

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{group}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((ex) => (
              <div key={ex.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{ex.name}</h3>
                  <span className="inline-block mt-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{ex.muscleGroup}</span>
                </div>
                {ex.custom ? (
                  <button onClick={() => handleDelete(ex.id)} className="text-red-400 text-xs hover:text-red-600">Delete</button>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Pre-built</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
