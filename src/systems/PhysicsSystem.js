// Basic physics system for collision detection and response
class PhysicsSystem {
    constructor() {
        this.entities = new Set();
        this.staticObjects = new Set();
        this.worldColliders = new Set(); // Forest boundary and other world colliders
        this.gravity = -9.81;
        this.worldBoundaryRadius = 45; // Match forest boundary radius
        
        console.log('PhysicsSystem initialized');
    }

    // Add entity to physics simulation
    addEntity(entity) {
        this.entities.add(entity);
    }

    // Remove entity from physics simulation
    removeEntity(entity) {
        this.entities.delete(entity);
    }

    // Add static collision object
    addStaticObject(object) {
        this.staticObjects.add(object);
    }

    // Add world collider (trees, boundaries, etc.)
    addWorldCollider(collider) {
        this.worldColliders.add(collider);
    }

    // Remove world collider
    removeWorldCollider(collider) {
        this.worldColliders.delete(collider);
    }

    // Initialize world colliders from scene
    initializeWorldColliders(scene) {
        scene.traverse((object) => {
            if (object.userData && object.userData.isCollider) {
                this.addWorldCollider(object);
            }
        });
        console.log(`Initialized ${this.worldColliders.size} world colliders`);
    }

    // Update physics simulation
    update(deltaTime) {
        // Update entity physics
        this.entities.forEach(entity => {
            this.updateEntityPhysics(entity, deltaTime);
            
            // Check world boundary collisions
            this.checkWorldBoundary(entity);
            
            // Check world collider collisions
            this.checkWorldCollisions(entity);
        });
        
        // Check entity-entity collisions
        this.checkCollisions();
    }

    updateEntityPhysics(entity, deltaTime) {
        // Basic physics is handled in Entity class
        // This could be expanded for more complex physics
    }

    checkCollisions() {
        const entitiesArray = Array.from(this.entities);
        
        // Check entity-entity collisions
        for (let i = 0; i < entitiesArray.length; i++) {
            for (let j = i + 1; j < entitiesArray.length; j++) {
                const entityA = entitiesArray[i];
                const entityB = entitiesArray[j];
                
                if (this.checkCollision(entityA, entityB)) {
                    this.resolveCollision(entityA, entityB);
                }
            }
        }
    }

    checkCollision(entityA, entityB) {
        // Simple distance-based collision
        const distance = entityA.position.distanceTo(entityB.position);
        const minDistance = entityA.collisionRadius + entityB.collisionRadius;
        
        return distance < minDistance;
    }

    resolveCollision(entityA, entityB) {
        // Simple collision response - push entities apart
        const direction = entityB.position.clone().sub(entityA.position).normalize();
        const overlap = (entityA.collisionRadius + entityB.collisionRadius) - 
                       entityA.position.distanceTo(entityB.position);
        
        const pushDistance = overlap * 0.5;
        
        entityA.position.sub(direction.clone().multiplyScalar(pushDistance));
        entityB.position.add(direction.clone().multiplyScalar(pushDistance));
    }

    checkWorldBoundary(entity) {
        // Check if entity is trying to go outside the world boundary
        const distanceFromCenter = Math.sqrt(entity.position.x * entity.position.x + entity.position.z * entity.position.z);
        
        if (distanceFromCenter > this.worldBoundaryRadius) {
            // Push entity back inside boundary
            const direction = new THREE.Vector3(entity.position.x, 0, entity.position.z).normalize();
            const pushBackDistance = distanceFromCenter - this.worldBoundaryRadius;
            
            entity.position.x -= direction.x * (pushBackDistance + 1);
            entity.position.z -= direction.z * (pushBackDistance + 1);
            
            // Stop velocity in that direction
            if (entity.velocity) {
                const velocityDot = entity.velocity.dot(direction);
                if (velocityDot > 0) {
                    entity.velocity.sub(direction.multiplyScalar(velocityDot));
                }
            }
            
            console.log('Entity pushed back from world boundary');
        }
    }

    checkWorldCollisions(entity) {
        // Check collisions with world objects (trees, buildings, etc.)
        this.worldColliders.forEach(collider => {
            if (this.checkEntityWorldCollision(entity, collider)) {
                this.resolveEntityWorldCollision(entity, collider);
            }
        });
    }

    checkEntityWorldCollision(entity, collider) {
        if (!collider.userData || !collider.userData.collisionRadius) return false;
        
        const distance = entity.position.distanceTo(collider.position);
        const minDistance = entity.collisionRadius + collider.userData.collisionRadius;
        
        return distance < minDistance;
    }

    resolveEntityWorldCollision(entity, collider) {
        // Push entity away from collider
        const direction = entity.position.clone().sub(collider.position);
        direction.y = 0; // Only horizontal collision
        direction.normalize();
        
        const overlap = (entity.collisionRadius + collider.userData.collisionRadius) - 
                       entity.position.distanceTo(collider.position);
        
        if (overlap > 0) {
            entity.position.add(direction.multiplyScalar(overlap + 0.1));
            
            // Stop velocity in collision direction
            if (entity.velocity) {
                const velocityDot = entity.velocity.dot(direction);
                if (velocityDot < 0) {
                    entity.velocity.sub(direction.multiplyScalar(velocityDot));
                }
            }
        }
    }

    // Cleanup
    dispose() {
        this.entities.clear();
        this.staticObjects.clear();
        console.log('PhysicsSystem disposed');
    }
}

// Make PhysicsSystem globally accessible
window.PhysicsSystem = PhysicsSystem; 