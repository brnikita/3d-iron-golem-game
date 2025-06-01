// Basic resource item class
class Resource extends Entity {
    constructor(position = new THREE.Vector3(), type = 'ironIngots') {
        super(position);
        
        this.resourceType = type;
        this.amount = 1;
        this.collisionRadius = 0.5;
        this.collisionHeight = 1.0;
        this.isResource = true;
        
        // Animation properties
        this.floatSpeed = 2.0;
        this.floatHeight = 0.3;
        this.rotationSpeed = 1.0;
        this.baseY = position.y;
        
        // Lifetime
        this.maxLifetime = 30000; // 30 seconds
        this.currentLifetime = 0;
        this.isExpired = false;
        this.markForRemoval = false;
        
        console.log(`Resource ${type} created`);
    }

    createMesh() {
        // Create different meshes based on resource type
        switch (this.resourceType) {
            case 'ironIngots':
                this.createIronIngotMesh();
                break;
            case 'bones':
                this.createBoneMesh();
                break;
            case 'emeralds':
                this.createEmeraldMesh();
                break;
            default:
                this.createDefaultMesh();
        }
        
        // Set initial transform
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        this.mesh.scale.copy(this.scale);
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = false; // Resources don't need to receive shadows
        
        // Store reference
        this.mesh.userData.entity = this;
        this.mesh.userData.type = 'resource';
        this.mesh.userData.resourceType = this.resourceType;
    }

    createIronIngotMesh() {
        // Iron ingot - rectangular metallic block
        this.geometry = new THREE.BoxGeometry(0.8, 0.3, 0.4);
        this.material = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF // Белый цвет как у голема
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    createBoneMesh() {
        // Bone - elongated white cylinder
        this.geometry = new THREE.CylinderGeometry(0.1, 0.1, 1.0);
        this.material = new THREE.MeshLambertMaterial({ 
            color: 0xF5F5DC // Bone white
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.z = Math.PI / 4; // Tilt the bone
    }

    createEmeraldMesh() {
        // Emerald - green octahedron (diamond shape)
        this.geometry = new THREE.OctahedronGeometry(0.4);
        this.material = new THREE.MeshLambertMaterial({ 
            color: 0x50C878,
            transparent: true,
            opacity: 0.8
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    createDefaultMesh() {
        // Default - simple cube
        this.geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        this.material = new THREE.MeshLambertMaterial({ color: 0x888888 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.markForRemoval || this.isExpired) return;
        
        // Update lifetime
        this.updateLifetime(deltaTime);
        
        // Floating animation
        this.updateFloatingAnimation(deltaTime);
        
        // Rotation animation
        this.updateRotationAnimation(deltaTime);
        
        // Check for collection by player
        this.checkForCollection();
        
        // Update visual effects based on lifetime
        this.updateVisualEffects();
    }

    updateLifetime(deltaTime) {
        this.currentLifetime += deltaTime * 1000; // Convert to milliseconds
        
        if (this.currentLifetime >= this.maxLifetime) {
            this.isExpired = true;
            console.log(`Resource ${this.resourceType} expired`);
        }
    }

    updateFloatingAnimation(deltaTime) {
        // Simple sine wave floating animation
        const time = Date.now() * 0.001; // Convert to seconds
        const floatOffset = Math.sin(time * this.floatSpeed) * this.floatHeight;
        this.position.y = this.baseY + floatOffset;
    }

    updateRotationAnimation(deltaTime) {
        // Continuous rotation around Y axis
        this.rotation.y += this.rotationSpeed * deltaTime;
    }

    checkForCollection() {
        if (!window.game?.gameEngine?.ironGolem) return;
        
        const player = window.game.gameEngine.ironGolem;
        const distance = this.position.distanceTo(player.position);
        
        // Collection range
        if (distance < 2.0) {
            this.collect(player);
        }
    }

    updateVisualEffects() {
        if (!this.mesh || !this.material) return;
        
        // Fade out as resource approaches expiration
        const lifetimeRatio = this.currentLifetime / this.maxLifetime;
        
        if (lifetimeRatio > 0.8) {
            // Start fading when 80% of lifetime is reached
            const fadeRatio = (lifetimeRatio - 0.8) / 0.2;
            this.material.transparent = true;
            this.material.opacity = 1.0 - fadeRatio;
        }
        
        // Blinking effect when about to expire
        if (lifetimeRatio > 0.9) {
            const blinkSpeed = 10;
            const blinkValue = Math.sin(Date.now() * 0.01 * blinkSpeed);
            this.material.opacity = 0.3 + (blinkValue + 1) * 0.35; // Range: 0.3 to 1.0
        }
    }

    collect(player) {
        // Add resource to player
        const success = player.addResource(this.resourceType, this.amount);
        
        if (success) {
            this.markForRemoval = true;
            console.log(`Collected ${this.amount} ${this.resourceType}`);
            
            // Play collection sound
            if (window.game?.gameEngine?.audioManager) {
                window.game.gameEngine.audioManager.playSound('resource_collect', this.position);
            }
            
            // Create collection effect
            this.createCollectionEffect();
        }
    }

    createCollectionEffect() {
        // Simple particle effect for collection
        if (!this.mesh) return;
        
        // Create temporary sparkle effect
        const sparkleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const sparkleMaterial = new THREE.MeshBasicMaterial({ 
            color: this.getResourceColor(),
            transparent: true,
            opacity: 1.0
        });
        
        for (let i = 0; i < 5; i++) {
            const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial.clone());
            sparkle.position.copy(this.position);
            sparkle.position.x += (Math.random() - 0.5) * 2;
            sparkle.position.y += (Math.random() - 0.5) * 2;
            sparkle.position.z += (Math.random() - 0.5) * 2;
            
            if (window.game?.gameEngine?.scene) {
                window.game.gameEngine.scene.add(sparkle);
                
                // Animate sparkle
                const animateSparkle = () => {
                    sparkle.material.opacity -= 0.05;
                    sparkle.scale.multiplyScalar(1.1);
                    
                    if (sparkle.material.opacity > 0) {
                        requestAnimationFrame(animateSparkle);
                    } else {
                        window.game.gameEngine.scene.remove(sparkle);
                        sparkle.geometry.dispose();
                        sparkle.material.dispose();
                    }
                };
                animateSparkle();
            }
        }
    }

    getResourceColor() {
        switch (this.resourceType) {
            case 'ironIngots': return 0xFFFFFF;
            case 'bones': return 0xF5F5DC;
            case 'emeralds': return 0x50C878;
            default: return 0xFFFFFF;
        }
    }

    // Override dispose to clean up properly
    dispose() {
        if (this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }
        
        if (this.geometry) {
            this.geometry.dispose();
        }
        
        if (this.material) {
            this.material.dispose();
        }
        
        console.log(`Resource ${this.resourceType} disposed`);
    }

    // Debug methods
    getDebugInfo() {
        const baseInfo = super.getDebugInfo();
        return {
            ...baseInfo,
            resourceType: this.resourceType,
            amount: this.amount,
            lifetime: `${this.currentLifetime}/${this.maxLifetime}`,
            isExpired: this.isExpired,
            markForRemoval: this.markForRemoval
        };
    }
}

window.Resource = Resource;