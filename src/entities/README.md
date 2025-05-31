# Game Entities Module

This module contains all interactive game objects including the player-controlled Iron Golem, hostile enemies, and collectible resources.

## 📁 Files Overview

### Entity.js
**Purpose**: Base class for all game entities with common functionality
**Responsibilities**:
- Position, rotation, and scale management
- Health and damage systems
- Collision detection and physics integration
- Animation state management
- Lifecycle management (spawn, update, destroy)

**Key Classes**:
- `Entity`: Abstract base class for all game objects
- `Transform`: Position, rotation, scale container
- `Health`: Health and damage management component
- `Collider`: Collision detection component

### IronGolem.js
**Purpose**: Player-controlled Iron Golem character implementation
**Responsibilities**:
- Slow, deliberate movement mechanics (3-5 units/second)
- Combat system with 2-second attack cooldown
- Health management (100 HP starting, no regeneration)
- Resource collection and inventory management
- Animation states (idle, walking, attacking, taking damage)

**Key Classes**:
- `IronGolem`: Main player character class
- `IronGolemController`: Input-driven movement and actions
- `IronGolemAnimator`: Animation state machine
- `IronGolemInventory`: Resource storage and management

### Enemy.js
**Purpose**: Base class for all hostile mobs with AI behaviors
**Responsibilities**:
- AI pathfinding and movement toward player/village
- Attack patterns and damage dealing
- Health management and death handling
- Resource dropping on defeat
- Different enemy types (zombies, skeletons, creepers)

**Key Classes**:
- `Enemy`: Base enemy class with common AI
- `Zombie`: Slow melee attacker
- `Skeleton`: Ranged bow attacker
- `Creeper`: Explosive suicide attacker
- `EnemyAI`: Pathfinding and behavior system

### Resource.js
**Purpose**: Collectible items dropped by defeated enemies
**Responsibilities**:
- Visual representation and pickup detection
- Resource types (iron ingots, bones, etc.)
- Collection animations and effects
- Inventory integration
- Despawn timers for performance

**Key Classes**:
- `Resource`: Base collectible resource class
- `IronIngot`: Primary currency for upgrades
- `Bone`: Secondary crafting material
- `ResourcePickup`: Collection interaction system

## 🎮 Gameplay Mechanics

### Iron Golem Specifications
```javascript
const IRON_GOLEM_STATS = {
    health: 100,
    maxHealth: 100,
    moveSpeed: 4.0, // units per second
    attackDamage: 25,
    attackCooldown: 2000, // milliseconds
    attackRange: 3.0,
    collisionRadius: 1.5
};
```

### Enemy Types and Behaviors

#### Zombie
- **Health**: 20 HP
- **Speed**: 2 units/second
- **Damage**: 10 HP per attack
- **Behavior**: Direct melee assault on Iron Golem
- **Drops**: 1-2 iron ingots

#### Skeleton
- **Health**: 15 HP
- **Speed**: 2.5 units/second
- **Damage**: 8 HP per arrow
- **Behavior**: Ranged attacks, maintains distance
- **Drops**: 1-3 bones, occasional iron ingot

#### Creeper
- **Health**: 25 HP
- **Speed**: 3 units/second
- **Damage**: 30 HP explosion (3 unit radius)
- **Behavior**: Approaches and explodes near Iron Golem
- **Drops**: 2-4 iron ingots (if killed before explosion)

### Resource System
```javascript
const RESOURCE_TYPES = {
    IRON_INGOT: {
        value: 1,
        uses: ['health_repair', 'damage_upgrade'],
        dropChance: 0.8
    },
    BONE: {
        value: 1,
        uses: ['special_abilities'],
        dropChance: 0.6
    }
};

const UPGRADE_COSTS = {
    health_repair: 10, // iron ingots per 20 HP
    damage_upgrade: 15 // iron ingots per +5 damage
};
```

## 🔧 Technical Implementation

### Entity Component System
```javascript
class Entity {
    constructor(position = new THREE.Vector3()) {
        this.transform = new Transform(position);
        this.health = new Health();
        this.collider = new Collider();
        this.animator = new Animator();
        this.components = new Map();
    }
    
    addComponent(component) {
        this.components.set(component.constructor.name, component);
    }
    
    update(deltaTime) {
        for (const component of this.components.values()) {
            component.update(deltaTime);
        }
    }
}
```

