window.onerror = function (message, source, lineno, colno, error) {
    console.error('Global error:', message, 'at', source + ':' + lineno + ':' + colno, error);
};

// ── Global state ──
let globalMatches = null;
let globalDeliveries = null;
let globalBatting = null;
let globalBowling = null;

const flags = {
    'India': '🇮🇳',
    'Australia': '🇦🇺',
    'New Zealand': '🇳🇿',
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Pakistan': '🇵🇰',
    'South Africa': '🇿🇦',
    'Sri Lanka': '🇱🇰',
    'Bangladesh': '🇧🇩',
    'Afghanistan': '🇦🇫',
    'Netherlands': '🇳🇱',
    'West Indies': '🌴',
    'Zimbabwe': '🇿🇼',
    'Ireland': '🇮🇪',
    'Kenya': '🇰🇪',
    'Namibia': '🇳🇦',
    'Bermuda': '🇧🇲',
    'Canada': '🇨🇦',
    'United Arab Emirates': '🇦🇪',
};

// ── Edition accent colours ──
const editionColors = {
    '2003': { border: '#e67e22', bg: 'rgba(230,126,34,0.08)', badge: '#e67e22' },
    '2007': { border: '#8e44ad', bg: 'rgba(142,68,173,0.08)', badge: '#8e44ad' },
    '2011': { border: '#27ae60', bg: 'rgba(39,174,96,0.08)', badge: '#27ae60' },
    '2015': { border: '#2980b9', bg: 'rgba(41,128,185,0.08)', badge: '#2980b9' },
    '2019': { border: '#c0392b', bg: 'rgba(192,57,43,0.08)', badge: '#c0392b' },
    '2023': { border: '#A8C840', bg: 'rgba(168,200,64,0.08)', badge: '#A8C840' },
};

// ─────────────────────────────────────────────
//  DATA FETCHING
// ─────────────────────────────────────────────
async function ensureMatches() {
    if (!globalMatches) {
        const res = await fetch('/api/matches');
        globalMatches = await res.json();
    }
}

async function fetchMatchData(matchId) {
    try {
        await ensureMatches();

        const matchMeta = globalMatches.find(m => m.match_id === matchId);
        if (!matchMeta) {
            console.error('Match not found:', matchId);
            return;
        }

        // Fetch deliveries / batting / bowling in parallel
        const [dRes, bRes, bowRes] = await Promise.all([
            fetch(`/api/deliveries/${encodeURIComponent(matchId)}`),
            fetch(`/api/batting/${encodeURIComponent(matchId)}`),
            fetch(`/api/bowling/${encodeURIComponent(matchId)}`),
        ]);

        globalDeliveries = await dRes.json();
        globalBatting = await bRes.json();
        globalBowling = await bowRes.json();

        populateDashboard(matchMeta, globalDeliveries);
    } catch (e) {
        console.error('Error loading match data:', e);
    }
}

// ─────────────────────────────────────────────
//  DASHBOARD INIT OVERRIDE
// ─────────────────────────────────────────────
const originalInit = window.initDashboard;
window.initDashboard = async function () {
    if (originalInit) originalInit();

    await ensureMatches();

    // Default to most recent match (last entry = 2023 final)
    const defaultMatch = globalMatches[globalMatches.length - 1];
    if (defaultMatch) fetchMatchData(defaultMatch.match_id);
};

// ─────────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────────
function selectMatch(matchId) {
    goToDashboard();
    fetchMatchData(matchId);
}

function goToMatchAnalysis() {
    document.getElementById('view-landing').classList.add('hidden');
    document.getElementById('view-dashboard').classList.add('hidden');
    const ma = document.getElementById('view-match-analysis');
    if (ma) ma.classList.remove('hidden');
    document.body.classList.add('dashboard-mode');
    renderMatchAnalysisGrids();
}

