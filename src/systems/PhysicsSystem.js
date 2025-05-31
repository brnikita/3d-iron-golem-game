// Basic physics system for collision detection and response
class PhysicsSystem {
    constructor() {
        this.entities = new Set();
        this.staticObjects = new Set();
        this.gravity = -9.81;
        
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

    // Update physics simulation
    update(deltaTime) {
        // Update entity physics
        this.entities.forEach(entity => {
            this.updateEntityPhysics(entity, deltaTime);
        });
        
        // Check collisions
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

    // Cleanup
    dispose() {
        this.entities.clear();
        this.staticObjects.clear();
        console.log('PhysicsSystem disposed');
    }
}

// Make PhysicsSystem globally accessible
window.PhysicsSystem = PhysicsSystem; 