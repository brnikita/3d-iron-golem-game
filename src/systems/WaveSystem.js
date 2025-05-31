// Wave system for managing enemy spawning and progression
class WaveSystem {
    constructor() {
        this.currentWave = 0;
        this.waveInterval = 30000; // 30 seconds between waves
        this.lastWaveTime = 0;
        this.isWaveActive = false;
        this.enemiesRemaining = 0;
        this.enemiesSpawned = 0;
        
        console.log('WaveSystem initialized');
    }

    update(deltaTime) {
        const currentTime = Date.now();
        
        // Check if it's time for a new wave
        if (!this.isWaveActive && currentTime - this.lastWaveTime >= this.waveInterval) {
            this.startNextWave();
        }
        
        // Check if current wave is complete
        if (this.isWaveActive && this.enemiesRemaining <= 0) {
            this.completeWave();
        }
    }

    startNextWave() {
        this.currentWave++;
        this.isWaveActive = true;
        this.lastWaveTime = Date.now();
        
        // Calculate enemies for this wave
        this.enemiesSpawned = Math.min(5 + this.currentWave * 2, 20);
        this.enemiesRemaining = this.enemiesSpawned;
        
        console.log(`Starting wave ${this.currentWave} with ${this.enemiesSpawned} enemies`);
        
        // Play wave start sound
        const audioManager = window.game?.gameEngine?.audioManager;
        if (audioManager) {
            audioManager.playSound('wave_start', null, 0.8);
        }
        
        // Spawn enemies
        this.spawnEnemies();
        
        // Update HUD
        if (window.game?.gameEngine?.hud) {
            window.game.gameEngine.hud.updateWave(this.currentWave);
        }
    }

    spawnEnemies() {
        if (!window.game?.gameEngine) return;
        
        const gameEngine = window.game.gameEngine;
        
        for (let i = 0; i < this.enemiesSpawned; i++) {
            // Spawn enemy at random position around the village
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 10;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            
            // Create proper Enemy instance
            const enemy = new Enemy(new THREE.Vector3(x, 0, z));
            
            // Scale enemy stats based on wave
            enemy.maxHealth = 20 + (this.currentWave - 1) * 5;
            enemy.currentHealth = enemy.maxHealth;
            enemy.attackDamage = 10 + (this.currentWave - 1) * 2;
            enemy.moveSpeed = 2.0 + (this.currentWave - 1) * 0.2;
            
            // Initialize enemy
            enemy.initialize();
            
            // Add to game engine
            gameEngine.addEnemy(enemy);
            
            // Add to physics system
            if (gameEngine.physicsSystem) {
                gameEngine.physicsSystem.addEntity(enemy);
            }
        }
    }

    completeWave() {
        this.isWaveActive = false;
        console.log(`Wave ${this.currentWave} completed!`);
        
        // Give player some resources
        if (window.game?.gameEngine?.ironGolem) {
            const ironGolem = window.game.gameEngine.ironGolem;
            ironGolem.addResource('ironIngots', this.currentWave * 2);
            console.log(`Wave bonus: ${this.currentWave * 2} iron ingots`);
        }
        
        // Update HUD
        if (window.game?.gameEngine?.hud) {
            window.game.gameEngine.hud.updateWaveStatus('Wave Complete!');
        }
    }

    onEnemyDefeated(enemy) {
        this.enemiesRemaining--;
        console.log(`Enemy defeated. ${this.enemiesRemaining} remaining.`);
        
        // Drop resources
        if (window.game?.gameEngine?.resourceSystem) {
            window.game.gameEngine.resourceSystem.dropResources(enemy, enemy.position);
        }
        
        // Remove from physics system
        if (window.game?.gameEngine?.physicsSystem) {
            window.game.gameEngine.physicsSystem.removeEntity(enemy);
        }
    }

    reset() {
        this.currentWave = 0;
        this.lastWaveTime = 0;
        this.isWaveActive = false;
        this.enemiesRemaining = 0;
        this.enemiesSpawned = 0;
        console.log('WaveSystem reset');
    }

    dispose() {
        this.reset();
        console.log('WaveSystem disposed');
    }
}

window.WaveSystem = WaveSystem; 