# Game Systems Module

This module contains the core gameplay systems that manage combat mechanics, wave-based survival, physics simulation, and resource management.

## 📁 Files Overview

### CombatSystem.js
**Purpose**: Manages all combat interactions between entities
**Responsibilities**:
- Process attack commands and damage calculations
- Handle collision detection for melee and ranged attacks
- Manage attack cooldowns and timing
- Apply damage effects and knockback
- Coordinate with animation and audio systems

**Key Classes**:
- `CombatSystem`: Main combat coordinator
- `Attack`: Individual attack instance with damage and effects
- `DamageCalculator`: Damage computation with modifiers
- `CombatEffects`: Visual and audio feedback for combat

### WaveSystem.js
**Purpose**: Controls the wave-based survival gameplay progression
**Responsibilities**:
- Spawn enemy waves at timed intervals
- Scale difficulty and enemy count per wave
- Manage wave transitions and intermissions
- Track wave completion and player progress
- Handle special wave events and boss encounters

**Key Classes**:
- `WaveSystem`: Main wave management system
- `Wave`: Individual wave configuration and state
- `SpawnManager`: Enemy spawning and placement
- `DifficultyScaler`: Progressive difficulty adjustment

### ResourceSystem.js
**Purpose**: Handles resource collection, inventory, and upgrade mechanics
**Responsibilities**:
- Manage player inventory and resource storage
- Process resource collection from defeated enemies
- Handle upgrade purchases and stat modifications
- Track resource statistics and achievements
- Provide upgrade UI integration

**Key Classes**:
- `ResourceSystem`: Main resource coordinator
- `Inventory`: Player resource storage
- `UpgradeManager`: Stat improvements and purchases
- `ResourceDropper`: Enemy death resource generation

### PhysicsSystem.js
**Purpose**: Simplified physics simulation for game entities
**Responsibilities**:
- Collision detection between entities and environment
- Movement physics and boundary constraints
- Projectile physics for ranged attacks
- Trigger zone detection for interactions
- Performance-optimized spatial partitioning

**Key Classes**:
- `PhysicsSystem`: Main physics coordinator
- `Collider`: Individual collision shapes and detection
- `RigidBody`: Physics properties for entities
- `SpatialGrid`: Optimized collision detection grid

## ⚔️ Combat System Details

### Attack Processing Pipeline
```javascript
class CombatSystem {
    processAttack(attacker, attackType, direction) {
        // 1. Validate attack conditions
        if (!this.canAttack(attacker, attackType)) {
            return false;
        }
        
        // 2. Create attack instance
        const attack = new Attack({
            attacker: attacker,
            type: attackType,
            damage: this.calculateDamage(attacker, attackType),
            range: attacker.getAttackRange(attackType),
            direction: direction,
            timestamp: Date.now()
        });
        
        // 3. Find targets in range
        const targets = this.findTargetsInRange(attack);
        
        // 4. Apply damage to each target
        targets.forEach(target => {
            this.applyDamage(target, attack);
        });
        
        // 5. Trigger effects and feedback
        this.triggerCombatEffects(attack, targets);
        
        // 6. Set cooldown
        attacker.setAttackCooldown(attackType);
        
        return true;
    }
}
```

### Damage Calculation System
```javascript
const DAMAGE_MODIFIERS = {
    IRON_GOLEM: {
        base: 25,
        upgrades: {
            damage_boost_1: 5,
            damage_boost_2: 10,
            damage_boost_3: 15
        },
        criticalChance: 0.1,
        criticalMultiplier: 1.5
    },
    ZOMBIE: {
        base: 10,
        armor_penetration: 0.2
    },
    SKELETON: {
        base: 8,
        range_bonus: 1.2,
        accuracy: 0.85
    },
    CREEPER: {
        base: 30,
        explosion_radius: 3.0,
        self_damage: true
    }
};
```

## 🌊 Wave System Mechanics

