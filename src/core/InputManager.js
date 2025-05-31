// Input manager for handling keyboard and mouse input
class InputManager {
    constructor() {
        // Input state
        this.keys = new Map();
        this.mouseButtons = new Map();
        this.mousePosition = { x: 0, y: 0 };
        this.mouseDelta = { x: 0, y: 0 };
        this.lastMousePosition = { x: 0, y: 0 };
        
        // Input callbacks
        this.onMouseMove = null;
        this.onMouseClick = null;
        this.onKeyPress = null;
        this.onKeyRelease = null;
        
        // Key bindings
        this.keyBindings = new Map([
            ['KeyW', 'moveForward'],
            ['KeyS', 'moveBackward'],
            ['KeyA', 'moveLeft'],
            ['KeyD', 'moveRight'],
            ['Space', 'jump'],
            ['Escape', 'pause'],
            ['KeyR', 'restart'],
            ['KeyU', 'openUpgradeShop']
        ]);
        
        // Mouse settings
        this.mouseSensitivity = 0.01;
        this.invertY = false;
        this.isPointerLocked = false;
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        console.log('InputManager initialized');
    }

    initializeEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
        
        // Mouse events
        document.addEventListener('mousedown', (event) => this.onMouseDown(event));
        document.addEventListener('mouseup', (event) => this.onMouseUp(event));
        document.addEventListener('mousemove', (event) => this.onMouseMoveEvent(event));
        
        // Pointer lock events
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        document.addEventListener('pointerlockerror', () => this.onPointerLockError());
        
