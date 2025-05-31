# User Interface Module

This module handles all user interface elements including the heads-up display (HUD), menu systems, and interactive UI components.

## 📁 Files Overview

### HUD.js
**Purpose**: In-game heads-up display showing vital game information
**Responsibilities**:
- Display Iron Golem health bar and current HP
- Show resource inventory (iron ingots, bones, etc.)
- Display current wave number and progress
- Show upgrade availability indicators
- Provide real-time game statistics

**Key Classes**:
- `HUD`: Main HUD controller and renderer
- `HealthBar`: Animated health display component
- `ResourceDisplay`: Inventory and resource counter
- `WaveIndicator`: Wave progress and countdown display

### MenuSystem.js
**Purpose**: Game menus and navigation interface
**Responsibilities**:
- Main menu with start/continue options
- Pause menu with resume/restart/quit options
- Game over screen with statistics and restart
- Settings menu for audio and graphics options
- Upgrade shop interface for purchasing improvements

**Key Classes**:
- `MenuSystem`: Main menu coordinator
- `MainMenu`: Initial game entry screen
- `PauseMenu`: In-game pause interface
- `GameOverMenu`: End game statistics and options
- `UpgradeShop`: Resource spending interface

## 🎮 HUD Design and Layout

### HUD Component Layout
```javascript
const HUD_LAYOUT = {
    healthBar: {
        position: { x: 20, y: 20 },
        size: { width: 200, height: 20 },
        style: 'minecraft',
        colors: {
            background: '#333333',
            health: '#FF0000',
            border: '#FFFFFF'
        }
    },
    resourceDisplay: {
        position: { x: 20, y: 60 },
        size: { width: 150, height: 80 },
        layout: 'vertical',
        showIcons: true
    },
    waveIndicator: {
        position: { x: 'center', y: 20 },
        size: { width: 300, height: 40 },
        showProgress: true,
        showCountdown: true
    },
    minimap: {
        position: { x: -150, y: 20 },
        size: { width: 120, height: 120 },
        showEnemies: true,
        showBuildings: true
    }
};
```

### Health Bar Implementation
```javascript
class HealthBar {
    constructor(position, size, maxHealth) {
        this.position = position;
        this.size = size;
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.animatedHealth = maxHealth;
        this.element = this.createElement();
    }
    
    createElement() {
        const container = document.createElement('div');
        container.className = 'health-bar-container';
        container.style.cssText = `
            position: absolute;
            left: ${this.position.x}px;
            top: ${this.position.y}px;
            width: ${this.size.width}px;
            height: ${this.size.height}px;
            border: 2px solid #fff;
            background: #333;
            font-family: 'Courier New', monospace;
        `;
        
        this.healthFill = document.createElement('div');
        this.healthFill.className = 'health-fill';
        this.healthFill.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #ff0000, #ff6666);
            transition: width 0.3s ease;
        `;
        
        this.healthText = document.createElement('div');
        this.healthText.className = 'health-text';
        this.healthText.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 12px;
            font-weight: bold;
            text-shadow: 1px 1px 1px #000;
        `;
        
        container.appendChild(this.healthFill);
        container.appendChild(this.healthText);
        
        return container;
    }
    
    updateHealth(newHealth) {
        this.currentHealth = Math.max(0, Math.min(this.maxHealth, newHealth));
        const healthPercent = (this.currentHealth / this.maxHealth) * 100;
        
        this.healthFill.style.width = `${healthPercent}%`;
        this.healthText.textContent = `${this.currentHealth}/${this.maxHealth}`;
        
        // Color changes based on health percentage
        if (healthPercent > 60) {
            this.healthFill.style.background = 'linear-gradient(90deg, #00ff00, #66ff66)';
        } else if (healthPercent > 30) {
            this.healthFill.style.background = 'linear-gradient(90deg, #ffff00, #ffff66)';
        } else {
            this.healthFill.style.background = 'linear-gradient(90deg, #ff0000, #ff6666)';
        }
    }
}
```

