let startTime;
let timerInterval;
let currentTime;

// Sound System
const SOUNDS = {
    background: new Audio('/assets/audio/CheckmateDreams.mp3'),
    click: new Audio('/sounds/click.mp3'),
    flag: new Audio('/sounds/flag.mp3'),
    gameOver: new Audio('/sounds/game-over.mp3'),
    win: new Audio('/sounds/win.mp3')
};

// Preload all sounds
function preloadSounds() {
    Object.values(SOUNDS).forEach(sound => {
        sound.load();
        // Set default volume
        sound.volume = sound.src.includes('CheckmateDreams') ? 0.2 : 0.3;
    });
}

// Sound settings
let isMusicPlaying = false;
let isSoundEnabled = true;

// Add sound loading status tracking
let soundsLoaded = false;

// Initialize sound system with proper loading checks
function initSoundSystem() {
    preloadSounds();
    
    // Set up background music
    SOUNDS.background.loop = true;

    // Initialize with saved preferences
    const savedMusicState = localStorage.getItem('music-enabled') === 'true';
    const savedSoundState = localStorage.getItem('sound-enabled') !== 'false';
    
    isSoundEnabled = savedSoundState;
    isMusicPlaying = savedMusicState;
    
    // Add click listener to enable audio
    document.addEventListener('click', function enableAudio() {
        if (isMusicPlaying) {
            const promise = SOUNDS.background.play();
            if (promise !== undefined) {
                promise.catch(error => {
                    console.log("Autoplay prevented:", error);
                });
            }
        }
        document.removeEventListener('click', enableAudio);
    }, { once: true });

    updateSoundButton();
    updateMusicButton();
}

// Update the playSound function with better error handling
function playSound(soundName) {
    if (!isSoundEnabled || !soundsLoaded) return;
    
    const sound = SOUNDS[soundName];
    if (!sound) {
        console.error(`Sound ${soundName} not found`);
        return;
    }

    try {
        // Create a new audio instance for overlapping sounds
        if (soundName !== 'background') {
            const newSound = sound.cloneNode();
            newSound.volume = sound.volume;
            const playPromise = newSound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Sound play failed:', error);
                });
            }
        } else {
            // Handle background music separately
            const playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Background music play failed:', error);
                });
            }
        }
    } catch (error) {
        console.error('Error playing sound:', error);
    }
}

// Background music controls
function playBackgroundMusic() {
    // Reset the audio to the beginning
    SOUNDS.background.currentTime = 0;
    
    // Play the audio with error handling
    const playPromise = SOUNDS.background.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                isMusicPlaying = true;
                updateMusicButton();
                console.log('Music started successfully');
            })
            .catch(error => {
                console.error('Error playing music:', error);
                // Try playing after user interaction
                document.addEventListener('click', function initAudio() {
                    playBackgroundMusic();
                    document.removeEventListener('click', initAudio);
                }, { once: true });
            });
    }
}

function toggleBackgroundMusic() {
    console.log('Toggle music called. Current state:', isMusicPlaying);
    
    if (isMusicPlaying) {
        SOUNDS.background.pause();
        SOUNDS.background.currentTime = 0;
        isMusicPlaying = false;
    } else {
        playBackgroundMusic();
    }
    
    localStorage.setItem('music-enabled', isMusicPlaying);
    updateMusicButton();
    console.log('New music state:', isMusicPlaying);
}

function toggleSoundEffects() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('sound-enabled', isSoundEnabled);
    updateSoundButton();
}

// Update UI buttons
function updateMusicButton() {
    const musicButton = document.getElementById('music-toggle');
    if (musicButton) {
        musicButton.textContent = isMusicPlaying ? '🎵 Music On' : '🎵 Music Off';
        musicButton.classList.toggle('active', isMusicPlaying);
    }
}

