import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - auto-hide on hover */}
      <div className="hidden md:block">
        <div className="fixed left-0 top-0 h-screen w-16 hover:w-64 group transition-all duration-300 ease-in-out">
          <Sidebar collapsed={true} />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}

      {/* Main Content */}
      <main className={`${isMobile ? 'mb-16' : 'md:ml-16'} p-8`}>
        {children}
      </main>
    </div>
  );
}