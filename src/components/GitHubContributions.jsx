import { GitHubCalendar } from 'react-github-calendar';
import profile from '../data/profile';
import colors from '../styles/colors';

export default function GitHubContributions() {
  return (
    <div className="github-calendar">
      <h3>GitHub 贡献图</h3>
      <div className="calendar-wrapper">
        <GitHubCalendar
          username={profile.githubUsername}
          colorScheme="light"
          theme={{
            light: colors.githubCalendarLight,
            dark: colors.githubCalendarDark,
          }}
          labels={{
            totalCount: '过去一年共 {{count}} 次贡献',
          }}
          tooltips={{
            activity: {
              text: ({ count, date }) => `${date} 共计 ${count} 次贡献`,
              placement: 'top',
            },
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
