// Base entity class for all game objects
class Entity {
    constructor(position = new THREE.Vector3()) {
        // Transform properties
        this.position = position.clone();
        this.rotation = new THREE.Euler();
        this.scale = new THREE.Vector3(1, 1, 1);
        
        // Physics properties
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.mass = 1.0;
        this.friction = 0.9;
        this.isGrounded = false;
        
        // Health and combat
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        this.isDead = false;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
        
        // Collision
        this.boundingBox = new THREE.Box3();
        this.collisionRadius = 1.0;
        this.collisionHeight = 2.0;
        
        // Visual representation
        this.mesh = null;
        this.material = null;
        this.geometry = null;
        
        // Animation
        this.mixer = null;
        this.animations = new Map();
        this.currentAnimation = null;
        
        // Unique identifier
        this.id = Entity.generateId();
        
        // Lifecycle flags
        this.isActive = true;
        this.shouldDestroy = false;
        
        console.log(`Entity ${this.id} created`);
    }

    // Static ID generator
    static generateId() {
        if (!Entity.nextId) Entity.nextId = 1;
        return Entity.nextId++;
    }

    // Initialize the entity (override in subclasses)
    initialize() {
        this.createMesh();
        this.updateBoundingBox();
    }

    // Create the visual mesh (override in subclasses)
    createMesh() {
        // Default cube mesh
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshLambertMaterial({ color: 0x888888 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        this.mesh.scale.copy(this.scale);
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Store reference to this entity in the mesh
        this.mesh.userData.entity = this;
    }

    // Update method called each frame
    update(deltaTime) {
        if (!this.isActive || this.isDead) return;
        
        // Update physics
        this.updatePhysics(deltaTime);
        
        // Update animations
        this.updateAnimations(deltaTime);
        
        // Update invulnerability
        this.updateInvulnerability(deltaTime);
        
        // Update mesh transform
        this.updateMeshTransform();
        
        // Update bounding box
        this.updateBoundingBox();
    }

    updatePhysics(deltaTime) {
        // Apply acceleration to velocity
        this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
        
        // Apply friction
        this.velocity.multiplyScalar(this.friction);
        
        // Apply gravity if not grounded
        if (!this.isGrounded) {
            this.velocity.y -= 9.81 * deltaTime; // Gravity
        }
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Ground check (simple)
        if (this.position.y <= 0) {
            this.position.y = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
        
        // Reset acceleration
        this.acceleration.set(0, 0, 0);
    }

    updateAnimations(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }

    updateInvulnerability(deltaTime) {
        if (this.isInvulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.isInvulnerable = false;
                this.invulnerabilityTime = 0;
            }
        }
    }

    updateMeshTransform() {
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.rotation.copy(this.rotation);
            this.mesh.scale.copy(this.scale);
        }
    }

    updateBoundingBox() {
        if (this.mesh) {
            this.boundingBox.setFromObject(this.mesh);
        } else {
            // Fallback bounding box
            const halfSize = this.collisionRadius;
            this.boundingBox.setFromCenterAndSize(
                this.position,
                new THREE.Vector3(halfSize * 2, this.collisionHeight, halfSize * 2)
            );
        }
    }

    // Health and damage methods
    takeDamage(amount, source = null) {
        if (this.isDead || this.isInvulnerable) return false;
        
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        
        console.log(`Entity ${this.id} took ${amount} damage (${this.currentHealth}/${this.maxHealth} HP)`);
        
        // Set invulnerability period
        this.isInvulnerable = true;
        this.invulnerabilityTime = 0.5; // 0.5 seconds
        
        // Check if dead
        if (this.currentHealth <= 0) {
            this.die();
        }
        
        // Trigger damage effects
        this.onDamage(amount, source);
        
        return true;
    }

    heal(amount) {
        if (this.isDead) return false;
        
        const oldHealth = this.currentHealth;
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        const actualHealing = this.currentHealth - oldHealth;
        
        if (actualHealing > 0) {
            console.log(`Entity ${this.id} healed ${actualHealing} HP (${this.currentHealth}/${this.maxHealth} HP)`);
            this.onHeal(actualHealing);
        }
        
        return actualHealing > 0;
    }

    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        this.currentHealth = 0;
        this.velocity.set(0, 0, 0);
        
        console.log(`Entity ${this.id} died`);
        
        // Trigger death effects
        this.onDeath();
        
        // Mark for destruction
        this.shouldDestroy = true;
    }

    // Event handlers (override in subclasses)
    onDamage(amount, source) {
        // Flash red or other damage effect
        if (this.material) {
            const originalColor = this.material.color.clone();
            this.material.color.setHex(0xff0000);
            
            setTimeout(() => {
                if (this.material) {
                    this.material.color.copy(originalColor);
                }
            }, 100);
        }
    }

    onHeal(amount) {
        // Green flash or other healing effect
    }

    onDeath() {
        // Death animation or effects
        if (this.mesh) {
            // Simple death effect - fade out
            const fadeOut = () => {
                if (this.material && this.material.opacity > 0) {
                    this.material.transparent = true;
                    this.material.opacity -= 0.02;
                    requestAnimationFrame(fadeOut);
                }
            };
            fadeOut();
        }
    }

    // Movement methods
    move(direction, speed, deltaTime) {
        const movement = direction.clone().normalize().multiplyScalar(speed * deltaTime);
        this.position.add(movement);
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
    }

    setRotation(x, y, z) {
        this.rotation.set(x, y, z);
    }

    lookAt(target) {
        const direction = target.clone().sub(this.position).normalize();
        this.rotation.y = Math.atan2(direction.x, direction.z);
    }

    // Collision methods
    intersects(other) {
        return this.boundingBox.intersectsBox(other.boundingBox);
    }

    distanceTo(other) {
        return this.position.distanceTo(other.position);
    }

    isInRange(other, range) {
        return this.distanceTo(other) <= range;
    }

    // Animation methods
    playAnimation(name, loop = true) {
        if (!this.mixer || !this.animations.has(name)) return;
        
        // Stop current animation
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }
        
        // Play new animation
        const action = this.animations.get(name);
        action.reset();
        action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
        action.play();
        
        this.currentAnimation = action;
    }

    stopAnimation() {
        if (this.currentAnimation) {
            this.currentAnimation.stop();
            this.currentAnimation = null;
        }
    }

    // Utility methods
    getForwardDirection() {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyEuler(this.rotation);
        return forward;
    }

    getRightDirection() {
        const right = new THREE.Vector3(1, 0, 0);
        right.applyEuler(this.rotation);
        return right;
    }

    getUpDirection() {
        const up = new THREE.Vector3(0, 1, 0);
        up.applyEuler(this.rotation);
        return up;
    }

    // Cleanup
    dispose() {
        if (this.mesh) {
            if (this.mesh.parent) {
                this.mesh.parent.remove(this.mesh);
            }
        }
        
        if (this.geometry) {
            this.geometry.dispose();
        }
        
        if (this.material) {
            this.material.dispose();
        }
        
        if (this.mixer) {
            this.mixer.stopAllAction();
        }
        
        console.log(`Entity ${this.id} disposed`);
    }

    // Debug methods
    getDebugInfo() {
        return {
            id: this.id,
            position: this.position.clone(),
            health: `${this.currentHealth}/${this.maxHealth}`,
            isDead: this.isDead,
            isGrounded: this.isGrounded,
            velocity: this.velocity.clone()
        };
    }
}

// Make Entity globally accessible
window.Entity = Entity; 