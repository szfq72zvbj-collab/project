import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header.jsx';

describe('Header Component', () => {
  test('renders header with logo', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check if logo text is present
    const logoElement = screen.getByText(/G12 Math Hub/i);
    expect(logoElement).toBeInTheDocument();
    
    // Check if navigation links are present
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Chapters/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact/i)).toBeInTheDocument();
  });

  test('renders premium button', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check if premium button is present
    const premiumButton = screen.getByText(/Unlock Premium/i);
    expect(premiumButton).toBeInTheDocument();
  });
});