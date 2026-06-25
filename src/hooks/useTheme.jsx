import { useState, useEffect, createContext, useContext } from 'react';

function getSystemPrefersDark() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch { return false; }
}

const ThemeContext = createContext();

const VALID_THEMES = ['auto', 'light', 'dark'];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (VALID_THEMES.includes(saved)) return saved;
    return 'auto';
  });

  // 实时跟踪系统偏好
  const [systemDark, setSystemDark] = useState(getSystemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // 解析实际暗色状态：auto → 跟随系统
  const isDark = theme === 'auto' ? systemDark : theme === 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', theme);
  }, [theme, isDark]);

  // 循环切换：auto → light → dark → auto
  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'auto') return 'light';
      if (prev === 'light') return 'dark';
      return 'auto';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
