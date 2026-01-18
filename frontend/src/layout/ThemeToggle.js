import React, { useContext, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';

export default function ThemeToggle({ className = '' }) {
  const { state, dispatch } = useContext(Store);
  const { theme } = state;
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const onToggle = () => {
    dispatch({
      type: 'THEME_SET',
      payload: theme === 'dark' ? 'light' : 'dark',
    });
  };

  return (
    <Button
      variant="outline-light"
      onClick={onToggle}
      className={`d-flex align-items-center ${className}`}
      aria-label="Toggle theme"
      title="Toggle theme"
      style={{ gap: 8 }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </Button>
  );
}
