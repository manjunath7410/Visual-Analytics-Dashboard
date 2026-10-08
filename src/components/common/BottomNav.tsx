import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LineChart, 
  Sparkles, 
  Database, 
  FileText 
} from 'lucide-react';

interface BottomNavItem {
  name: string;
  to: string;
  icon: React.ElementType;
}

const navItems: BottomNavItem[] = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Analytics', to: '/analytics', icon: LineChart },
  { name: 'AI Insights', to: '/insights', icon: Sparkles },
  { name: 'SQL & OLAP', to: '/sql', icon: Database },
  { name: 'Reports', to: '/reports', icon: FileText },
];

export const BottomNav: React.FC = () => {
  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex h-14 items-stretch border-t border-slate-200/90 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-950/95"
    >
      <div className="flex w-full items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-1 flex-col items-center justify-center py-1 min-h-[44px] transition-colors
                ${isActive 
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold' 
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
