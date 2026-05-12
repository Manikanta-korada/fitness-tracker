import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkoutLog from './pages/WorkoutLog';
import ExerciseLibrary from './pages/ExerciseLibrary';
import DietLog from './pages/DietLog';
import MealLibrary from './pages/MealLibrary';
import Progress from './pages/Progress';
import Login from './pages/Login';

function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workouts" element={<WorkoutLog />} />
        <Route path="/exercise-library" element={<ExerciseLibrary />} />
        <Route path="/diet" element={<DietLog />} />
        <Route path="/meal-library" element={<MealLibrary />} />
        <Route path="/progress" element={<Progress />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
}