function updateSoundButton() {
    const soundButton = document.getElementById('sound-toggle');
    if (soundButton) {
        soundButton.textContent = isSoundEnabled ? '🔊 Sound On' : '🔈 Sound Off';
        soundButton.classList.toggle('active', isSoundEnabled);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme handler
    initThemeHandler();

    // Check which page we're on
    const isGamePage = window.location.pathname.includes('game.html');
    const isChessPage = window.location.pathname.includes('chess.html');
    
    if (isGamePage || isChessPage) {
        // Initialize sound system first
        initSoundSystem();
    
        // Game page initialization
        // Game page initialization
        if (isGamePage) {
            initGame();
            document.getElementById('restart-button').addEventListener('click', initGame);
        }
        // Add sound control listeners

         // Add a one-time click listener to start audio (browser policy)
         document.addEventListener('click', function initAudio() {
            if (!isMusicPlaying) {
                playBackgroundMusic();
            }
            document.removeEventListener('click', initAudio);
        }, { once: true });
        document.getElementById('music-toggle')?.addEventListener('click', toggleBackgroundMusic);
        document.getElementById('sound-toggle')?.addEventListener('click', toggleSoundEffects);
                
        updateMusicButton();
        updateSoundButton();
    } else {
        // Menu page initialization
        const mainMenu = document.getElementById('main-menu');
        const controlsScreen = document.getElementById('controls-screen');
        
        // Controls button
        document.getElementById('controls-button').addEventListener('click', () => {
            mainMenu.classList.add('hidden');
            controlsScreen.classList.remove('hidden');
        });
        
        // Quit button
        document.getElementById('quit-button').addEventListener('click', () => {
            if (confirm('Are you sure you want to quit?')) {
                window.close();
            }
        });
        
        // Back to menu button
        document.getElementById('back-to-menu').addEventListener('click', () => {
            controlsScreen.classList.add('hidden');
            mainMenu.classList.remove('hidden');
        });
    }
});

// Theme handling
function initThemeHandler() {
    const themeSelect = document.getElementById('theme');
    if (!themeSelect) {
        console.error('Theme selector not found!');
        return;
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('board-theme') || 'classic';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeSelect.value = savedTheme;

    // Theme change handler
    themeSelect.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('board-theme', newTheme);
    });
}

// Game variables
let rows = 10;
let cols = 10;
let minesCount = 15;
let cells = [];
let gameOver = false;

