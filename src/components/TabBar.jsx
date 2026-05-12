const tabs = [
  { id: 'home', label: '首页' },
  { id: 'links', label: '链接' },
  { id: 'contact', label: '联系' },
  { id: 'games', label: '游戏' },
  { id: 'anime', label: '二次元' },
  { id: 'projects', label: '项目' },
];

export default function TabBar({ activeTab, setActiveTab }) {
  return (
    <nav className="tab-bar">
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
