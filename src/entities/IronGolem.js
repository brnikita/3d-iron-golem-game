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
        this.mouseSensitivity = 0.01; // Increased from 0.005 to 0.01
        
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
        body.position.y = 2.4;
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const head = new THREE.Mesh(headGeometry, ironMaterial);
        head.position.y = 4.2;
        head.castShadow = true;
        this.mesh.add(head);
        
        // Eyes (glowing red)
        const eyeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.1);
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 4.3, 0.6);
        this.mesh.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 4.3, 0.6);
        this.mesh.add(rightEye);
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.6, 2.0, 0.6);
        
        const leftArm = new THREE.Mesh(armGeometry, ironMaterial);
        leftArm.position.set(-1.4, 2.4, 0);
        leftArm.castShadow = true;
        this.mesh.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, ironMaterial);
        rightArm.position.set(1.4, 2.4, 0);
        rightArm.castShadow = true;
        this.mesh.add(rightArm);
        
        // Hands (larger fists)
        const handGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        
        const leftHand = new THREE.Mesh(handGeometry, ironMaterial);
        leftHand.position.set(-1.4, 1.2, 0);
        leftHand.castShadow = true;
        this.mesh.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, ironMaterial);
        rightHand.position.set(1.4, 1.2, 0);
        rightHand.castShadow = true;
        this.mesh.add(rightHand);
        
        // Create weapon (iron hammer)
        this.createWeapon(rightHand);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.8);
        
        const leftLeg = new THREE.Mesh(legGeometry, ironMaterial);
        leftLeg.position.set(-0.5, 0.9, 0);
        leftLeg.castShadow = true;
        this.mesh.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, ironMaterial);
        rightLeg.position.set(0.5, 0.9, 0);
        rightLeg.castShadow = true;
        this.mesh.add(rightLeg);
        
        // Feet
        const footGeometry = new THREE.BoxGeometry(1.0, 0.4, 1.4);
        
        const leftFoot = new THREE.Mesh(footGeometry, ironMaterial);
        leftFoot.position.set(-0.5, 0.2, 0.2);
        leftFoot.castShadow = true;
        this.mesh.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, ironMaterial);
        rightFoot.position.set(0.5, 0.2, 0.2);
        rightFoot.castShadow = true;
        this.mesh.add(rightFoot);
        
        // Decorative vines on body
        const vineGeometry = new THREE.BoxGeometry(0.1, 1.0, 0.1);
        for (let i = 0; i < 3; i++) {
            const vine = new THREE.Mesh(vineGeometry, vineMaterial);
            vine.position.set(
                (Math.random() - 0.5) * 1.5,
                2.4 + (Math.random() - 0.5) * 1.0,
                0.51
            );
            vine.rotation.z = (Math.random() - 0.5) * 0.5;
            this.mesh.add(vine);
        }
        
        // Nose (iron block protruding from face)
        const noseGeometry = new THREE.BoxGeometry(0.3, 0.6, 0.2);
        const nose = new THREE.Mesh(noseGeometry, ironMaterial);
        nose.position.set(0, 4.0, 0.7);
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

    createWeapon(hand) {
        // Create iron hammer weapon
        this.weapon = new THREE.Group();
        this.weapon.name = 'IronHammer';
        
        // Get iron material
        const assetLoader = window.game?.gameEngine?.assetLoader;
        const ironTexture = assetLoader?.getAsset('textures/iron');
        const ironMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x607D8B,
            map: ironTexture
        });
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown handle
        
        // Hammer handle
        const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5);
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0, -0.8, 0);
        handle.castShadow = true;
        this.weapon.add(handle);
        
        // Hammer head
        const headGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.4);
        const head = new THREE.Mesh(headGeometry, ironMaterial);
        head.position.set(0, 0.2, 0);
        head.castShadow = true;
        this.weapon.add(head);
        
        // Hammer spikes for more intimidating look
        const spikeGeometry = new THREE.ConeGeometry(0.1, 0.3, 6);
        const spike1 = new THREE.Mesh(spikeGeometry, ironMaterial);
        spike1.position.set(0.35, 0.2, 0);
        spike1.rotation.z = -Math.PI / 2;
        spike1.castShadow = true;
        this.weapon.add(spike1);
        
        const spike2 = new THREE.Mesh(spikeGeometry, ironMaterial);
        spike2.position.set(-0.35, 0.2, 0);
        spike2.rotation.z = Math.PI / 2;
        spike2.castShadow = true;
        this.weapon.add(spike2);
        
        // Position weapon in hand
        this.weapon.position.set(0, -0.5, 0);
        this.weapon.rotation.x = Math.PI / 6; // Slight angle
        
        // Attach to hand
        hand.add(this.weapon);
        
        // Store weapon parts for animation
        this.weaponParts = {
            weapon: this.weapon,
            handle: handle,
            head: head,
            spikes: [spike1, spike2]
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
        
        // Update HUD with attack cooldown
        if (window.game?.gameEngine?.hud) {
            window.game.gameEngine.hud.updateAttackCooldown(this.attackCooldown, this.attackCooldownTime);
        }
    }

    updateWalkingAnimation(deltaTime) {
        if (!this.bodyParts) return;
        
        const isMoving = this.velocity.length() > 0.1;
        
        if (isMoving) {
            this.walkTime += deltaTime * 4; // Slightly faster for more visible animation
            
            // Enhanced leg animation - more dramatic and realistic swings
            const legSwing = Math.sin(this.walkTime) * 0.6; // Increased amplitude for more visible movement
            const legLift = Math.abs(Math.sin(this.walkTime)) * 0.3; // Vertical leg lift
            
            // Left leg movement
            this.bodyParts.leftLeg.rotation.x = legSwing;
            this.bodyParts.leftLeg.position.y = 0.9 + (legSwing > 0 ? legLift : 0); // Lift when swinging forward
            
            // Right leg movement (opposite phase)
            this.bodyParts.rightLeg.rotation.x = -legSwing;
            this.bodyParts.rightLeg.position.y = 0.9 + (-legSwing > 0 ? legLift : 0); // Lift when swinging forward
            
            // Enhanced hand and arm animation - more natural walking motion
            const armSwing = Math.sin(this.walkTime + Math.PI) * 0.4; // Opposite to legs, increased amplitude
            const handRotation = Math.sin(this.walkTime + Math.PI) * 0.2; // Hand rotation for natural movement
            
            // Left arm and hand (opposite to right leg)
            this.bodyParts.leftArm.rotation.x = armSwing;
            this.bodyParts.leftArm.rotation.z = Math.sin(this.walkTime * 2) * 0.1; // Side swing
            this.bodyParts.leftHand.rotation.x = handRotation;
            this.bodyParts.leftHand.rotation.z = Math.sin(this.walkTime) * 0.15; // Hand sway
            
            // Right arm and hand (less swing due to weapon, but still natural)
            this.bodyParts.rightArm.rotation.x = -armSwing * 0.6; // Reduced due to weapon weight
            this.bodyParts.rightArm.rotation.z = Math.sin(this.walkTime * 2) * 0.05; // Subtle side swing
            this.bodyParts.rightHand.rotation.x = -handRotation * 0.7; // Weapon hand movement
            this.bodyParts.rightHand.rotation.z = Math.sin(this.walkTime) * 0.1; // Weapon sway
            
            // Enhanced body movement for more realistic walking
            if (this.bodyParts.body) {
                this.bodyParts.body.rotation.z = Math.sin(this.walkTime * 2) * 0.08; // Increased body sway
                this.bodyParts.body.position.y = 2.4 + Math.sin(this.walkTime * 2) * 0.15; // More pronounced vertical bob
                this.bodyParts.body.rotation.x = Math.sin(this.walkTime) * 0.03; // Forward/backward lean
            }
            
            // Enhanced head movement - more natural head bobbing
            if (this.bodyParts.head) {
                this.bodyParts.head.rotation.x = Math.sin(this.walkTime * 2) * 0.08; // More pronounced nod
                this.bodyParts.head.position.y = 4.2 + Math.sin(this.walkTime * 2) * 0.12; // Enhanced head bob
                this.bodyParts.head.rotation.z = Math.sin(this.walkTime * 2) * 0.04; // Side head movement
            }
            
            // Enhanced weapon sway during walking
            if (this.weapon) {
                this.weapon.rotation.z = Math.sin(this.walkTime) * 0.15; // More weapon sway
                this.weapon.rotation.x = Math.PI / 6 + Math.sin(this.walkTime * 2) * 0.05; // Weapon bob
            }
            
            // Enhanced footstep sounds with ground impact
            if (!this.lastFootstepTime) this.lastFootstepTime = 0;
            if (this.walkTime - this.lastFootstepTime > 0.8) { // Slightly faster footsteps for better rhythm
                const audioManager = window.game?.gameEngine?.audioManager;
                if (audioManager) {
                    audioManager.playSound('footstep', this.position, 0.6); // Slightly louder footsteps
                }
                this.lastFootstepTime = this.walkTime;
                
                // Add screen shake for heavy footsteps
                this.addFootstepShake();
            }
        } else {
            // Smooth return to neutral pose with better interpolation
            const returnSpeed = deltaTime * 4; // Faster return for more responsive feel
            
            // Reset legs with smooth interpolation
            if (this.bodyParts.leftLeg) {
                this.bodyParts.leftLeg.rotation.x = THREE.MathUtils.lerp(this.bodyParts.leftLeg.rotation.x, 0, returnSpeed);
                this.bodyParts.leftLeg.position.y = THREE.MathUtils.lerp(this.bodyParts.leftLeg.position.y, 0.9, returnSpeed);
            }
            if (this.bodyParts.rightLeg) {
                this.bodyParts.rightLeg.rotation.x = THREE.MathUtils.lerp(this.bodyParts.rightLeg.rotation.x, 0, returnSpeed);
                this.bodyParts.rightLeg.position.y = THREE.MathUtils.lerp(this.bodyParts.rightLeg.position.y, 0.9, returnSpeed);
            }
            
            // Reset arms with smooth interpolation
            if (this.bodyParts.leftArm) {
                this.bodyParts.leftArm.rotation.x = THREE.MathUtils.lerp(this.bodyParts.leftArm.rotation.x, 0, returnSpeed);
                this.bodyParts.leftArm.rotation.z = THREE.MathUtils.lerp(this.bodyParts.leftArm.rotation.z, 0, returnSpeed);
            }
            if (this.bodyParts.rightArm) {
                this.bodyParts.rightArm.rotation.x = THREE.MathUtils.lerp(this.bodyParts.rightArm.rotation.x, 0, returnSpeed);
                this.bodyParts.rightArm.rotation.z = THREE.MathUtils.lerp(this.bodyParts.rightArm.rotation.z, 0, returnSpeed);
            }
            
            // Reset hands with smooth interpolation
            if (this.bodyParts.leftHand) {
                this.bodyParts.leftHand.rotation.x = THREE.MathUtils.lerp(this.bodyParts.leftHand.rotation.x, 0, returnSpeed);
                this.bodyParts.leftHand.rotation.z = THREE.MathUtils.lerp(this.bodyParts.leftHand.rotation.z, 0, returnSpeed);
            }
            if (this.bodyParts.rightHand) {
                this.bodyParts.rightHand.rotation.x = THREE.MathUtils.lerp(this.bodyParts.rightHand.rotation.x, 0, returnSpeed);
                this.bodyParts.rightHand.rotation.z = THREE.MathUtils.lerp(this.bodyParts.rightHand.rotation.z, 0, returnSpeed);
            }
            
            // Reset body position and rotation with smooth interpolation
            if (this.bodyParts.body) {
                this.bodyParts.body.rotation.z = THREE.MathUtils.lerp(this.bodyParts.body.rotation.z, 0, returnSpeed);
                this.bodyParts.body.rotation.x = THREE.MathUtils.lerp(this.bodyParts.body.rotation.x, 0, returnSpeed);
                this.bodyParts.body.position.y = THREE.MathUtils.lerp(this.bodyParts.body.position.y, 2.4, returnSpeed);
            }
            
            // Reset head with smooth interpolation
            if (this.bodyParts.head) {
                this.bodyParts.head.rotation.x = THREE.MathUtils.lerp(this.bodyParts.head.rotation.x, 0, returnSpeed);
                this.bodyParts.head.rotation.z = THREE.MathUtils.lerp(this.bodyParts.head.rotation.z, 0, returnSpeed);
                this.bodyParts.head.position.y = THREE.MathUtils.lerp(this.bodyParts.head.position.y, 4.2, returnSpeed);
            }
            
            // Reset weapon with smooth interpolation
            if (this.weapon) {
                this.weapon.rotation.z = THREE.MathUtils.lerp(this.weapon.rotation.z, 0, returnSpeed);
                this.weapon.rotation.x = THREE.MathUtils.lerp(this.weapon.rotation.x, Math.PI / 6, returnSpeed);
            }
        }
    }

    addFootstepShake() {
        // Add subtle screen shake for heavy Iron Golem footsteps
        const camera = window.game?.gameEngine?.camera;
        if (!camera) return;
        
        const originalPosition = camera.position.clone();
        const shakeIntensity = 0.05; // Subtle shake
        const shakeDuration = 100; // milliseconds
        
        // Apply shake
        camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        camera.position.y += (Math.random() - 0.5) * shakeIntensity;
        camera.position.z += (Math.random() - 0.5) * shakeIntensity;
        
        // Restore original position
        setTimeout(() => {
            if (camera) {
                camera.position.copy(originalPosition);
            }
        }, shakeDuration);
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
        if (this.attackCooldown > 0) {
            console.log(`⏰ Attack on cooldown: ${this.attackCooldown.toFixed(1)}s remaining`);
            return false;
        }
        
        console.log('⚔️ IRON GOLEM ATTACKS! ⚔️');
        
        // Play attack animation
        this.playAttackAnimation();
        
        // Play attack sound
        const audioManager = window.game?.gameEngine?.audioManager;
        if (audioManager) {
            audioManager.playSound('attack', this.position, 0.8);
            console.log('🔊 Attack sound played');
        }
        
        // Set cooldown
        this.attackCooldown = this.attackCooldownTime;
        console.log(`⏰ Attack cooldown set to ${this.attackCooldownTime}s`);
        
        // Get combat system and perform attack
        const combatSystem = window.game?.gameEngine?.combatSystem;
        if (combatSystem) {
            const targets = combatSystem.getTargetsInRange(this.position, this.attackRange, this);
            console.log(`🎯 Found ${targets.length} targets in range`);
            
            targets.forEach(target => {
                if (target !== this && target.takeDamage) {
                    const damage = this.attackDamage + (this.upgrades.damageBoost * 5);
                    target.takeDamage(damage, this);
                    console.log(`💥 Iron Golem deals ${damage} damage to ${target.constructor.name}`);
                }
            });
        } else {
            console.log('❌ Combat system not found');
        }
        
        return true;
    }

    playAttackAnimation() {
        if (!this.bodyParts) return;
        
        console.log('🔨 Playing weapon attack animation!'); // Debug log
        
        // Enhanced weapon-based attack animation
        this.performWeaponAttack();
        
        // Add screen shake effect
        this.addScreenShake();
        
        // Add weapon impact effect instead of ball effect
        this.addWeaponImpactEffect();
    }

    performWeaponAttack() {
        if (!this.bodyParts.rightArm || !this.bodyParts.rightHand || !this.weapon) return;
        
        const arm = this.bodyParts.rightArm;
        const hand = this.bodyParts.rightHand;
        const body = this.bodyParts.body;
        
        // Store original positions
        const originalArmRotation = arm.rotation.clone();
        const originalHandRotation = hand.rotation.clone();
        const originalBodyRotation = body.rotation.clone();
        const originalWeaponRotation = this.weapon.rotation.clone();
        
        // Phase 1: Wind up (200ms)
        const windUpDuration = 200;
        
        // Raise weapon high
        arm.rotation.x = -2.2; // High overhead
        arm.rotation.z = 0.3; // Slight outward
        hand.rotation.x = -0.5;
        this.weapon.rotation.x = -0.5; // Weapon angle
        body.rotation.z = 0.3; // Body twist for power
        
        // Phase 2: Strike down (300ms)
        setTimeout(() => {
            // Powerful downward strike
            arm.rotation.x = 1.5; // Down swing
            arm.rotation.z = -0.2; // Inward swing
            hand.rotation.x = 0.3;
            this.weapon.rotation.x = 0.8; // Weapon follows through
            body.rotation.z = -0.2; // Body follows through
            
            // Add weapon trail effect
            this.createWeaponTrail();
            
        }, windUpDuration);
        
        // Phase 3: Impact and follow through (200ms)
        setTimeout(() => {
            // Maximum impact position
            arm.rotation.x = 2.0;
            arm.rotation.z = -0.4;
            hand.rotation.x = 0.5;
            this.weapon.rotation.x = 1.2;
            body.rotation.z = -0.4;
            
            // Create ground impact effect
            this.createGroundImpact();
            
        }, windUpDuration + 150);
        
        // Phase 4: Recovery (400ms)
        setTimeout(() => {
            // Smooth return to original position
            const recoveryDuration = 400;
            const startTime = Date.now();
            
            const recover = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / recoveryDuration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                
                // Interpolate back to original positions
                arm.rotation.x = THREE.MathUtils.lerp(arm.rotation.x, originalArmRotation.x, easeOut);
                arm.rotation.z = THREE.MathUtils.lerp(arm.rotation.z, originalArmRotation.z, easeOut);
                hand.rotation.x = THREE.MathUtils.lerp(hand.rotation.x, originalHandRotation.x, easeOut);
                this.weapon.rotation.x = THREE.MathUtils.lerp(this.weapon.rotation.x, originalWeaponRotation.x, easeOut);
                body.rotation.z = THREE.MathUtils.lerp(body.rotation.z, originalBodyRotation.z, easeOut);
                
                if (progress < 1) {
                    requestAnimationFrame(recover);
                }
            };
            
            recover();
            
        }, windUpDuration + 350);
        
        console.log('🔨 Weapon attack sequence initiated!');
    }

    createWeaponTrail() {
        // Create a visual trail effect for the weapon swing
        const scene = window.game?.gameEngine?.scene;
        if (!scene || !this.weapon) return;
        
        // Create multiple trail segments
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const trailGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.1);
                const trailMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0xFFFFFF,
                    transparent: true,
                    opacity: 0.6 - (i * 0.1)
                });
                const trail = new THREE.Mesh(trailGeometry, trailMaterial);
                
                // Position trail at weapon location
                const weaponWorldPos = new THREE.Vector3();
                this.weapon.getWorldPosition(weaponWorldPos);
                trail.position.copy(weaponWorldPos);
                trail.rotation.copy(this.weapon.rotation);
                
                scene.add(trail);
                
                // Fade out and remove trail
                let opacity = 0.6 - (i * 0.1);
                const fadeTrail = () => {
                    opacity -= 0.05;
                    trail.material.opacity = opacity;
                    
                    if (opacity > 0) {
                        requestAnimationFrame(fadeTrail);
                    } else {
                        scene.remove(trail);
                        trail.geometry.dispose();
                        trail.material.dispose();
                    }
                };
                
                fadeTrail();
                
            }, i * 20); // Stagger trail segments
        }
    }

    createGroundImpact() {
        // Create ground impact effect at weapon strike location
        const scene = window.game?.gameEngine?.scene;
        if (!scene) return;
        
        // Calculate impact position in front of Iron Golem
        const impactDirection = new THREE.Vector3(0, 0, -3);
        impactDirection.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
        const impactPosition = this.position.clone().add(impactDirection);
        impactPosition.y = 0.1; // Just above ground
        
        // Create impact crater effect
        const craterGeometry = new THREE.RingGeometry(0.5, 2.0, 8);
        const craterMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x8B4513,
            transparent: true,
            opacity: 0.8
        });
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.copy(impactPosition);
        crater.rotation.x = -Math.PI / 2; // Lay flat on ground
        
        scene.add(crater);
        
        // Create dust particles
        for (let i = 0; i < 10; i++) {
            const dustGeometry = new THREE.SphereGeometry(0.1, 4, 4);
            const dustMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xD2B48C,
                transparent: true,
                opacity: 0.6
            });
            const dust = new THREE.Mesh(dustGeometry, dustMaterial);
            
            dust.position.copy(impactPosition);
            dust.position.x += (Math.random() - 0.5) * 3;
            dust.position.z += (Math.random() - 0.5) * 3;
            dust.position.y += Math.random() * 1;
            
            scene.add(dust);
            
            // Animate dust particles
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 2
            );
            
            const animateDust = () => {
                dust.position.add(velocity.clone().multiplyScalar(0.02));
                velocity.y -= 0.05; // Gravity
                dust.material.opacity -= 0.02;
                
                if (dust.material.opacity > 0 && dust.position.y > 0) {
                    requestAnimationFrame(animateDust);
                } else {
                    scene.remove(dust);
                    dust.geometry.dispose();
                    dust.material.dispose();
                }
            };
            
            animateDust();
        }
        
        // Remove crater after a while
        setTimeout(() => {
            scene.remove(crater);
            crater.geometry.dispose();
            crater.material.dispose();
        }, 3000);
        
        console.log('💥 Ground impact effect created!');
    }

    addScreenShake() {
        // Simple screen shake by slightly moving the camera
        const camera = window.game?.gameEngine?.camera;
        if (!camera) return;
        
        const originalPosition = camera.position.clone();
        const shakeIntensity = 0.1;
        const shakeDuration = 200; // milliseconds
        
        // Apply shake
        camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        camera.position.y += (Math.random() - 0.5) * shakeIntensity;
        camera.position.z += (Math.random() - 0.5) * shakeIntensity;
        
        // Restore original position
        setTimeout(() => {
            if (camera) {
                camera.position.copy(originalPosition);
            }
        }, shakeDuration);
        
        console.log('📳 Screen shake effect applied!');
    }

    addWeaponImpactEffect() {
        // Create weapon-specific impact effect
        const scene = window.game?.gameEngine?.scene;
        if (!scene) return;
        
        // Create sparks effect at weapon location
        const weaponWorldPos = new THREE.Vector3();
        if (this.weapon) {
            this.weapon.getWorldPosition(weaponWorldPos);
        } else {
            // Fallback to hand position
            weaponWorldPos.copy(this.position);
            weaponWorldPos.y += 2;
        }
        
        // Create multiple spark particles
        for (let i = 0; i < 15; i++) {
            const sparkGeometry = new THREE.SphereGeometry(0.05, 4, 4);
            const sparkMaterial = new THREE.MeshBasicMaterial({ 
                color: new THREE.Color().setHSL(0.1, 1, 0.5 + Math.random() * 0.5), // Orange/yellow sparks
                transparent: true,
                opacity: 1.0
            });
            const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
            
            spark.position.copy(weaponWorldPos);
            
            // Random spark direction
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                Math.random() * 2 + 1,
                (Math.random() - 0.5) * 4
            );
            
            scene.add(spark);
            
            // Animate spark
            const animateSpark = () => {
                spark.position.add(velocity.clone().multiplyScalar(0.03));
                velocity.y -= 0.08; // Gravity
                velocity.multiplyScalar(0.98); // Air resistance
                spark.material.opacity -= 0.03;
                
                // Scale down over time
                const scale = spark.material.opacity;
                spark.scale.setScalar(scale);
                
                if (spark.material.opacity > 0 && spark.position.y > 0) {
                    requestAnimationFrame(animateSpark);
                } else {
                    scene.remove(spark);
                    spark.geometry.dispose();
                    spark.material.dispose();
                }
            };
            
            animateSpark();
        }
        
        // Create energy wave effect
        const waveGeometry = new THREE.RingGeometry(0.5, 1.5, 16);
        const waveMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFAA00,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const wave = new THREE.Mesh(waveGeometry, waveMaterial);
        
        wave.position.copy(weaponWorldPos);
        wave.position.y -= 1; // Lower to ground level
        wave.rotation.x = -Math.PI / 2; // Lay flat
        
        scene.add(wave);
        
        // Animate energy wave
        let waveScale = 0.1;
        let waveOpacity = 0.7;
        const animateWave = () => {
            waveScale += 0.2;
            waveOpacity -= 0.05;
            
            wave.scale.setScalar(waveScale);
            wave.material.opacity = waveOpacity;
            
            if (waveOpacity > 0) {
                requestAnimationFrame(animateWave);
            } else {
                scene.remove(wave);
                wave.geometry.dispose();
                wave.material.dispose();
            }
        };
        
        animateWave();
        
        console.log('💥 Weapon impact effect created!');
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