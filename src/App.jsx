import { useState, useEffect, useRef, useCallback } from 'react';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ParticleBackground from './components/ParticleBackground';
import ThemeToggle from './components/ThemeToggle';
import TabBar from './components/TabBar';
import LyricsTypewriter from './components/LyricsTypewriter';
import DailyCheckIn from './components/DailyCheckIn';
import AuthPage from './components/AuthPage';
import AnimatedSection from './components/AnimatedSection';
import profile from './data/profile';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import GamesPage from './pages/GamesPage';
import AnimePage from './pages/AnimePage';
import ProjectsPage from './pages/ProjectsPage';
import LinksPage from './pages/LinksPage';
import { FaArrowUp, FaUser, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
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
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutClosing, setLogoutClosing] = useState(false);
  const [authResetKey, setAuthResetKey] = useState(0);
  const scrollRef = useRef(null);
  const manualTimerRef = useRef(null);
  const loginBtnRef = useRef(null);
  const logoutWrapRef = useRef(null);
  // 用 ref 同步传递手动滚动状态，避免 React 批处理异步导致 scrollIntoView 先执行
  const manualScrollingFlagRef = useRef(false);
  const targetTabRef = useRef('home');

  // 打开 auth 时重置动画 key
  useEffect(() => {
    if (showAuthPage) setAuthResetKey(k => k + 1);
  }, [showAuthPage]);

  // 带退场动画的关闭
  const closeLogout = () => {
    setLogoutClosing(true);
  };

  // 点击空白处关闭退出确认弹窗
  useEffect(() => {
    if (!showLogoutConfirm) return;
    const onDocClick = (e) => {
      if (logoutWrapRef.current && !logoutWrapRef.current.contains(e.target)) {
        closeLogout();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showLogoutConfirm]);

  // 监听主体滚动容器
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      setShowBackToTop(container.scrollTop > 400);

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
    // 如果 auth 页面打开，先切换 activeTab 再关闭 auth，避免旧 tab 弹跳
    if (showAuthPage) {
      setActiveTab(tabId);
      setShowAuthPage(false);
      // 等 auth 关闭 DOM 更新后再滚动
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.getElementById(tabId);
          if (!el) return;
          manualScrollingFlagRef.current = true;
          targetTabRef.current = tabId;
          setIsManualScrolling(true);
          clearTimeout(manualTimerRef.current);
          el.scrollIntoView({ behavior: 'smooth' });
          manualTimerRef.current = setTimeout(() => {
            manualScrollingFlagRef.current = false;
            setIsManualScrolling(false);
          }, 800);
        });
      });
      return;
    }

    const el = document.getElementById(tabId);
    if (!el) return;

    // 同步更新 ref（observer 回调直接读取 .current，不依赖 React 渲染）
    manualScrollingFlagRef.current = true;
    targetTabRef.current = tabId;

    setActiveTab(tabId);
    setIsManualScrolling(true);
    clearTimeout(manualTimerRef.current);

    el.scrollIntoView({ behavior: 'smooth' });

    // 滚动结束后恢复自动检测
    manualTimerRef.current = setTimeout(() => {
      manualScrollingFlagRef.current = false;
      setIsManualScrolling(false);
    }, 800);
  }, [showAuthPage]);

  return (
      <div className="app">
        <ParticleBackground />

        <div className="top-bar">
          <div className="top-bar-left">
            <span className="site-title">DRheEheAM_Gary</span>
            <span className="site-subtitle">个人主页 | OIer & 二次元</span>
          </div>
          <TabBar activeTab={activeTab} setActiveTab={scrollToSection} isAuthOpen={showAuthPage} loginBtnRef={loginBtnRef} />
          <div className="top-bar-right">
            {user ? (
              <div className="top-bar-user-wrap" ref={logoutWrapRef}>
                <div className="top-bar-login-btn top-bar-user-pill">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="top-bar-avatar" />
                  ) : (
                    <FaUserCircle />
                  )}
                  {user.name}
                  <button
                    className="top-bar-logout-btn"
                    onClick={() => setShowLogoutConfirm(true)}
                    title="退出登录"
                  >
                    <FaSignOutAlt />
                  </button>
                </div>
                {showLogoutConfirm && (
                  <div
                    className={`logout-confirm-bar${logoutClosing ? ' closing' : ''}`}
                    onAnimationEnd={() => {
                      if (logoutClosing) {
                        setShowLogoutConfirm(false);
                        setLogoutClosing(false);
                      }
                    }}
                  >
                    <span>确定退出？</span>
                    <div className="logout-confirm-actions">
                      <button className="logout-confirm-cancel" onClick={closeLogout}>取消</button>
                      <button className="logout-confirm-ok" onClick={() => {
                        logout();
                        localStorage.removeItem('daily-checkin-dates');
                        localStorage.removeItem('daily-fortune');
                        window.location.reload();
                      }}>确定</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button ref={loginBtnRef} className="top-bar-login-btn" onClick={() => setShowAuthPage(true)} title="登录/注册">
                <FaUser /> 登录/注册
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>

        <div className="app-body">
          {showAuthPage ? (
            <div className="auth-snap-wrapper">
              <AnimatedSection id="auth" resetKey={authResetKey} manualScrollingFlagRef={manualScrollingFlagRef} targetTabRef={targetTabRef} isManualScrolling={isManualScrolling}>
                <AuthPage onBack={() => setShowAuthPage(false)} onModeSwitch={() => setAuthResetKey(k => k + 1)} />
              </AnimatedSection>
            </div>
          ) : (
            <>
              {/* 主滚动容器：所有页面连续排列，snap 吸附 */}
              <div className="snap-container" ref={scrollRef}>
                {sections.map(({ id, Component }) => (
                  <AnimatedSection key={id} id={id} manualScrollingFlagRef={manualScrollingFlagRef} targetTabRef={targetTabRef} isManualScrolling={isManualScrolling}>
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
            </>
          )}

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
            <DailyCheckIn key={user?.slug || 'guest'} />
          </aside>
        </div>

        {!showAuthPage && (
          <button
            className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
            onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            title="回到顶部"
          >
            <FaArrowUp />
          </button>
        )}
      </div>
  );
}
