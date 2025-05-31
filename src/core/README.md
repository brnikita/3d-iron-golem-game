# Core Game Engine Components

This module contains the fundamental systems that power the Iron Golem 3D game engine.

## 📁 Files Overview

### GameEngine.js
**Purpose**: Main game engine orchestrator and game loop manager
**Responsibilities**:
- Initialize Three.js scene, camera, and renderer
- Manage the main game loop (update/render cycle)
- Handle game state transitions (menu, playing, paused, game over)
- Coordinate between all game systems
- Performance monitoring and FPS management

**Key Classes**:
- `GameEngine`: Main engine class with singleton pattern
- `GameState`: Enum for different game states
- `Scene`: Extended Three.js scene with game-specific functionality

### AssetLoader.js
**Purpose**: Centralized asset loading and management system
**Responsibilities**:
- Load 3D models, textures, and audio files
- Progress tracking for loading screen
- Asset caching and memory management
- Error handling for failed loads
- Texture atlas management

**Key Classes**:
- `AssetLoader`: Main asset loading manager
- `AssetCache`: Memory-efficient asset storage
- `LoadingProgress`: Progress tracking utility

### InputManager.js
**Purpose**: Unified input handling for keyboard, mouse, and touch
**Responsibilities**:
- WASD movement input processing
- Mouse look and camera rotation
- Click detection for combat
- Key binding management
- Input state buffering

**Key Classes**:
- `InputManager`: Central input coordinator
- `KeyboardHandler`: Keyboard input processing
- `MouseHandler`: Mouse movement and click handling
- `InputBuffer`: Frame-based input buffering

### AudioManager.js
**Purpose**: 3D spatial audio system and sound effect management
**Responsibilities**:
- Load and play sound effects
- 3D positional audio for immersive experience
- Volume control and audio settings
- Audio pooling for performance
- Background music management

**Key Classes**:
- `AudioManager`: Main audio system controller
- `SpatialAudio`: 3D positioned sound effects
- `AudioPool`: Reusable audio source management
- `MusicPlayer`: Background music controller

## 🔧 Technical Implementation

### Game Loop Architecture
```javascript
// 60 FPS target with delta time compensation
const targetFPS = 60;
const targetFrameTime = 1000 / targetFPS;

function gameLoop(currentTime) {
    const deltaTime = Math.min(currentTime - lastTime, targetFrameTime * 2);
    
    // Update all systems
    inputManager.update(deltaTime);
    physicsSystem.update(deltaTime);
    combatSystem.update(deltaTime);
    waveSystem.update(deltaTime);
    
    // Render the scene
    renderer.render(scene, camera);
    
    lastTime = currentTime;
    requestAnimationFrame(gameLoop);
}
```

### Asset Loading Pipeline
1. **Discovery**: Scan asset manifest for required files
2. **Prioritization**: Load critical assets first (player model, basic textures)
3. **Streaming**: Load non-critical assets in background
4. **Optimization**: Compress textures and optimize models on load
5. **Caching**: Store processed assets for quick access

### Input Processing Flow
1. **Raw Input**: Capture browser events (keydown, mousemove, click)
2. **Normalization**: Convert to game-specific input format
3. **Buffering**: Store inputs for consistent frame processing
4. **Distribution**: Send processed inputs to relevant systems
5. **State Management**: Track input states across frames

## 🎯 Performance Considerations

### Memory Management
- **Asset Disposal**: Automatic cleanup of unused assets
- **Geometry Pooling**: Reuse common geometries (cubes, spheres)
- **Texture Compression**: Use compressed texture formats when available
- **Garbage Collection**: Minimize object creation in game loop

### Rendering Optimization
- **Frustum Culling**: Only render objects in camera view
- **Level of Detail**: Reduce geometry complexity for distant objects
- **Batch Rendering**: Group similar objects for efficient drawing
- **Shader Optimization**: Minimize fragment shader complexity

### Audio Performance
- **Audio Pooling**: Reuse audio sources to prevent memory leaks
- **Distance Culling**: Don't play sounds beyond hearing range
- **Format Optimization**: Use compressed audio formats (OGG, MP3)
- **Streaming**: Load large audio files progressively

## 🔗 Dependencies

### External Libraries
- **Three.js**: 3D graphics and WebGL abstraction
- **Web Audio API**: Spatial audio and sound processing

### Internal Dependencies
- `utils/MathUtils.js`: Mathematical helper functions
- `utils/StorageManager.js`: Local storage management
- All game systems depend on core components

## 🚀 Usage Examples

### Initializing the Game Engine
```javascript
const gameEngine = new GameEngine({
    canvas: document.getElementById('gameCanvas'),
    antialias: true,
    shadowMap: true,
    targetFPS: 60
});

await gameEngine.initialize();
gameEngine.start();
```

### Loading Assets
```javascript
const assetLoader = new AssetLoader();
assetLoader.onProgress = (progress) => {
    updateLoadingBar(progress);
};

await assetLoader.loadAssets([
    'models/iron_golem.glb',
    'textures/village_atlas.png',
    'audio/attack_sound.ogg'
]);
```

### Handling Input
```javascript
const inputManager = new InputManager();
inputManager.bindKey('KeyW', 'moveForward');
inputManager.bindKey('KeyS', 'moveBackward');
inputManager.bindMouse('leftClick', 'attack');

// In game loop
const input = inputManager.getInputState();
if (input.moveForward) {
    player.moveForward(deltaTime);
}
```

## 🧪 Testing Considerations

### Performance Testing
- Monitor FPS across different devices
- Test asset loading times
- Verify memory usage patterns
- Check for memory leaks

### Compatibility Testing
- Test across major browsers (Chrome, Firefox, Edge)
- Verify WebGL feature support
- Test with different screen resolutions
- Validate touch input on mobile devices

### Error Handling
- Graceful degradation for missing WebGL features
- Fallback options for failed asset loads
- User-friendly error messages
- Recovery mechanisms for system failures

---

**Note**: All core components are designed to be modular and testable. Each class should have clear interfaces and minimal dependencies to facilitate unit testing and maintenance. 