### Resource Display System
```javascript
class ResourceDisplay {
    constructor(position, resources) {
        this.position = position;
        this.resources = resources;
        this.element = this.createElement();
        this.resourceElements = new Map();
    }
    
    createElement() {
        const container = document.createElement('div');
        container.className = 'resource-display';
        container.style.cssText = `
            position: absolute;
            left: ${this.position.x}px;
            top: ${this.position.y}px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #fff;
            padding: 10px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            color: white;
        `;
        
        return container;
    }
    
    updateResource(resourceType, amount) {
        if (!this.resourceElements.has(resourceType)) {
            this.createResourceElement(resourceType);
        }
        
        const element = this.resourceElements.get(resourceType);
        const countElement = element.querySelector('.resource-count');
        countElement.textContent = amount;
        
        // Animate count change
        countElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            countElement.style.transform = 'scale(1)';
        }, 200);
    }
    
    createResourceElement(resourceType) {
        const resourceElement = document.createElement('div');
        resourceElement.className = 'resource-item';
        resourceElement.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        `;
        
        const icon = document.createElement('div');
        icon.className = 'resource-icon';
        icon.style.cssText = `
            width: 16px;
            height: 16px;
            background: url('assets/textures/${resourceType}_icon.png');
            background-size: contain;
            margin-right: 8px;
        `;
        
        const count = document.createElement('span');
        count.className = 'resource-count';
        count.style.cssText = `
            font-size: 14px;
            font-weight: bold;
            transition: transform 0.2s ease;
        `;
        count.textContent = '0';
        
        resourceElement.appendChild(icon);
        resourceElement.appendChild(count);
        this.element.appendChild(resourceElement);
        this.resourceElements.set(resourceType, resourceElement);
    }
}
```

## 📋 Menu System Architecture

### Menu State Management
```javascript
class MenuSystem {
    constructor() {
        this.currentMenu = null;
        this.menuStack = [];
        this.menus = {
            main: new MainMenu(),
            pause: new PauseMenu(),
            gameOver: new GameOverMenu(),
            settings: new SettingsMenu(),
            upgradeShop: new UpgradeShop()
        };
        
        this.setupEventListeners();
    }
    
    showMenu(menuName, data = {}) {
        if (this.currentMenu) {
            this.currentMenu.hide();
            this.menuStack.push(this.currentMenu);
        }
        
        this.currentMenu = this.menus[menuName];
        this.currentMenu.show(data);
        
        // Pause game if showing in-game menu
        if (menuName !== 'main' && GameEngine.instance.isRunning()) {
            GameEngine.instance.pause();
        }
    }
    
    hideCurrentMenu() {
        if (this.currentMenu) {
            this.currentMenu.hide();
            
            if (this.menuStack.length > 0) {
                this.currentMenu = this.menuStack.pop();
                this.currentMenu.show();
            } else {
                this.currentMenu = null;
                GameEngine.instance.resume();
            }
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Escape') {
                if (this.currentMenu === null) {
                    this.showMenu('pause');
                } else if (this.currentMenu === this.menus.pause) {
                    this.hideCurrentMenu();
                }
            }
        });
    }
}
```

### Pause Menu Implementation
```javascript
class PauseMenu {
    constructor() {
        this.element = this.createElement();
        this.isVisible = false;
    }
    
    createElement() {
        const overlay = document.createElement('div');
        overlay.className = 'pause-menu-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const menu = document.createElement('div');
        menu.className = 'pause-menu';
        menu.style.cssText = `
            background: #2a2a2a;
            border: 3px solid #fff;
            padding: 40px;
            text-align: center;
            font-family: 'Courier New', monospace;
            color: white;
            min-width: 300px;
        `;
        
        const title = document.createElement('h2');
        title.textContent = 'Game Paused';
        title.style.marginBottom = '30px';
        
        const buttons = [
            { text: 'Resume', action: () => this.resume() },
            { text: 'Restart', action: () => this.restart() },
            { text: 'Settings', action: () => this.showSettings() },
            { text: 'Main Menu', action: () => this.mainMenu() }
        ];
        
        buttons.forEach(button => {
            const btn = this.createButton(button.text, button.action);
            menu.appendChild(btn);
        });
        
        menu.appendChild(title);
        overlay.appendChild(menu);
        
        return overlay;
    }
    
    createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            display: block;
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            background: #4a4a4a;
            color: white;
            border: 2px solid #fff;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.2s;
        `;
        
        button.addEventListener('mouseenter', () => {
            button.style.background = '#6a6a6a';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = '#4a4a4a';
        });
        
        button.addEventListener('click', onClick);
        
        return button;
    }
    
    show() {
        this.element.style.display = 'flex';
        this.isVisible = true;
    }
    
    hide() {
        this.element.style.display = 'none';
        this.isVisible = false;
    }
    
    resume() {
        MenuSystem.instance.hideCurrentMenu();
    }
    
    restart() {
        GameEngine.instance.restart();
        MenuSystem.instance.hideCurrentMenu();
    }
    
    showSettings() {
        MenuSystem.instance.showMenu('settings');
    }
    
    mainMenu() {
        GameEngine.instance.stop();
        MenuSystem.instance.showMenu('main');
    }
}
```

## 🛒 Upgrade Shop Interface

### Shop Layout and Functionality
```javascript
class UpgradeShop {
    constructor() {
        this.element = this.createElement();
        this.upgrades = this.loadUpgradeDefinitions();
        this.playerResources = null;
    }
    
    loadUpgradeDefinitions() {
        return {
            health_repair: {
                name: 'Repair Health',
                description: 'Restore 20 HP',
                cost: 10,
                currency: 'iron_ingot',
                icon: 'health_potion.png',
                repeatable: true
            },
            damage_boost: {
                name: 'Damage Boost',
                description: 'Increase attack damage by 5',
                cost: [15, 25, 40],
                currency: 'iron_ingot',
                icon: 'sword_upgrade.png',
                maxLevel: 3
            },
            attack_speed: {
                name: 'Attack Speed',
                description: 'Reduce attack cooldown',
                cost: [20, 35],
                currency: 'iron_ingot',
                icon: 'speed_boost.png',
                maxLevel: 2
            },
            health_boost: {
                name: 'Health Boost',
                description: 'Increase maximum health',
                cost: [25, 40, 60],
                currency: 'iron_ingot',
                icon: 'health_boost.png',
                maxLevel: 3
            }
        };
    }
    
    show(data = {}) {
        this.playerResources = data.resources || {};
        this.updateUpgradeAvailability();
        this.element.style.display = 'flex';
    }
    
    updateUpgradeAvailability() {
        Object.keys(this.upgrades).forEach(upgradeId => {
            const upgrade = this.upgrades[upgradeId];
            const button = this.element.querySelector(`[data-upgrade="${upgradeId}"]`);
            
            if (button) {
                const cost = this.getUpgradeCost(upgradeId);
                const canAfford = this.playerResources[upgrade.currency] >= cost;
                
                button.disabled = !canAfford;
                button.style.opacity = canAfford ? '1' : '0.5';
            }
        });
    }
    
    purchaseUpgrade(upgradeId) {
        const upgrade = this.upgrades[upgradeId];
        const cost = this.getUpgradeCost(upgradeId);
        
        if (this.playerResources[upgrade.currency] >= cost) {
            // Emit purchase event
            EventBus.emit('upgrade_purchased', {
                upgradeId: upgradeId,
                cost: cost,
                currency: upgrade.currency
            });
            
            // Update local resource display
            this.playerResources[upgrade.currency] -= cost;
            this.updateUpgradeAvailability();
            this.updateResourceDisplay();
        }
    }
}
```

## 🎨 UI Styling and Themes

### Minecraft-Inspired CSS Styles
```css
/* Base UI Theme */
.ui-element {
    font-family: 'Courier New', monospace;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
}

.minecraft-button {
    background: linear-gradient(to bottom, #8B8B8B 0%, #6B6B6B 50%, #4A4A4A 100%);
    border: 2px outset #8B8B8B;
    color: white;
    text-shadow: 2px 2px 0px #000;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.1s;
}

.minecraft-button:hover {
    background: linear-gradient(to bottom, #ABABAB 0%, #8B8B8B 50%, #6A6A6A 100%);
    border-color: #ABABAB;
}

.minecraft-button:active {
    border: 2px inset #6B6B6B;
    background: linear-gradient(to bottom, #6B6B6B 0%, #4A4A4A 50%, #2A2A2A 100%);
}

.health-bar {
    background: url('assets/textures/health_bar_bg.png') repeat-x;
    border: 2px solid #000;
    box-shadow: inset 0 0 0 1px #fff;
}

.resource-icon {
    image-rendering: pixelated;
    filter: drop-shadow(1px 1px 0px #000);
}
```

### Responsive Design Considerations
```javascript
class ResponsiveUI {
    constructor() {
        this.breakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        };
        
        this.setupResponsiveHandlers();
    }
    
    setupResponsiveHandlers() {
        window.addEventListener('resize', () => {
            this.updateUILayout();
        });
        
        this.updateUILayout();
    }
    
    updateUILayout() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (width < this.breakpoints.mobile) {
            this.applyMobileLayout();
        } else if (width < this.breakpoints.tablet) {
            this.applyTabletLayout();
        } else {
            this.applyDesktopLayout();
        }
    }
    
    applyMobileLayout() {
        // Larger UI elements for touch
        document.documentElement.style.setProperty('--ui-scale', '1.5');
        document.documentElement.style.setProperty('--button-size', '60px');
        document.documentElement.style.setProperty('--font-size', '18px');
    }
    
    applyDesktopLayout() {
        // Standard UI sizing
        document.documentElement.style.setProperty('--ui-scale', '1.0');
        document.documentElement.style.setProperty('--button-size', '40px');
        document.documentElement.style.setProperty('--font-size', '14px');
    }
}
```

## 🔧 Performance Optimization

### UI Update Optimization
```javascript
class UIUpdateManager {
    constructor() {
        this.updateQueue = new Set();
        this.isUpdating = false;
        this.frameId = null;
    }
    
    scheduleUpdate(component) {
        this.updateQueue.add(component);
        
        if (!this.isUpdating) {
            this.isUpdating = true;
            this.frameId = requestAnimationFrame(() => {
                this.processUpdates();
            });
        }
    }
    
    processUpdates() {
        this.updateQueue.forEach(component => {
            if (component.needsUpdate) {
                component.update();
                component.needsUpdate = false;
            }
        });
        
        this.updateQueue.clear();
        this.isUpdating = false;
    }
    
    // Batch DOM updates to prevent layout thrashing
    batchDOMUpdates(updates) {
        const fragment = document.createDocumentFragment();
        
        updates.forEach(update => {
            update(fragment);
        });
        
        document.body.appendChild(fragment);
    }
}
```

## 🧪 Testing and Accessibility

### UI Testing Scenarios
- **Responsive Design**: Test on different screen sizes
- **Performance**: Monitor UI update performance
- **Accessibility**: Keyboard navigation and screen reader support
- **Cross-browser**: Verify compatibility across browsers

### Accessibility Features
```javascript
class AccessibilityManager {
    constructor() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                this.handleTabNavigation(event);
            }
        });
    }
    
    setupScreenReaderSupport() {
        // Add ARIA labels and descriptions
        const healthBar = document.querySelector('.health-bar');
        if (healthBar) {
            healthBar.setAttribute('role', 'progressbar');
            healthBar.setAttribute('aria-label', 'Iron Golem Health');
        }
    }
}
```

---

**Note**: The UI system is designed to be modular and easily customizable, with support for different themes and responsive layouts to ensure accessibility across various devices and screen sizes. 