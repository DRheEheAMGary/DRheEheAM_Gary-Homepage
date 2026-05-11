import profile from '../data/profile';
import { FaMicrophone, FaWind, FaWater, FaStar, FaGamepad } from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';

export default function AnimePage() {
  return (
    <div className="page anime-page">
      <h2>二次元成分</h2>

      <div className="anime-section">
        <h3><FaMicrophone /> 虚拟主播</h3>
        <div className="character-grid">
          {profile.vtubers.map((v, i) => (
            <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" className="char-card">
              <span className="char-icon"><FaMicrophone /></span>
              <span className="char-name">{v.name}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="anime-section">
        <h3>原神 主推</h3>
        <div className="character-grid">
          {profile.genshinChars.map((c, i) => (
            <div key={i} className="char-card">
              <span className="char-icon">
                {c.name === '温迪' ? <FaWind /> : c.name === '妮露' ? <FaWater /> : <FaStar />}
              </span>
              <span className="char-name">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="anime-section">
        <h3>副推</h3>
        <div className="character-grid">
          {profile.subPush.map((s, i) => (
            s.url ? (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="char-card">
                <span className="char-icon"><FaMicrophone /></span>
                <span className="char-name">{s.name}</span>
              </a>
            ) : (
              <div key={i} className="char-card">
                <span className="char-icon">{s.name === '银狼' ? <FaGamepad /> : <GiWheat />}</span>
                <span className="char-name">{s.name}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
