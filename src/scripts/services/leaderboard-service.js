import { API } from 'aws-amplify';

export async function saveScore(score) {
    try {
        const response = await API.post('gameApi', '/scores', {
            body: {
                score: score.value,
                playerName: score.playerName,
                gameMode: score.gameMode,
                timestamp: new Date().toISOString()
            }
        });
        return response;
    } catch (error) {
        console.error('Error saving score:', error);
        throw error;
    }
}

export async function getLeaderboard(gameMode) {
    try {
        const response = await API.get('gameApi', '/scores', {
            queryStringParameters: {
                gameMode: gameMode
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
} 