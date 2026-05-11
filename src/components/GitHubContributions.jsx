import { GitHubCalendar } from 'react-github-calendar';
import profile from '../data/profile';

export default function GitHubContributions() {
  return (
    <div className="github-calendar">
      <h3>GitHub 贡献图</h3>
      <div className="calendar-wrapper">
        <GitHubCalendar
          username={profile.githubUsername}
          colorScheme="light"
          labels={{
            totalCount: '过去一年共 {{count}} 次贡献',
          }}
        />
      </div>
      <p className="github-link">
        <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noopener noreferrer">
          访问我的 GitHub →
        </a>
      </p>
    </div>
  );
}
