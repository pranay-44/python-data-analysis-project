// Keep global state to avoid refetching on every dropdown change
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
    'Canada': '🇨🇦'
};

async function fetchMatchData(matchId) {
    try {
        if (!globalMatches || !globalDeliveries || !globalBatting || !globalBowling) {
            const matchesRes = await fetch('/api/matches');
            globalMatches = await matchesRes.json();
            
            const deliveriesRes = await fetch('/api/deliveries');
            globalDeliveries = await deliveriesRes.json();

            const battingRes = await fetch('/api/batting');
            globalBatting = await battingRes.json();

            const bowlingRes = await fetch('/api/bowling');
            globalBowling = await bowlingRes.json();
        }

        // Filter for specific match (default to IND vs AUS 2023 Final)
        const targetMatchId = matchId || '2023-11-19-Ind-vs-Aus';
        const matchMeta = globalMatches.find(m => m.match_id === targetMatchId);
        const matchDeliveries = globalDeliveries.filter(d => d.match_id === targetMatchId);

        if (!matchMeta) {
            console.error("Match not found:", targetMatchId);
            return;
        }

        populateDashboard(matchMeta, matchDeliveries);
    } catch(e) {
        console.error("Error loading data:", e);
    }
}

// Override initDashboard to call fetchMatchData after original init
const originalInit = window.initDashboard;
window.initDashboard = function() {
    if(originalInit) originalInit();
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('match') || '2023-11-19-Ind-vs-Aus';
    fetchMatchData(matchId);
};

// ─── Match Analysis Navigation ───
function selectMatch(matchId) {
    fetchMatchData(matchId);
    goToDashboard();
}

function goToMatchAnalysis() {
    document.getElementById('view-landing').classList.add('hidden');
    document.getElementById('view-dashboard').classList.add('hidden');
    const ma = document.getElementById('view-match-analysis');
    if (ma) ma.classList.remove('hidden');
    document.body.classList.add('dashboard-mode');
    renderMatchAnalysisGrids();
}

function renderMatchAnalysisGrids() {
    const container = document.getElementById('analysis-grids-container');
    if (!container) return;

    // If data hasn't loaded yet, fetch it first
    if (!globalMatches) {
        fetch('/api/matches')
            .then(r => r.json())
            .then(data => {
                globalMatches = data;
                renderMatchAnalysisGrids(); // retry after loading
            });
        return;
    }

    const years = ['2003', '2007', '2011', '2015', '2019', '2023'];
    container.innerHTML = '';

    years.forEach(year => {
        const matchesForYear = globalMatches.filter(m => m.year == year && (m.team1 === 'India' || m.team2 === 'India'));

        const gridDiv = document.createElement('div');
        gridDiv.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;';

        let inner = `<h3 style="margin-top:0;color:var(--lime);font-family:'Barlow Condensed',sans-serif;font-size:22px;margin-bottom:16px">${year} ODI World Cup</h3>`;
        inner += `<div style="display:flex;flex-direction:column;gap:10px">`;

        if (matchesForYear.length > 0) {
            matchesForYear.forEach(m => {
                const opponent = m.team1 === 'India' ? m.team2 : m.team1;
                const oppFlag = flags[opponent] || '🏳️';
                inner += `
                    <div onclick="selectMatch('${m.match_id}')" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;cursor:pointer;transition:background 0.2s,transform 0.15s" onmouseover="this.style.background='rgba(204,255,0,0.06)';this.style.transform='translateX(4px)'" onmouseout="this.style.background='var(--surface2)';this.style.transform='none'">
                        <div style="display:flex;align-items:center;gap:12px">
                            <span style="font-size:20px">🇮🇳 vs ${oppFlag}</span>
                            <span style="font-weight:600;color:var(--text)">India vs ${opponent}</span>
                        </div>
                        <div style="font-size:12px;color:var(--text-muted)">${m.date}</div>
                    </div>
                `;
            });
        } else {
            inner += `<div style="color:var(--text-muted);font-size:14px">No matches found.</div>`;
        }

        inner += `</div>`;
        gridDiv.innerHTML = inner;
        container.appendChild(gridDiv);
    });
}