// Game initialization
function initGame() {
    const gameBoard = document.getElementById('game-board');
    const message = document.getElementById('message');
    const modeSelect = document.getElementById('mode');
    const difficultySelect = document.getElementById('difficulty');
    const movementSelect = document.getElementById('movement');
    updateLeaderboard();
    
    // Handle game mode
    const gameMode = modeSelect.value;
    if (gameMode === 'survival' && !gameOver) {
        difficultySelect.disabled = true;
        if (!currentLevel) {
            initSurvivalMode();
            return;
        }
    } else {
        difficultySelect.disabled = false;
        updateDifficulty();
    }

    // Reset timer
    if (timerInterval) {
        stopTimer();
    }
    document.getElementById('timer').textContent = 'Time: 00:00';

    updateDifficulty();
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 60px)`;
    gameBoard.innerHTML = '';
    cells = [];
    message.textContent = '';
    gameOver = false;

    // Create cells
    for (let i = 0; i < rows; i++) {
        cells[i] = [];
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add((i + j) % 2 === 0 ? 'cell-light' : 'cell-dark');
            
            cell.dataset.row = i;
            cell.dataset.col = j;
            gameBoard.appendChild(cell);
            cells[i][j] = { 
                element: cell, 
                isMine: false, 
                revealed: false,
                flagged: false,
                surroundingMines: 0 
            };

            // Add event listeners
            cell.addEventListener('click', () => revealCell(i, j));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                flagCell(i, j);
            });
            cell.addEventListener('mouseenter', () => highlightMovementPattern(i, j));
            cell.addEventListener('mouseleave', () => {
                const cells = document.querySelectorAll('.cell');
                cells.forEach(cell => {
                    cell.classList.remove('highlight-king', 'highlight-bishop', 'highlight-rook', 'highlight-knight');
                });
            });
        }
    }

    placeMines();
    calculateSurroundingMines();

    // Start the timer
    startTimer();
}

// Update difficulty
function updateDifficulty() {
    const difficultySelect = document.getElementById('difficulty');
    const difficulty = difficultySelect.value;
    if (difficulty === 'easy') {
        rows = 8;
        cols = 8;
        minesCount = 10;
    } else if (difficulty === 'medium') {
        rows = 10;
        cols = 10;
        minesCount = 15;
    } else if (difficulty === 'hard') {
        rows = 12;
        cols = 12;
        minesCount = 25;
    }
}

// Place mines randomly
function placeMines() {
    let placedMines = 0;
    while (placedMines < minesCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);

        if (!cells[row][col].isMine) {
            cells[row][col].isMine = true;
            placedMines++;
        }
    }
}

// Calculate surrounding mines
function calculateSurroundingMines() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (cells[i][j].isMine) continue;

            let count = 0;
            // Check all adjacent cells
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    const ni = i + di;
                    const nj = j + dj;
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && cells[ni][nj].isMine) {
                        count++;
                    }
                }
            }
            cells[i][j].surroundingMines = count;
        }
    }
}
// Calculate surrounding mines for bishop's movement
function calculateSurroundingMinesBishop() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (cells[i][j].isMine) continue;

            let count = 0;
            // Check all diagonal directions (Bishop's movement)
            const directions = [
                [-1, -1], // top-left
                [-1, 1],  // top-right
                [1, -1],  // bottom-left
                [1, 1]    // bottom-right
            ];

            // For each diagonal direction
            for (const [di, dj] of directions) {
                // Continue along the diagonal until edge or mine
                let ni = i + di;
                let nj = j + dj;
                while (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                    if (cells[ni][nj].isMine) {
                        count++;
                        break; // Only count the first mine in each direction
                    }
                    ni += di;
                    nj += dj;
                }
            }
            cells[i][j].surroundingMines = count;
        }
    }
}
// Calculate surrounding mines for rook's movement
function calculateSurroundingMinesRook() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (cells[i][j].isMine) continue;

            let count = 0;
            // Check horizontal and vertical directions (Rook's movement)
            const directions = [
                [-1, 0],  // up
                [1, 0],   // down
                [0, -1],  // left
                [0, 1]    // right
            ];

            // For each direction
            for (const [di, dj] of directions) {
                // Continue along the line until edge or mine
                let ni = i + di;
                let nj = j + dj;
                while (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                    if (cells[ni][nj].isMine) {
                        count++;
                        break; // Only count the first mine in each direction
                    }
                    ni += di;
                    nj += dj;
                }
            }
            cells[i][j].surroundingMines = count;
        }
    }
}

// Reveal cell
function highlightMovementPattern(row, col) {
    // Clear previous highlights
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('highlight-king', 'highlight-bishop', 'highlight-rook', 'highlight-knight');
    });

    const movementType = document.getElementById('movement').value;
    const currentCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

    switch (movementType) {
        case 'bishop':
            highlightBishopPattern(row, col);
            break;
        case 'rook':
            highlightRookPattern(row, col);
            break;
        case 'knight':
            highlightKnightPattern(row, col);
            break;
        case 'king':
        default:
            highlightKingPattern(row, col);
            break;
    }
}

function highlightKingPattern(row, col) {
    for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
            if (di === 0 && dj === 0) continue;
            const ni = row + di;
            const nj = col + dj;
            if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                const cell = document.querySelector(`[data-row="${ni}"][data-col="${nj}"]`);
                cell.classList.add('highlight-king');
            }
        }
    }
}

function highlightBishopPattern(row, col) {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [di, dj] of directions) {
        let ni = row + di;
        let nj = col + dj;
        while (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
            const cell = document.querySelector(`[data-row="${ni}"][data-col="${nj}"]`);
            cell.classList.add('highlight-bishop');
            ni += di;
            nj += dj;
        }
    }
}

function highlightRookPattern(row, col) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [di, dj] of directions) {
        let ni = row + di;
        let nj = col + dj;
        while (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
            const cell = document.querySelector(`[data-row="${ni}"][data-col="${nj}"]`);
            cell.classList.add('highlight-rook');
            ni += di;
            nj += dj;
        }
    }
}

function highlightKnightPattern(row, col) {
    const directions = [
        [-2, -1], [-2, 1],
        [2, -1], [2, 1],
        [-1, -2], [1, -2],
        [-1, 2], [1, 2]
    ];
    for (const [di, dj] of directions) {
        const ni = row + di;
        const nj = col + dj;
        if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
            const cell = document.querySelector(`[data-row="${ni}"][data-col="${nj}"]`);
            cell.classList.add('highlight-knight');
        }
    }
}

function revealCell(row, col) {
    const cell = cells[row][col];
    if (gameOver || cell.revealed || cell.flagged) return;

    cell.revealed = true;
    cell.element.classList.add('revealed');

    if (cell.isMine) {
        cell.element.textContent = '💣';
        cell.element.classList.add('mine');
        playSound('gameOver');
        endGame(false);
    } else {
        if (cell.surroundingMines > 0) {
            cell.element.textContent = cell.surroundingMines;
            cell.element.setAttribute('data-mines', cell.surroundingMines);
        } else {
            // Reveal adjacent cells for empty cells
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    const ni = row + di;
                    const nj = col + dj;
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && !cells[ni][nj].revealed) {
                        revealCell(ni, nj);
                    }
                }
            }
        }
        checkWin();
    }
}

// Flag cell
function flagCell(row, col) {
    const cell = cells[row][col];
    if (gameOver || cell.revealed) return;

    cell.flagged = !cell.flagged;
    cell.element.textContent = cell.flagged ? '🚩' : '';
    playSound('flag')
}

// Check win condition
function checkWin() {
    let unrevealedSafeCells = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!cells[i][j].isMine && !cells[i][j].revealed) {
                unrevealedSafeCells++;
            }
        }
    }
    
    if (unrevealedSafeCells === 0) {
        const gameMode = document.getElementById('mode').value;
        if (gameMode === 'survival') {
            if (rows < MAX_BOARD_SIZE) {
                progressToNextLevel();
            } else {
                // Final level completed
                const finalTime = stopTimer();
                endGame(true);
                const playerName = prompt("Congratulations! You've completed Survival Mode! Enter your name:");
                if (playerName) {
                    saveSurvivalScore(playerName, finalTime);
                }
            }
        } else {
            endGame(true);
        }
    }
}

function endGame(won) {
    gameOver = true;
    const finalTime = stopTimer();
    const currentMovementDiv = document.getElementById('current-movement');
    currentMovementDiv.textContent = '';
    const difficulty = document.getElementById('difficulty').value;
    const message = document.getElementById('message');
    
    if (won) {
        const isNewBest = saveBestTime(difficulty, finalTime);
        updateLeaderboard();
        messageText = `Congratulations! You won in ${formatTime(finalTime)}${isNewBest ? ' - New Best Time!' : ''}`;
        message.style.color = '#00ff00';
    } else {
        messageText = 'Game Over!';
        message.style.color = '#ff0000';
    }
    messageText += `Time: ${formatTime(finalTime)}`;
    
    // Check for best time if won
    if (won) {
        const isNewBest = saveBestTime(difficulty, finalTime);
        const bestTime = getBestTime(difficulty);
        
        if (isNewBest) {
            messageText += '\nNEW BEST TIME! 🏆';
        }
        messageText += `\nBest Time: ${formatTime(bestTime)}`;
    }
    
    message.textContent = messageText;
    message.style.color = won ? 'green' : 'red';
    message.style.whiteSpace = 'pre-line'; // Preserve line breaks

    if (won) {
        playSound('win');
    }

    // Reveal all mines
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = cells[i][j];
            if (cell.isMine) {
                cell.element.textContent = '💣';
                cell.element.classList.add('revealed');
                if (won) {
                    cell.element.style.backgroundColor = '#90EE90';
                }
            }
        }
    }
}

// Add visibility change handler to manage music when tab is hidden/visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (isMusicPlaying) {
            SOUNDS.background.pause();
        }
    } else {
        if (isMusicPlaying) {
            SOUNDS.background.play()
                .catch(error => console.error('Error resuming music:', error));
        }
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (isMusicPlaying) {
        SOUNDS.background.pause();
        SOUNDS.background.currentTime = 0;
    }
});

// Timer functions
function startTimer() {
    startTime = Date.now();
    updateTimer();
    // Update timer every second
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    return currentTime;
}

function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
    currentTime = elapsedTime;
    
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    
    // Format time as MM:SS
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = `Time: ${formattedTime}`;
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Function to save best time
function saveBestTime(difficulty, timeInSeconds) {
    // Reset all leaderboards if this is the first time using the new format
    if (!localStorage.getItem('leaderboardWithNames')) {
        localStorage.removeItem('leaderboard');
        localStorage.setItem('leaderboardWithNames', 'true');
    }

    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || {};
    if (!leaderboard[difficulty]) {
        leaderboard[difficulty] = [];
    }
    
    const playerName = prompt("Congratulations! Enter your name for the leaderboard:", "Player");
    const entry = {
        name: playerName || "Anonymous",
        time: timeInSeconds
    };
    
    // Add new entry and sort
    leaderboard[difficulty].push(entry);
    leaderboard[difficulty].sort((a, b) => a.time - b.time);
    
    // Keep only top 5 times
    leaderboard[difficulty] = leaderboard[difficulty].slice(0, 5);
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    return leaderboard[difficulty][0].time === timeInSeconds; // Return true if it's a new best time
}

function updateLeaderboard() {
    const leaderboardDiv = document.getElementById('leaderboard-entries');
    const difficulty = document.getElementById('difficulty').value;
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || {};
    const entries = leaderboard[difficulty] || [];
    
    let html = `<h3>${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode</h3>`;
    if (entries.length === 0) {
        html += '<p>No times recorded yet</p>';
    } else {
        html += '<ol>';
        entries.forEach(entry => {
            html += `<li>${entry.name} - ${formatTime(entry.time)}</li>`;
        });
        html += '</ol>';
    }
    
    leaderboardDiv.innerHTML = html;
}

// Function to get best time
function getBestTime(difficulty) {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || {};
    const times = leaderboard[difficulty] || [];
    return times.length > 0 ? times[0] : null;
}

// Add user interaction handler for autoplay policy
function initializeAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Resume audio context on user interaction
    document.addEventListener('click', function resumeAudio() {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        // Try playing background music if it was enabled
        if (isMusicPlaying) {
            playBackgroundMusic();
        }
        document.removeEventListener('click', resumeAudio);
    }, { once: true });
}

// Add this function to retry loading sounds
function retryLoadSound(sound, maxRetries = 3) {
    let retries = 0;
    
    function attemptLoad() {
        sound.load();
        return new Promise((resolve, reject) => {
            sound.addEventListener('canplaythrough', resolve, { once: true });
            sound.addEventListener('error', (error) => {
                if (retries < maxRetries) {
                    retries++;
                    console.log(`Retrying sound load, attempt ${retries}`);
                    setTimeout(attemptLoad, 1000);
                } else {
                    reject(error);
                }
            }, { once: true });
        });
    }
    
    return attemptLoad();
}

// Update sound initialization to use retry logic
Object.values(SOUNDS).forEach(sound => {
    retryLoadSound(sound)
        .catch(error => console.error('Failed to load sound after retries:', error));
});

// Add this function to test sound loading
function testSounds() {
    console.log("Testing sounds...");
    Object.entries(SOUNDS).forEach(([name, sound]) => {
        console.log(`Testing ${name}:`, {
            src: sound.src,
            readyState: sound.readyState,
            networkState: sound.networkState,
            error: sound.error
        });
        
        // Try to play each sound
        const promise = sound.play();
        if (promise !== undefined) {
            promise
                .then(() => {
                    console.log(`${name} played successfully`);
                    sound.pause();
                    sound.currentTime = 0;
                })
                .catch(error => {
                    console.error(`${name} play failed:`, error);
                });
        }
    });
}

// Call this after initialization
document.addEventListener('click', function testAudio() {
    testSounds();
    document.removeEventListener('click', testAudio);
}, { once: true });

// Add this to your existing sound initialization
Object.values(SOUNDS).forEach(sound => {
    sound.addEventListener('error', (e) => {
        console.error('Sound loading error:', {
            src: sound.src,
            error: e.error,
            message: e.message
        });
    });
});
