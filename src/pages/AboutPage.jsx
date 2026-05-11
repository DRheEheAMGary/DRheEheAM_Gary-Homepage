import profile from '../data/profile';
import { FaGamepad, FaCube, FaHeart } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div className="page about-page">
      <h2>Hello!</h2>
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
        <p>v圈单推 <strong>{profile.vtuber}</strong></p>
        <p>{profile.genshinPush}</p>
        <p className="friendly">很开心与你做朋友!</p>
      </div>
    </div>
  );
}
