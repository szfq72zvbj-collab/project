import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Chapters', path: '/#chapters' },
    { name: 'Premium', path: '/#premium' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleAnchorClick = (anchor) => {
    setIsMobileMenuOpen(false);
    // For anchor links, we need to handle them differently with HashRouter
    if (location.pathname === '/' || location.pathname === '/#/') {
      // We're already on home page, scroll to anchor
      const element = document.getElementById(anchor.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page first, then scroll to anchor
      window.location.hash = `#/${anchor}`;
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
          <nav className="hidden md:flex items-center gap-8">
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
            <Button 
              onClick={() => handleAnchorClick('/#premium')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Unlock Premium
            </Button>
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
              <div className="pt-2">
                <Button 
                  onClick={() => handleAnchorClick('/#premium')}
                  className="w-full bg-primary"
                >
                  Unlock Premium
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;