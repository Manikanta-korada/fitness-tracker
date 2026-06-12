import { useEffect, useState, useRef } from 'react';
import { mealsApi } from '../api/client';

export default function MealLibrary() {
  const [meals, setMeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    loadMeals();
  }, []);

  async function loadMeals() {
    setMeals(await mealsApi.getAll());
  }

  function startEdit(meal) {
    setEditingId(meal.id);
    setName(meal.name);
    setCalories(String(meal.calories));
    setProtein(String(meal.proteinG));
    setCarbs(String(meal.carbsG));
    setFat(String(meal.fatG));
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const cal = parseInt(calories);
    const prot = parseFloat(protein);
    const c = parseFloat(carbs);
    const f = parseFloat(fat);
    if (!name.trim() || [cal, prot, c, f].some(v => isNaN(v) || v < 0)) return;
    setSaving(true);
    try {
      const payload = { name: name.trim(), calories: cal, proteinG: prot, carbsG: c, fatG: f };
      if (editingId) {
        await mealsApi.update(editingId, payload);
      } else {
        await mealsApi.create(payload);
      }
      resetForm();
      loadMeals();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await mealsApi.delete(id);
      loadMeals();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meal Library</h1>
        <button
          onClick={() => showForm ? resetForm() : setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ Add Meal'}
        </button>
      </div>

      {showForm && (
        <form ref={formRef} onSubmit={handleSubmit} className={`bg-white rounded-xl p-6 border shadow-sm mb-6 ${editingId ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-100'}`}>
          {editingId && <p className="text-sm font-semibold text-indigo-600 mb-3">Editing Meal</p>}
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Meal name" className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-3 text-sm" required />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Calories (kcal)</label>
              <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" min="0" step="1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
              <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" min="0" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
              <input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" min="0" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
              <input type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="0" min="0" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
            </div>
          </div>
          <button type="submit" disabled={saving} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Update Meal' : 'Save Meal'}</button>
        </form>
      )}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search meals..."
        aria-label="Search meals"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meals.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())).map((meal) => (
          <div key={meal.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 text-sm">{meal.name}</h3>
              <div className="flex gap-1.5">
                <button onClick={() => startEdit(meal)} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded hover:bg-indigo-100">Edit</button>
                <button onClick={() => handleDelete(meal.id)} disabled={deletingId === meal.id} aria-label={`Delete ${meal.name}`} className="px-2 py-0.5 bg-red-50 text-red-500 text-xs font-medium rounded hover:bg-red-100 disabled:opacity-50">{deletingId === meal.id ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
            <p className="text-lg font-bold text-orange-600">{meal.calories} <span className="text-xs font-normal">kcal</span></p>
            <div className="flex gap-3 mt-2 text-xs text-gray-500">
              <span>P: {meal.proteinG}g</span>
              <span>C: {meal.carbsG}g</span>
              <span>F: {meal.fatG}g</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
