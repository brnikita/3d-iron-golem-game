// Combat system for managing battles between entities
class CombatSystem {
    constructor() {
        this.combatEvents = [];
        console.log('CombatSystem initialized');
    }

    update(deltaTime) {
        // Process combat events
        this.processCombatEvents();
    }

    processCombatEvents() {
        // Combat is handled directly in entity classes for now
        // This system could be expanded for more complex combat mechanics
    }

    // Get all targets within range of a position
    getTargetsInRange(position, range, excludeEntity = null) {
        const targets = [];
        
        // Get game engine reference
        const gameEngine = window.game?.gameEngine;
        if (!gameEngine) return targets;
        
        // Check enemies
        if (gameEngine.enemies) {
            gameEngine.enemies.forEach(enemy => {
                if (enemy === excludeEntity || enemy.isDead) return;
                
                const distance = position.distanceTo(enemy.position);
                if (distance <= range) {
                    targets.push(enemy);
                }
            });
        }
        
        // Check Iron Golem (if attacker is not Iron Golem)
        if (gameEngine.ironGolem && gameEngine.ironGolem !== excludeEntity && !gameEngine.ironGolem.isDead) {
            const distance = position.distanceTo(gameEngine.ironGolem.position);
            if (distance <= range) {
                targets.push(gameEngine.ironGolem);
            }
        }
        
        return targets;
    }

    // Get enemies within range of a position
    getEnemiesInRange(position, range) {
        const enemies = [];
        
        const gameEngine = window.game?.gameEngine;
        if (!gameEngine || !gameEngine.enemies) return enemies;
        
        gameEngine.enemies.forEach(enemy => {
            if (enemy.isDead) return;
            
            const distance = position.distanceTo(enemy.position);
            if (distance <= range) {
                enemies.push(enemy);
            }
        });
        
        return enemies;
    }

    // Check if there are enemies within range
    hasEnemiesInRange(position, range) {
        return this.getEnemiesInRange(position, range).length > 0;
    }

    // Deal area damage
    dealAreaDamage(position, range, damage, attacker = null) {
        const targets = this.getTargetsInRange(position, range, attacker);
        
        targets.forEach(target => {
            if (target.takeDamage) {
                target.takeDamage(damage, attacker);
                this.registerCombatEvent(attacker, target, damage);
            }
        });
        
        return targets.length;
    }

    // Register a combat event
    registerCombatEvent(attacker, target, damage) {
        this.combatEvents.push({
            attacker: attacker,
            target: target,
            damage: damage,
            timestamp: Date.now()
        });
    }

    // Get recent combat events
    getRecentCombatEvents(timeWindow = 5000) {
        const now = Date.now();
        return this.combatEvents.filter(event => 
            now - event.timestamp <= timeWindow
        );
    }

    // Reset system
    reset() {
        this.combatEvents = [];
    }

    dispose() {
        this.combatEvents = [];
        console.log('CombatSystem disposed');
    }
}

window.CombatSystem = CombatSystem; 