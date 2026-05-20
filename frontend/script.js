// Keep global state to avoid refetching on every dropdown change
let globalMatches = null;
let globalDeliveries = null;

async function fetchMatchData(matchId) {
    try {
        if (!globalMatches || !globalDeliveries) {
            const matchesRes = await fetch('../data/processed/matches.json');
            globalMatches = await matchesRes.json();
            
            const deliveriesRes = await fetch('../data/processed/deliveries.json');
            globalDeliveries = await deliveriesRes.json();
            
            populateMatchDropdown(globalMatches, matchId);
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

function populateMatchDropdown(matches, initialMatchId) {
    const selector = document.getElementById('matchSelector');
    if (!selector) return;
    
    // Sort matches by date descending
    const sortedMatches = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    selector.innerHTML = '';
    sortedMatches.forEach(m => {
        const option = document.createElement('option');
        option.value = m.match_id;
        option.textContent = `[${m.year}] ${m.team1} vs ${m.team2} (${m.venue})`;
        if (m.match_id === initialMatchId) {
            option.selected = true;
        }
        selector.appendChild(option);
    });
    
    selector.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        if (selectedId) {
            fetchMatchData(selectedId);
        }
    });
}

// Override initDashboard to call fetchMatchData after original init
const originalInit = window.initDashboard;
window.initDashboard = function() {
    if(originalInit) originalInit();
    fetchMatchData('2023-11-19-Ind-vs-Aus'); // Hardcoded ID based on our ETL output
};

function populateDashboard(meta, deliveries) {
    // 1. Update Hero Card Meta
    const metaEl = document.querySelector('.hero-meta');
    if (metaEl) {
        metaEl.innerHTML = `<strong>${meta.team1} vs ${meta.team2}</strong> · ${meta.year} World Cup · ${meta.venue}, ${meta.city}`;
    }
    
    // Separate deliveries by team
    const team1Name = meta.team1;
    const team2Name = meta.team2;
    
    const team1Deliveries = deliveries.filter(d => d.innings === team1Name);
    const team2Deliveries = deliveries.filter(d => d.innings === team2Name);
    
    // Calculate cumulative runs per over
    function getRunsPerOver(teamDeliveries) {
        let cumulative = [];
        let total = 0;
        let currentOver = 1;
        let fours = 0, sixes = 0;
        let dotBalls = 0;
        for (let d of teamDeliveries) {
            if (d.over > currentOver) {
                while(currentOver < d.over) {
                    cumulative.push(total);
                    currentOver++;
                }
            }
            total += d.runs_bat + d.extras;
            if (d.runs_bat === 4) fours++;
            if (d.runs_bat === 6) sixes++;
            if (d.runs_bat === 0 && d.extras === 0 && !d.is_wicket) dotBalls++;
        }
        cumulative.push(total);
        return { cumulative, total, fours, sixes, dotBalls, ballsFaced: teamDeliveries.length };
    }

    const t1Data = getRunsPerOver(team1Deliveries);
    const t2Data = getRunsPerOver(team2Deliveries);
    
    // Update Score UI
    const teamElements = document.querySelectorAll('.team-score');
    if(teamElements.length >= 2) {
        teamElements[0].textContent = `${t1Data.total}/${team1Deliveries.filter(d => d.is_wicket).length}`;
        teamElements[1].textContent = `${t2Data.total}/${team2Deliveries.filter(d => d.is_wicket).length}`;
    }
    
    // Update Stat Cards (using Team 1 as the primary focus for now)
    const statVals = document.querySelectorAll('.stat-val');
    if(statVals.length >= 5) {
        // Total Runs
        statVals[0].textContent = t1Data.total;
        
        // Boundary % (Runs from boundaries / Total runs)
        const boundaryRuns = (t1Data.fours * 4) + (t1Data.sixes * 6);
        const bdryPct = t1Data.total > 0 ? Math.round((boundaryRuns / t1Data.total) * 100) : 0;
        statVals[2].innerHTML = `${bdryPct}<span style="font-size:16px;font-weight:500;color:var(--text-muted)">%</span>`;
        
        const trendLabels = document.querySelectorAll('.trend-up');
        if(trendLabels.length >= 3) {
            trendLabels[2].innerHTML = `↑ 4s: ${t1Data.fours}&nbsp;&nbsp;&nbsp;6s: ${t1Data.sixes}`;
        }
        
        // Dot Ball %
        const dotPct = t1Data.ballsFaced > 0 ? Math.round((t1Data.dotBalls / t1Data.ballsFaced) * 100) : 0;
        statVals[4].innerHTML = `${dotPct}<span style="font-size:16px;color:var(--text-muted)">%</span>`;
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