        // Canvas click to request pointer lock
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.addEventListener('click', () => this.requestPointerLock());
        }
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
        
        // Handle window focus/blur
        window.addEventListener('blur', () => this.onWindowBlur());
        window.addEventListener('focus', () => this.onWindowFocus());
    }

    onKeyDown(event) {
        const code = event.code;
        
        // Prevent default for game keys
        if (this.keyBindings.has(code)) {
            event.preventDefault();
        }
        
        // Set key state
        this.keys.set(code, true);
        
        // Call callback if set
        if (this.onKeyPress) {
            const action = this.keyBindings.get(code);
            this.onKeyPress(code, action);
        }
        
        // Handle special keys
        this.handleSpecialKeys(code);
    }

    onKeyUp(event) {
        const code = event.code;
        
        // Clear key state
        this.keys.set(code, false);
        
        // Call callback if set
        if (this.onKeyRelease) {
            const action = this.keyBindings.get(code);
            this.onKeyRelease(code, action);
        }
    }

    onMouseDown(event) {
        const button = event.button;
        this.mouseButtons.set(button, true);
        
        console.log(`Mouse button ${button} pressed`); // Debug log
        
        // Call callback if set
        if (this.onMouseClick) {
            this.onMouseClick(button, true);
        }
        
        // Handle left click for attacks
        if (button === 0 && window.game && window.game.gameEngine) {
            const ironGolem = window.game.gameEngine.getIronGolem();
            if (ironGolem) {
                console.log('Attempting Iron Golem attack...'); // Debug log
                const attackResult = ironGolem.attack();
                console.log('Attack result:', attackResult); // Debug log
            } else {
                console.log('Iron Golem not found for attack'); // Debug log
            }
        }
        
        // Request pointer lock on first click
        if (button === 0) {
            this.requestPointerLock();
        }
    }

    onMouseUp(event) {
        const button = event.button;
        this.mouseButtons.set(button, false);
        
        // Call callback if set
        if (this.onMouseClick) {
            this.onMouseClick(button, false);
        }
    }

    onMouseMoveEvent(event) {
        // Update mouse position
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
        
        // Calculate mouse delta
        if (this.isPointerLocked) {
            this.mouseDelta.x = event.movementX * this.mouseSensitivity;
            this.mouseDelta.y = event.movementY * this.mouseSensitivity;
            
            // Invert Y if enabled
            if (this.invertY) {
                this.mouseDelta.y = -this.mouseDelta.y;
            }
            
            // Call callback if set
            if (this.onMouseMove) {
                this.onMouseMove(this.mouseDelta.x, this.mouseDelta.y);
            }
        } else {
            // Calculate delta from last position for non-locked mode
            this.mouseDelta.x = (event.clientX - this.lastMousePosition.x) * this.mouseSensitivity;
            this.mouseDelta.y = (event.clientY - this.lastMousePosition.y) * this.mouseSensitivity;
            
            // Call callback even when not locked (for testing)
            if (this.onMouseMove) {
                this.onMouseMove(this.mouseDelta.x, this.mouseDelta.y);
            }
            
            this.lastMousePosition.x = event.clientX;
            this.lastMousePosition.y = event.clientY;
        }
    }

    requestPointerLock() {
        const canvas = document.getElementById('gameCanvas');
        if (canvas && !this.isPointerLocked) {
            canvas.requestPointerLock();
            console.log('Requesting pointer lock...');
        }
    }

    exitPointerLock() {
        if (this.isPointerLocked) {
            document.exitPointerLock();
        }
    }

    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === document.getElementById('gameCanvas');
        
        if (this.isPointerLocked) {
            console.log('Pointer locked');
        } else {
            console.log('Pointer unlocked');
        }
    }

    onPointerLockError() {
        console.error('Pointer lock failed');
    }

    onWindowBlur() {
        // Clear all input states when window loses focus
        this.keys.clear();
        this.mouseButtons.clear();
    }

    onWindowFocus() {
        // Reset input states when window gains focus
        this.keys.clear();
        this.mouseButtons.clear();
    }

    handleSpecialKeys(code) {
        switch (code) {
            case 'Escape':
                // Toggle pause or exit pointer lock
                if (this.isPointerLocked) {
                    this.exitPointerLock();
                } else if (window.game && window.game.gameEngine) {
                    const engine = window.game.gameEngine;
                    if (engine.isPaused) {
                        engine.resume();
                    } else {
                        engine.pause();
                    }
                }
                break;
                
            case 'KeyR':
                // Restart game
                if (window.game && window.game.gameEngine) {
                    window.game.gameEngine.restart();
                }
                break;
                
            case 'KeyU':
                // Open upgrade shop
                if (window.game && window.game.gameEngine && window.game.gameEngine.resourceSystem) {
                    const shop = document.getElementById('upgradeShop');
                    if (shop) {
                        shop.style.display = shop.style.display === 'none' ? 'block' : 'none';
                    } else {
                        window.game.gameEngine.resourceSystem.createUpgradeShop();
                        const newShop = document.getElementById('upgradeShop');
                        if (newShop) {
                            newShop.style.display = 'block';
                        }
                    }
                }
                break;
                
            case 'F11':
                // Toggle fullscreen
                this.toggleFullscreen();
                break;
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // Input state queries
    isKeyPressed(code) {
        return this.keys.get(code) || false;
    }

    isActionPressed(action) {
        for (const [code, boundAction] of this.keyBindings) {
            if (boundAction === action && this.isKeyPressed(code)) {
                return true;
            }
        }
        return false;
    }

    isMouseButtonPressed(button) {
        return this.mouseButtons.get(button) || false;
    }

    getMousePosition() {
        return { ...this.mousePosition };
    }

    getMouseDelta() {
        return { ...this.mouseDelta };
    }

    // Movement input helpers
    getMovementInput() {
        const movement = { x: 0, z: 0 };
        
        if (this.isActionPressed('moveForward')) movement.z -= 1;
        if (this.isActionPressed('moveBackward')) movement.z += 1;
        if (this.isActionPressed('moveLeft')) movement.x -= 1;
        if (this.isActionPressed('moveRight')) movement.x += 1;
        
        // Normalize diagonal movement
        if (movement.x !== 0 && movement.z !== 0) {
            const length = Math.sqrt(movement.x * movement.x + movement.z * movement.z);
            movement.x /= length;
            movement.z /= length;
        }
        
        return movement;
    }

    // Key binding management
    bindKey(code, action) {
        this.keyBindings.set(code, action);
    }

    unbindKey(code) {
        this.keyBindings.delete(code);
    }

    getKeyBinding(action) {
        for (const [code, boundAction] of this.keyBindings) {
            if (boundAction === action) {
                return code;
            }
        }
        return null;
    }

    // Settings
    setMouseSensitivity(sensitivity) {
        this.mouseSensitivity = Math.max(0.001, Math.min(0.01, sensitivity));
    }

    setInvertY(invert) {
        this.invertY = invert;
    }

    // Update method called each frame
    update(deltaTime) {
        // Reset mouse delta if not moving
        if (!this.isPointerLocked) {
            this.mouseDelta.x = 0;
            this.mouseDelta.y = 0;
        }
        
        // Handle continuous input (movement)
        this.handleContinuousInput(deltaTime);
    }

    handleContinuousInput(deltaTime) {
        if (!window.game || !window.game.gameEngine) return;
        
        const engine = window.game.gameEngine;
        const ironGolem = engine.getIronGolem();
        
        if (!ironGolem || engine.isPaused) return;
        
        // Handle movement input
        const movement = this.getMovementInput();
        if (movement.x !== 0 || movement.z !== 0) {
            ironGolem.move(movement.x, movement.z, deltaTime);
        }
        
        // Handle jump input
        if (this.isActionPressed('jump')) {
            ironGolem.jump();
        }
    }

    // Debug methods
    getInputState() {
        return {
            keys: Array.from(this.keys.entries()).filter(([key, pressed]) => pressed),
            mouseButtons: Array.from(this.mouseButtons.entries()).filter(([button, pressed]) => pressed),
            mousePosition: this.mousePosition,
            mouseDelta: this.mouseDelta,
            isPointerLocked: this.isPointerLocked
        };
    }

    // Cleanup
    dispose() {
        // Remove event listeners
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('mousemove', this.onMouseMoveEvent);
        
        // Clear state
        this.keys.clear();
        this.mouseButtons.clear();
        
        console.log('InputManager disposed');
    }
}

// Make InputManager globally accessible
window.InputManager = InputManager; 