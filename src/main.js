// Main game entry point
class Game {
    constructor() {
        this.gameEngine = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();

            // Initialize game engine
            this.gameEngine = new GameEngine({
                canvas: document.getElementById('gameCanvas'),
                antialias: true,
                shadowMap: true
            });

            // Initialize all systems
            await this.gameEngine.initialize();

            // Hide loading screen
            this.hideLoadingScreen();

            this.isInitialized = true;
            console.log('Game initialized successfully');

        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to load game. Please refresh and try again.');
        }
    }

    start() {
        if (!this.isInitialized) {
            console.error('Game not initialized');
            return;
        }

        this.gameEngine.start();
        console.log('Game started');
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    showError(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <h1>Error</h1>
                <p>${message}</p>
                <button onclick="location.reload()">Retry</button>
            `;
        }
    }

    updateLoadingProgress(progress) {
        const progressBar = document.getElementById('loadingProgress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
}

// Initialize and start the game when page loads
window.addEventListener('DOMContentLoaded', async () => {
    const game = new Game();
    
    // Make game instance globally accessible for debugging
    window.game = game;
    
    await game.init();
    game.start();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.game && window.game.gameEngine) {
        window.game.gameEngine.handleResize();
    }
});

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (window.game && window.game.gameEngine) {
        if (document.hidden) {
            window.game.gameEngine.pause();
        } else {
            window.game.gameEngine.resume();
        }
    }
}); 