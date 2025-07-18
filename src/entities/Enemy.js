// Basic enemy class
class Enemy extends Entity {
    constructor(position = new THREE.Vector3()) {
        super(position);
        
        this.maxHealth = 20;
        this.currentHealth = this.maxHealth;
        this.moveSpeed = 2.0;
        this.attackDamage = 10;
        this.attackRange = 2.5;
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
        head.position.y = 2.8;
        head.castShadow = true;
        this.mesh.add(head);
        
        // Eyes
        const eyeGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.1);
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.2, 2.85, 0.4);
        this.mesh.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.2, 2.85, 0.4);
        this.mesh.add(rightEye);
        
        // Hair (messy zombie hair)
        const hairGeometry = new THREE.BoxGeometry(0.9, 0.3, 0.9);
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 3.3;
        this.mesh.add(hair);
        
        // Body (torso)
        const bodyGeometry = new THREE.BoxGeometry(1.0, 1.5, 0.6);
        const body = new THREE.Mesh(bodyGeometry, clothesMaterial);
        body.position.y = 1.95;
        body.castShadow = true;
        this.mesh.add(body);
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
        
        const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
        leftArm.position.set(-0.8, 1.95, 0);
        leftArm.rotation.z = 0.3; // Slightly bent zombie arms
        leftArm.castShadow = true;
        this.mesh.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
        rightArm.position.set(0.8, 1.95, 0);
        rightArm.rotation.z = -0.3;
        rightArm.castShadow = true;
        this.mesh.add(rightArm);
        
        // Hands
        const handGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        
        const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
        leftHand.position.set(-1.0, 1.3, 0.2);
        leftHand.castShadow = true;
        this.mesh.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
        rightHand.position.set(1.0, 1.3, 0.2);
        rightHand.castShadow = true;
        this.mesh.add(rightHand);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.5, 1.2, 0.5);
        
        const leftLeg = new THREE.Mesh(legGeometry, clothesMaterial);
        leftLeg.position.set(-0.3, 0.6, 0);
        leftLeg.castShadow = true;
        this.mesh.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, clothesMaterial);
        rightLeg.position.set(0.3, 0.6, 0);
        rightLeg.castShadow = true;
        this.mesh.add(rightLeg);
        
        // Feet
        const footGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.8);
        
        const leftFoot = new THREE.Mesh(footGeometry, skinMaterial);
        leftFoot.position.set(-0.3, 0.15, 0.1);
        leftFoot.castShadow = true;
        this.mesh.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, skinMaterial);
        rightFoot.position.set(0.3, 0.15, 0.1);
        rightFoot.castShadow = true;
        this.mesh.add(rightFoot);
        
        // Torn clothes details
        const tearGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
        for (let i = 0; i < 2; i++) {
            const tear = new THREE.Mesh(tearGeometry, clothesMaterial);
            tear.position.set(
                (Math.random() - 0.5) * 0.8,
                1.95 + (Math.random() - 0.5) * 0.5,
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
        
        // Create health bar
        this.createHealthBar();
    }

    createHealthBar() {
        // Create health bar above enemy
        const healthBarGroup = new THREE.Group();
        
        // Background bar (red)
        const bgGeometry = new THREE.PlaneGeometry(1.5, 0.2);
        const bgMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000, transparent: true, opacity: 0.8 });
        const bgBar = new THREE.Mesh(bgGeometry, bgMaterial);
        healthBarGroup.add(bgBar);
        
        // Health bar (green)
        const healthGeometry = new THREE.PlaneGeometry(1.5, 0.2);
        const healthMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00, transparent: true, opacity: 0.9 });
        this.healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
        this.healthBar.position.z = 0.01; // Slightly in front
        healthBarGroup.add(this.healthBar);
        
        // Position health bar above enemy
        healthBarGroup.position.y = 4.0; // Above head
        healthBarGroup.lookAt(0, 4.0, 1); // Face camera initially
        
        this.mesh.add(healthBarGroup);
        this.healthBarGroup = healthBarGroup;
    }

    updateHealthBar() {
        if (!this.healthBar) return;
        
        const healthPercent = this.currentHealth / this.maxHealth;
        this.healthBar.scale.x = Math.max(0, healthPercent);
        
        // Change color based on health
        if (healthPercent > 0.6) {
            this.healthBar.material.color.setHex(0x00FF00); // Green
        } else if (healthPercent > 0.3) {
            this.healthBar.material.color.setHex(0xFFFF00); // Yellow
        } else {
            this.healthBar.material.color.setHex(0xFF0000); // Red
        }
        
        // Make health bar face camera
        if (this.healthBarGroup && window.game?.gameEngine?.camera) {
            this.healthBarGroup.lookAt(window.game.gameEngine.camera.position);
        }
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
        
        // Update walking animation
        this.updateWalkingAnimation(deltaTime);
        
        // Update health bar
        this.updateHealthBar();
        
        // Update mesh transform
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.rotation.copy(this.rotation);
            this.mesh.scale.copy(this.scale);
        }
    }

    updateAI(deltaTime) {
        // Find target (Iron Golem)
        this.findTarget();
        
        if (!this.target) {
            this.state = 'idle';
            return;
        }
        
        const distanceToTarget = this.distanceTo(this.target);
        
        // Add periodic debug logging
        if (!this.lastStateLog || Date.now() - this.lastStateLog > 1000) {
            console.log(`Enemy state: ${this.state}, distance: ${distanceToTarget.toFixed(2)}, attackRange: ${this.attackRange}`);
            this.lastStateLog = Date.now();
        }
        
        // State machine
        switch (this.state) {
            case 'idle':
                if (distanceToTarget <= this.detectionRange) {
                    this.state = 'chasing';
                    console.log('Enemy: idle -> chasing');
                }
                break;
                
            case 'chasing':
                if (distanceToTarget <= this.attackRange) {
                    this.state = 'attacking';
                    console.log(`🎯 Enemy: chasing -> attacking! Distance: ${distanceToTarget.toFixed(2)}`);
                } else if (distanceToTarget > this.detectionRange * 1.5) {
                    this.state = 'idle';
                    console.log('Enemy: chasing -> idle (too far)');
                } else {
                    this.moveTowardsTarget(deltaTime);
                }
                break;
                
            case 'attacking':
                if (distanceToTarget > this.attackRange) {
                    this.state = 'chasing';
                    console.log('Enemy: attacking -> chasing (out of range)');
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
        if (!this.target) {
            console.log('❌ Enemy attack failed: No target');
            return;
        }
        
        if (!this.canAttack()) {
            console.log(`❌ Enemy attack on cooldown: ${(this.attackCooldown - (Date.now() - this.lastAttackTime))/1000}s remaining`);
            return;
        }
        
        console.log('🧟 Enemy attacks Iron Golem!');
        console.log(`Attack details: damage=${this.attackDamage}, distance=${this.distanceTo(this.target).toFixed(2)}`);
        
        // Deal damage to target
        const result = this.target.takeDamage(this.attackDamage, this);
        console.log(`Damage dealt: ${result ? 'SUCCESS' : 'FAILED (invulnerable?)'}`);
        
        // Set attack cooldown
        this.lastAttackTime = Date.now();
        
        // Play attack animation
        this.playAttackAnimation();
        
        // Play attack sound
        if (window.game?.gameEngine?.audioManager) {
            window.game.gameEngine.audioManager.playSound('enemy_attack', this.position, 0.9);
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

    playAttackAnimation() {
        if (!this.bodyParts) return;
        
        console.log('🎬 Playing enemy attack animation!');
        
        // Store original positions
        const originalBody = {
            position: this.bodyParts.body.position.z,
            rotation: this.bodyParts.body.rotation.x
        };
        
        // Dramatic zombie attack animation
        // Arms stretch forward aggressively
        this.bodyParts.leftArm.rotation.x = -2.0; // Arms reach forward
        this.bodyParts.leftArm.rotation.z = 0.4;
        this.bodyParts.rightArm.rotation.x = -2.0;
        this.bodyParts.rightArm.rotation.z = -0.4;
        
        // Lunge body forward
        this.bodyParts.body.position.z = 0.5;
        this.bodyParts.body.rotation.x = 0.3;
        
        // Make eyes flash red
        if (this.bodyParts.leftEye && this.bodyParts.rightEye) {
            const originalEyeColor = this.bodyParts.leftEye.material.color.getHex();
            this.bodyParts.leftEye.material.color.setHex(0xFF0000);
            this.bodyParts.rightEye.material.color.setHex(0xFF0000);
            
            // Flash effect
            setTimeout(() => {
                if (this.bodyParts.leftEye && this.bodyParts.rightEye) {
                    this.bodyParts.leftEye.material.color.setHex(0xFFFFFF);
                    this.bodyParts.rightEye.material.color.setHex(0xFFFFFF);
                }
            }, 100);
            
            setTimeout(() => {
                if (this.bodyParts.leftEye && this.bodyParts.rightEye) {
                    this.bodyParts.leftEye.material.color.setHex(originalEyeColor);
                    this.bodyParts.rightEye.material.color.setHex(originalEyeColor);
                }
            }, 200);
        }
        
        // Create visual slash effect
        this.createSlashEffect();
        
        // Reset after animation
        setTimeout(() => {
            if (this.bodyParts) {
                // Return arms to zombie pose
                this.bodyParts.leftArm.rotation.x = 0.3;
                this.bodyParts.leftArm.rotation.z = 0.3;
                this.bodyParts.rightArm.rotation.x = -0.3;
                this.bodyParts.rightArm.rotation.z = -0.3;
                
                // Return body
                this.bodyParts.body.position.z = originalBody.position;
                this.bodyParts.body.rotation.x = originalBody.rotation;
            }
        }, 400);
    }
    
    createSlashEffect() {
        const scene = window.game?.gameEngine?.scene;
        if (!scene) return;
        
        // Create claw slash effect
        for (let i = 0; i < 3; i++) {
            const slashGeometry = new THREE.BoxGeometry(0.1, 1.0, 0.05);
            const slashMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFF00,
                transparent: true,
                opacity: 0.8
            });
            const slash = new THREE.Mesh(slashGeometry, slashMaterial);
            
            // Position in front of enemy with slight offset
            slash.position.copy(this.position);
            slash.position.y += 2.5;
            slash.position.x += (i - 1) * 0.3;
            const forward = this.getForwardDirection().multiplyScalar(1.5);
            slash.position.add(forward);
            slash.rotation.y = this.rotation.y;
            slash.rotation.z = (i - 1) * 0.3; // Fan out the slashes
            
            scene.add(slash);
            
            // Animate slash
            let opacity = 0.8;
            const animateSlash = () => {
                opacity -= 0.1;
                slash.material.opacity = opacity;
                slash.position.y += 0.05;
                slash.scale.y *= 0.95;
                
                if (opacity > 0) {
                    requestAnimationFrame(animateSlash);
                } else {
                    scene.remove(slash);
                    slash.geometry.dispose();
                    slash.material.dispose();
                }
            };
            animateSlash();
        }
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
        
        // Flash red when hit and show damage on body
        this.showDamageEffect();
        
        // Create floating damage text
        this.createDamageText(amount);
        
        if (this.currentHealth <= 0) {
            this.die(attacker);
        } else {
            // Switch to chasing state when damaged
            this.setState('chasing');
        }
    }

    showDamageEffect() {
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
        
        // Add damage cracks/wounds based on health
        const healthPercent = this.currentHealth / this.maxHealth;
        if (healthPercent < 0.7) {
            this.addWounds();
        }
        
        // Restore original materials after flash
        setTimeout(() => {
            Object.keys(originalMaterials).forEach(partName => {
                const part = this.bodyParts[partName];
                if (part) {
                    part.material = originalMaterials[partName];
                }
            });
        }, 150);
    }

    addWounds() {
        // Add visual wounds/damage to the enemy body
        const healthPercent = this.currentHealth / this.maxHealth;
        
        if (healthPercent < 0.5 && !this.hasWounds) {
            // Add dark spots (wounds) to body
            const woundMaterial = new THREE.MeshBasicMaterial({ color: 0x330000 });
            
            for (let i = 0; i < 3; i++) {
                const woundGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.05);
                const wound = new THREE.Mesh(woundGeometry, woundMaterial);
                wound.position.set(
                    (Math.random() - 0.5) * 0.8,
                    1.95 + (Math.random() - 0.5) * 1.0,
                    0.32
                );
                this.mesh.add(wound);
            }
            this.hasWounds = true;
        }
        
        if (healthPercent < 0.3 && !this.hasSevereWounds) {
            // Make enemy look more damaged - darker skin
            Object.keys(this.bodyParts).forEach(partName => {
                const part = this.bodyParts[partName];
                if (part && part.material && part.material.color) {
                    part.material.color.multiplyScalar(0.7); // Darken
                }
            });
            this.hasSevereWounds = true;
        }
    }

    createDamageText(damage) {
        // Create floating damage number
        const scene = window.game?.gameEngine?.scene;
        if (!scene) return;
        
        // Create text geometry (simplified - using a colored sphere for now)
        const textGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const textMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF0000,
            transparent: true,
            opacity: 1.0
        });
        const damageIndicator = new THREE.Mesh(textGeometry, textMaterial);
        
        // Position above enemy
        damageIndicator.position.copy(this.position);
        damageIndicator.position.y += 3.5;
        damageIndicator.position.x += (Math.random() - 0.5) * 1.0;
        
        scene.add(damageIndicator);
        
        // Animate floating up and fading
        let time = 0;
        const animateDamage = () => {
            time += 0.05;
            damageIndicator.position.y += 0.05;
            damageIndicator.material.opacity = Math.max(0, 1.0 - time);
            
            if (time < 1.0) {
                requestAnimationFrame(animateDamage);
            } else {
                scene.remove(damageIndicator);
                damageIndicator.geometry.dispose();
                damageIndicator.material.dispose();
            }
        };
        
        animateDamage();
    }

    die(attacker = null) {
        if (this.isDead) return;
        
        this.isDead = true;
        this.state = 'dead';
        
        console.log('Enemy died');
        
        // Call onDeath to notify systems
        this.onDeath();
        
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
            
            // Remove from game engine using the correct method
            if (window.game?.gameEngine) {
                window.game.gameEngine.removeEnemy(this);
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

    updateWalkingAnimation(deltaTime) {
        if (!this.bodyParts) return;
        
        const isMoving = this.velocity.length() > 0.1;
        
        if (isMoving) {
            // Initialize walk time if not exists
            if (!this.walkTime) this.walkTime = 0;
            this.walkTime += deltaTime * 6; // Walking speed for zombies
            
            // Animate legs (zombie shuffle)
            const legSwing = Math.sin(this.walkTime) * 0.4; // More dramatic than Iron Golem
            this.bodyParts.leftLeg.rotation.x = legSwing;
            this.bodyParts.rightLeg.rotation.x = -legSwing;
            
            // Animate arms (zombie-like swaying)
            const armSwing = Math.sin(this.walkTime + Math.PI/4) * 0.3; // Offset for natural movement
            this.bodyParts.leftArm.rotation.x = armSwing;
            this.bodyParts.rightArm.rotation.x = -armSwing;
            
            // Add slight head bobbing
            if (this.bodyParts.head) {
                this.bodyParts.head.position.y = 2.8 + Math.sin(this.walkTime * 2) * 0.1;
            }
            
        } else {
            // Reset to neutral pose
            if (this.bodyParts.leftLeg) this.bodyParts.leftLeg.rotation.x = 0;
            if (this.bodyParts.rightLeg) this.bodyParts.rightLeg.rotation.x = 0;
            if (this.bodyParts.leftArm) this.bodyParts.leftArm.rotation.x = 0.3; // Return to zombie pose
            if (this.bodyParts.rightArm) this.bodyParts.rightArm.rotation.x = -0.3; // Return to zombie pose
            if (this.bodyParts.head) this.bodyParts.head.position.y = 2.8; // Reset head position
        }
    }
}

window.Enemy = Enemy; 