import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, Menu, User, LogOut, Settings, Wallet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export const Navbar = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gradient">ERSX</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Trade</Link>
                <Link to="/portfolio" className="nav-link">Portfolio</Link>
                <Link to="/wallet" className="nav-link">Wallet</Link>
                <Link to="/history" className="nav-link">History</Link>
                {role === 'admin' && (
                  <Link to="/admin" className="nav-link text-warning">Admin</Link>
                )}
              </>
            ) : (
              <>
                <Link to="/" className="nav-link">Home</Link>
                <a href="#features" className="nav-link">Features</a>
                <a href="#about" className="nav-link">About</a>
                <a href="#contact" className="nav-link">Contact</a>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/wallet')}>
                      <Wallet className="w-4 h-4 mr-2" />
                      Wallet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth?mode=register">
                  <Button variant="hero">Get Started</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <Link to="/dashboard" className="nav-link">Trade</Link>
                  <Link to="/portfolio" className="nav-link">Portfolio</Link>
                  <Link to="/wallet" className="nav-link">Wallet</Link>
                  <Link to="/history" className="nav-link">History</Link>
                  {role === 'admin' && (
                    <Link to="/admin" className="nav-link text-warning">Admin</Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/" className="nav-link">Home</Link>
                  <a href="#features" className="nav-link">Features</a>
                  <a href="#about" className="nav-link">About</a>
                  <a href="#contact" className="nav-link">Contact</a>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
