import { useRef, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { FaSun, FaMoon, FaAdjust } from 'react-icons/fa';

export default function ThemeToggle() {
  const { theme, isDark, toggleTheme } = useTheme();
  const btnRef = useRef(null);

  const handleClick = useCallback(() => {
    const btn = btnRef.current;
    const root = document.documentElement;

    if (btn) {
      const rect = btn.getBoundingClientRect();
      root.style.setProperty('--vt-x', `${rect.left + rect.width / 2}px`);
      root.style.setProperty('--vt-y', `${rect.top + rect.height / 2}px`);
    } else {
      root.style.setProperty('--vt-x', '50%');
      root.style.setProperty('--vt-y', '50%');
    }

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        toggleTheme();
      });
    } else {
      toggleTheme();
    }
  }, [toggleTheme]);

  const modeLabel = theme === 'auto' ? '自动（跟随系统）' : isDark ? '深色模式' : '浅色模式';
  const nextLabel = theme === 'auto' ? '浅色' : theme === 'light' ? '深色' : '自动';

  const icon = theme === 'auto'
    ? <FaAdjust />
    : isDark
      ? <FaMoon />
      : <FaSun />;

  return (
    <button
      ref={btnRef}
      className="theme-toggle"
      onClick={handleClick}
      title={`${modeLabel} — 点击切换到${nextLabel}模式`}
    >
      {icon}
    </button>
  );
}
