import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, isAuthenticated } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Chapters', path: '/#chapters' },
    { name: 'Premium', path: '/#premium' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleAnchorClick = (anchor) => {
    setIsMobileMenuOpen(false);
    const anchorId = anchor.replace('/', '').replace('#', '');
    
    // Check if we're on the home page
    const isOnHomePage = window.location.hash === '#/' || window.location.hash === '' || window.location.hash === '#';
    
    if (isOnHomePage) {
      // We're on home page, scroll to section
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page with anchor
      window.location.href = `/#/#${anchorId}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              G12 Math Hub
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.path.startsWith('/#') ? (
                  <button
                    onClick={() => handleAnchorClick(link.path)}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                  >
                    {link.name}
                  </button>
                ) : (
                  <Link 
                    to={link.path} 
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {currentUser?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Logout will be handled in dashboard
                    window.location.href = '/#/dashboard';
                  }}
                >
                  {currentUser?.name || 'Account'}
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  onClick={() => handleAnchorClick('/#premium')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Unlock Premium
                </Button>
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="outline" size="sm">Sign Up</Button>
                  </Link>
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.path.startsWith('/#') ? (
                    <button
                      onClick={() => handleAnchorClick(link.path)}
                      className="text-base font-medium text-foreground px-2 py-1 rounded-md hover:bg-muted bg-transparent border-none cursor-pointer text-left w-full"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link 
                      to={link.path} 
                      className="text-base font-medium text-foreground px-2 py-1 rounded-md hover:bg-muted block w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
              
              {isAuthenticated ? (
                <>
                  {currentUser?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="flex items-center gap-2 text-base font-medium text-accent px-2 py-1 rounded-md hover:bg-muted"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link 
                    to="/dashboard" 
                    className="text-base font-medium text-foreground px-2 py-1 rounded-md hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Dashboard
                  </Link>
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.location.href = '/#/dashboard';
                      }}
                    >
                      {currentUser?.name || 'My Account'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="pt-2">
                    <Button 
                      onClick={() => handleAnchorClick('/#premium')}
                      className="w-full bg-primary"
                    >
                      Unlock Premium
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">Login</Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;