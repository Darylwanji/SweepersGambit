import { saveScore, getLeaderboard } from '../../services/leaderboard-service.js';

// Update the saveBestTime function to use AWS
async function saveBestTime(difficulty, timeInSeconds) {
    try {
        const playerName = prompt("Congratulations! Enter your name for the leaderboard:", "Player");
        if (!playerName) return false;

        await saveScore({
            value: timeInSeconds,
            playerName: playerName,
            gameMode: difficulty
        });

        await updateLeaderboard(); // Refresh the leaderboard
        return true;
    } catch (error) {
        console.error('Error saving score:', error);
        return false;
    }
}

// Update the updateLeaderboard function to use AWS
async function updateLeaderboard() {
    try {
        const leaderboardDiv = document.getElementById('leaderboard-entries');
        const difficulty = document.getElementById('difficulty').value;
        
        const scores = await getLeaderboard(difficulty);
        
        let html = `<h3>${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode</h3>`;
        if (scores.length === 0) {
            html += '<p>No times recorded yet</p>';
        } else {
            html += '<ol>';
            scores.forEach(score => {
                html += `<li>${score.playerName} - ${formatTime(score.value)}</li>`;
            });
            html += '</ol>';
        }
        
        leaderboardDiv.innerHTML = html;
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}