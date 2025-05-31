# Game Assets Directory

This directory contains all visual, audio, and shader assets for the Iron Golem 3D survival game. All assets follow Minecraft-inspired low-poly aesthetics and are optimized for web performance.

## 📁 Directory Structure

### models/
Contains 3D models in GLB/GLTF format for all game entities and environment objects.

### textures/
Texture files in PNG format with pixel art styling and optimized compression.

### audio/
Sound effects and music files in OGG/MP3 format for cross-browser compatibility.

### shaders/
Custom GLSL shader files for special visual effects and optimizations.

## 🎨 Asset Guidelines

### 3D Models (models/)

#### Technical Requirements
- **Format**: GLB (preferred) or GLTF
- **Polygon Count**: 
  - Iron Golem: ~800 triangles
  - Enemies: ~300-500 triangles each
  - Buildings: ~1000 triangles max
  - Environment objects: ~100-300 triangles
- **Texture Resolution**: 64x64 to 256x256 pixels
- **Animation**: Embedded in model files
- **Optimization**: Merged vertices, optimized topology

#### Model List

**Characters:**
- `iron_golem.glb` - Player character with animations
  - Animations: idle, walk, attack, take_damage, death
  - Size: ~3x4x2 units (width x height x depth)
  - Materials: Iron texture with rust details

- `zombie.glb` - Basic melee enemy
  - Animations: idle, walk, attack, death
  - Size: ~1.8x1.8x0.6 units
  - Materials: Rotting flesh texture

- `skeleton.glb` - Ranged bow enemy
  - Animations: idle, walk, draw_bow, shoot, death
  - Size: ~1.8x1.8x0.4 units
  - Materials: Bone texture with bow

- `creeper.glb` - Explosive suicide enemy
  - Animations: idle, walk, charge, explode
  - Size: ~1.4x1.7x1.4 units
  - Materials: Green mottled texture

**Buildings:**
- `house_small.glb` - Basic village house
- `house_large.glb` - Larger residential building
- `blacksmith.glb` - Blacksmith shop with forge
- `inn.glb` - Village inn with sign
- `well.glb` - Central village well

**Environment:**
- `tree_oak.glb` - Oak tree variations (3 models)
- `tree_birch.glb` - Birch tree variations (2 models)
- `tree_pine.glb` - Pine tree variations (2 models)
- `rock_boulder.glb` - Large rock formations
- `rock_small.glb` - Small scattered rocks
- `grass_patch.glb` - Grass clump variations

**Resources:**
- `iron_ingot.glb` - Collectible iron ingot
- `bone.glb` - Collectible bone
- `emerald.glb` - Rare collectible gem

### Textures (textures/)

#### Technical Requirements
- **Format**: PNG with transparency support
- **Resolution**: 16x16, 32x32, 64x64, or 128x128 pixels
- **Style**: Pixel art with limited color palette
- **Compression**: Optimized for web (use tools like TinyPNG)
- **Naming**: Descriptive names with material type

#### Texture Atlas Organization
```
atlas_main.png (512x512) - Primary texture atlas containing:
├── Characters (256x256 section)
│   ├── iron_golem_body.png (64x64)
│   ├── iron_golem_face.png (32x32)
│   ├── zombie_skin.png (64x64)
│   ├── skeleton_bones.png (64x64)
│   └── creeper_skin.png (64x64)
├── Buildings (256x256 section)
│   ├── wood_planks.png (32x32)
│   ├── cobblestone.png (32x32)
│   ├── thatch_roof.png (32x32)
│   ├── door_wood.png (16x32)
│   └── window_glass.png (16x16)
└── Environment (256x256 section)
    ├── grass_top.png (32x32)
    ├── dirt.png (32x32)
    ├── stone.png (32x32)
    ├── tree_bark.png (32x32)
    └── leaves_green.png (32x32)
```

#### Individual Texture Files
**UI Textures:**
- `health_bar_bg.png` - Health bar background
- `health_bar_fill.png` - Health bar fill
- `iron_ingot_icon.png` - Resource icon
- `bone_icon.png` - Resource icon
- `emerald_icon.png` - Resource icon

**Effect Textures:**
- `particle_spark.png` - Combat effect particles
- `particle_smoke.png` - Explosion effects
- `particle_blood.png` - Damage effects
- `particle_pickup.png` - Resource collection effect

### Audio (audio/)

#### Technical Requirements
- **Format**: OGG (primary), MP3 (fallback)
- **Sample Rate**: 44.1kHz or 22.05kHz
- **Bit Depth**: 16-bit
- **Compression**: Optimized for web streaming
- **Length**: Sound effects <3 seconds, music loops 30-120 seconds

#### Sound Categories

**Combat Sounds:**
- `iron_golem_attack.ogg` - Heavy metal swing sound
- `iron_golem_hit.ogg` - Metal impact sound
- `iron_golem_footstep.ogg` - Heavy footstep
- `zombie_groan.ogg` - Zombie ambient sound
- `zombie_attack.ogg` - Zombie bite/claw sound
- `skeleton_bow_draw.ogg` - Bow string tension
- `skeleton_arrow_shoot.ogg` - Arrow release
- `skeleton_rattle.ogg` - Bone movement sound
- `creeper_hiss.ogg` - Creeper charge sound
- `explosion.ogg` - Creeper explosion

**Environment Sounds:**
- `wind_ambient.ogg` - Background wind loop
- `birds_chirping.ogg` - Peaceful bird sounds
- `water_flowing.ogg` - Well/stream water sound
- `fire_crackling.ogg` - Blacksmith forge sound

