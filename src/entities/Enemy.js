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
        // Create detailed enemy model (zombie-like)
        this.mesh = new THREE.Group();
        this.mesh.name = 'Enemy';
        
        // Create materials
        const skinMaterial = new THREE.MeshLambertMaterial({ color: 0x8FBC8F }); // Pale green skin
        const clothesMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 }); // Blue clothes
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 }); // Red eyes
        const hairMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown hair
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.y = 1.6;
        head.castShadow = true;
        this.mesh.add(head);
        
        // Eyes
        const eyeGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.1);
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.2, 1.65, 0.4);
        this.mesh.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.2, 1.65, 0.4);
        this.mesh.add(rightEye);
        
        // Hair (messy zombie hair)
        const hairGeometry = new THREE.BoxGeometry(0.9, 0.3, 0.9);
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 2.1;
        this.mesh.add(hair);
        
        // Body (torso)
        const bodyGeometry = new THREE.BoxGeometry(1.0, 1.5, 0.6);
        const body = new THREE.Mesh(bodyGeometry, clothesMaterial);
        body.position.y = 0.75;
        body.castShadow = true;
        this.mesh.add(body);
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
        
        const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
        leftArm.position.set(-0.8, 0.75, 0);
        leftArm.rotation.z = 0.3; // Slightly bent zombie arms
        leftArm.castShadow = true;
        this.mesh.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
        rightArm.position.set(0.8, 0.75, 0);
        rightArm.rotation.z = -0.3;
        rightArm.castShadow = true;
        this.mesh.add(rightArm);
        
        // Hands
        const handGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        
        const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
        leftHand.position.set(-1.0, 0.1, 0.2);
        leftHand.castShadow = true;
        this.mesh.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
        rightHand.position.set(1.0, 0.1, 0.2);
        rightHand.castShadow = true;
        this.mesh.add(rightHand);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.5, 1.2, 0.5);
        
        const leftLeg = new THREE.Mesh(legGeometry, clothesMaterial);
        leftLeg.position.set(-0.3, -0.6, 0);
        leftLeg.castShadow = true;
        this.mesh.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, clothesMaterial);
        rightLeg.position.set(0.3, -0.6, 0);
        rightLeg.castShadow = true;
        this.mesh.add(rightLeg);
        
        // Feet
        const footGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.8);
        
        const leftFoot = new THREE.Mesh(footGeometry, skinMaterial);
        leftFoot.position.set(-0.3, -1.3, 0.1);
        leftFoot.castShadow = true;
        this.mesh.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, skinMaterial);
        rightFoot.position.set(0.3, -1.3, 0.1);
        rightFoot.castShadow = true;
        this.mesh.add(rightFoot);
        
        // Torn clothes details
        const tearGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
        for (let i = 0; i < 2; i++) {
            const tear = new THREE.Mesh(tearGeometry, clothesMaterial);
            tear.position.set(
                (Math.random() - 0.5) * 0.8,
                0.75 + (Math.random() - 0.5) * 0.5,
                0.31
            );
            this.mesh.add(tear);
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
        
        // Store body parts for animation
        this.bodyParts = {
            head: head,
            body: body,
            leftArm: leftArm,
            rightArm: rightArm,
            leftLeg: leftLeg,
            rightLeg: rightLeg,
            leftEye: leftEye,
            rightEye: rightEye
        };
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

    takeDamage(amount, attacker = null) {
        if (this.isDead) return;
        
        this.currentHealth -= amount;
        console.log(`Enemy takes ${amount} damage, health: ${this.currentHealth}`);
        
        // Play hit sound
        const audioManager = window.game?.gameEngine?.audioManager;
        if (audioManager) {
            audioManager.playSound('hit', this.position, 0.6);
        }
        
        // Flash red when hit
        this.flashRed();
        
        if (this.currentHealth <= 0) {
            this.die(attacker);
        } else {
            // Switch to chasing state when damaged
            this.setState('chasing');
        }
    }

    flashRed() {
        if (!this.bodyParts) return;
        
        // Store original materials
        const originalMaterials = {};
        Object.keys(this.bodyParts).forEach(partName => {
            const part = this.bodyParts[partName];
            if (part && part.material) {
                originalMaterials[partName] = part.material.clone();
                part.material.color.setHex(0xFF4444); // Red flash
            }
        });
        
        // Restore original materials after flash
        setTimeout(() => {
            Object.keys(originalMaterials).forEach(partName => {
                const part = this.bodyParts[partName];
                if (part) {
                    part.material = originalMaterials[partName];
                }
            });
        }, 100);
    }

    die(attacker = null) {
        if (this.isDead) return;
        
        this.isDead = true;
        this.state = 'dead';
        
        console.log('Enemy died');
        
        // Play death sound
        const audioManager = window.game?.gameEngine?.audioManager;
        if (audioManager) {
            audioManager.playSound('enemy_death', this.position, 0.7);
        }
        
        // Drop resources
        this.dropResources();
        
        // Remove from scene after a short delay
        setTimeout(() => {
            if (this.mesh && this.mesh.parent) {
                this.mesh.parent.remove(this.mesh);
            }
            
            // Remove from game engine
            if (window.game?.gameEngine) {
                window.game.gameEngine.removeEntity(this);
            }
        }, 1000);
    }

    dropResources() {
        // Drop resources when enemy dies
        if (window.game?.gameEngine?.resourceSystem) {
            window.game.gameEngine.resourceSystem.dropResources(this, this.position);
        }
    }

    setState(newState) {
        this.state = newState;
    }
}

window.Enemy = Enemy; 