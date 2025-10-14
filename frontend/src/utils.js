// פונקציה להחזרת הודעת שגיאה ידידותית
export const getError = (error) =>
  error.response && error.response.data.message
    ? error.response.data.message
    : error.message;

// ✅ פונקציה להוספת אפקט רעידה לשדות עם שגיאה
export const shakeElement = (element) => {
  if (!element) return;

  // מסירים מחלקות ישנות (למניעת כפילויות)
  element.classList.remove('shake', 'input-error');

  // מוסיפים את המחלקות
  void element.offsetWidth; // טריק להפעלת האנימציה מחדש
  element.classList.add('shake', 'input-error');

  // מסירים את האנימציה אחרי 500ms
  setTimeout(() => {
    element.classList.remove('shake');
  }, 500);

  // ממקדים בשדה
  element.focus();
};

// ✅ פונקציה להפעלת מצב Dark Mode
export const toggleDarkMode = () => {
  const current = localStorage.getItem('darkMode') === 'true';
  const newState = !current;
  localStorage.setItem('darkMode', newState);
  document.body.classList.toggle('dark-mode', newState);
  return newState;
};

// ✅ פונקציה להפעלת Dark Mode עם שמירה על מצב קיים
export const applySavedTheme = () => {
  const isDark = localStorage.getItem('darkMode') === 'true';
  document.body.classList.toggle('dark-mode', isDark);
  return isDark;
};
