import profile from '../data/profile';
import { FaHeart, FaUserGraduate, FaLaptopCode, FaGamepad, FaCube } from 'react-icons/fa';

export default function HomePage() {
  return (
    <div className="page home-page">
      {/* 个人简介 */}
      <p className="profile-title">{profile.description}</p>
      <p className="profile-mbti">CN: {profile.cn} | MBTI: {profile.mbti}</p>
      <p className="profile-quote">"{profile.quote}"</p>
      <div className="quick-stats">
        <div className="stat-item">
          <FaUserGraduate />
          <span>{profile.description.split('|')[0].trim()}</span>
        </div>
        <div className="stat-item">
          <FaLaptopCode />
          <span>{profile.description.split('|')[1].trim()}</span>
        </div>
        <div className="stat-item">
          <FaHeart />
          <span>{profile.description.split('|')[2].trim()}</span>
        </div>
      </div>

      {/* 关于我 */}
      <div className="about-content">
        {profile.about.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="about-section">
        <h3><FaGamepad /> 目前玩的游戏</h3>
        <ul className="tag-list">
          {profile.games.map((g, i) => (
            <li key={i} className="tag">{g}</li>
          ))}
        </ul>
      </div>

      <div className="about-section">
        <h3><FaHeart /> 二次元成分</h3>
        <ul className="tag-list">
          {profile.anime.map((a, i) => (
            <li key={i} className="tag">{a}</li>
          ))}
        </ul>
      </div>

      <div className="about-section">
        <h3><FaCube /> Minecraft成分</h3>
        <p>{profile.minecraft}</p>
      </div>

      <div className="about-section">
        <h3><FaHeart />主推（推し）</h3>
        <p>v圈单推 <strong>{profile.vtuber}</strong></p>
        <p>{profile.genshin}</p>
      </div>
    </div>
  );
}