// ─────────────────────────────────────────────
//  MATCH ANALYSIS PAGE
// ─────────────────────────────────────────────
async function renderMatchAnalysisGrids() {
    const container = document.getElementById('analysis-grids-container');
    if (!container) return;

    container.innerHTML = `<div style="color:var(--text-muted);font-size:13px;padding:20px">Loading matches…</div>`;

    await ensureMatches();

    // Only India matches, sorted by date
    const indiaMatches = globalMatches
        .filter(m => m.team1 === 'India' || m.team2 === 'India')
        .sort((a, b) => a.date.localeCompare(b.date));

    // Group by edition year
    const byYear = {};
    indiaMatches.forEach(m => {
        if (!byYear[m.year]) byYear[m.year] = [];
        byYear[m.year].push(m);
    });

    container.innerHTML = '';

    Object.keys(byYear).sort().forEach(year => {
        const col = editionColors[year] || { border: 'var(--border)', bg: 'var(--surface)', badge: 'var(--lime)' };
        const matches = byYear[year];

        // W / L / NR count
        const record = matches.reduce((acc, m) => {
            if (m.winner === 'India') acc.w++;
            else if (m.winner) acc.l++;
            else acc.nr++;
            return acc;
        }, { w: 0, l: 0, nr: 0 });

        const section = document.createElement('div');
        section.style.cssText = `
            background:var(--surface);
            border:1px solid ${col.border};
            border-radius:12px;
            padding:20px;
            display:flex;
            flex-direction:column;
            gap:10px;
        `;

        // Edition header
        section.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
                <h3 style="margin:0;font-family:'Barlow Condensed',sans-serif;
                           font-size:22px;letter-spacing:1px;color:${col.badge}">
                    ${year} WORLD CUP
                </h3>
                <div style="display:flex;gap:8px;align-items:center">
                    <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:4px;
                                 background:rgba(168,200,64,0.15);color:#A8C840;
                                 font-family:'Barlow Condensed',sans-serif;letter-spacing:1px">
                        W ${record.w}
                    </span>
                    <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:4px;
                                 background:rgba(192,57,43,0.15);color:#C0504A;
                                 font-family:'Barlow Condensed',sans-serif;letter-spacing:1px">
                        L ${record.l}
                    </span>
                    ${record.nr > 0
                ? `<span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:4px;
                                        background:rgba(255,255,255,0.06);color:var(--text-muted);
                                        font-family:'Barlow Condensed',sans-serif;letter-spacing:1px">
                               NR ${record.nr}
                           </span>`
                : ''}
                </div>
            </div>
        `;

        // One row per match
        matches.forEach(m => {
            const opponent = m.team1 === 'India' ? m.team2 : m.team1;
            const oppFlag = flags[opponent] || '🏳️';
            const indWon = m.winner === 'India';
            const noResult = !m.winner;

            const badgeBg = noResult ? 'rgba(255,255,255,0.06)'
                : indWon ? 'rgba(168,200,64,0.15)'
                    : 'rgba(192,57,43,0.15)';
            const badgeColor = noResult ? 'var(--text-muted)'
                : indWon ? '#A8C840'
                    : '#C0504A';
            const badgeText = noResult ? 'N/R' : indWon ? 'WON' : 'LOST';

            const winBy = m.win_margin
                ? (indWon
                    ? `by ${m.win_margin} ${typeof m.win_margin === 'number' && m.win_margin <= 10 ? 'wkts' : 'runs'}`
                    : `lost by ${m.win_margin}`)
                : '';

            const row = document.createElement('div');
            row.style.cssText = `
                display:flex;align-items:center;justify-content:space-between;
                padding:12px 16px;
                background:${col.bg};
                border:1px solid rgba(255,255,255,0.06);
                border-radius:8px;
                cursor:pointer;
                transition:background 0.2s, transform 0.15s;
            `;
            row.onmouseover = () => { row.style.background = 'rgba(168,200,64,0.08)'; row.style.transform = 'translateX(4px)'; };
            row.onmouseout = () => { row.style.background = col.bg; row.style.transform = 'none'; };
            row.onclick = () => selectMatch(m.match_id);

            row.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">
                    <span style="font-size:20px;flex-shrink:0">🇮🇳 vs ${oppFlag}</span>
                    <div style="min-width:0">
                        <div style="font-weight:600;color:var(--text);font-size:13px;
                                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                            India vs ${opponent}
                        </div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">
                            ${m.venue || ''}${m.city ? ', ' + m.city : ''}
                        </div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;margin-left:12px">
                    <div style="text-align:right">
                        <div style="font-size:11px;color:var(--text-muted)">${m.date}</div>
                        ${winBy
                    ? `<div style="font-size:10px;color:var(--text-dim);margin-top:1px">${winBy}</div>`
                    : ''}
                    </div>
                    <span style="font-size:10px;font-weight:700;padding:3px 10px;border-radius:4px;
                                 background:${badgeBg};color:${badgeColor};
                                 font-family:'Barlow Condensed',sans-serif;letter-spacing:1px;
                                 min-width:40px;text-align:center">
                        ${badgeText}
                    </span>
                </div>
            `;
            section.appendChild(row);
        });

        container.appendChild(section);
    });
}

