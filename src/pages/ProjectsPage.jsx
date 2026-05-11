import profile from '../data/profile';
import GitHubContributions from '../components/GitHubContributions';
import BiliBiliFeed from '../components/BiliBiliFeed';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';

export default function ProjectsPage() {
  return (
    <div className="page projects-page">
      <h2>项目 & 动态</h2>

      <div className="project-section">
        <h3><FaGithub /> GitHub 项目</h3>
        {profile.githubProjects.map((p, i) => (
          <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="project-card">
            <div className="project-icon"><FaGithub /></div>
            <div className="project-info">
              <h4>{p.name}</h4>
              <p>{p.desc}</p>
            </div>
            <FaExternalLinkAlt className="project-arrow" />
          </a>
        ))}
      </div>

      <GitHubContributions />
      <BiliBiliFeed />
    </div>
  );
}
