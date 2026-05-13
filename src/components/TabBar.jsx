import { useRef, useEffect, useState } from 'react';

const tabs = [
  { id: 'home', label: '首页' },
  { id: 'links', label: '链接' },
  { id: 'contact', label: '联系' },
  { id: 'games', label: '游戏' },
  { id: 'anime', label: '二次元' },
  { id: 'projects', label: '项目' },
];

export default function TabBar({ activeTab, setActiveTab }) {
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateIndicator = () => {
      const activeBtn = nav.querySelector('.tab-item.active');
      if (activeBtn) {
        const navRect = nav.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        setIndicatorStyle({
          left: btnRect.left - navRect.left,
          width: btnRect.width,
          opacity: 1,
        });
      }
    };

    updateIndicator();

    // 监听窗口大小变化，更新指示器位置
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab]);

  return (
    <nav className="tab-bar" ref={navRef}>
      <div
        className="tab-indicator"
        style={{
          transform: `translateX(${indicatorStyle.left}px)`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
        }}
      />
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export { tabs };
