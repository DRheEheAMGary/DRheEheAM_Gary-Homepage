import profile from '../data/profile';
import { FaGamepad, FaCube } from 'react-icons/fa';

export default function GamesPage() {
  return (
    <div className="page games-page">
      <h2>游戏账号</h2>
      <div className="game-cards">
        {profile.gameAccounts.map((g, i) => (
          <div key={i} className="game-card">
            <div className="game-icon">
              {g.game.includes('MC') ? <FaCube /> : <FaGamepad />}
            </div>
            <div className="game-info">
              <h3>{g.game}</h3>
              <p>UID: {g.uid}</p>
              {g.level && <span className="game-level">{g.level}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
