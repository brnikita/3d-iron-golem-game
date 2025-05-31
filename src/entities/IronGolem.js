// Iron Golem player character class
class IronGolem extends Entity {
    constructor(position = new THREE.Vector3()) {
        super(position);
        
        // Iron Golem specific stats
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        this.moveSpeed = 4.0; // units per second
        this.attackDamage = 25;
        this.attackRange = 3.0;
        this.attackCooldown = 2000; // milliseconds
        this.lastAttackTime = 0;
        
        // Collision properties
        this.collisionRadius = 1.5;
        this.collisionHeight = 4.0;
        
        // Camera properties
        this.cameraRotationX = 0;
        this.cameraRotationY = 0;
        this.maxCameraX = Math.PI / 3; // 60 degrees up/down
        
        // Movement state
        this.isMoving = false;
        this.movementDirection = new THREE.Vector3();
        
        // Resources
        this.resources = {
            ironIngots: 0,
            bones: 0,
            emeralds: 0
        };
        
        // Upgrades
        this.upgrades = {
            damageBoost: 0,
            healthBoost: 0,
            attackSpeed: 0
        };
        
        this.initialize();
        console.log('Iron Golem created');
    }

    createMesh() {
        // Get Iron Golem model from asset loader
        const assetLoader = window.game?.gameEngine?.assetLoader;
        if (assetLoader && assetLoader.hasAsset('models/iron_golem')) {
            const model = assetLoader.getAsset('models/iron_golem');
            this.mesh = model.scene.clone();
        } else {
            // Fallback to simple geometry
            this.geometry = new THREE.BoxGeometry(2, 4, 1);
            this.material = new THREE.MeshLambertMaterial({ 
                color: 0x607D8B,
                map: assetLoader?.getAsset('textures/iron')
            });
            this.mesh = new THREE.Mesh(this.geometry, this.material);
        }
        
        // Set initial transform
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        this.mesh.scale.copy(this.scale);
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Store reference
        this.mesh.userData.entity = this;
        this.mesh.userData.type = 'iron_golem';
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Update movement animation state
        this.updateMovementState();
        
        // Update attack cooldown
        this.updateAttackCooldown();
    }

    updateMovementState() {
        const wasMoving = this.isMoving;
        this.isMoving = this.velocity.length() > 0.1;
        
        // Play movement animation if state changed
        if (this.isMoving && !wasMoving) {
            this.playAnimation('walk');
        } else if (!this.isMoving && wasMoving) {
            this.playAnimation('idle');
        }
    }

    updateAttackCooldown() {
        // Attack cooldown is handled by checking time difference
        // No need to update anything here
    }

    // Movement methods
    move(x, z, deltaTime) {
        if (this.isDead) return;
        
        // Create movement vector in world space
        const movement = new THREE.Vector3(x, 0, z);
        
        // Apply camera rotation to movement
        movement.applyEuler(new THREE.Euler(0, this.cameraRotationY, 0));
        
        // Normalize and apply speed
        movement.normalize().multiplyScalar(this.moveSpeed * deltaTime);
        
        // Apply movement
        this.position.add(movement);
        
        // Rotate Iron Golem to face movement direction
        if (movement.length() > 0) {
            this.lookAt(this.position.clone().add(movement));
        }
        
        // Store movement direction for animation
        this.movementDirection.copy(movement);
    }

    jump() {
        if (this.isDead || !this.isGrounded) return;
        
        this.velocity.y = 8; // Jump velocity
        this.isGrounded = false;
        
        console.log('Iron Golem jumped');
    }

    // Camera control methods
    rotateCamera(deltaX, deltaY) {
        this.cameraRotationY -= deltaX;
        this.cameraRotationX -= deltaY;
        
        // Clamp vertical rotation
        this.cameraRotationX = Math.max(-this.maxCameraX, 
                                       Math.min(this.maxCameraX, this.cameraRotationX));
        
        // Normalize horizontal rotation
        this.cameraRotationY = this.cameraRotationY % (Math.PI * 2);
    }

