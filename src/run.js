import fs from 'node:fs/promises';
import { rank } from './engine.js';

const env = process.env;
const config = {
  lookback: +(env.LOOKBACK_MATCHES || 10),
  minAvg: +(env.MIN_GOALS_AVG || 1),
  minH2H: +(env.MIN_H2H_OVER15 || .8),
  minScored: +(env.MIN_SCORED_LAST5 || 4),
  minOver15: +(env.MIN_TEAM_OVER15_LAST5 || .8),
  minBtts: +(env.MIN_RECENT_BTTS || .6)
};
const apiKey = env.FOOTBALL_DATA_API_KEY;
if (!apiKey) throw Error('Mangler FOOTBALL_DATA_API_KEY');

const now = new Date();
const date = new Intl.DateTimeFormat('en-CA', {
  timeZone: env.TIMEZONE || 'Europe/Copenhagen', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(now);
const localDate = value => new Intl.DateTimeFormat('en-CA', {
  timeZone: env.TIMEZONE || 'Europe/Copenhagen', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date(value));
const seasonStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const seasonEnd = date;
const competitions = (env.FOOTBALL_DATA_COMPETITIONS || 'PL').split(',').map(x => x.trim()).filter(Boolean);

async function fetchCompetition(code) {
  const params = new URLSearchParams({ dateFrom: seasonStart, dateTo: seasonEnd });
  const response = await fetch(`https://api.football-data.org/v4/competitions/${encodeURIComponent(code)}/matches?${params}`, {
    headers: { 'X-Auth-Token': apiKey }
  });
  if (!response.ok) throw Error(`Football-Data.org ${response.status}: ${await response.text()}`);
  return (await response.json()).matches || [];
}

const asMatch = match => ({
  id: match.id,
  home_team: match.homeTeam.name,
  away_team: match.awayTeam.name,
  home_id: match.homeTeam.id,
  away_id: match.awayTeam.id,
  home_score: match.score.fullTime.home,
  away_score: match.score.fullTime.away,
  league: match.competition?.name || '',
  start_time: match.utcDate
});

const allMatches = (await Promise.all(competitions.map(fetchCompetition))).flat().map(asMatch);
const finished = allMatches.filter(match => match.home_score !== null && match.away_score !== null);
const byTeam = new Map();
for (const match of finished) {
  for (const teamId of [match.home_id, match.away_id]) {
    const history = byTeam.get(teamId) || [];
    history.push(match);
    byTeam.set(teamId, history);
  }
}
for (const history of byTeam.values()) history.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

const todaysMatches = allMatches.filter(match => localDate(match.start_time) === date);
const enriched = todaysMatches.map(match => {
  const homeHistory = (byTeam.get(match.home_id) || []).slice(0, config.lookback);
  const awayHistory = (byTeam.get(match.away_id) || []).slice(0, config.lookback);
  const h2h = finished.filter(item =>
    (item.home_id === match.home_id && item.away_id === match.away_id) ||
    (item.home_id === match.away_id && item.away_id === match.home_id)
  );
  return { ...match, home_history: homeHistory, away_history: awayHistory, h2h };
});
const output = rank(enriched, config);
await fs.mkdir('docs/data', { recursive: true });
await fs.writeFile('docs/data/results.json', JSON.stringify({
  date,
  updatedAt: new Date().toISOString(),
  totalMatches: todaysMatches.length,
  missing: output.missing,
  results: output.results
}, null, 2));
