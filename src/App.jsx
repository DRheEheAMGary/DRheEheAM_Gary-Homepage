import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider } from './hooks/useTheme';
import ParticleBackground from './components/ParticleBackground';
import ThemeToggle from './components/ThemeToggle';
import TabBar from './components/TabBar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import GamesPage from './pages/GamesPage';
import AnimePage from './pages/AnimePage';
import ProjectsPage from './pages/ProjectsPage';
import LinksPage from './pages/LinksPage';
import { FaArrowUp } from 'react-icons/fa';
import './App.css';

const pageComponents = {
  home: HomePage,
  about: AboutPage,
  contact: ContactPage,
  games: GamesPage,
  anime: AnimePage,
  projects: ProjectsPage,
  links: LinksPage,
};

const ITEM_DELAY = 40;
const ITEM_DURATION = 150;

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [transition, setTransition] = useState({ phase: 'idle', tab: 'home' });
  const mainRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const applyDelays = (container, dir) => {
    const prop = dir === 'exit' ? '--exit-delay' : '--enter-delay';
    const page = container?.querySelector('.page');
    if (!page) return 0;
    const items = [...page.children];
    const total = items.length;
    if (total === 0) return 0;
    items.forEach((el, i) => {
      const idx = dir === 'exit' ? total - 1 - i : i;
      el.style.setProperty(prop, `${idx * ITEM_DELAY}ms`);
    });
    return (total - 1) * ITEM_DELAY + ITEM_DURATION;
  };

  const switchTab = useCallback((newTab) => {
    if (newTab === activeTab || transition.phase !== 'idle') return;
    const container = mainRef.current;

    // Phase 1: exit — children sink down bottom-to-top
    const exitTotal = applyDelays(container, 'exit');
    setTransition({ phase: 'exit', tab: activeTab });

    setTimeout(() => {
      // Phase 2: switch tab, then enter — children float up top-to-bottom
      setActiveTab(newTab);
      setTransition({ phase: 'enter', tab: newTab });
      window.scrollTo({ top: 0, behavior: 'instant' });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const enterTotal = applyDelays(mainRef.current, 'enter');
          setTimeout(() => {
            setTransition({ phase: 'idle', tab: newTab });
            // cleanup
            const page = mainRef.current?.querySelector('.page');
            if (page) [...page.children].forEach(el => {
              el.style.removeProperty('--exit-delay');
              el.style.removeProperty('--enter-delay');
            });
          }, enterTotal + 30);
        });
      });
    }, exitTotal + 30);
  }, [activeTab, transition.phase]);

  const ActivePage = pageComponents[activeTab];
  const pageClass = transition.phase === 'exit' ? 'page-exit' : transition.phase === 'enter' ? 'page-enter' : '';

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
          <TabBar activeTab={activeTab} setActiveTab={switchTab} />
          <ThemeToggle />
        </div>

        <div className="app-container">
          <main ref={mainRef} className={`main-content ${pageClass}`}>
            <ActivePage />
          </main>
        </div>

        <footer className="app-footer">
          <p>© {new Date().getFullYear()} DRheEheAM_Gary</p>
          <a href="https://icp.gov.moe/?keyword=20260513" target="_blank" rel="noopener noreferrer">
            萌ICP备20260513号
          </a>
          <p className="footer-quote">"爱如果太猛烈/注定是要毁灭"</p>
        </footer>

        <button
          className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="回到顶部"
        >
          <FaArrowUp />
        </button>
      </div>
    </ThemeProvider>
  );
}