// ─────────────────────────────────────────────
//  POPULATE DASHBOARD
// ─────────────────────────────────────────────
function populateDashboard(meta, deliveries) {
    const opponent = meta.team1 === 'India' ? meta.team2 : meta.team1;
    const team1Name = 'India';
    const team2Name = opponent;

    // Hero meta line
    const metaEl = document.querySelector('.hero-meta');
    if (metaEl) {
        metaEl.innerHTML = `<strong>India vs ${opponent}</strong> · ${meta.year} World Cup · ${meta.venue || ''}, ${meta.city || ''}`;
    }

    // Names + flags
    document.getElementById('hero-team1-name').textContent = 'India';
    document.getElementById('hero-team2-name').textContent = opponent;
    document.getElementById('hero-team1-flag').textContent = flags['India'] || '🇮🇳';
    document.getElementById('hero-team2-flag').textContent = flags[opponent] || '🏳️';

    // Split deliveries
    const team1Del = deliveries.filter(d => d.innings === team1Name);
    const team2Del = deliveries.filter(d => d.innings === team2Name);

    const indBattedFirst = deliveries.length > 0 && deliveries[0].innings === team1Name;
    document.getElementById('hero-team1-status').textContent = indBattedFirst ? 'BATTED FIRST' : 'BATTED SECOND';
    document.getElementById('hero-team2-status').textContent = indBattedFirst ? 'BATTED SECOND' : 'BATTED FIRST';

    // ── Innings stats calculator ──
    function calcInnings(dels) {
        let total = 0, fours = 0, sixes = 0, dots = 0, wickets = 0;
        let maxOver = 0, cumulative = [];
        let currentOver = 0, partnership = 0, highPartnership = 0;

        dels.forEach(d => {
            if (d.over !== currentOver) {
                cumulative.push(total);
                currentOver = d.over;
            }
            total += (d.runs_bat || 0) + (d.extras || 0);
            partnership += (d.runs_bat || 0) + (d.extras || 0);
            if (d.runs_bat === 4) fours++;
            if (d.runs_bat === 6) sixes++;
            if (!d.runs_bat && !d.extras && !d.is_wicket) dots++;
            if (d.is_wicket) {
                wickets++;
                highPartnership = Math.max(highPartnership, partnership);
                partnership = 0;
            }
            maxOver = Math.max(maxOver, d.over || 0);
        });
        highPartnership = Math.max(highPartnership, partnership);
        cumulative.push(total);
        return {
            total, fours, sixes, dots, wickets, maxOver,
            cumulative, balls: dels.length, highPartnership
        };
    }

    const t1 = calcInnings(team1Del);
    const t2 = calcInnings(team2Del);

    // Scores
    document.getElementById('hero-team1-score').textContent = `${t1.total}/${t1.wickets}`;
    document.getElementById('hero-team2-score').textContent = `${t2.total}/${t2.wickets}`;

    const t1RR = t1.maxOver > 0 ? (t1.total / t1.maxOver).toFixed(2) : '0.00';
    const t2RR = t2.maxOver > 0 ? (t2.total / t2.maxOver).toFixed(2) : '0.00';
    document.getElementById('hero-team1-overs').textContent = `${t1.maxOver} overs · RR: ${t1RR}`;
    document.getElementById('hero-team2-overs').textContent = `${t2.maxOver} overs · RR: ${t2RR}`;

    document.getElementById('hero-vs-status').innerHTML = meta.winner
        ? `${meta.winner}<br>Won` : 'No Result';

    // ── Player footer ──
    const indBatters = globalBatting
        .filter(b => b.team === 'India')
        .sort((a, b) => b.runs - a.runs);

    const allBowlers = globalBowling
        .sort((a, b) => b.wickets - a.wickets || a.runs_conceded - b.runs_conceded);

    if (indBatters[0]) {
        document.getElementById('hero-p1-val').textContent = indBatters[0].player;
        const star = indBatters[0].dismissed ? '' : '★';
        document.getElementById('hero-p1-lbl').textContent =
            `Batting · ${indBatters[0].runs}${star}(${indBatters[0].balls})`;
    }
    if (indBatters[1]) {
        document.getElementById('hero-p2-val').textContent = indBatters[1].player;
        const star = indBatters[1].dismissed ? '' : '★';
        document.getElementById('hero-p2-lbl').textContent =
            `Batting · ${indBatters[1].runs}${star}(${indBatters[1].balls})`;
    }
    if (allBowlers[0]) {
        document.getElementById('hero-p3-val').textContent = allBowlers[0].player;
        document.getElementById('hero-p3-lbl').textContent =
            `Bowling · ${allBowlers[0].wickets}/${allBowlers[0].runs_conceded} · ${allBowlers[0].overs}ov`;
    }
    document.getElementById('hero-p4-val').textContent = meta.winner || 'N/R';
    document.getElementById('hero-p4-lbl').textContent = meta.win_margin
        ? `Won by ${meta.win_margin}` : 'Result';

    // ── Stat cards ──
    const bdryRuns = (t1.fours * 4) + (t1.sixes * 6);
    const bdryPct = t1.total > 0 ? Math.round((bdryRuns / t1.total) * 100) : 0;
    const dotPct = t1.balls > 0 ? Math.round((t1.dots / t1.balls) * 100) : 0;

    document.getElementById('stat-total-runs').textContent = t1.total;
    document.getElementById('stat-bdry-pct').innerHTML =
        `${bdryPct}<span style="font-size:16px;font-weight:500;color:var(--text-muted)">%</span>`;
    document.getElementById('stat-bdry-trend').innerHTML =
        `<span class="trend-up">↑ 4s: ${t1.fours}</span><span class="trend-lbl">&nbsp;6s: ${t1.sixes}</span>`;
    document.getElementById('stat-dot-pct').innerHTML =
        `${dotPct}<span style="font-size:16px;color:var(--text-muted)">%</span>`;
    document.getElementById('stat-partnership').textContent = t1.highPartnership;
    document.getElementById('stat-wickets').textContent = t1.wickets;
    document.getElementById('stat-crr').textContent = t1RR;

    // ── Worm chart ──
    if (window.wormChart) {
        const maxLen = Math.max(t1.cumulative.length, t2.cumulative.length);
        window.wormChart.data.labels = Array.from({ length: maxLen }, (_, i) => i + 1);
        window.wormChart.data.datasets[0].label = team1Name;
        window.wormChart.data.datasets[0].data = t1.cumulative;
        window.wormChart.data.datasets[1].label = team2Name;
        window.wormChart.data.datasets[1].data = t2.cumulative;
        window._indRuns = t1.cumulative;
        window._ausRuns = t2.cumulative;
        window.wormChart.update();
    }

    // ── Timeline ──
    const tl = document.getElementById('timeline');
    if (tl) {
        tl.innerHTML = '';
        let events = [];
        team1Del.forEach(d => {
            if (d.is_wicket && d.player_dismissed) {
                events.push({
                    type: 'wicket', over: `${d.over}.${d.ball}`,
                    lbl: `${d.player_dismissed.split(' ').pop()}\nW`
                });
            } else if (d.runs_bat === 6) {
                events.push({ type: 'six', over: `${d.over}.${d.ball}`, lbl: '6' });
            } else if (d.runs_bat === 4) {
                events.push({ type: 'four', over: `${d.over}.${d.ball}`, lbl: '4' });
            }
        });

        // Downsample to max 24 events
        const step = Math.ceil(events.length / 24);
        events = events.filter((_, i) => i % step === 0);

        events.forEach((ev, i) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div style="position:relative;display:flex;align-items:center">
                    <div class="timeline-dot ${ev.type}"></div>
                    ${i < events.length - 1
                    ? '<div style="position:absolute;left:10px;top:50%;width:36px;height:1px;background:var(--border);transform:translateY(-50%)"></div>'
                    : ''}
                </div>
                <div style="display:flex;flex-direction:column;align-items:center;margin-top:4px">
                    <div class="timeline-val">${ev.over}</div>
                    <div class="timeline-lbl" style="white-space:pre;text-align:center">${ev.lbl}</div>
                </div>`;
            tl.appendChild(item);
        });
    }
}