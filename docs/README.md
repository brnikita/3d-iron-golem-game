# Documentation Directory

This directory contains comprehensive documentation for the Iron Golem 3D survival game, including development guides, API references, and technical specifications.

## 📁 Documentation Structure

### Development Guides
- `DEVELOPMENT_SETUP.md` - Setting up the development environment
- `CODING_STANDARDS.md` - Code style and best practices
- `TESTING_GUIDE.md` - Testing procedures and frameworks
- `DEPLOYMENT_GUIDE.md` - Build and deployment instructions

### Technical Documentation
- `API_REFERENCE.md` - Complete API documentation for all modules
- `ARCHITECTURE_OVERVIEW.md` - High-level system architecture
- `PERFORMANCE_GUIDE.md` - Performance optimization techniques
- `BROWSER_COMPATIBILITY.md` - Cross-browser support details

### Game Design Documents
- `GAME_DESIGN_DOCUMENT.md` - Complete game design specification
- `BALANCE_GUIDE.md` - Gameplay balance and tuning
- `AUDIO_DESIGN.md` - Sound design and implementation
- `VISUAL_STYLE_GUIDE.md` - Art direction and visual consistency

## 🚀 Quick Start for Developers

### Prerequisites
- Modern web browser with WebGL 2.0 support
- Local web server (Python, Node.js, or PHP)
- Text editor or IDE (VS Code recommended)
- Git for version control

### Development Setup
1. Clone the repository
2. Set up a local web server
3. Open `index.html` in your browser
4. Start developing!

### Recommended Development Tools
- **Code Editor**: Visual Studio Code with extensions:
  - Live Server
  - JavaScript (ES6) code snippets
  - Three.js snippets
  - GLSL syntax highlighting
- **Browser**: Chrome with Developer Tools
- **Version Control**: Git with GitHub Desktop (optional)
- **Asset Tools**: Blender for 3D models, Aseprite for textures

## 📖 Documentation Guidelines

### Writing Standards
- Use clear, concise language
- Include code examples where appropriate
- Maintain consistent formatting
- Update documentation with code changes
- Use proper markdown syntax

### Code Documentation
```javascript
/**
 * Calculate damage with modifiers and critical hits
 * @param {number} baseDamage - Base damage value
 * @param {Object} attacker - Entity performing the attack
 * @param {Object} target - Entity receiving damage
 * @param {Object} modifiers - Damage modifiers object
 * @returns {number} Final damage amount
 * @example
 * const damage = calculateDamage(25, ironGolem, zombie, { critical: true });
 */
function calculateDamage(baseDamage, attacker, target, modifiers = {}) {
    // Implementation details...
}
```

### API Documentation Format
```markdown
## ClassName

Brief description of the class purpose and functionality.

### Constructor
`new ClassName(param1, param2)`

**Parameters:**
- `param1` (Type): Description
- `param2` (Type): Description

### Methods

#### methodName(param)
Description of what the method does.

**Parameters:**
- `param` (Type): Parameter description

**Returns:**
- (Type): Return value description

**Example:**
```javascript
const instance = new ClassName();
const result = instance.methodName(value);
```
```

## 🎮 Game Design Documentation

### Core Gameplay Loop
1. **Preparation Phase**: Player explores village, collects resources
2. **Wave Warning**: 10-second countdown to next enemy wave
3. **Combat Phase**: Defend village against enemy assault
4. **Resource Collection**: Gather materials from defeated enemies
5. **Upgrade Phase**: Spend resources on improvements
6. **Repeat**: Next wave with increased difficulty

### Progression Systems
- **Wave Difficulty**: Exponential scaling with more enemies and stronger variants
- **Player Upgrades**: Health, damage, and attack speed improvements
- **Resource Economy**: Iron ingots as primary currency, bones for special abilities
- **Score System**: Points based on waves survived and enemies defeated

### Balance Philosophy
- **Slow Progression**: Deliberate pacing matches Iron Golem's heavy movement
- **Risk vs Reward**: Higher waves offer better resource drops
- **Player Agency**: Multiple upgrade paths for different playstyles
- **Accessibility**: Simple controls with depth in strategy

## 🔧 Technical Architecture

### Module Dependencies
```
GameEngine (Core)
├── AssetLoader
├── InputManager
├── AudioManager
└── Systems
    ├── PhysicsSystem
    ├── CombatSystem
    ├── WaveSystem
    └── ResourceSystem

Entities
├── IronGolem
├── Enemies (Zombie, Skeleton, Creeper)
└── Resources

World
├── WorldGenerator
├── Village
└── Terrain

UI
├── HUD
└── MenuSystem

Utils
├── MathUtils
├── GeometryUtils
└── StorageManager
```

