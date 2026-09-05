import React, { useContext } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, ThemeContext } from '../ThemeContext';

const ThemeConsumer = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <div>
      <span data-testid="mode">{isDarkMode ? 'dark' : 'light'}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to light mode when no theme is stored and no dark preference', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('reads a previously stored dark preference from localStorage', () => {
    localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggleTheme flips the mode and persists it to localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('toggle'));

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(screen.getByText('toggle'));

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