### Wave Configuration
```javascript
const WAVE_SETTINGS = {
    baseInterval: 30000, // 30 seconds between waves
    difficultyScaling: 1.2, // 20% increase per wave
    maxEnemiesPerWave: 50,
    spawnRadius: 40, // units from village center
    
    waveTypes: {
        NORMAL: {
            probability: 0.7,
            enemyTypes: ['zombie', 'skeleton'],
            specialEvents: false
        },
        HORDE: {
            probability: 0.2,
            enemyTypes: ['zombie'],
            enemyMultiplier: 2.0,
            specialEvents: false
        },
        MIXED: {
            probability: 0.08,
            enemyTypes: ['zombie', 'skeleton', 'creeper'],
            bossChance: 0.1,
            specialEvents: true
        },
        BOSS: {
            probability: 0.02,
            enemyTypes: ['boss_zombie'],
            enemyMultiplier: 0.3,
            specialEvents: true
        }
    }
};
```

### Difficulty Progression
```javascript
class DifficultyScaler {
    calculateWaveStats(waveNumber) {
        const baseEnemies = 5;
        const scalingFactor = Math.pow(WAVE_SETTINGS.difficultyScaling, waveNumber - 1);
        
        return {
            enemyCount: Math.min(
                Math.floor(baseEnemies * scalingFactor),
                WAVE_SETTINGS.maxEnemiesPerWave
            ),
            enemyHealth: 1.0 + (waveNumber - 1) * 0.1,
            enemyDamage: 1.0 + (waveNumber - 1) * 0.05,
            spawnRate: Math.max(1000, 3000 - (waveNumber * 100)) // faster spawning
        };
    }
    
    getEnemyComposition(waveNumber, waveType) {
        const composition = {};
        
        switch (waveType) {
            case 'NORMAL':
                composition.zombie = 0.7;
                composition.skeleton = 0.3;
                break;
            case 'HORDE':
                composition.zombie = 1.0;
                break;
            case 'MIXED':
                composition.zombie = 0.5;
                composition.skeleton = 0.3;
                composition.creeper = 0.2;
                break;
        }
        
        return composition;
    }
}
```

## 💎 Resource System Implementation

### Resource Types and Values
```javascript
const RESOURCE_DEFINITIONS = {
    IRON_INGOT: {
        id: 'iron_ingot',
        name: 'Iron Ingot',
        stackSize: 999,
        value: 1,
        dropSources: ['zombie', 'skeleton', 'creeper'],
        uses: ['health_repair', 'damage_upgrade']
    },
    BONE: {
        id: 'bone',
        name: 'Bone',
        stackSize: 999,
        value: 1,
        dropSources: ['skeleton'],
        uses: ['special_abilities']
    },
    EMERALD: {
        id: 'emerald',
        name: 'Emerald',
        stackSize: 99,
        value: 10,
        dropSources: ['boss_enemies'],
        uses: ['rare_upgrades']
    }
};
```

### Upgrade System
```javascript
class UpgradeManager {
    constructor() {
        this.upgrades = {
            health_repair: {
                cost: 10,
                effect: (player) => player.heal(20),
                description: 'Restore 20 HP'
            },
            damage_boost: {
                levels: 3,
                costs: [15, 25, 40],
                effects: [5, 10, 15],
                description: 'Increase attack damage'
            },
            attack_speed: {
                levels: 2,
                costs: [20, 35],
                effects: [0.8, 0.6], // cooldown multipliers
                description: 'Reduce attack cooldown'
            },
            health_boost: {
                levels: 3,
                costs: [25, 40, 60],
                effects: [25, 50, 100],
                description: 'Increase maximum health'
            }
        };
    }
    
    purchaseUpgrade(upgradeId, player, inventory) {
        const upgrade = this.upgrades[upgradeId];
        if (!upgrade) return false;
        
        const cost = this.getUpgradeCost(upgradeId, player);
        if (!inventory.hasResources('iron_ingot', cost)) {
            return false;
        }
        
        inventory.removeResources('iron_ingot', cost);
        this.applyUpgrade(upgradeId, player);
        
        return true;
    }
}
```

## 🎯 Physics System Architecture

### Collision Detection
```javascript
class PhysicsSystem {
    constructor() {
        this.spatialGrid = new SpatialGrid(10); // 10 unit grid cells
        this.colliders = new Set();
        this.rigidBodies = new Set();
    }
    
    update(deltaTime) {
        // Update spatial grid
        this.spatialGrid.clear();
        this.colliders.forEach(collider => {
            this.spatialGrid.insert(collider);
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Update physics bodies
        this.rigidBodies.forEach(body => {
            this.updateRigidBody(body, deltaTime);
        });
    }
    
    checkCollisions() {
        const pairs = this.spatialGrid.getPotentialCollisionPairs();
        
        pairs.forEach(([a, b]) => {
            if (this.testCollision(a, b)) {
                this.resolveCollision(a, b);
            }
        });
    }
}
```