### Data Flow
1. **Input** → InputManager → Game Systems
2. **Game Logic** → Systems → Entity Updates
3. **Rendering** → Three.js → WebGL → Display
4. **Audio** → AudioManager → Web Audio API → Speakers
5. **Persistence** → StorageManager → localStorage → Browser

### Performance Considerations
- **60 FPS Target**: Optimized for smooth gameplay
- **Memory Management**: Object pooling and asset cleanup
- **Rendering Optimization**: Frustum culling, LOD, batching
- **Asset Streaming**: Progressive loading for faster startup

## 🧪 Testing Strategy

### Testing Levels
1. **Unit Tests**: Individual function and class testing
2. **Integration Tests**: System interaction testing
3. **Performance Tests**: Frame rate and memory usage
4. **Compatibility Tests**: Cross-browser validation
5. **User Testing**: Gameplay experience validation

### Testing Tools
- **Unit Testing**: Jest or Mocha for JavaScript testing
- **Performance**: Browser DevTools and custom profilers
- **Compatibility**: BrowserStack or manual testing
- **Automation**: GitHub Actions for CI/CD

### Test Coverage Goals
- **Core Systems**: 90%+ coverage
- **Game Logic**: 80%+ coverage
- **UI Components**: 70%+ coverage
- **Utilities**: 95%+ coverage

## 📊 Performance Metrics

### Target Performance
- **Frame Rate**: 60 FPS on desktop, 30 FPS on mobile
- **Loading Time**: <10 seconds initial load
- **Memory Usage**: <200MB total
- **Asset Size**: <50MB initial download

### Monitoring Tools
- **FPS Counter**: Built-in performance display
- **Memory Profiler**: Browser DevTools integration
- **Network Monitor**: Asset loading optimization
- **Error Tracking**: Console error logging

### Optimization Techniques
- **Geometry Instancing**: Reuse meshes for similar objects
- **Texture Atlasing**: Combine textures to reduce draw calls
- **Audio Pooling**: Reuse audio sources
- **Spatial Partitioning**: Efficient collision detection

## 🌐 Browser Compatibility

### Supported Browsers
- **Chrome**: 80+ (full support)
- **Firefox**: 75+ (full support)
- **Edge**: 80+ (full support)
- **Safari**: 13+ (limited support)
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+

### Required Features
- **WebGL 2.0**: 3D graphics rendering
- **Web Audio API**: Spatial audio support
- **ES6 Modules**: Modern JavaScript features
- **localStorage**: Game state persistence
- **Pointer Lock API**: Mouse look controls

### Fallback Strategies
- **WebGL 1.0**: Reduced feature set for older browsers
- **Audio Fallback**: Basic audio without spatial effects
- **Touch Controls**: Mobile device support
- **Reduced Graphics**: Lower quality for performance

## 📝 Contributing Guidelines

### Code Contributions
1. Fork the repository
2. Create a feature branch
3. Follow coding standards
4. Add tests for new features
5. Update documentation
6. Submit a pull request

### Documentation Contributions
1. Identify documentation gaps
2. Follow writing standards
3. Include code examples
4. Test documentation accuracy
5. Submit improvements

### Bug Reports
1. Use the issue template
2. Include reproduction steps
3. Provide browser/system info
4. Attach relevant screenshots
5. Test with latest version

## 🔗 External Resources

### Learning Resources
- **Three.js Documentation**: https://threejs.org/docs/
- **WebGL Fundamentals**: https://webglfundamentals.org/
- **Game Development Patterns**: https://gameprogrammingpatterns.com/
- **JavaScript Best Practices**: https://developer.mozilla.org/

### Asset Resources
- **Free 3D Models**: Sketchfab, OpenGameArt
- **Texture Resources**: Textures.com, OpenGameArt
- **Audio Resources**: Freesound.org, Zapsplat
- **Font Resources**: Google Fonts, DaFont

### Development Tools
- **Blender**: Free 3D modeling software
- **Aseprite**: Pixel art and animation tool
- **Audacity**: Free audio editing software
- **VS Code**: Recommended code editor

---

**Note**: This documentation is a living resource that should be updated regularly as the project evolves. All contributors are encouraged to maintain and improve the documentation alongside code changes. 