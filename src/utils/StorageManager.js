// Storage manager for handling local storage and game persistence
class StorageManager {
    constructor(gameId = 'iron_golem_survival') {
        this.gameId = gameId;
        this.prefix = `${gameId}_`;
        console.log('StorageManager initialized');
    }

    // Save game state
    saveGame(gameState) {
        try {
            const data = {
                timestamp: Date.now(),
                version: '1.0.0',
                gameState: gameState
            };
            
            const serialized = JSON.stringify(data);
            localStorage.setItem(`${this.prefix}save_game`, serialized);
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    // Load game state
    loadGame() {
        try {
            const data = localStorage.getItem(`${this.prefix}save_game`);
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            console.log('Game loaded successfully');
            return parsed.gameState;
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }

    // Save high score
    saveHighScore(score, waveNumber) {
        try {
            const highScores = this.getHighScores();
            
            const newScore = {
                score: score,
                wave: waveNumber,
                date: Date.now()
            };
            
            highScores.push(newScore);
            highScores.sort((a, b) => b.score - a.score);
            
            // Keep only top 10 scores
            const topScores = highScores.slice(0, 10);
            
            localStorage.setItem(`${this.prefix}high_scores`, JSON.stringify(topScores));
            console.log('High score saved');
            return true;
        } catch (error) {
            console.error('Failed to save high score:', error);
            return false;
        }
    }

    // Get high scores
    getHighScores() {
        try {
            const data = localStorage.getItem(`${this.prefix}high_scores`);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load high scores:', error);
            return [];
        }
    }

    // Save player settings
    saveSettings(settings) {
        try {
            localStorage.setItem(`${this.prefix}settings`, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    // Get player settings
    getSettings() {
        try {
            const data = localStorage.getItem(`${this.prefix}settings`);
            return data ? JSON.parse(data) : this.getDefaultSettings();
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.getDefaultSettings();
        }
    }

    // Default settings
    getDefaultSettings() {
        return {
            masterVolume: 0.7,
            sfxVolume: 0.8,
            musicVolume: 0.5,
            mouseSensitivity: 1.0,
            invertY: false
        };
    }

    // Clear all game data
    clearAllData() {
        const keys = Object.keys(localStorage).filter(key => 
            key.startsWith(this.prefix));
        
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('All game data cleared');
    }
}

// Make StorageManager globally accessible
window.StorageManager = StorageManager; 