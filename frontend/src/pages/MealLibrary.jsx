import { useEffect, useState } from 'react';
import { mealsApi } from '../api/client';

export default function MealLibrary() {
  const [meals, setMeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    loadMeals();
  }, []);

  async function loadMeals() {
    setMeals(await mealsApi.getAll());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await mealsApi.create({
      name,
      calories: parseInt(calories),
      proteinG: parseFloat(protein),
      carbsG: parseFloat(carbs),
      fatG: parseFloat(fat),
    });
    setShowForm(false);
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    loadMeals();
  }

  async function handleDelete(id) {
    await mealsApi.delete(id);
    loadMeals();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meal Library</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ Add Meal'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Meal name" className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-3 text-sm" required />
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Calories (kcal)</label>
              <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
              <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" step="0.1" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
              <input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" step="0.1" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
              <input type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" step="0.1" required />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Save Meal</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meals.map((meal) => (
          <div key={meal.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 text-sm">{meal.name}</h3>
              {meal.custom && (
                <button onClick={() => handleDelete(meal.id)} className="text-red-400 text-xs hover:text-red-600">Delete</button>
              )}
            </div>
            <p className="text-lg font-bold text-orange-600">{meal.calories} <span className="text-xs font-normal">kcal</span></p>
            <div className="flex gap-3 mt-2 text-xs text-gray-500">
              <span>P: {meal.proteinG}g</span>
              <span>C: {meal.carbsG}g</span>
              <span>F: {meal.fatG}g</span>
            </div>
            {!meal.custom && <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Pre-built</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
