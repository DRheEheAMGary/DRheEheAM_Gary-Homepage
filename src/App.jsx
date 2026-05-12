import { useState, useEffect, useRef, useCallback } from 'react';
import { ThemeProvider } from './hooks/useTheme';
import ParticleBackground from './components/ParticleBackground';
import ThemeToggle from './components/ThemeToggle';
import TabBar from './components/TabBar';
import LyricsTypewriter from './components/LyricsTypewriter';
import AnimatedSection from './components/AnimatedSection';
import profile from './data/profile';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import GamesPage from './pages/GamesPage';
import AnimePage from './pages/AnimePage';
import ProjectsPage from './pages/ProjectsPage';
import LinksPage from './pages/LinksPage';
import { FaArrowUp } from 'react-icons/fa';
import './App.css';

const sections = [
  { id: 'home', Component: HomePage },
  { id: 'links', Component: LinksPage },
  { id: 'contact', Component: ContactPage },
  { id: 'games', Component: GamesPage },
  { id: 'anime', Component: AnimePage },
  { id: 'projects', Component: ProjectsPage },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const scrollRef = useRef(null);
  const manualTimerRef = useRef(null);

  // 监听主体滚动容器
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      setShowBackToTop(container.scrollTop > 400);
      const h = container.scrollHeight - container.clientHeight;
      setScrollProgress(h > 0 ? (container.scrollTop / h) * 100 : 0);

      // 手动滚动时更新 activeTab
      if (isManualScrolling) return;
      const centerY = container.scrollTop + container.clientHeight / 2;
      let closest = sections[0].id;
      let closestDist = Infinity;
      sections.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const elCenter = rect.top - containerRect.top + rect.height / 2 + container.scrollTop;
        const dist = Math.abs(elCenter - centerY);
        if (dist < closestDist) {
          closestDist = dist;
          closest = id;
        }
      });
      if (closest !== activeTab) {
        setActiveTab(closest);
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [activeTab, isManualScrolling]);

  // Tab 点击 → 滚动到对应 section
  const scrollToSection = useCallback((tabId) => {
    const el = document.getElementById(tabId);
    if (!el) return;

    setActiveTab(tabId);
    setIsManualScrolling(true);
    clearTimeout(manualTimerRef.current);

    el.scrollIntoView({ behavior: 'smooth' });

    // 滚动结束后恢复自动检测
    manualTimerRef.current = setTimeout(() => {
      setIsManualScrolling(false);
    }, 800);
  }, []);

  return (
    <ThemeProvider>
      <div className="app">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${scrollProgress}%` }} />
        </div>

        <ParticleBackground />

        <div className="top-bar">
          <div className="top-bar-left">
            <span className="site-title">DRheEheAM_Gary</span>
            <span className="site-subtitle">个人主页 | OIer & 二次元</span>
          </div>
          <TabBar activeTab={activeTab} setActiveTab={scrollToSection} />
          <ThemeToggle />
        </div>

        <div className="app-body">
          {/* 主滚动容器：所有页面连续排列，snap 吸附 */}
          <div className="snap-container" ref={scrollRef}>
            {sections.map(({ id, Component }) => (
              <AnimatedSection key={id} id={id}>
                <Component />
              </AnimatedSection>
            ))}
            <footer className="app-footer">
              <p>© {new Date().getFullYear()} DRheEheAM_Gary</p>
              <a href="https://icp.gov.moe/?keyword=20260513" target="_blank" rel="noopener noreferrer">
                萌ICP备20260513号
              </a>
              <p className="footer-quote">"爱如果太猛烈/注定是要毁灭"</p>
            </footer>
          </div>

          {/* 全局右侧边栏：头像 + 名字 + 歌词滚动，始终显示 */}
          <aside className="global-sidebar">
            <div className="sidebar-top">
              <h1 className="profile-name">
                <span className="profile-greeting">Hello! I'm</span>
                <span className="profile-name-main">{profile.name}</span>
              </h1>
              <div className="avatar-wrapper">
                <img src={profile.avatar} alt={profile.name} className="avatar" />
                <div className="avatar-ring" />
              </div>
            </div>
            <div className="lyrics-section">
              <LyricsTypewriter />
            </div>
          </aside>
        </div>

        <button
          className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          title="回到顶部"
        >
          <FaArrowUp />
        </button>
      </div>
    </ThemeProvider>
  );
}
