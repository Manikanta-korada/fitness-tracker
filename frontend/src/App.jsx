import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkoutLog from './pages/WorkoutLog';
import WorkoutTemplates from './pages/WorkoutTemplates';
import DietLog from './pages/DietLog';
import MealLibrary from './pages/MealLibrary';
import Progress from './pages/Progress';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workouts" element={<WorkoutLog />} />
        <Route path="/templates" element={<WorkoutTemplates />} />
        <Route path="/diet" element={<DietLog />} />
        <Route path="/meal-library" element={<MealLibrary />} />
        <Route path="/progress" element={<Progress />} />
      </Route>
    </Routes>
  );
}