### Spatial Partitioning
```javascript
class SpatialGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }
    
    insert(collider) {
        const bounds = collider.getBounds();
        const cells = this.getCellsInBounds(bounds);
        
        cells.forEach(cellKey => {
            if (!this.grid.has(cellKey)) {
                this.grid.set(cellKey, new Set());
            }
            this.grid.get(cellKey).add(collider);
        });
    }
    
    getPotentialCollisionPairs() {
        const pairs = new Set();
        
        this.grid.forEach(cellColliders => {
            const colliderArray = Array.from(cellColliders);
            
            for (let i = 0; i < colliderArray.length; i++) {
                for (let j = i + 1; j < colliderArray.length; j++) {
                    const pairKey = `${colliderArray[i].id}-${colliderArray[j].id}`;
                    pairs.add([colliderArray[i], colliderArray[j]]);
                }
            }
        });
        
        return Array.from(pairs);
    }
}
```

## 🔄 System Integration and Communication

### Event System
```javascript
class SystemEventBus {
    constructor() {
        this.listeners = new Map();
    }
    
    subscribe(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType).add(callback);
    }
    
    emit(eventType, data) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).forEach(callback => {
                callback(data);
            });
        }
    }
}

// Usage examples
eventBus.subscribe('enemy_defeated', (data) => {
    resourceSystem.dropResources(data.enemy, data.position);
    waveSystem.onEnemyDefeated(data.enemy);
});

eventBus.subscribe('wave_completed', (data) => {
    resourceSystem.grantWaveBonus(data.waveNumber);
    audioManager.playWaveCompleteSound();
});
```

### System Update Order
```javascript
class SystemManager {
    constructor() {
        this.systems = [
            'inputSystem',
            'physicsSystem',
            'combatSystem',
            'waveSystem',
            'resourceSystem',
            'audioSystem'
        ];
    }
    
    update(deltaTime) {
        // Update systems in specific order to maintain consistency
        this.systems.forEach(systemName => {
            const system = this[systemName];
            if (system && system.update) {
                system.update(deltaTime);
            }
        });
    }
}
```

## 📊 Performance Monitoring

### System Performance Metrics
```javascript
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            combatSystem: { updateTime: 0, callCount: 0 },
            physicsSystem: { updateTime: 0, callCount: 0 },
            waveSystem: { updateTime: 0, callCount: 0 },
            resourceSystem: { updateTime: 0, callCount: 0 }
        };
    }
    
    measureSystem(systemName, updateFunction) {
        const startTime = performance.now();
        updateFunction();
        const endTime = performance.now();
        
        const metric = this.metrics[systemName];
        metric.updateTime += endTime - startTime;
        metric.callCount++;
    }
    
    getAverageUpdateTime(systemName) {
        const metric = this.metrics[systemName];
        return metric.callCount > 0 ? metric.updateTime / metric.callCount : 0;
    }
}
```

## 🧪 Testing and Validation

### Combat System Testing
- **Damage Calculation**: Verify correct damage values with modifiers
- **Attack Timing**: Validate cooldown periods and attack windows
- **Range Detection**: Test attack range accuracy and collision detection
- **Effect Application**: Confirm visual and audio feedback triggers

### Wave System Testing
- **Spawn Timing**: Verify wave intervals and enemy spawn rates
- **Difficulty Scaling**: Test progressive difficulty increases
- **Enemy Composition**: Validate correct enemy type distributions
- **Performance**: Monitor frame rate with maximum enemy counts

### Resource System Testing
- **Drop Rates**: Verify resource drop probabilities
- **Inventory Management**: Test resource storage and stacking
- **Upgrade Mechanics**: Validate upgrade costs and effects
- **Persistence**: Test save/load functionality

### Physics System Testing
- **Collision Accuracy**: Verify collision detection precision
- **Performance**: Monitor collision check performance with many entities
- **Spatial Partitioning**: Test grid efficiency and accuracy
- **Edge Cases**: Validate boundary conditions and corner cases

---

**Note**: All systems are designed with performance in mind, using object pooling, spatial partitioning, and efficient algorithms to maintain smooth gameplay even with large numbers of entities. 