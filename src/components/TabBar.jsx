import { useRef, useEffect, useState } from 'react';

const tabs = [
  { id: 'home', label: '首页' },
  { id: 'links', label: '链接' },
  { id: 'contact', label: '联系' },
  { id: 'games', label: '游戏' },
  { id: 'anime', label: '二次元' },
  { id: 'projects', label: '项目' },
];

export default function TabBar({ activeTab, setActiveTab, isAuthOpen, loginBtnRef }) {
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [targetLeft, setTargetLeft] = useState(0);
  const [targetWidth, setTargetWidth] = useState(0);

  // 测量指示器目标位置：正常时跟 active tab，auth 打开时吸附到登录按钮
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const measure = () => {
      if (isAuthOpen && loginBtnRef?.current) {
        // 吸附到登录按钮位置
        const navRect = nav.getBoundingClientRect();
        const btnRect = loginBtnRef.current.getBoundingClientRect();
        setTargetLeft(btnRect.left - navRect.left);
        setTargetWidth(btnRect.width);
        setIndicatorStyle(prev => ({ ...prev, opacity: 1 }));
      } else {
        // 跟 active tab
        const activeBtn = nav.querySelector('.tab-item.active');
        if (activeBtn) {
          const navRect = nav.getBoundingClientRect();
          const btnRect = activeBtn.getBoundingClientRect();
          setTargetLeft(btnRect.left - navRect.left);
          setTargetWidth(btnRect.width);
          setIndicatorStyle(prev => ({ ...prev, opacity: 1 }));
        }
      }
    };

    measure();

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeTab, isAuthOpen, loginBtnRef]);

  return (
    <nav className="tab-bar" ref={navRef}>
      <div
        className="tab-indicator"
        style={{
          transform: `translateX(${targetLeft}px)`,
          width: `${targetWidth}px`,
          opacity: indicatorStyle.opacity,
        }}
      />
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''} ${isAuthOpen ? 'dimmed' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export { tabs };
