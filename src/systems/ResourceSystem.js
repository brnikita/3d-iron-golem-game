// Resource system for managing collectible items and upgrades
class ResourceSystem {
    constructor() {
        this.droppedResources = new Set();
        this.resourceLifetime = 30000; // 30 seconds before resources expire
        console.log('ResourceSystem initialized');
    }

    update(deltaTime) {
        // Update dropped resources (collection, expiration, etc.)
        const resourcesToRemove = [];
        
        this.droppedResources.forEach(resource => {
            if (resource.update) {
                resource.update(deltaTime);
            }
            
            // Check if resource should be removed
            if (resource.markForRemoval || resource.isExpired) {
                resourcesToRemove.push(resource);
            }
        });
        
        // Remove expired or collected resources
        resourcesToRemove.forEach(resource => {
            this.removeResource(resource);
        });
    }

    // Drop resources when enemy dies
    dropResources(enemy, position) {
        const dropChance = 0.8; // 80% chance to drop resources
        
        if (Math.random() > dropChance) return;
        
        // Determine what to drop based on enemy type
        const drops = this.calculateDrops(enemy);
        
        drops.forEach((drop, index) => {
            // Create resource entity
            const resourcePosition = position.clone();
            // Spread resources around a bit
            resourcePosition.x += (Math.random() - 0.5) * 2;
            resourcePosition.z += (Math.random() - 0.5) * 2;
            resourcePosition.y = 0.5; // Slightly above ground
            
            const resource = new Resource(resourcePosition, drop.type);
            resource.amount = drop.amount;
            resource.initialize();
            
            // Add to scene
            if (window.game?.gameEngine) {
                window.game.gameEngine.scene.add(resource.mesh);
            }
            
            this.droppedResources.add(resource);
            
            console.log(`Dropped ${drop.amount} ${drop.type} at position`, resourcePosition);
        });
    }

    calculateDrops(enemy) {
        const drops = [];
        
        // Base iron ingot drop
        const ironAmount = Math.floor(Math.random() * 3) + 1;
        drops.push({ type: 'ironIngots', amount: ironAmount });
        
        // Chance for bonus drops based on enemy type
        if (enemy.mesh?.userData?.type === 'skeleton' && Math.random() < 0.3) {
            drops.push({ type: 'bones', amount: 1 });
        }
        
        // Rare emerald drop (5% chance)
        if (Math.random() < 0.05) {
            drops.push({ type: 'emeralds', amount: 1 });
        }
        
        return drops;
    }

    removeResource(resource) {
        this.droppedResources.delete(resource);
        
        // Remove from scene
        if (resource.mesh && resource.mesh.parent) {
            resource.mesh.parent.remove(resource.mesh);
        }
        
        // Dispose of resource
        if (resource.dispose) {
            resource.dispose();
        }
    }

    // Create upgrade shop interface
    createUpgradeShop() {
        const shopElement = document.createElement('div');
        shopElement.id = 'upgradeShop';
        shopElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 3px solid #fff;
            padding: 20px;
            border-radius: 10px;
            color: white;
            font-family: 'Courier New', monospace;
            display: none;
            z-index: 1000;
            max-width: 400px;
        `;
        
        shopElement.innerHTML = `
            <h3 style="text-align: center; margin-bottom: 20px;">Iron Golem Upgrades</h3>
            <div id="upgradeList">
                <div class="upgrade-item" data-upgrade="healthRepair">
                    <span>Health Repair (20 HP)</span>
                    <span style="float: right;">10 Iron</span>
                </div>
                <div class="upgrade-item" data-upgrade="damageBoost">
                    <span>Damage Boost (+5 damage)</span>
                    <span style="float: right;">15 Iron</span>
                </div>
                <div class="upgrade-item" data-upgrade="healthBoost">
                    <span>Health Boost (+25 max HP)</span>
                    <span style="float: right;">25 Iron</span>
                </div>
                <div class="upgrade-item" data-upgrade="attackSpeed">
                    <span>Attack Speed (+20% faster)</span>
                    <span style="float: right;">20 Iron</span>
                </div>
            </div>
            <button onclick="this.parentElement.style.display='none'" style="
                width: 100%;
                padding: 10px;
                margin-top: 15px;
                background: #666;
                color: white;
                border: 1px solid #fff;
                font-family: 'Courier New', monospace;
                cursor: pointer;
            ">Close</button>
        `;
        
        // Add click handlers for upgrades
        shopElement.addEventListener('click', (event) => {
            if (event.target.classList.contains('upgrade-item')) {
                const upgradeType = event.target.dataset.upgrade;
                this.purchaseUpgrade(upgradeType);
            }
        });
        
        document.body.appendChild(shopElement);
        return shopElement;
    }

    purchaseUpgrade(upgradeType) {
        const ironGolem = window.game?.gameEngine?.ironGolem;
        if (!ironGolem) return false;
        
        let success = false;
        
        switch (upgradeType) {
            case 'healthRepair':
                success = ironGolem.repairHealth();
                break;
            case 'damageBoost':
                success = ironGolem.purchaseUpgrade('damageBoost');
                break;
            case 'healthBoost':
                success = ironGolem.purchaseUpgrade('healthBoost');
                break;
            case 'attackSpeed':
                success = ironGolem.purchaseUpgrade('attackSpeed');
                break;
        }
        
        if (success) {
            console.log(`Purchased upgrade: ${upgradeType}`);
        } else {
            console.log(`Failed to purchase upgrade: ${upgradeType}`);
        }
        
        return success;
    }

    reset() {
        // Remove all dropped resources
        this.droppedResources.forEach(resource => {
            this.removeResource(resource);
        });
        this.droppedResources.clear();
        console.log('ResourceSystem reset');
    }

    dispose() {
        this.reset();
        
        // Remove upgrade shop if it exists
        const shop = document.getElementById('upgradeShop');
        if (shop && shop.parentNode) {
            shop.parentNode.removeChild(shop);
        }
        
        console.log('ResourceSystem disposed');
    }
}

window.ResourceSystem = ResourceSystem; 