import { useNavigate } from 'react-router-dom';
import { 
  Home, Car, LogOut, UserSquare2, PlusCircle, 
  FileText, ClipboardList, Settings, User 
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const navigate = useNavigate();
  const { user, role } = useAuthStore();

  const getNavItems = () => {
    switch (role?.nombre) {
      case 'admin':
        return [
          { icon: Home, label: 'Home', path: '/' },
          { icon: Car, label: 'Review Autos', path: '/admin/review' },
          { icon: FileText, label: 'Review Loans', path: '/admin/loans' },
          { icon: Settings, label: 'Dashboard', path: '/admin/dashboard' },
        ];
      case 'seller':
        return [
          { icon: Home, label: 'Dashboard', path: '/dashboard' },
          { icon: PlusCircle, label: 'Submit Auto', path: '/mis-autos' },
          { icon: ClipboardList, label: 'History', path: '/history' },
          { icon: User, label: 'Profile', path: '/profile' },
        ];
      default:
        return [
          { icon: Home, label: 'Home', path: '/' },
          { icon: FileText, label: 'Apply for Loan', path: '/autos' },
          { icon: ClipboardList, label: 'My Applications', path: '/mis-solicitudes' },
          { icon: User, label: 'Profile', path: '/profile' },
        ];
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = getNavItems();

  return (
    <aside className="h-full bg-white shadow-lg flex flex-col transition-all duration-300">
      <div className={`p-4 ${collapsed ? 'text-center' : ''}`}>
        <h1 className="text-2xl font-bold text-primary truncate">TREFA</h1>
        <div className={`mt-2 text-sm text-gray-600 truncate ${collapsed ? 'hidden group-hover:block' : ''}`}>
          {user?.nombre} {user?.apellido}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ icon: Icon, label, path }) => (
            <li key={path}>
              <button
                onClick={() => navigate(path)}
                className="flex items-center w-full p-3 rounded-md hover:bg-gray-100 text-gray-700"
              >
                <Icon className="w-5 h-5 min-w-[1.25rem]" />
                <span className={`ml-3 ${collapsed ? 'hidden group-hover:block' : ''}`}>
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-md hover:bg-red-50 text-red-600"
        >
          <LogOut className="w-5 h-5 min-w-[1.25rem]" />
          <span className={`ml-3 ${collapsed ? 'hidden group-hover:block' : ''}`}>
            Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>
  );
}