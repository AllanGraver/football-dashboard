let data = { results: [], nearMisses: [] };
const $ = selector => document.querySelector(selector);
const pct = value => Math.round((value || 0) * 100) + '%';
const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const band = score => score >= 90 ? 'elite' : score >= 80 ? 'strong' : score >= 70 ? 'watch' : 'low';
const criterion = (passed, title, value) => `<li class="${passed ? 'ok' : 'no'}"><i>${passed ? '✓' : '×'}</i><span>${title}<b>${value}</b></span></li>`;
const criteriaTitles = ['Målsnit over 1,00', 'H2H over 1,5', 'Scoret i mindst 4/5', 'Holdkampe over 1,5', 'Seneste BTTS'];

function card(match, index) {
  const metrics = match.metrics || {};
  const criteria = match.criteria || [];
  return `<article class="card ${band(match.score)}"><div class="head"><b>#${index + 1}</b><label>${match.score >= 90 ? 'ELITE PICK' : match.score >= 80 ? 'STÆRK' : 'INTERESSANT'}</label><time>${esc(match.kickoff || 'Tid ukendt')}</time></div><div class="fixture"><small>${esc(match.league || 'Liga ukendt')}</small><h3>${esc(match.home)}</h3><em>MOD</em><h3>${esc(match.away)}</h3></div><div class="ring" style="--score:${match.score}"><span><b>${match.score.toFixed(1)}</b><small>/100</small></span></div><div class="quick"><p><small>MÅLSNIT</small><b>${metrics.homeAvg.toFixed(2)} / ${metrics.awayAvg.toFixed(2)}</b></p><p><small>H2H O1,5</small><b>${pct(metrics.h2hOver15)}</b></p><p><small>SCORET 5</small><b>${metrics.hScored}/5 / ${metrics.aScored}/5</b></p></div><button class="details">Vis analyse ⌄</button><ul>${criterion(criteria[0], criteriaTitles[0], metrics.homeAvg.toFixed(2) + ' / ' + metrics.awayAvg.toFixed(2))}${criterion(criteria[1], criteriaTitles[1], pct(metrics.h2hOver15))}${criterion(criteria[2], criteriaTitles[2], metrics.hScored + '/5 · ' + metrics.aScored + '/5')}${criterion(criteria[3], criteriaTitles[3], pct(metrics.homeOver15) + ' · ' + pct(metrics.awayOver15))}${criterion(criteria[4], criteriaTitles[4], pct(metrics.recentBtts))}</ul></article>`;
}

function nearMiss(match, index) {
  const missed = (match.criteria || []).map((passed, criterionIndex) => passed ? '' : criteriaTitles[criterionIndex]).filter(Boolean);
  return `<article class="near-miss"><div><b>#${index + 1}</b><strong>${esc(match.home)} <span>mod</span> ${esc(match.away)}</strong><small>${esc(match.league || 'Liga ukendt')} · Score ${match.score.toFixed(1)}/100 · ${(match.criteria || []).filter(Boolean).length}/5 kriterier</small></div><p><b>Manglede:</b> ${esc(missed.join(', '))}</p></article>`;
}

function render() {
  const query = $('#search').value.toLowerCase();
  const level = $('#level').value;
  const matches = data.results.filter(match => (match.home + ' ' + match.away + ' ' + match.league).toLowerCase().includes(query) && (level === 'all' || level === 'approved' && match.passed || level === 'elite' && match.score >= 90 || level === 'strong' && match.score >= 80)).slice(0, 10);
  $('#list').innerHTML = matches.length ? matches.map(card).join('') : '<div class="empty">Ingen kampe matcher filteret.</div>';
  const nearMatches = data.nearMisses.filter(match => (match.home + ' ' + match.away + ' ' + match.league).toLowerCase().includes(query)).slice(0, 10);
  $('#near-misses-list').innerHTML = nearMatches.length ? nearMatches.map(nearMiss).join('') : '<div class="empty">Ingen næsten-kandidater i dagens data.</div>';
  document.querySelectorAll('.details').forEach(button => button.onclick = () => button.parentElement.classList.toggle('open'));
}

async function load() {
  try {
    const response = await fetch('data/results.json?v=' + Date.now(), { cache: 'no-store' });
    data = await response.json();
    const approved = data.results.filter(match => match.passed);
    const topScore = Math.max(0, ...data.results.map(match => match.score));
    $('#total').textContent = data.totalMatches || 0;
    $('#approved').textContent = approved.length;
    $('#topscore').textContent = topScore.toFixed(1);
    $('#elite').textContent = approved.filter(match => match.score >= 90).length;
    $('#meta').textContent = `Kampdato ${data.date || '-'} · Opdateret ${data.updatedAt ? new Date(data.updatedAt).toLocaleString('da-DK') : 'ikke endnu'}`;
    render();
  } catch {
    $('#meta').textContent = 'Kør GitHub-workflowet for at publicere dagens data.';
  }
}

$('#refresh').onclick = load;
$('#search').oninput = render;
$('#level').onchange = render;
load();
