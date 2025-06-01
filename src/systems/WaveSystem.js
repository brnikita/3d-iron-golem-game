// Wave system for managing enemy spawning and progression
class WaveSystem {
    constructor() {
        this.currentWave = 0;
        this.waveInterval = 30000; // 30 seconds between waves
        this.lastWaveTime = 0;
        this.isWaveActive = false;
        this.enemiesRemaining = 0;
        this.enemiesSpawned = 0;
        this.bossSpawned = false; // Флаг для отслеживания появления босса
        this.shouldSpawnBoss = false; // Флаг для определения, нужно ли спавнить босса
        
        console.log('WaveSystem initialized');
    }

    update(deltaTime) {
        const currentTime = Date.now();
        
        // Check if it's time for a new wave
        if (!this.isWaveActive && currentTime - this.lastWaveTime >= this.waveInterval) {
            this.startNextWave();
        }
        
        // Проверяем, нужно ли спавнить босса после уничтожения всех зомби
        if (this.isWaveActive && this.shouldSpawnBoss && !this.bossSpawned && this.enemiesRemaining <= 0) {
            this.spawnMutantBoss();
        }
        
        // Check if current wave is complete
        // Волна завершается если:
        // 1. Не должно быть босса и все враги уничтожены
        // 2. Должен быть босс, он заспавнен и все враги (включая босса) уничтожены
        if (this.isWaveActive && this.enemiesRemaining <= 0) {
            if (!this.shouldSpawnBoss || (this.shouldSpawnBoss && this.bossSpawned)) {
                this.completeWave();
            }
        }
    }

    startNextWave() {
        this.currentWave++;
        this.isWaveActive = true;
        this.lastWaveTime = Date.now();
        this.bossSpawned = false;
        
        // Определяем, будет ли в этой волне босс (каждые 3 волны начиная с 3-й)
        this.shouldSpawnBoss = this.currentWave >= 3 && this.currentWave % 3 === 0;
        
        // Calculate enemies for this wave
        this.enemiesSpawned = Math.min(5 + this.currentWave * 2, 20);
        this.enemiesRemaining = this.enemiesSpawned;
        
        console.log(`Starting wave ${this.currentWave} with ${this.enemiesSpawned} enemies`);
        
        if (this.shouldSpawnBoss) {
            console.log('🧟‍♂️💀 This wave will spawn a MUTANT BOSS after all zombies are defeated!');
        }
        
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
            
            if (this.shouldSpawnBoss) {
                window.game.gameEngine.hud.updateWaveStatus('⚠️ Boss Wave! Defeat all zombies first! ⚠️');
            }
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

    spawnMutantBoss() {
        if (!window.game?.gameEngine || this.bossSpawned) return;
        
        const gameEngine = window.game.gameEngine;
        this.bossSpawned = true;
        
        console.log('🧟‍♂️💀 ALL ZOMBIES DEFEATED! SPAWNING MUTANT BOSS!');
        
        // Спавним босса в центре карты
        const bossPosition = new THREE.Vector3(0, 0, 0);
        const mutantBoss = new ZombieMutantBoss(bossPosition);
        
        // Масштабируем характеристики босса в зависимости от волны
        const waveMultiplier = Math.floor(this.currentWave / 3);
        mutantBoss.maxHealth = 200 + (waveMultiplier * 50);
        mutantBoss.currentHealth = mutantBoss.maxHealth;
        mutantBoss.attackDamage = 35 + (waveMultiplier * 10);
        mutantBoss.moveSpeed = Math.min(1.2 + (waveMultiplier * 0.1), 2.0);
        
        // Инициализируем босса
        mutantBoss.initialize();
        
        // Добавляем в игровой движок
        gameEngine.addEnemy(mutantBoss);
        
        // Добавляем в физическую систему
        if (gameEngine.physicsSystem) {
            gameEngine.physicsSystem.addEntity(mutantBoss);
        }
        
        // Увеличиваем счетчик врагов
        this.enemiesRemaining = 1;
        
        // Звуковой эффект появления босса
        const audioManager = window.game?.gameEngine?.audioManager;
        if (audioManager) {
            audioManager.playSound('wave_start', null, 1.0); // Громче для босса
        }
        
        // Обновляем HUD
        if (window.game?.gameEngine?.hud) {
            window.game.gameEngine.hud.updateWaveStatus('🧟‍♂️💀 MUTANT BOSS APPEARED! 💀🧟‍♂️');
        }
        
        // Создаем драматический эффект появления
        this.createBossSpawnEffect(bossPosition);
    }

    createBossSpawnEffect(position) {
        const scene = window.game?.gameEngine?.scene;
        if (!scene) return;
        
        // Создаем эффект телепортации
        for (let i = 0; i < 30; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 6, 6);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0, 1, 0.3 + Math.random() * 0.4), // Красные оттенки
                transparent: true,
                opacity: 1.0
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            particle.position.copy(position);
            particle.position.y += Math.random() * 6;
            particle.position.x += (Math.random() - 0.5) * 4;
            particle.position.z += (Math.random() - 0.5) * 4;
            
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 2
            );
            
