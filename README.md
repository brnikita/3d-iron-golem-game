# Iron Golem Survival - 3D Browser Game

A serverless 3D browser-based survival game where you control an Iron Golem from Minecraft in a procedurally generated village environment. Built with Three.js and WebGL, this game runs entirely client-side without requiring any backend server.

## 🎮 Game Features

### Core Mechanics
- **Iron Golem Control**: Slow, deliberate movement (3-5 units/second) with WASD controls
- **Camera System**: Mouse-based camera rotation for 3D navigation
- **Combat System**: Melee attacks with 2-second cooldown, dealing 20-30 HP damage
- **Health System**: 100 HP starting health, no automatic regeneration
- **Resource Collection**: Collect iron ingots, bones, and other materials from defeated enemies

### Survival Mode
- **Wave-based Combat**: Increasingly difficult waves of hostile mobs
- **Enemy Types**: Zombies, skeletons, and creepers with unique behaviors
- **Village Defense**: Protect the procedurally generated village
- **Progression System**: Use resources to repair health and upgrade damage

### Technical Features
- **Procedural Generation**: Dynamic village layouts with houses, trees, and terrain
- **Low-poly Aesthetics**: Minecraft-inspired 3D models and textures
- **Performance Optimized**: Targets 30-60 FPS on mid-range devices
- **Local Storage**: Save high scores and progress between sessions
- **Cross-browser Compatible**: Works on Chrome, Firefox, and Edge

## 🚀 Quick Start

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Wait for assets to load
4. Use WASD to move, mouse to look around, left-click to attack
5. Survive as many waves as possible!

## 🎯 Controls

- **W/A/S/D**: Move Iron Golem
- **Mouse**: Look around / Camera rotation
- **Left Click**: Attack enemies
- **ESC**: Pause menu
- **R**: Restart game (when game over)

## 📁 Project Structure

```
/
├── index.html              # Main game entry point
├── README.md              # This file
├── src/                   # Source code directory
│   ├── core/             # Core game engine components
│   ├── entities/         # Game entities (player, enemies, resources)
│   ├── world/            # World generation and environment
│   ├── systems/          # Game systems (combat, waves, physics)
│   ├── ui/               # User interface components
│   └── utils/            # Utility functions and helpers
├── assets/               # Game assets
│   ├── models/          # 3D models and geometries
│   ├── textures/        # Texture files
│   ├── audio/           # Sound effects and music
│   └── shaders/         # Custom GLSL shaders
└── docs/                # Additional documentation
```

## 🛠️ Development

### Prerequisites
- Modern web browser with WebGL support
- Local web server (for development) - optional but recommended

### Running Locally
For development, it's recommended to serve the files through a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Architecture Overview

The game follows a modular architecture with clear separation of concerns:

- **Core**: Game engine, asset loading, input handling
- **Entities**: Player character, enemies, collectible resources
- **World**: Procedural generation, village layout, terrain
- **Systems**: Combat mechanics, wave spawning, physics simulation
- **UI**: HUD elements, menus, game state display
- **Utils**: Mathematical helpers, geometry utilities, storage management

## 🎨 Asset Guidelines

### 3D Models
- Low-poly style (< 1000 triangles per model)
- Minecraft-inspired blocky aesthetics
- Efficient UV mapping for texture atlas usage

### Textures
- 16x16 or 32x32 pixel textures for authentic Minecraft feel
- Limited color palette for consistent visual style
- Optimized file sizes for fast loading

### Audio
- Royalty-free sound effects
- Compressed formats (OGG/MP3) for web compatibility
- Spatial audio support for 3D positioning

## 🔧 Performance Optimization

- **Geometry Instancing**: Reuse meshes for similar objects
- **Texture Atlasing**: Combine textures to reduce draw calls
- **LOD System**: Level-of-detail for distant objects
- **Frustum Culling**: Only render visible objects
- **Object Pooling**: Reuse enemy and projectile objects

## 💾 Save System

The game uses localStorage to persist:
- High scores (highest wave reached)
- Player preferences (volume, controls)
- Unlock progress
- Statistics (total enemies defeated, resources collected)

## 🌐 Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Edge**: Full support
- **Safari**: Basic support (some features may be limited)
- **Mobile**: Limited support (performance dependent)

## 📈 Future Enhancements

- Additional enemy types and boss battles
- More resource types and crafting system
- Multiple village biomes
- Multiplayer support (requires backend)
- Mobile touch controls
- VR support

## 🤝 Contributing

This is an educational project. Feel free to fork and modify for your own learning purposes.

## 📄 License

This project is for educational purposes. Three.js is licensed under MIT. Minecraft is a trademark of Mojang Studios.

## 🎵 Audio Credits

Sound effects sourced from:
- Freesound.org (CC0 licensed)
- Generated using procedural audio techniques
- Inspired by Minecraft's iconic sound design

---

**Note**: This game is a fan project inspired by Minecraft and is not affiliated with Mojang Studios or Microsoft. 