import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Shield, CalendarDays } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, role, signOut, loading } = useAuth();

  const navLinks = [
    { name: "Find Coaches", href: "#coaches" },
    { name: "Session Types", href: "#sessions" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Reviews", href: "#reviews" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'athlete': return 'Athlete';
      case 'parent': return 'Parent';
      case 'coach': return 'Coach';
      case 'admin': return 'Admin';
      default: return '';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-md border-b border-cream/10">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <span className="font-display text-xl text-accent-foreground">D</span>
            </div>
            <span className="font-display text-2xl text-cream tracking-wide">
              DIAMOND<span className="text-accent">PRO</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-cream/80 hover:text-cream transition-colors text-sm font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="h-10 w-24 bg-cream/10 animate-pulse rounded-md" />
            ) : user ? (
              <>
                <div className="text-cream/80 text-sm">
                  <span className="text-cream font-medium">{user.user_metadata?.first_name || 'User'}</span>
                  {role && (
                    <span className="ml-2 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                      {getRoleLabel(role)}
                    </span>
                  )}
                </div>
                {(role === 'athlete' || role === 'parent') && (
                  <Button 
                    variant="ghost" 
                    className="text-cream hover:text-cream hover:bg-cream/10"
                    onClick={() => navigate('/my-bookings')}
                  >
                    <CalendarDays className="w-4 h-4 mr-2" />
                    My Bookings
                  </Button>
                )}
                {role === 'coach' && (
                  <Button 
                    variant="ghost" 
                    className="text-cream hover:text-cream hover:bg-cream/10"
                    onClick={() => navigate('/coach')}
                  >
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                {role === 'admin' && (
                  <Button 
                    variant="ghost" 
                    className="text-accent hover:text-accent hover:bg-accent/10"
                    onClick={() => navigate('/admin')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="text-cream hover:text-cream hover:bg-cream/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-cream hover:text-cream hover:bg-cream/10"
                  onClick={() => navigate('/coach/login')}
                >
                  Coach Login
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-cream hover:text-cream hover:bg-cream/10"
                  onClick={() => navigate('/auth')}
                >
                  Log In
                </Button>
                <Button variant="accent" onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-cream p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-cream/10">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-cream/80 hover:text-cream transition-colors text-sm font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-cream/10">
                {loading ? (
                  <div className="h-10 w-full bg-cream/10 animate-pulse rounded-md" />
                ) : user ? (
                  <>
                    <div className="text-cream/80 text-sm py-2">
                      <span className="text-cream font-medium">{user.user_metadata?.first_name || 'User'}</span>
                      {role && (
                        <span className="ml-2 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                          {getRoleLabel(role)}
                        </span>
                      )}
                    </div>
                    {(role === 'athlete' || role === 'parent') && (
                      <Button 
                        variant="ghost" 
                        className="text-cream hover:text-cream hover:bg-cream/10 justify-start"
                        onClick={() => { navigate('/my-bookings'); setIsOpen(false); }}
                      >
                        <CalendarDays className="w-4 h-4 mr-2" />
                        My Bookings
                      </Button>
                    )}
                    {role === 'coach' && (
                      <Button 
                        variant="ghost" 
                        className="text-cream hover:text-cream hover:bg-cream/10 justify-start"
                        onClick={() => { navigate('/coach'); setIsOpen(false); }}
                      >
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    )}
                    {role === 'admin' && (
                      <Button 
                        variant="ghost" 
                        className="text-accent hover:text-accent hover:bg-accent/10 justify-start"
                        onClick={() => { navigate('/admin'); setIsOpen(false); }}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      className="text-cream hover:text-cream hover:bg-cream/10 justify-start"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="text-cream hover:text-cream hover:bg-cream/10 justify-start"
                      onClick={() => { navigate('/coach/login'); setIsOpen(false); }}
                    >
                      Coach Login
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-cream hover:text-cream hover:bg-cream/10 justify-start"
                      onClick={() => { navigate('/auth'); setIsOpen(false); }}
                    >
                      Log In
                    </Button>
                    <Button 
                      variant="accent"
                      onClick={() => { navigate('/auth'); setIsOpen(false); }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
