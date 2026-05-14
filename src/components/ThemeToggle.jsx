import { useRef, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const btnRef = useRef(null);

  const handleClick = useCallback(() => {
    const btn = btnRef.current;
    const root = document.documentElement;

    // 记录按钮在视口中的中心位置，传递给 CSS
    if (btn) {
      const rect = btn.getBoundingClientRect();
      root.style.setProperty('--vt-x', `${rect.left + rect.width / 2}px`);
      root.style.setProperty('--vt-y', `${rect.top + rect.height / 2}px`);
    } else {
      root.style.setProperty('--vt-x', '50%');
      root.style.setProperty('--vt-y', '50%');
    }

    // 使用 View Transition API：自动截取新旧页面快照，以圆形裁剪从按钮处揭开新主题
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        toggleTheme();
      });
    } else {
      // 降级：普通过渡
      toggleTheme();
    }
  }, [isDark, toggleTheme]);

  return (
    <button
      ref={btnRef}
      className="theme-toggle"
      onClick={handleClick}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      {isDark ? <FaSun /> : <FaMoon />}
    </button>
  );
}
