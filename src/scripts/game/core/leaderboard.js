// Leaderboard functions
function saveSurvivalScore(playerName, time) {
    const scores = getSurvivalScores();
    scores.push({ name: playerName, time: time });
    scores.sort((a, b) => a.time - b.time);
    scores.splice(10); // Keep only top 10 scores
    localStorage.setItem('survivalScores', JSON.stringify(scores));
    updateLeaderboard();
}

function getSurvivalScores() {
    const scores = localStorage.getItem('survivalScores');
    return scores ? JSON.parse(scores) : [];
}

function updateLeaderboard() {
    const gameMode = document.getElementById('mode').value;
    const leaderboardDiv = document.getElementById('leaderboard-entries');
    leaderboardDiv.innerHTML = '';

    if (gameMode === 'survival') {
        const scores = getSurvivalScores();
        scores.forEach((score, index) => {
            const entry = document.createElement('div');
            entry.className = 'leaderboard-entry';
            entry.textContent = `${index + 1}. ${score.name} - ${formatTime(score.time)}`;
            leaderboardDiv.appendChild(entry);
        });
    } else {
        // Classic mode - use existing best times logic
        const difficulties = ['easy', 'medium', 'hard'];
        difficulties.forEach(difficulty => {
            const bestTime = getBestTime(difficulty);
            if (bestTime) {
                const entry = document.createElement('div');
                entry.className = 'leaderboard-entry';
                entry.textContent = `${difficulty.toUpperCase()}: ${formatTime(bestTime)}`;
                leaderboardDiv.appendChild(entry);
            }
        });
    }
}