function populateDashboard(meta, deliveries) {
    const opponent = meta.team1 === 'India' ? meta.team2 : meta.team1;
    
    // 1. Update Hero Card Meta
    const metaEl = document.querySelector('.hero-meta');
    if (metaEl) {
        metaEl.innerHTML = `<strong>India vs ${opponent}</strong> · ${meta.year} World Cup · ${meta.venue}, ${meta.city}`;
    }
    
    // 2. Update Dynamic Team Names and Flags
    document.getElementById('hero-team1-name').textContent = 'India';
    document.getElementById('hero-team2-name').textContent = opponent;
    
    document.getElementById('hero-team1-flag').textContent = flags['India'] || '🇮🇳';
    document.getElementById('hero-team2-flag').textContent = flags[opponent] || '🏳️';

    // Separate deliveries by team
    const team1Name = 'India';
    const team2Name = opponent;
    
    const team1Deliveries = deliveries.filter(d => d.innings === team1Name);
    const team2Deliveries = deliveries.filter(d => d.innings === team2Name);
    
    // Determine who batted first by checking first delivery's innings
    let indBattingFirst = true;
    if (deliveries.length > 0 && deliveries[0].innings === team2Name) {
        indBattingFirst = false;
    }
    
    document.getElementById('hero-team1-status').textContent = indBattingFirst ? 'BATTED FIRST' : 'BATTED SECOND';
    document.getElementById('hero-team2-status').textContent = indBattingFirst ? 'BATTED SECOND' : 'BATTED FIRST';

    // Calculate cumulative runs per over
    function getRunsPerOver(teamDeliveries) {
        let cumulative = [];
        let total = 0;
        let currentOver = 1;
        let fours = 0, sixes = 0;
        let dotBalls = 0;
        let wickets = 0;
        let maxOver = 0;
        let highestPartnership = 0;
        let currentPartnership = 0;
        
        for (let d of teamDeliveries) {
            if (d.over > currentOver) {
                while(currentOver < d.over) {
                    cumulative.push(total);
                    currentOver++;
                }
            }
            total += d.runs_bat + d.extras;
            currentPartnership += d.runs_bat + d.extras;
            if (d.runs_bat === 4) fours++;
            if (d.runs_bat === 6) sixes++;
            if (d.runs_bat === 0 && d.extras === 0 && !d.is_wicket) dotBalls++;
            if (d.is_wicket) {
                wickets++;
                highestPartnership = Math.max(highestPartnership, currentPartnership);
                currentPartnership = 0;
            }
            maxOver = Math.max(maxOver, d.over);
        }
        highestPartnership = Math.max(highestPartnership, currentPartnership);
        cumulative.push(total);
        return { cumulative, total, fours, sixes, dotBalls, wickets, ballsFaced: teamDeliveries.length, overs: maxOver, highestPartnership };
    }

    const t1Data = getRunsPerOver(team1Deliveries);
    const t2Data = getRunsPerOver(team2Deliveries);
    
    // Update Score UI
    document.getElementById('hero-team1-score').textContent = `${t1Data.total}/${t1Data.wickets}`;
    document.getElementById('hero-team2-score').textContent = `${t2Data.total}/${t2Data.wickets}`;
    
    let t1RR = t1Data.overs > 0 ? (t1Data.total / t1Data.overs).toFixed(2) : "0.00";
    let t2RR = t2Data.overs > 0 ? (t2Data.total / t2Data.overs).toFixed(2) : "0.00";
    document.getElementById('hero-team1-overs').textContent = `${t1Data.overs} overs · RR: ${t1RR}`;
    document.getElementById('hero-team2-overs').textContent = `${t2Data.overs} overs · RR: ${t2RR}`;
    
    document.getElementById('hero-vs-status').innerHTML = meta.winner ? `${meta.winner}<br>Won` : 'Match<br>Tied/NR';

    // Update Player Stats Footer
    const matchBatting = globalBatting.filter(b => b.match_id === meta.match_id);
    const matchBowling = globalBowling.filter(b => b.match_id === meta.match_id);

    const indBatters = matchBatting.filter(b => b.team === 'India').sort((a, b) => b.runs - a.runs);
    const oppBowlers = matchBowling.filter(b => b.team === opponent).sort((a, b) => b.wickets - a.wickets);

    // Player 1 (Top India Batter)
    if (indBatters.length > 0) {
        document.getElementById('hero-p1-val').textContent = indBatters[0].player;
        const asterisk = indBatters[0].dismissed ? '' : '★';
        document.getElementById('hero-p1-lbl').textContent = `Batting · ${indBatters[0].runs}${asterisk}(${indBatters[0].balls})`;
    }
    
    // Player 2 (Second Top India Batter)
    if (indBatters.length > 1) {
        document.getElementById('hero-p2-val').textContent = indBatters[1].player;
        const asterisk = indBatters[1].dismissed ? '' : '★';
        document.getElementById('hero-p2-lbl').textContent = `Batting · ${indBatters[1].runs}${asterisk}(${indBatters[1].balls})`;
    }

    // Player 3 (Highest Wicket Taker in match)
    const allBowlers = matchBowling.sort((a, b) => b.wickets - a.wickets);
    if (allBowlers.length > 0) {
        document.getElementById('hero-p3-val').textContent = allBowlers[0].player;
        document.getElementById('hero-p3-lbl').textContent = `Bowling · ${allBowlers[0].wickets}/${allBowlers[0].runs_conceded} · ${allBowlers[0].overs}ov`;
    } else {
        document.getElementById('hero-p3-val').textContent = "N/A";
        document.getElementById('hero-p3-lbl').textContent = "Bowling · N/A";
    }

    // Player 4 (Match Result or generic stat)
    document.getElementById('hero-p4-val').textContent = "Result";
    document.getElementById('hero-p4-lbl').textContent = meta.win_margin ? `Won by ${meta.win_margin}` : (meta.winner || 'N/A');

    // Update Stat Cards (using Team 1 as the primary focus for now)
    const totalRunsEl = document.getElementById('stat-total-runs');
    if (totalRunsEl) totalRunsEl.textContent = t1Data.total;
    
    const bdryPctEl = document.getElementById('stat-bdry-pct');
    if (bdryPctEl) {
        const boundaryRuns = (t1Data.fours * 4) + (t1Data.sixes * 6);
        const bdryPct = t1Data.total > 0 ? Math.round((boundaryRuns / t1Data.total) * 100) : 0;
        bdryPctEl.innerHTML = `${bdryPct}<span style="font-size:16px;font-weight:500;color:var(--text-muted)">%</span>`;
    }

    const bdryTrendEl = document.getElementById('stat-bdry-trend');
    if (bdryTrendEl) {
        bdryTrendEl.innerHTML = `<span class="trend-up">↑ 4s: ${t1Data.fours}</span><span class="trend-lbl">&nbsp;6s: ${t1Data.sixes}</span>`;
    }

    const dotPctEl = document.getElementById('stat-dot-pct');
    if (dotPctEl) {
        const dotPct = t1Data.ballsFaced > 0 ? Math.round((t1Data.dotBalls / t1Data.ballsFaced) * 100) : 0;
        dotPctEl.innerHTML = `${dotPct}<span style="font-size:16px;color:var(--text-muted)">%</span>`;
    }

    const partnershipEl = document.getElementById('stat-partnership');
    if (partnershipEl) {
        partnershipEl.textContent = t1Data.highestPartnership;
    }

    const wicketsEl = document.getElementById('stat-wickets');
    if (wicketsEl) {
        wicketsEl.textContent = t1Data.wickets;
    }

    const crrEl = document.getElementById('stat-crr');
    if (crrEl) {
        let crr = t1Data.overs > 0 ? (t1Data.total / t1Data.overs).toFixed(2) : "0.00";
        crrEl.textContent = crr;
    }

    // Replace Chart Data
    if (window.wormChart) {
        window.wormChart.data.labels = Array.from({length: Math.max(t1Data.cumulative.length, t2Data.cumulative.length)}, (_,i)=>i+1);
        window.wormChart.data.datasets[0].label = team1Name;
        window.wormChart.data.datasets[0].data = t1Data.cumulative;
        window.wormChart.data.datasets[1].label = team2Name;
        window.wormChart.data.datasets[1].data = t2Data.cumulative;
        window._indRuns = t1Data.cumulative;
        window._ausRuns = t2Data.cumulative;
        window.wormChart.update();
    }
    
    // Replace Match Timeline Data
    const tl = document.getElementById('timeline');
    if (tl) {
        tl.innerHTML = ''; // clear mock
        let events = [];
        team1Deliveries.forEach(d => {
            if (d.is_wicket) {
                events.push({type:'wicket', over:`${d.over}.${d.ball}`, lbl: `${d.player_dismissed.split(' ').pop()}\nW`});
            } else if (d.runs_bat === 6) {
                events.push({type:'six', over:`${d.over}.${d.ball}`, lbl: '6'});
            } else if (d.runs_bat === 4) {
                events.push({type:'four', over:`${d.over}.${d.ball}`, lbl: '4'});
            }
        });
        
        // Only show last 20 events for UI tidiness, or downsample
        events = events.filter((e, i) => i % Math.ceil(events.length / 20) === 0);
        
        events.forEach((ev,i) => {
            const item = document.createElement('div'); item.className='timeline-item';
            item.innerHTML=`<div style="position:relative;display:flex;align-items:center"><div class="timeline-dot ${ev.type}"></div>${i<events.length-1?'<div style="position:absolute;left:10px;top:50%;width:36px;height:1px;background:var(--border);transform:translateY(-50%)"></div>':''}</div><div style="display:flex;flex-direction:column;align-items:center;margin-top:4px"><div class="timeline-val">${ev.over}</div><div class="timeline-lbl" style="white-space:pre;text-align:center">${ev.lbl}</div></div>`;
            tl.appendChild(item);
        });
    }
}
