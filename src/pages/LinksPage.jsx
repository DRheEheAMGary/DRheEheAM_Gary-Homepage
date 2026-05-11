import profile from '../data/profile';
import { FaExternalLinkAlt, FaBlog, FaFolder, FaChessKnight, FaHeadphones, FaCube, FaGamepad, FaLink } from 'react-icons/fa';
import { SiBilibili } from 'react-icons/si';

const linkIcons = {
  'fa-blog': FaBlog,
  'fa-folder': FaFolder,
  'fa-chess-rook': FaChessKnight,
  'fa-bilibili': SiBilibili,
  'fa-headphones': FaHeadphones,
  'fa-cube': FaCube,
  'fa-gamepad': FaGamepad,
};

export default function LinksPage() {
  return (
    <div className="page links-page">
      <h2>网站链接</h2>
      <div className="links-grid">
        {profile.links.map((l, i) => {
          const Icon = linkIcons[l.icon] || FaLink;
          return (
          <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="link-card">
            <span className="link-icon"><Icon /></span>
            <div className="link-info">
              <span className="link-name">{l.name}</span>
              <span className="link-desc">{l.desc}</span>
            </div>
            <FaExternalLinkAlt className="link-arrow" />
          </a>
        )})}
      </div>
    </div>
  );
}
