// Basic enemy class
class Enemy extends Entity {
    constructor(position = new THREE.Vector3()) {
        super(position);
        
        this.maxHealth = 20;
        this.currentHealth = this.maxHealth;
        this.moveSpeed = 2.0;
        this.attackDamage = 10;
        this.attackRange = 2.0;
        this.attackCooldown = 1500; // milliseconds
        this.lastAttackTime = 0;
        this.isEnemy = true;
        
        // AI properties
        this.target = null;
        this.detectionRange = 15.0;
        this.state = 'idle'; // idle, chasing, attacking
        this.pathfindingTimer = 0;
        this.stuckTimer = 0;
        this.lastPosition = new THREE.Vector3();
        
        console.log('Enemy created');
    }

    createMesh() {
        // Get enemy model from asset loader or create simple mesh
        const assetLoader = window.game?.gameEngine?.assetLoader;
        if (assetLoader && assetLoader.hasAsset('models/zombie')) {
            const model = assetLoader.getAsset('models/zombie');
            this.mesh = model.scene.clone();
        } else {
            // Fallback to simple geometry
            this.geometry = new THREE.BoxGeometry(1, 2, 0.5);
            this.material = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
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
        this.mesh.userData.type = 'enemy';
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.isDead) return;
        
        // Update AI
        this.updateAI(deltaTime);
        
        // Update attack cooldown
        this.updateAttackCooldown(deltaTime);
        
        // Check if stuck
        this.checkIfStuck(deltaTime);
    }

    updateAI(deltaTime) {
        // Find target (Iron Golem)
        this.findTarget();
        
        if (!this.target) {
            this.state = 'idle';
            return;
        }
        
        const distanceToTarget = this.distanceTo(this.target);
        
        // State machine
        switch (this.state) {
            case 'idle':
                if (distanceToTarget <= this.detectionRange) {
                    this.state = 'chasing';
                }
                break;
                
            case 'chasing':
                if (distanceToTarget <= this.attackRange) {
                    this.state = 'attacking';
                } else if (distanceToTarget > this.detectionRange * 1.5) {
                    this.state = 'idle';
                } else {
                    this.moveTowardsTarget(deltaTime);
                }
                break;
                
            case 'attacking':
                if (distanceToTarget > this.attackRange) {
                    this.state = 'chasing';
                } else {
                    this.attackTarget();
                }
                break;
        }
    }

    findTarget() {
        if (window.game?.gameEngine?.ironGolem) {
            this.target = window.game.gameEngine.ironGolem;
        }
    }

    moveTowardsTarget(deltaTime) {
        if (!this.target) return;
        
        // Calculate direction to target
        const direction = this.target.position.clone().sub(this.position);
        direction.y = 0; // Only move on XZ plane
        direction.normalize();
        
        // Apply movement
        const movement = direction.multiplyScalar(this.moveSpeed * deltaTime);
        this.position.add(movement);
        
        // Face target
        this.lookAt(this.target.position);
        
        // Store velocity for animation
        this.velocity.copy(movement.divideScalar(deltaTime));
    }

    attackTarget() {
        if (!this.target || !this.canAttack()) return;
        
        console.log('Enemy attacks Iron Golem!');
        
        // Deal damage to target
        this.target.takeDamage(this.attackDamage, this);
        
        // Set attack cooldown
        this.lastAttackTime = Date.now();
        
        // Play attack animation
        this.playAnimation('attack', false);
        
        // Play attack sound
        if (window.game?.gameEngine?.audioManager) {
            window.game.gameEngine.audioManager.playSound('enemy_attack', this.position);
        }
    }

    canAttack() {
        const timeSinceLastAttack = Date.now() - this.lastAttackTime;
        return timeSinceLastAttack >= this.attackCooldown;
    }

    updateAttackCooldown(deltaTime) {
        // Attack cooldown is handled by checking time difference
    }

    checkIfStuck(deltaTime) {
        // Check if enemy is stuck and hasn't moved much
        const distanceMoved = this.position.distanceTo(this.lastPosition);
        
        if (distanceMoved < 0.1 && this.state === 'chasing') {
            this.stuckTimer += deltaTime;
            
            // If stuck for too long, try to unstuck
            if (this.stuckTimer > 2.0) {
                this.unstuck();
                this.stuckTimer = 0;
            }
        } else {
            this.stuckTimer = 0;
        }
        
        this.lastPosition.copy(this.position);
    }

    unstuck() {
        // Simple unstuck mechanism - move in random direction
        const randomAngle = Math.random() * Math.PI * 2;
        const unstuckDistance = 2.0;
        
        this.position.x += Math.cos(randomAngle) * unstuckDistance;
        this.position.z += Math.sin(randomAngle) * unstuckDistance;
        
        console.log('Enemy unstuck');
    }

    // Override damage method
    onDamage(amount, source) {
        super.onDamage(amount, source);
        
        // Set target to attacker if not already set
        if (source && !this.target) {
            this.target = source;
            this.state = 'chasing';
        }
    }

    onDeath() {
        super.onDeath();
        
        console.log('Enemy defeated!');
        
        // Notify wave system
        if (window.game?.gameEngine?.waveSystem) {
            window.game.gameEngine.waveSystem.onEnemyDefeated(this);
        }
        
        // Play death sound
        if (window.game?.gameEngine?.audioManager) {
            window.game.gameEngine.audioManager.playSound('enemy_death', this.position);
        }
    }

    // Debug methods
    getDebugInfo() {
        const baseInfo = super.getDebugInfo();
        return {
            ...baseInfo,
            state: this.state,
            target: this.target ? this.target.id : null,
            distanceToTarget: this.target ? this.distanceTo(this.target) : null,
            canAttack: this.canAttack(),
            stuckTimer: this.stuckTimer
        };
    }
}

window.Enemy = Enemy; 