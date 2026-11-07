import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const login = process.env.GITHUB_REPOSITORY_OWNER || 'iamdwn';
const now = new Date().toISOString();
const today = now.slice(0, 10);
const dayMs = 86_400_000;
const dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function queryUser(query, variables = {}) {
  const args = ['api', 'graphql', '-f', 'query=' + query];
  for (const [key, value] of Object.entries({ login, ...variables })) {
    args.push('-f', key + '=' + value);
  }
  const response = JSON.parse(execFileSync('gh', args, { encoding: 'utf8' }));
  if (!response.data?.user || response.errors?.length) throw new Error('Incomplete GitHub contribution data');
  return response.data.user;
}

const profile = queryUser(`query($login: String!) {
  user(login: $login) { createdAt contributionsCollection { contributionYears } }
}`);
const dailyCounts = new Map();
for (const year of profile.contributionsCollection.contributionYears) {
  const from = year + '-01-01T00:00:00Z';
  const to = year === Number(today.slice(0, 4)) ? now : year + '-12-31T23:59:59Z';
  const user = queryUser(`query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
      }
    }
  }`, { from, to });
  const calendar = user.contributionsCollection.contributionCalendar;
  const days = calendar.weeks.flatMap(week => week.contributionDays);
  if (!days.length || days.reduce((sum, day) => sum + day.contributionCount, 0) !== calendar.totalContributions) {
    throw new Error('Incomplete contribution calendar for ' + year);
  }
  for (const { date, contributionCount } of days) {
    if (date >= from.slice(0, 10) && date <= to.slice(0, 10) && contributionCount > 0) dailyCounts.set(date, contributionCount);
  }
}

const activeDates = [...dailyCounts.keys()].sort();
let run = { length: 0 };
let longest = run;
for (const date of activeDates) {
  if (Date.parse(date) - Date.parse(run.end) === dayMs) {
    run = { start: run.start, end: date, length: run.length + 1 };
  } else {
    run = { start: date, end: date, length: 1 };
  }
  if (run.length > longest.length) longest = run;
}
const current = Date.parse(today) - Date.parse(run.end) <= dayMs ? run : { length: 0 };
const total = [...dailyCounts.values()].reduce((sum, count) => sum + count, 0);
const format = date => dateLabel.format(new Date(date));
function range(streak) {
  if (!streak.length) return '—';
  return dateLabel.formatRange(new Date(streak.start), new Date(streak.end));
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 192" width="720" height="192" role="img" aria-labelledby="title desc">
  <title id="title">GitHub contribution streak</title>
  <desc id="desc">As of ${today} UTC: ${total} contributions, current streak ${current.length} days, longest streak ${longest.length} days.</desc>
  <rect width="720" height="192" rx="8" fill="#0d1117"/>
  <path d="M240 25v142m240-142v142" stroke="#30363d"/>
  <g fill="#f0f2f4" font-family="Segoe UI,Helvetica,Arial,sans-serif" text-anchor="middle">
    <g font-size="32" font-weight="700">
      <text x="120" y="91">${total.toLocaleString('en-US')}</text>
      <circle cx="360" cy="75" r="45" fill="none" stroke="#f47b39" stroke-width="5"/>
      <path d="M360 11c2 8 8 10 8 16a8 8 0 0 1-16 0c0-3 1-6 4-9-1 5 0 7 2 8 3-4 4-8 2-15Z" fill="#f47b39" stroke="#0d1117" stroke-width="3" stroke-linejoin="round"/>
      <text x="360" y="86">${current.length}</text>
      <text x="600" y="91">${longest.length}</text>
    </g>
    <g fill="#aeb8c5" font-size="17">
      <text x="120" y="126">Total Contributions</text>
      <text x="360" y="148" fill="#f5b887" font-weight="600">Current Streak</text>
      <text x="600" y="126">Longest Streak</text>
    </g>
    <g fill="#8b949e" font-size="14">
      <text x="120" y="153">${format(activeDates[0] || profile.createdAt)} – Present</text>
      <text x="360" y="173">${range(current)}</text>
      <text x="600" y="153">${range(longest)}</text>
    </g>
  </g>
</svg>\n`;
await writeFile(new URL('../assets/github-streak.svg', import.meta.url), svg);
