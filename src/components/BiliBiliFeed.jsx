import { useState, useEffect } from 'react';
import profile from '../data/profile';
import { SiBilibili } from 'react-icons/si';
import { FaExternalLinkAlt } from 'react-icons/fa';

export default function BiliBiliFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 使用B站API获取动态 (注意: 可能存在跨域限制)
    const fetchFeed = async () => {
      try {
        const res = await fetch(
          `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=${profile.bilibiliUid}&offset=`,
          { mode: 'cors' }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.code === 0 && data.data?.items) {
            setFeed(data.data.items.slice(0, 5));
          }
        }
      } catch {
        // 跨域或API不可用时显示备用链接
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  if (loading) {
    return (
      <div className="bilibili-feed">
        <h3><SiBilibili /> B站动态</h3>
        <p className="loading-text">加载中...</p>
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="bilibili-feed">
        <h3><SiBilibili /> B站动态</h3>
        <p>无法直接加载动态（API限制），请访问我的B站空间：</p>
        <a
          href={`https://space.bilibili.com/${profile.bilibiliUid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bilibili-link-btn"
        >
          <FaExternalLinkAlt /> 前往B站空间
        </a>
      </div>
    );
  }

  return (
    <div className="bilibili-feed">
      <h3><SiBilibili /> B站最新动态</h3>
      <div className="feed-list">
        {feed.map((item, i) => (
          <div key={i} className="feed-item">
            <p className="feed-text">
              {item.modules?.module_dynamic?.major?.archive?.title ||
                item.modules?.module_dynamic?.desc?.text ||
                '查看详情'}
            </p>
            <a
              href={`https://t.bilibili.com/${item.id_str}`}
              target="_blank"
              rel="noopener noreferrer"
              className="feed-link"
            >
              查看动态 →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
