import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/workouts', label: 'Log Workout' },
  { path: '/diet', label: 'Log Meal' },
  { path: '/meal-library', label: 'Meal Library' },
  { path: '/exercise-library', label: 'Exercise Library' },
  { path: '/progress', label: 'Progress' },
];

export default function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 p-4 flex flex-col fixed h-full">
        <h1 className="text-xl font-bold text-indigo-600 mb-1 px-3">FitBot</h1>
        <a href="https://instagram.com/fit_man_i" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-indigo-500 px-3 mb-5 block">@fit_man_i</a>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-100 pt-3 mt-3">
          <p className="text-xs text-gray-500 px-3 truncate">{user?.email}</p>
          <button
            onClick={signOut}
            className="mt-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left font-medium"
          >
            Log Out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-56 p-8">
        <Outlet />
      </main>
    </div>
  );
}
