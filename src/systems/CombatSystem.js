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

    // Register a combat event
    registerCombatEvent(attacker, target, damage) {
        this.combatEvents.push({
            attacker: attacker,
            target: target,
            damage: damage,
            timestamp: Date.now()
        });
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