    getCameraPosition() {
        // Camera position behind and above Iron Golem
        const offset = new THREE.Vector3(0, 8, 12);
        
        // Apply camera rotation
        offset.applyEuler(new THREE.Euler(this.cameraRotationX, this.cameraRotationY, 0));
        
        return this.position.clone().add(offset);
    }

    getCameraTarget() {
        // Look at point in front of Iron Golem
        const target = this.position.clone();
        target.y += 2; // Look slightly above ground
        
        // Apply horizontal rotation to target
        const forward = new THREE.Vector3(0, 0, -5);
        forward.applyEuler(new THREE.Euler(0, this.cameraRotationY, 0));
        target.add(forward);
        
        return target;
    }

    // Combat methods
    attack() {
        if (this.isDead || !this.canAttack()) return false;
        
        console.log('Iron Golem attacks!');
        
        // Play attack animation
        this.playAnimation('attack', false);
        
        // Find enemies in range
        const enemies = this.findEnemiesInRange();
        
        // Deal damage to enemies
        enemies.forEach(enemy => {
            const damage = this.calculateDamage();
            enemy.takeDamage(damage, this);
            console.log(`Iron Golem hit enemy for ${damage} damage`);
        });
        
        // Set attack cooldown
        this.lastAttackTime = Date.now();
        
        // Play attack sound
        if (window.game?.gameEngine?.audioManager) {
            window.game.gameEngine.audioManager.playSound('attack', this.position);
        }
        
        return true;
    }

    canAttack() {
        const timeSinceLastAttack = Date.now() - this.lastAttackTime;
        const cooldown = this.getAttackCooldown();
        return timeSinceLastAttack >= cooldown;
    }

    getAttackCooldown() {
        // Base cooldown reduced by attack speed upgrades
        const speedMultiplier = 1 - (this.upgrades.attackSpeed * 0.2);
        return this.attackCooldown * speedMultiplier;
    }

    calculateDamage() {
        // Base damage plus upgrades
        return this.attackDamage + (this.upgrades.damageBoost * 5);
    }

    findEnemiesInRange() {
        const enemies = [];
        
        if (window.game?.gameEngine) {
            const allEnemies = window.game.gameEngine.getEnemies();
            
            allEnemies.forEach(enemy => {
                if (this.isInRange(enemy, this.attackRange)) {
                    enemies.push(enemy);
                }
            });
        }
        
        return enemies;
    }

    // Resource management
    addResource(type, amount) {
        if (this.resources.hasOwnProperty(type)) {
            this.resources[type] += amount;
            console.log(`Iron Golem collected ${amount} ${type} (total: ${this.resources[type]})`);
            
            // Update HUD
            if (window.game?.gameEngine?.hud) {
                window.game.gameEngine.hud.updateResources(this.resources);
            }
            
            return true;
        }
        return false;
    }

    spendResource(type, amount) {
        if (this.resources.hasOwnProperty(type) && this.resources[type] >= amount) {
            this.resources[type] -= amount;
            console.log(`Iron Golem spent ${amount} ${type} (remaining: ${this.resources[type]})`);
            
            // Update HUD
            if (window.game?.gameEngine?.hud) {
                window.game.gameEngine.hud.updateResources(this.resources);
            }
            
            return true;
        }
        return false;
    }

    hasResource(type, amount) {
        return this.resources.hasOwnProperty(type) && this.resources[type] >= amount;
    }

