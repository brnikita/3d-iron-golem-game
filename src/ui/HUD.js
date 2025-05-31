// HUD (Heads-Up Display) for showing game information
class HUD {
    constructor() {
        this.element = null;
        this.healthBar = null;
        this.resourceDisplay = null;
        this.waveDisplay = null;
        this.isVisible = false;
        
        console.log('HUD initialized');
    }

    initialize() {
        this.createElement();
        this.hide(); // Start hidden
    }

    createElement() {
        // Create main HUD container
        this.element = document.createElement('div');
        this.element.id = 'hud';
        this.element.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
            font-family: 'Courier New', monospace;
            color: white;
        `;
        
        // Create health bar
        this.createHealthBar();
        
        // Create resource display
        this.createResourceDisplay();
        
        // Create wave display
        this.createWaveDisplay();
        
        // Create controls help
        this.createControlsHelp();
        
        // Add to document
        document.body.appendChild(this.element);
    }

    createHealthBar() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            width: 200px;
            height: 30px;
        `;
        
        // Health bar background
        const background = document.createElement('div');
        background.style.cssText = `
            width: 100%;
            height: 20px;
            background: #333;
            border: 2px solid #fff;
            position: relative;
        `;
        
        // Health bar fill
        this.healthBar = document.createElement('div');
        this.healthBar.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #ff0000, #ff6666);
            transition: width 0.3s ease;
        `;
        
        // Health text
        const healthText = document.createElement('div');
        healthText.id = 'healthText';
        healthText.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 12px;
            font-weight: bold;
            text-shadow: 1px 1px 1px #000;
            z-index: 1;
        `;
        healthText.textContent = '100/100';
        
        background.appendChild(this.healthBar);
        background.appendChild(healthText);
        container.appendChild(background);
        
        // Health label
        const label = document.createElement('div');
        label.style.cssText = `
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
            text-shadow: 1px 1px 1px #000;
        `;
        label.textContent = 'Iron Golem Health';
        
        container.insertBefore(label, background);
        this.element.appendChild(container);
    }

    createResourceDisplay() {
        this.resourceDisplay = document.createElement('div');
        this.resourceDisplay.style.cssText = `
            position: absolute;
            top: 80px;
            left: 20px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #fff;
            padding: 10px;
            border-radius: 5px;
            min-width: 150px;
        `;
        
        // Title
        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 1px 1px 1px #000;
        `;
        title.textContent = 'Resources';
        this.resourceDisplay.appendChild(title);
        
        // Iron ingots
        const ironDisplay = document.createElement('div');
        ironDisplay.id = 'ironDisplay';
        ironDisplay.style.cssText = `
            margin-bottom: 5px;
            font-size: 12px;
        `;
        ironDisplay.innerHTML = '🔩 Iron Ingots: <span id="ironCount">0</span>';
        this.resourceDisplay.appendChild(ironDisplay);
        
        // Bones
        const boneDisplay = document.createElement('div');
        boneDisplay.id = 'boneDisplay';
        boneDisplay.style.cssText = `
            margin-bottom: 5px;
            font-size: 12px;
        `;
        boneDisplay.innerHTML = '🦴 Bones: <span id="boneCount">0</span>';
        this.resourceDisplay.appendChild(boneDisplay);
        
        this.element.appendChild(this.resourceDisplay);
    }

    createWaveDisplay() {
        this.waveDisplay = document.createElement('div');
        this.waveDisplay.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #fff;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            min-width: 120px;
        `;
        
        // Wave number
        const waveNumber = document.createElement('div');
        waveNumber.id = 'waveNumber';
        waveNumber.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            text-shadow: 1px 1px 1px #000;
        `;
        waveNumber.textContent = 'Wave 0';
        
        // Wave status
        const waveStatus = document.createElement('div');
        waveStatus.id = 'waveStatus';
        waveStatus.style.cssText = `
            font-size: 12px;
            color: #ccc;
        `;
        waveStatus.textContent = 'Preparing...';
        
        this.waveDisplay.appendChild(waveNumber);
        this.waveDisplay.appendChild(waveStatus);
        this.element.appendChild(this.waveDisplay);
    }

    createControlsHelp() {
        const controls = document.createElement('div');
        controls.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid #fff;
            padding: 10px;
            border-radius: 5px;
            font-size: 11px;
            line-height: 1.4;
        `;
        
        controls.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">Controls:</div>
            <div>WASD - Move</div>
            <div>Mouse - Look around</div>
            <div>Left Click - Attack</div>
            <div>Space - Jump</div>
            <div>U - Upgrade Shop</div>
            <div>ESC - Pause</div>
            <div>R - Restart</div>
        `;
        
        this.element.appendChild(controls);
    }

    // Update methods
    updateHealth(current, max) {
        const percentage = (current / max) * 100;
        
        if (this.healthBar) {
            this.healthBar.style.width = `${percentage}%`;
            
            // Change color based on health
            if (percentage > 60) {
                this.healthBar.style.background = 'linear-gradient(90deg, #00ff00, #66ff66)';
            } else if (percentage > 30) {
                this.healthBar.style.background = 'linear-gradient(90deg, #ffff00, #ffff66)';
            } else {
                this.healthBar.style.background = 'linear-gradient(90deg, #ff0000, #ff6666)';
            }
        }
        
        const healthText = document.getElementById('healthText');
        if (healthText) {
            healthText.textContent = `${current}/${max}`;
        }
    }

    updateResources(resources) {
        const ironCount = document.getElementById('ironCount');
        if (ironCount) {
            ironCount.textContent = resources.ironIngots || 0;
        }
        
        const boneCount = document.getElementById('boneCount');
        if (boneCount) {
            boneCount.textContent = resources.bones || 0;
        }
    }

    updateWave(waveNumber) {
        const waveNumberElement = document.getElementById('waveNumber');
        if (waveNumberElement) {
            waveNumberElement.textContent = `Wave ${waveNumber}`;
        }
        
        const waveStatus = document.getElementById('waveStatus');
        if (waveStatus) {
            waveStatus.textContent = 'In Progress';
        }
    }

    updateWaveStatus(status) {
        const waveStatus = document.getElementById('waveStatus');
        if (waveStatus) {
            waveStatus.textContent = status;
        }
    }

    // Visibility methods
    show() {
        if (this.element) {
            this.element.style.display = 'block';
            this.isVisible = true;
        }
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            this.isVisible = false;
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    // Update method called each frame
    update(deltaTime) {
        // Update any animated elements or real-time displays
        // For now, this is mostly static
    }

    // Cleanup
    dispose() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        console.log('HUD disposed');
    }
}

// Make HUD globally accessible
window.HUD = HUD; 