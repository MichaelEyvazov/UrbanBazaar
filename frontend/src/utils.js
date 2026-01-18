
export const getError = (error) =>
  error.response && error.response.data.message
    ? error.response.data.message
    : error.message;

export const shakeElement = (element) => {
  if (!element) return;

  element.classList.remove('shake', 'input-error');


  void element.offsetWidth; 
  element.classList.add('shake', 'input-error');

  setTimeout(() => {
    element.classList.remove('shake');
  }, 500);

  element.focus();
};

export const toggleDarkMode = () => {
  const current = localStorage.getItem('darkMode') === 'true';
  const newState = !current;
  localStorage.setItem('darkMode', newState);
  document.body.classList.toggle('dark-mode', newState);
  return newState;
};

export const applySavedTheme = () => {
  const isDark = localStorage.getItem('darkMode') === 'true';
  document.body.classList.toggle('dark-mode', isDark);
  return isDark;
};