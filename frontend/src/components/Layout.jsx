import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/workouts', label: 'Workouts' },
  { path: '/templates', label: 'Templates' },
  { path: '/diet', label: 'Diet' },
  { path: '/meal-library', label: 'Meal Library' },
  { path: '/progress', label: 'Progress' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 p-4 flex flex-col gap-1 fixed h-full">
        <h1 className="text-xl font-bold text-indigo-600 mb-6 px-3">FitTracker</h1>
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
      </aside>
      <main className="flex-1 ml-56 p-8">
        <Outlet />
      </main>
    </div>
  );
}
