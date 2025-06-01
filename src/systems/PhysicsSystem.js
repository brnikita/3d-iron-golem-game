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
        
        // Use 2D distance for horizontal collision (ignore Y axis)
        const dx = entity.position.x - collider.position.x;
        const dz = entity.position.z - collider.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        const minDistance = entity.collisionRadius + collider.userData.collisionRadius;
        
        return distance < minDistance;
    }

    resolveEntityWorldCollision(entity, collider) {
        // Push entity away from collider
        const dx = entity.position.x - collider.position.x;
        const dz = entity.position.z - collider.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        // Avoid division by zero
        if (distance < 0.001) {
            // If entities are at same position, push in random direction
            const angle = Math.random() * Math.PI * 2;
            const direction = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
            entity.position.add(direction.multiplyScalar(entity.collisionRadius + 0.5));
            return;
        }
        
        const direction = new THREE.Vector3(dx / distance, 0, dz / distance);
        
        const overlap = (entity.collisionRadius + collider.userData.collisionRadius) - distance;
        
        if (overlap > 0) {
            entity.position.add(direction.multiplyScalar(overlap + 0.1));
            
            // Stop velocity in collision direction
            if (entity.velocity) {
                const velocityDot = entity.velocity.dot(direction);
                if (velocityDot < 0) {
                    entity.velocity.sub(direction.multiplyScalar(velocityDot));
                }
            }
            
            // Debug logging for collision
            if (collider.userData.type) {
                // Only log occasionally to avoid spam
                if (!this.lastCollisionLog) this.lastCollisionLog = 0;
                if (Date.now() - this.lastCollisionLog > 1000) { // Log once per second max
                    console.log(`Entity collided with ${collider.userData.type}, pushed by ${overlap.toFixed(2)} units`);
                    this.lastCollisionLog = Date.now();
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

    // Debug visualization for collision boundaries
    enableDebugVisualization(scene) {
        if (this.debugVisualization) return; // Already enabled
        
        this.debugVisualization = true;
        this.debugMeshes = new Set();
        
        // Create debug meshes for all world colliders
        this.worldColliders.forEach(collider => {
            if (collider.userData && collider.userData.collisionRadius) {
                this.createDebugMesh(collider, scene);
            }
        });
        
        console.log(`Debug visualization enabled for ${this.debugMeshes.size} colliders`);
    }
    
    createDebugMesh(collider, scene) {
        const radius = collider.userData.collisionRadius;
        const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 16);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xFF0000, 
            transparent: true, 
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const debugMesh = new THREE.Mesh(geometry, material);
        debugMesh.position.copy(collider.position);
        debugMesh.position.y = 0.1; // Slightly above ground
        debugMesh.rotation.x = -Math.PI / 2; // Lay flat
        
        scene.add(debugMesh);
        this.debugMeshes.add(debugMesh);
    }
    
    disableDebugVisualization(scene) {
        if (!this.debugVisualization) return;
        
        this.debugMeshes.forEach(mesh => {
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        
        this.debugMeshes.clear();
        this.debugVisualization = false;
        console.log('Debug visualization disabled');
    }
}

// Make PhysicsSystem globally accessible
window.PhysicsSystem = PhysicsSystem; 