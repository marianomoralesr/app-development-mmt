import { Home, Car, FileText, User, Settings, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function MobileNav() {
  const navigate = useNavigate();
  const { role } = useAuthStore();

  const getNavItems = () => {
    switch (role?.nombre) {
      case 'admin':
        return [
          { icon: Home, label: 'Home', path: '/' },
          { icon: Car, label: 'Review', path: '/admin/review' },
          { icon: FileText, label: 'Loans', path: '/admin/loans' },
          { icon: Settings, label: 'Dashboard', path: '/admin/dashboard' },
        ];
      case 'seller':
        return [
          { icon: Home, label: 'Dashboard', path: '/dashboard' },
          { icon: Car, label: 'Submit', path: '/mis-autos' },
          { icon: ClipboardList, label: 'History', path: '/history' },
          { icon: User, label: 'Profile', path: '/profile' },
        ];
      default:
        return [
          { icon: Home, label: 'Home', path: '/' },
          { icon: FileText, label: 'Apply', path: '/autos' },
          { icon: ClipboardList, label: 'Applications', path: '/mis-solicitudes' },
          { icon: User, label: 'Profile', path: '/profile' },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-primary"
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}