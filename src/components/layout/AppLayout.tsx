import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { BottomNav } from '../common/BottomNav';

export const AppLayout: React.FC = () => {
  // Persist sidebar collapsed state
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('acuity_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('acuity_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Global keyboard shortcut for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-[#0B1020] dark:text-[#F8FAFC]">
      {/* Subtle enterprise ambient radial glow */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-10%,rgba(99,102,241,0.05),transparent)] dark:bg-[radial-gradient(ellipse_80%_45%_at_50%_-10%,rgba(99,102,241,0.07),rgba(11,16,32,0))]" 
      />

      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Workspace Viewport */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          onToggleMobileMenu={() => setMobileOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 pb-20 md:pb-8">
          <div className="max-w-[1720px] mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Navigation Bar */}
        <BottomNav />
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};