    // Upgrade methods
    purchaseUpgrade(upgradeType) {
        let cost = 0;
        let maxLevel = 3;
        
        switch (upgradeType) {
            case 'damageBoost':
                cost = 15 + (this.upgrades.damageBoost * 10);
                break;
            case 'healthBoost':
                cost = 25 + (this.upgrades.healthBoost * 15);
                break;
            case 'attackSpeed':
                cost = 20 + (this.upgrades.attackSpeed * 15);
                maxLevel = 2;
                break;
            default:
                return false;
        }
        
        // Check if can afford and not at max level
        if (this.upgrades[upgradeType] >= maxLevel) {
            console.log(`${upgradeType} is already at max level`);
            return false;
        }
        
        if (!this.hasResource('ironIngots', cost)) {
            console.log(`Not enough iron ingots for ${upgradeType} (need ${cost})`);
            return false;
        }
        
        // Purchase upgrade
        this.spendResource('ironIngots', cost);
        this.upgrades[upgradeType]++;
        
        // Apply upgrade effects
        this.applyUpgradeEffects(upgradeType);
        
        console.log(`Purchased ${upgradeType} level ${this.upgrades[upgradeType]}`);
        return true;
    }

    applyUpgradeEffects(upgradeType) {
        switch (upgradeType) {
            case 'healthBoost':
                // Increase max health and heal to full
                const oldMaxHealth = this.maxHealth;
                this.maxHealth = 100 + (this.upgrades.healthBoost * 25);
                const healthIncrease = this.maxHealth - oldMaxHealth;
                this.currentHealth += healthIncrease;
                break;
        }
    }

    repairHealth() {
        const cost = 10;
        const healAmount = 20;
        
        if (!this.hasResource('ironIngots', cost)) {
            console.log(`Not enough iron ingots for health repair (need ${cost})`);
            return false;
        }
        
        if (this.currentHealth >= this.maxHealth) {
            console.log('Health is already full');
            return false;
        }
        
        this.spendResource('ironIngots', cost);
        this.heal(healAmount);
        
        console.log(`Repaired health for ${healAmount} HP`);
        return true;
    }

    // Override damage method to handle Iron Golem specific effects
    onDamage(amount, source) {
        super.onDamage(amount, source);
        
        // Screen shake or other player-specific effects
        console.log('Iron Golem takes damage!');
        
        // Update HUD
        if (window.game?.gameEngine?.hud) {
            window.game.gameEngine.hud.updateHealth(this.currentHealth, this.maxHealth);
        }
    }

    onHeal(amount) {
        super.onHeal(amount);
        
        // Update HUD
        if (window.game?.gameEngine?.hud) {
            window.game.gameEngine.hud.updateHealth(this.currentHealth, this.maxHealth);
        }
    }

    onDeath() {
        super.onDeath();
        
        console.log('Iron Golem has fallen!');
        
        // Trigger game over
        if (window.game?.gameEngine) {
            window.game.gameEngine.setState(GameState.GAME_OVER);
        }
    }

    // Reset method for game restart
    reset() {
        this.currentHealth = this.maxHealth;
        this.isDead = false;
        this.shouldDestroy = false;
        this.position.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this.cameraRotationX = 0;
        this.cameraRotationY = 0;
        this.lastAttackTime = 0;
        
        // Reset resources (optional - could keep them)
        this.resources = {
            ironIngots: 0,
            bones: 0,
            emeralds: 0
        };
        
        // Reset upgrades (optional - could keep them)
        this.upgrades = {
            damageBoost: 0,
            healthBoost: 0,
            attackSpeed: 0
        };
        
        this.maxHealth = 100; // Reset to base health
        
        console.log('Iron Golem reset');
    }

    // Debug methods
    getDebugInfo() {
        const baseInfo = super.getDebugInfo();
        return {
            ...baseInfo,
            moveSpeed: this.moveSpeed,
            attackDamage: this.calculateDamage(),
            attackCooldown: this.getAttackCooldown(),
            canAttack: this.canAttack(),
            resources: { ...this.resources },
            upgrades: { ...this.upgrades },
            cameraRotation: {
                x: this.cameraRotationX,
                y: this.cameraRotationY
            }
        };
    }
}

// Make IronGolem globally accessible
window.IronGolem = IronGolem; 