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
        this.attackCooldown = 0; // Current cooldown (in seconds)
        this.attackCooldownTime = 2.0; // Cooldown duration (in seconds)
        this.lastAttackTime = 0;
        
        // Collision properties
        this.collisionRadius = 1.5;
        this.collisionHeight = 4.0;
        
        // Camera properties
        this.cameraRotation = { x: 0, y: 0 };
        this.maxCameraX = Math.PI / 3; // 60 degrees up/down
        this.mouseSensitivity = 0.005; // Added for mouse sensitivity
        
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
        
        // Animation state
        this.walkTime = 0;
        this.lastFootstepTime = 0;
        
        this.initialize();
        console.log('Iron Golem created');
    }

    createMesh() {
        // Create detailed Iron Golem model
        this.mesh = new THREE.Group();
        this.mesh.name = 'IronGolem';
        
        // Get textures
        const assetLoader = window.game?.gameEngine?.assetLoader;
        const ironTexture = assetLoader?.getAsset('textures/iron');
        
        // Create materials
        const ironMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x607D8B,
            map: ironTexture
        });
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4444 }); // Red glowing eyes
        const vineMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Green vines
        
        // Body (main torso)
        const bodyGeometry = new THREE.BoxGeometry(1.8, 2.4, 1.0);
        const body = new THREE.Mesh(bodyGeometry, ironMaterial);
        body.position.y = 1.2;
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const head = new THREE.Mesh(headGeometry, ironMaterial);
        head.position.y = 3.0;
        head.castShadow = true;
        this.mesh.add(head);
        
        // Eyes (glowing red)
        const eyeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.1);
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 3.1, 0.6);
        this.mesh.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 3.1, 0.6);
        this.mesh.add(rightEye);
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.6, 2.0, 0.6);
        
        const leftArm = new THREE.Mesh(armGeometry, ironMaterial);
        leftArm.position.set(-1.4, 1.2, 0);
        leftArm.castShadow = true;
        this.mesh.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, ironMaterial);
        rightArm.position.set(1.4, 1.2, 0);
        rightArm.castShadow = true;
        this.mesh.add(rightArm);
        
        // Hands (larger fists)
        const handGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        
        const leftHand = new THREE.Mesh(handGeometry, ironMaterial);
        leftHand.position.set(-1.4, 0.0, 0);
        leftHand.castShadow = true;
        this.mesh.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, ironMaterial);
        rightHand.position.set(1.4, 0.0, 0);
        rightHand.castShadow = true;
        this.mesh.add(rightHand);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.8);
        
        const leftLeg = new THREE.Mesh(legGeometry, ironMaterial);
        leftLeg.position.set(-0.5, -0.9, 0);
        leftLeg.castShadow = true;
        this.mesh.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, ironMaterial);
        rightLeg.position.set(0.5, -0.9, 0);
        rightLeg.castShadow = true;
        this.mesh.add(rightLeg);
        
        // Feet
        const footGeometry = new THREE.BoxGeometry(1.0, 0.4, 1.4);
        
        const leftFoot = new THREE.Mesh(footGeometry, ironMaterial);
        leftFoot.position.set(-0.5, -1.9, 0.2);
        leftFoot.castShadow = true;
        this.mesh.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, ironMaterial);
        rightFoot.position.set(0.5, -1.9, 0.2);
        rightFoot.castShadow = true;
        this.mesh.add(rightFoot);
        
        // Decorative vines on body
        const vineGeometry = new THREE.BoxGeometry(0.1, 1.0, 0.1);
        for (let i = 0; i < 3; i++) {
            const vine = new THREE.Mesh(vineGeometry, vineMaterial);
            vine.position.set(
                (Math.random() - 0.5) * 1.5,
                1.2 + (Math.random() - 0.5) * 1.0,
                0.51
            );
            vine.rotation.z = (Math.random() - 0.5) * 0.5;
            this.mesh.add(vine);
        }
        
        // Nose (iron block protruding from face)
        const noseGeometry = new THREE.BoxGeometry(0.3, 0.6, 0.2);
        const nose = new THREE.Mesh(noseGeometry, ironMaterial);
        nose.position.set(0, 2.8, 0.7);
        this.mesh.add(nose);
        
        // Set initial transform
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        this.mesh.scale.copy(this.scale);
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Store reference
        this.mesh.userData.entity = this;
        this.mesh.userData.type = 'iron_golem';
        
        // Store body parts for animation
        this.bodyParts = {
            body: body,
            head: head,
            leftArm: leftArm,
            rightArm: rightArm,
            leftHand: leftHand,
            rightHand: rightHand,
            leftLeg: leftLeg,
            rightLeg: rightLeg,
            leftEye: leftEye,
            rightEye: rightEye
        };
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Handle movement
        this.handleMovement(deltaTime);
        
        // Handle camera rotation
        this.handleCameraRotation(deltaTime);
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Update mesh transform
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.rotation.copy(this.rotation);
            this.mesh.scale.copy(this.scale);
        }
        
        // Update walking animation and sound
        this.updateWalkingAnimation(deltaTime);
    }

    updateWalkingAnimation(deltaTime) {
        if (!this.bodyParts) return;
        
        const isMoving = this.velocity.length() > 0.1;
        
        if (isMoving) {
            this.walkTime += deltaTime * 4; // Walking speed
            
            // Animate legs
            const legSwing = Math.sin(this.walkTime) * 0.3;
            this.bodyParts.leftLeg.rotation.x = legSwing;
            this.bodyParts.rightLeg.rotation.x = -legSwing;
            
            // Animate arms slightly
            const armSwing = Math.sin(this.walkTime) * 0.1;
            this.bodyParts.leftArm.rotation.x = -armSwing;
            this.bodyParts.rightArm.rotation.x = armSwing;
            
            // Play footstep sounds
            if (!this.lastFootstepTime) this.lastFootstepTime = 0;
            if (this.walkTime - this.lastFootstepTime > 0.8) { // Every 0.8 seconds
                const audioManager = window.game?.gameEngine?.audioManager;
                if (audioManager) {
                    audioManager.playSound('footstep', this.position, 0.3);
                }
                this.lastFootstepTime = this.walkTime;
            }
        } else {
            // Reset to neutral pose
            if (this.bodyParts.leftLeg) this.bodyParts.leftLeg.rotation.x = 0;
            if (this.bodyParts.rightLeg) this.bodyParts.rightLeg.rotation.x = 0;
            if (this.bodyParts.leftArm) this.bodyParts.leftArm.rotation.x = 0;
            if (this.bodyParts.rightArm) this.bodyParts.rightArm.rotation.x = 0;
        }
    }

    // Movement methods
    handleMovement(deltaTime) {
        if (this.isDead) return;
        
        // Get input manager
        const inputManager = window.game?.gameEngine?.inputManager;
        if (!inputManager) return;
        
        // Get movement input
        let moveX = 0;
        let moveZ = 0;
        
        if (inputManager.isKeyPressed('KeyW')) moveZ -= 1;
        if (inputManager.isKeyPressed('KeyS')) moveZ += 1;
        if (inputManager.isKeyPressed('KeyA')) moveX -= 1;
        if (inputManager.isKeyPressed('KeyD')) moveX += 1;
        
        // Apply movement if there's input
        if (moveX !== 0 || moveZ !== 0) {
            this.move(moveX, moveZ, deltaTime);
        } else {
            // Stop movement
            this.velocity.set(0, this.velocity.y, 0);
        }
    }

    move(x, z, deltaTime) {
        if (this.isDead) return;
        
        // Create movement vector in world space
        const movement = new THREE.Vector3(x, 0, z);
        
        // Apply camera rotation to movement
        movement.applyEuler(new THREE.Euler(0, this.cameraRotation.y, 0));
        
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
        // Horizontal rotation (Y-axis)
        this.cameraRotation.y -= deltaX * this.mouseSensitivity;
        
        // Vertical rotation (X-axis) with limits
        this.cameraRotation.x -= deltaY * this.mouseSensitivity;
        this.cameraRotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.cameraRotation.x));
        
        // Update character rotation to match camera horizontal rotation
        this.rotation.y = this.cameraRotation.y;
    }

    getCameraPosition() {
        // Third-person camera position behind and above the Iron Golem
        const offset = new THREE.Vector3(0, 8, 12);
        
        // Apply camera rotation
        offset.applyEuler(new THREE.Euler(this.cameraRotation.x, this.cameraRotation.y, 0));
        
        return this.position.clone().add(offset);
    }

    getCameraTarget() {
        // Look at point in front of the Iron Golem
        const target = this.position.clone();
        target.y += 2; // Look slightly above the Iron Golem
        
        // Add forward offset based on camera rotation
        const forward = new THREE.Vector3(0, 0, -5);
        forward.applyEuler(new THREE.Euler(this.cameraRotation.x, this.cameraRotation.y, 0));
        target.add(forward);
        
        return target;
    }

    handleCameraRotation(deltaTime) {
        // Smooth camera rotation if needed
        // For now, camera rotation is handled directly in rotateCamera method
    }

    // Combat methods
    attack() {
        if (this.attackCooldown > 0) return false;
        
        console.log('Iron Golem attacks!');
        
        // Play attack animation
        this.playAttackAnimation();
        
        // Play attack sound
        const audioManager = window.game?.gameEngine?.audioManager;
        if (audioManager) {
            audioManager.playSound('attack', this.position, 0.8);
        }
        
        // Set cooldown
        this.attackCooldown = this.attackCooldownTime;
        
        // Get combat system and perform attack
        const combatSystem = window.game?.gameEngine?.combatSystem;
        if (combatSystem) {
            const targets = combatSystem.getTargetsInRange(this.position, this.attackRange);
            
            targets.forEach(target => {
                if (target !== this && target.takeDamage) {
                    const damage = this.attackDamage + (this.upgrades.damageBoost * 5);
                    target.takeDamage(damage, this);
                    console.log(`Iron Golem deals ${damage} damage to ${target.constructor.name}`);
                }
            });
        }
        
        return true;
    }

    playAttackAnimation() {
        if (!this.bodyParts) return;
        
        // Animate attack with arms
        const animateArm = (arm, direction) => {
            if (!arm) return;
            
            const originalRotation = arm.rotation.x;
            arm.rotation.x = -1.2 * direction; // Swing down
            
            // Return to original position after animation
            setTimeout(() => {
                if (arm) arm.rotation.x = originalRotation;
            }, 300);
        };
        
        // Alternate between left and right arm attacks
        if (Math.random() > 0.5) {
            animateArm(this.bodyParts.leftArm, 1);
        } else {
            animateArm(this.bodyParts.rightArm, -1);
        }
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
        this.cameraRotation = { x: 0, y: 0 };
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
                x: this.cameraRotation.x,
                y: this.cameraRotation.y
            }
        };
    }
}

// Make IronGolem globally accessible
window.IronGolem = IronGolem; 