            scene.add(particle);
            
            const animate = () => {
                particle.position.add(velocity.clone().multiplyScalar(0.03));
                velocity.y -= 0.08; // Гравитация
                particle.material.opacity -= 0.02;
                
                if (particle.material.opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    scene.remove(particle);
                    particle.geometry.dispose();
                    particle.material.dispose();
                }
            };
            
            animate();
        }
        
        // Красная вспышка света
        const spawnLight = new THREE.PointLight(0xFF0000, 3, 20);
        spawnLight.position.copy(position);
        spawnLight.position.y += 3;
        scene.add(spawnLight);
        
        let intensity = 3;
        const fadeLight = () => {
            intensity -= 0.1;
            spawnLight.intensity = Math.max(0, intensity);
            
            if (intensity > 0) {
                requestAnimationFrame(fadeLight);
            } else {
                scene.remove(spawnLight);
            }
        };
        
        fadeLight();
        
        // Ударная волна появления
        const waveGeometry = new THREE.RingGeometry(0.5, 10, 16);
        const waveMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF0000,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const wave = new THREE.Mesh(waveGeometry, waveMaterial);
        
        wave.position.copy(position);
        wave.position.y = 0.1;
        wave.rotation.x = -Math.PI / 2;
        
        scene.add(wave);
        
        let scale = 0.1;
        let opacity = 0.6;
        const animateWave = () => {
            scale += 0.2;
            opacity -= 0.03;
            
            wave.scale.setScalar(scale);
            wave.material.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animateWave);
            } else {
                scene.remove(wave);
                wave.geometry.dispose();
                wave.material.dispose();
            }
        };
        
        animateWave();
    }

    completeWave() {
        this.isWaveActive = false;
        this.bossSpawned = false;
        this.shouldSpawnBoss = false;
        
        console.log(`Wave ${this.currentWave} completed!`);
        
        // Give player some resources
        if (window.game?.gameEngine?.ironGolem) {
            const ironGolem = window.game.gameEngine.ironGolem;
            const baseReward = this.currentWave * 2;
            // Дополнительная награда за волну с боссом
            const bossBonus = (this.currentWave % 3 === 0 && this.currentWave >= 3) ? this.currentWave : 0;
            const totalReward = baseReward + bossBonus;
            
            ironGolem.addResource('ironIngots', totalReward);
            console.log(`Wave bonus: ${totalReward} iron ingots${bossBonus > 0 ? ' (includes boss bonus!)' : ''}`);
        }
        
        // Update HUD
        if (window.game?.gameEngine?.hud) {
            window.game.gameEngine.hud.updateWaveStatus('Wave Complete!');
        }
    }

    onEnemyDefeated(enemy) {
        this.enemiesRemaining--;
        console.log(`Enemy defeated. ${this.enemiesRemaining} remaining.`);
        
        // Специальное сообщение при поражении босса
        if (enemy.isMutant && enemy.isBoss) {
            console.log('🧟‍♂️💀 MUTANT BOSS DEFEATED! Wave complete!');
            
            // Обновляем HUD с особым сообщением
            if (window.game?.gameEngine?.hud) {
                window.game.gameEngine.hud.updateWaveStatus('💀 MUTANT BOSS DEFEATED! 💀');
            }
        }
        
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
        this.bossSpawned = false;
        this.shouldSpawnBoss = false;
        console.log('WaveSystem reset');
    }

    dispose() {
        this.reset();
        console.log('WaveSystem disposed');
    }
}

window.WaveSystem = WaveSystem; 