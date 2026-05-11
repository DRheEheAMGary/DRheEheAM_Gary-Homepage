import profile from '../data/profile';
import LyricsTypewriter from '../components/LyricsTypewriter';
import { FaHeart, FaUserGraduate, FaLaptopCode } from 'react-icons/fa';

export default function HomePage() {
  return (
    <div className="page home-page">
      <div className="profile-header">
        <div className="avatar-wrapper">
          <img src={profile.avatar} alt={profile.name} className="avatar" />
          <div className="avatar-ring" />
        </div>
        <h1 className="profile-name">Hello! I'm {profile.name}</h1>
        <p className="profile-title">{profile.description}</p>
        <p className="profile-mbti">CN: {profile.cn} | MBTI: {profile.mbti}</p>
        <p className="profile-quote">"{profile.quote}"</p>
      </div>
      <div className="lyrics-section">
        <LyricsTypewriter />
      </div>
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
    </div>
  );
}
