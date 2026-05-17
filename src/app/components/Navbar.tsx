import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Menu, Search, Bell, User, Plus, X, Home, Settings, History } from 'lucide-react';

interface NavbarProps {
  showPlusButton?: boolean;
  onCreateLab?: () => void;
}

export function Navbar({ showPlusButton = false, onCreateLab }: NavbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border shadow-lg">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <span className="font-bold text-lg hidden sm:block">AILabAgent</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-input-background rounded-lg px-4 h-10 border border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search labs..."
                className="bg-transparent border-none outline-none text-sm w-64"
              />
            </div>

            {showPlusButton && (
              <button
                onClick={onCreateLab}
                className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}

            <button className="p-2 hover:bg-accent/10 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </button>

            <button className="p-2 hover:bg-accent/10 rounded-lg transition-colors" onClick={() => navigate('/profile')}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Menu</h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors group"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Home className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors group"
                onClick={() => setIsSidebarOpen(false)}
              >
                <User className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                <span>Profile</span>
              </Link>

              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors group"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                <span>Settings</span>
              </Link>

              <Link
                to="/lab-history"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors group"
                onClick={() => setIsSidebarOpen(false)}
              >
                <History className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                <span>Lab History</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