### AI Pathfinding System
```javascript
class EnemyAI {
    constructor(enemy) {
        this.enemy = enemy;
        this.target = null;
        this.path = [];
        this.state = 'seeking';
    }
    
    update(deltaTime) {
        switch (this.state) {
            case 'seeking':
                this.findTarget();
                break;
            case 'moving':
                this.followPath(deltaTime);
                break;
            case 'attacking':
                this.performAttack();
                break;
        }
    }
    
    findTarget() {
        // Prioritize Iron Golem, then village buildings
        const ironGolem = GameEngine.instance.getIronGolem();
        const distance = this.enemy.position.distanceTo(ironGolem.position);
        
        if (distance < this.enemy.detectionRange) {
            this.target = ironGolem;
            this.calculatePath();
            this.state = 'moving';
        }
    }
}
```

### Animation State Machine
```javascript
class IronGolemAnimator {
    constructor(model) {
        this.model = model;
        this.mixer = new THREE.AnimationMixer(model);
        this.actions = new Map();
        this.currentAction = null;
        this.loadAnimations();
    }
    
    loadAnimations() {
        const animations = this.model.animations;
        animations.forEach(clip => {
            const action = this.mixer.clipAction(clip);
            this.actions.set(clip.name, action);
        });
    }
    
    playAnimation(name, loop = true) {
        if (this.currentAction) {
            this.currentAction.fadeOut(0.3);
        }
        
        const action = this.actions.get(name);
        if (action) {
            action.reset().fadeIn(0.3);
            action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
            action.play();
            this.currentAction = action;
        }
    }
}
```

## 🎯 Combat System Integration

### Attack Mechanics
```javascript
class IronGolem extends Entity {
    attack() {
        if (this.canAttack()) {
            this.animator.playAnimation('attack', false);
            this.lastAttackTime = Date.now();
            
            // Find enemies in attack range
            const enemies = this.findEnemiesInRange(this.attackRange);
            enemies.forEach(enemy => {
                enemy.takeDamage(this.attackDamage);
                AudioManager.play('iron_golem_attack', this.position);
            });
        }
    }
    
    canAttack() {
        const timeSinceLastAttack = Date.now() - this.lastAttackTime;
        return timeSinceLastAttack >= this.attackCooldown;
    }
}
```

### Damage and Health System
```javascript
class Health {
    constructor(maxHealth = 100) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.isDead = false;
    }
    
    takeDamage(amount) {
        if (this.isDead) return;
        
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        
        if (this.currentHealth <= 0) {
            this.isDead = true;
            this.onDeath();
        }
        
        this.onDamage(amount);
    }
    
    heal(amount) {
        if (this.isDead) return;
        
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.onHeal(amount);
    }
}
```

## 🎨 Visual and Audio Integration

### Model Requirements
- **Iron Golem**: ~800 triangles, blocky Minecraft-style design
- **Enemies**: ~300-500 triangles each, distinct silhouettes
- **Resources**: ~50-100 triangles, simple geometric shapes

### Animation Requirements
- **Iron Golem**: Idle, walk, attack, take_damage, death (5 animations)
- **Enemies**: Idle, walk, attack, death (4 animations each)
- **Resources**: Idle float, pickup sparkle (2 animations)

### Audio Cues
- **Iron Golem**: Heavy footsteps, metal clang attacks, damage grunts
- **Zombies**: Groaning, flesh impact sounds
- **Skeletons**: Bone rattling, bow twang, arrow impacts
- **Creepers**: Hissing, explosion sounds
- **Resources**: Pickup chimes, inventory sounds

## 🔗 System Dependencies

### Required Systems
- `PhysicsSystem`: Collision detection and response
- `CombatSystem`: Damage calculation and effects
- `AudioManager`: Spatial sound effects
- `ResourceSystem`: Inventory and upgrade management

### Data Flow
1. **Input** → `IronGolemController` → Movement/Attack commands
2. **AI** → `EnemyAI` → Enemy behavior decisions
3. **Combat** → `CombatSystem` → Damage resolution
4. **Resources** → `ResourceSystem` → Collection and upgrades

## 🧪 Testing Scenarios

### Iron Golem Testing
- Movement responsiveness and speed validation
- Attack timing and damage verification
- Health system and upgrade mechanics
- Resource collection and inventory management

### Enemy AI Testing
- Pathfinding accuracy and performance
- Attack patterns and damage dealing
- Death and resource dropping
- Wave spawning and difficulty scaling

### Performance Testing
- Entity count limits (target: 50+ enemies simultaneously)
- Animation performance with multiple entities
- Memory usage with entity pooling
- Collision detection optimization

---

**Note**: All entities use object pooling to minimize garbage collection and maintain consistent performance during intense gameplay scenarios. 