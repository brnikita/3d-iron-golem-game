// Game states enum
const GameState = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

// Main game engine class
class GameEngine {
    constructor(options = {}) {
        // Three.js core components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = options.canvas;
        
        // Game state
        this.state = GameState.LOADING;
        this.isRunning = false;
        this.isPaused = false;
        
        // Timing
        this.clock = new THREE.Clock();
        this.lastTime = 0;
        this.deltaTime = 0;
        this.targetFPS = 60;
        this.frameCount = 0;
        
        // Game systems
        this.assetLoader = null;
        this.inputManager = null;
        this.audioManager = null;
        this.physicsSystem = null;
        this.combatSystem = null;
        this.waveSystem = null;
        this.resourceSystem = null;
        this.hud = null;
        this.menuSystem = null;
        
        // Game entities
        this.ironGolem = null;
        this.enemies = new Set();
        this.resources = new Set();
        this.world = null;
        
        // Performance monitoring
        this.performanceStats = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0
        };
        
        // Options
        this.options = {
            antialias: options.antialias || true,
            shadowMap: options.shadowMap || true,
            debug: options.debug || false,
            ...options
        };
    }

    async initialize() {
        console.log('Initializing game engine...');
        
        try {
            // Initialize Three.js
            this.initializeThreeJS();
            
            // Initialize core systems
            this.initializeSystems();
            
            // Load initial assets
            await this.loadAssets();
            
            // Initialize game world
            this.initializeWorld();
            
            // Initialize player
            this.initializePlayer();
            
            // Initialize UI
            this.initializeUI();
            
            // Set initial state
            this.setState(GameState.PLAYING);
            
            console.log('Game engine initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize game engine:', error);
            throw error;
        }
    }

    initializeThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, // FOV
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near plane
            1000 // Far plane
        );
        this.camera.position.set(0, 10, 10);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: this.options.antialias
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Enable shadows if requested
        if (this.options.shadowMap) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Add basic lighting
        this.setupLighting();
        
        console.log('Three.js initialized');
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xFFFFE0, 1.0);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        
        // Configure shadow camera
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        
        this.scene.add(directionalLight);
        
        // Add fog for atmosphere
        this.scene.fog = new THREE.Fog(0xCCCCCC, 50, 200);
    }

    initializeSystems() {
        // Initialize core systems
        this.assetLoader = new AssetLoader();
        this.inputManager = new InputManager();
        this.audioManager = new AudioManager();
        
        // Initialize game systems
        this.physicsSystem = new PhysicsSystem();
        this.combatSystem = new CombatSystem();
        this.waveSystem = new WaveSystem();
        this.resourceSystem = new ResourceSystem();
        
        // Initialize UI systems
        this.hud = new HUD();
        this.menuSystem = new MenuSystem();
        
        console.log('Game systems initialized');
    }

    async loadAssets() {
        console.log('Loading assets...');
        
        // Set up progress callback
        this.assetLoader.onProgress = (progress) => {
            if (window.game) {
                window.game.updateLoadingProgress(progress * 100);
            }
        };
        
        // Load critical assets first
        await this.assetLoader.loadCriticalAssets();
        
        console.log('Assets loaded');
    }

    initializeWorld() {
        // Create world generator and generate village
        this.worldGenerator = new WorldGenerator();
        this.world = this.worldGenerator.generateWorld();
        this.scene.add(this.world);
        
        console.log('World initialized');
    }

    initializePlayer() {
        // Create Iron Golem player character
        this.ironGolem = new IronGolem();
        this.ironGolem.position.set(0, 0, 0);
        this.ironGolem.initialize();
        this.scene.add(this.ironGolem.mesh);
        
        // Add Iron Golem to physics system
        if (this.physicsSystem) {
            this.physicsSystem.addEntity(this.ironGolem);
        }
        
        // Set up camera to follow Iron Golem
        this.setupPlayerCamera();
        
        console.log('Player initialized');
    }

    setupPlayerCamera() {
        // Camera controls handled by Iron Golem
        this.inputManager.onMouseMove = (deltaX, deltaY) => {
            if (this.state === GameState.PLAYING && !this.isPaused && this.ironGolem) {
                this.ironGolem.rotateCamera(deltaX, deltaY);
            }
        };
    }

    initializeUI() {
        // Initialize HUD
        this.hud.initialize();
        
        // Initialize menu system
        this.menuSystem.initialize();
        
        console.log('UI initialized');
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.clock.start();
        this.gameLoop();
        
        console.log('Game loop started');
    }

    stop() {
        this.isRunning = false;
        console.log('Game stopped');
    }

    pause() {
        this.isPaused = true;
        this.setState(GameState.PAUSED);
        console.log('Game paused');
    }

    resume() {
        this.isPaused = false;
        this.setState(GameState.PLAYING);
        console.log('Game resumed');
    }

    restart() {
        // Reset game state
        this.enemies.clear();
        this.resources.clear();
        
        // Reset player
        this.ironGolem.reset();
        
        // Reset systems
        this.waveSystem.reset();
        this.resourceSystem.reset();
        
        // Resume game
        this.setState(GameState.PLAYING);
        this.resume();
        
        console.log('Game restarted');
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const currentTime = this.clock.getElapsedTime();
        this.deltaTime = Math.min(currentTime - this.lastTime, 1/30); // Cap at 30 FPS minimum
        this.lastTime = currentTime;
        
        // Update performance stats
        this.updatePerformanceStats();
        
        // Update game if not paused
        if (!this.isPaused && this.state === GameState.PLAYING) {
            this.update(this.deltaTime);
        }
        
        // Render scene
        this.render();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        // Update input
        this.inputManager.update(deltaTime);
        
        // Update player
        if (this.ironGolem) {
            this.ironGolem.update(deltaTime);
        }
        
        // Update game systems
        this.physicsSystem.update(deltaTime);
        this.combatSystem.update(deltaTime);
        this.waveSystem.update(deltaTime);
        this.resourceSystem.update(deltaTime);
        
        // Update entities
        this.updateEntities(deltaTime);
        
        // Update camera
        this.updateCamera(deltaTime);
        
        // Update UI
        this.hud.update(deltaTime);
    }

    updateEntities(deltaTime) {
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime);
            
            // Remove dead enemies
            if (enemy.isDead) {
                this.removeEnemy(enemy);
            }
        });
        
        // Update resources
        this.resources.forEach(resource => {
            resource.update(deltaTime);
            
            // Remove collected or expired resources
            if (resource.isCollected || resource.isExpired) {
                this.removeResource(resource);
            }
        });
    }

    updateCamera(deltaTime) {
        if (!this.ironGolem) return;
        
        // Get camera position and target from Iron Golem
        const cameraPosition = this.ironGolem.getCameraPosition();
        const cameraTarget = this.ironGolem.getCameraTarget();
        
        // Smooth camera follow
        this.camera.position.lerp(cameraPosition, deltaTime * 5);
        
        // Look at target
        this.camera.lookAt(cameraTarget);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        this.frameCount++;
    }

    updatePerformanceStats() {
        // Update FPS counter
        if (this.frameCount % 60 === 0) {
            this.performanceStats.fps = Math.round(1 / this.deltaTime);
            this.performanceStats.frameTime = Math.round(this.deltaTime * 1000);
            
            // Update memory usage if available
            if (performance.memory) {
                this.performanceStats.memoryUsage = Math.round(
                    performance.memory.usedJSHeapSize / 1024 / 1024
                );
            }
        }
    }

    // Entity management
    addEnemy(enemy) {
        this.enemies.add(enemy);
        this.scene.add(enemy.mesh);
    }

    removeEnemy(enemy) {
        this.enemies.delete(enemy);
        this.scene.remove(enemy.mesh);
        
        // Remove from physics system
        if (this.physicsSystem) {
            this.physicsSystem.removeEntity(enemy);
        }
        
        enemy.dispose();
    }

    addResource(resource) {
        this.resources.add(resource);
        this.scene.add(resource.mesh);
    }

    removeResource(resource) {
        this.resources.delete(resource);
        this.scene.remove(resource.mesh);
        resource.dispose();
    }

    // State management
    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        
        console.log(`Game state changed: ${oldState} -> ${newState}`);
        
        // Handle state transitions
        this.onStateChange(oldState, newState);
    }

    onStateChange(oldState, newState) {
        switch (newState) {
            case GameState.PLAYING:
                this.hud.show();
                break;
            case GameState.PAUSED:
                this.menuSystem.showPauseMenu();
                break;
            case GameState.GAME_OVER:
                this.hud.hide();
                this.menuSystem.showGameOverMenu();
                break;
        }
    }

    // Utility methods
    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    getIronGolem() {
        return this.ironGolem;
    }

    getEnemies() {
        return Array.from(this.enemies);
    }

    getResources() {
        return Array.from(this.resources);
    }

    isGameRunning() {
        return this.isRunning && !this.isPaused && this.state === GameState.PLAYING;
    }

    // Debug methods
    getPerformanceStats() {
        return this.performanceStats;
    }

    enableDebugMode() {
        this.options.debug = true;
        
        // Add debug helpers
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
        
        // Add grid helper
        const gridHelper = new THREE.GridHelper(100, 100);
        this.scene.add(gridHelper);
        
        console.log('Debug mode enabled');
    }
}

// Make GameEngine globally accessible
window.GameEngine = GameEngine;
window.GameState = GameState; 