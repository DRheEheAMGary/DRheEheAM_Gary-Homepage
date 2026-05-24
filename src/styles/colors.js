/**
 * 全局颜色常量 (JS 端)
 * 用于 JS/JSX 组件中需要内联颜色的场景（如粒子、图表等）
 *
 * 注意: 大部分颜色已通过 CSS 变量定义在 colors.css 中，
 *       组件中应优先使用 var(--xxx) 引用。仅当必须使用 JS 值时才使用此文件。
 */

const colors = {
  // --- 主色 ---
  primary: '#f59e0b',
  primaryLight: '#fbbf24',
  primaryLighter: '#fde68a',

  // --- 强调色：蓝 ---
  accentBlue: '#7dd3fc',
  accentBlueLight: '#bae6fd',
  accentBlueDark: '#38bdf8',

  // --- 强调色：粉 ---
  accentPink: '#f9a8d4',

  // --- 背景 / 纯色 ---
  white: '#ffffff',
  darkBg: '#1c1917',

  // --- 粒子 ---
  particleColors: ['#fbbf24', '#f59e0b', '#fcd34d', '#7dd3fc', '#fde68a'],
  particleLinkColor: '#fbbf24',

  // --- GitHub 日历 ---
  githubCalendarLight: ['#ebedf0', '#fef3c7', '#fde68a', '#fbbf24', '#f59e0b'],
  githubCalendarDark: ['#161b22', '#451a03', '#92400e', '#d97706', '#fbbf24'],
};

export default colors;