**UI Sounds:**
- `button_click.ogg` - Menu button press
- `button_hover.ogg` - Menu button hover
- `resource_pickup.ogg` - Item collection sound
- `upgrade_purchase.ogg` - Successful upgrade sound
- `wave_complete.ogg` - Wave completion fanfare
- `game_over.ogg` - Death/game over sound

**Music:**
- `music_village_day.ogg` - Peaceful village theme
- `music_combat.ogg` - Intense battle music
- `music_victory.ogg` - Wave completion music
- `music_menu.ogg` - Main menu background music

### Shaders (shaders/)

#### Custom Shader Files
**Vertex Shaders:**
- `basic.vert` - Standard vertex transformation
- `animated.vert` - Skeletal animation support
- `instanced.vert` - Geometry instancing for performance
- `terrain.vert` - Terrain-specific vertex processing

**Fragment Shaders:**
- `basic.frag` - Standard material rendering
- `toon.frag` - Cartoon/cel-shading effect
- `water.frag` - Animated water surface
- `particle.frag` - Particle effect rendering
- `outline.frag` - Object outline effect

**Utility Shaders:**
- `noise.glsl` - Perlin noise functions
- `lighting.glsl` - Common lighting calculations
- `fog.glsl` - Distance fog implementation

## 📦 Asset Loading Strategy

### Loading Priority
1. **Critical Assets** (loaded first):
   - Iron Golem model and textures
   - Basic enemy models
   - Essential UI textures
   - Core sound effects

2. **Secondary Assets** (loaded during gameplay):
   - Building models
   - Environment objects
   - Music files
   - Particle effects

3. **Optional Assets** (loaded on demand):
   - Rare enemy variants
   - Special effect shaders
   - Additional music tracks

### Performance Optimization

#### Texture Optimization
```javascript
// Texture loading with compression
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('assets/textures/atlas_main.png');
texture.magFilter = THREE.NearestFilter; // Pixel art style
texture.minFilter = THREE.NearestMipMapLinearFilter;
texture.generateMipmaps = true;
```

#### Model Optimization
```javascript
// Model loading with optimization
const loader = new THREE.GLTFLoader();
loader.load('assets/models/iron_golem.glb', (gltf) => {
    // Optimize materials
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.material.transparent = false; // Disable if not needed
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
});
```

#### Audio Optimization
```javascript
// Audio loading with pooling
const audioLoader = new THREE.AudioLoader();
const audioPool = new Map();

function loadAudio(url, poolSize = 3) {
    const sounds = [];
    for (let i = 0; i < poolSize; i++) {
        audioLoader.load(url, (buffer) => {
            const sound = new THREE.PositionalAudio(listener);
            sound.setBuffer(buffer);
            sounds.push(sound);
        });
    }
    audioPool.set(url, sounds);
}
```

## 🎨 Asset Creation Guidelines

### 3D Modeling Best Practices
1. **Low-Poly Modeling**: Keep polygon count minimal
2. **Proper UV Mapping**: Efficient texture space usage
3. **Consistent Scale**: Use Blender units (1 unit = 1 meter)
4. **Clean Topology**: Avoid n-gons and overlapping faces
5. **Proper Normals**: Ensure correct face orientation

### Texture Creation Guidelines
1. **Pixel Art Style**: Sharp edges, no anti-aliasing
2. **Limited Palette**: Use consistent color schemes
3. **Power-of-Two Sizes**: 16, 32, 64, 128, 256, 512 pixels
4. **Tileable Textures**: Seamless repetition for terrain
5. **Alpha Channels**: Use for transparency effects

### Audio Production Guidelines
1. **Consistent Volume**: Normalize all audio files
2. **Clean Recordings**: Remove background noise
3. **Appropriate Length**: Keep sound effects short
4. **Loop Points**: Ensure seamless music loops
5. **Spatial Compatibility**: Mono for 3D positioned sounds

## 🔧 Asset Pipeline Tools

### Recommended Software
- **3D Modeling**: Blender (free, excellent GLB export)
- **Texture Creation**: Aseprite, GIMP, or Photoshop
- **Audio Editing**: Audacity (free) or Reaper
- **Compression**: TinyPNG, ImageOptim, FFmpeg

### Export Settings
**Blender GLB Export:**
```
Format: glTF Binary (.glb)
Include: Selected Objects
Transform: +Y Up
Geometry: Apply Modifiers, UVs, Normals, Tangents
Animation: Use Current Frame, Export Deformation Bones
```

**Texture Export:**
```
Format: PNG
Color Mode: RGB (RGBA if transparency needed)
Bit Depth: 8-bit
Compression: Maximum (lossless)
```

**Audio Export:**
```
Format: OGG Vorbis
Quality: 5-7 (good balance of size/quality)
Sample Rate: 44.1kHz (22.05kHz for ambient sounds)
Channels: Mono (for 3D positioned), Stereo (for music)
```

## 📊 Asset Budget

### File Size Targets
- **Total Assets**: <50MB for initial load
- **Individual Models**: <500KB each
- **Texture Atlas**: <2MB total
- **Sound Effects**: <100KB each
- **Music Files**: <2MB each

### Performance Targets
- **Loading Time**: <10 seconds on average connection
- **Memory Usage**: <200MB total asset memory
- **Draw Calls**: <100 per frame
- **Texture Memory**: <100MB GPU memory

---

**Note**: All assets should be created with web performance in mind. Prioritize visual clarity and game feel over technical complexity. The Minecraft-inspired aesthetic allows for simple, effective designs that perform well across different devices. 