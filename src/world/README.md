# World Generation Module

This module handles the procedural generation of the village environment, including terrain, buildings, vegetation, and atmospheric elements.

## 📁 Files Overview

### WorldGenerator.js
**Purpose**: Main orchestrator for procedural world generation
**Responsibilities**:
- Coordinate village layout generation
- Manage terrain creation and modification
- Place buildings, trees, and environmental objects
- Generate navigation meshes for AI pathfinding
- Optimize world geometry for performance

**Key Classes**:
- `WorldGenerator`: Main generation coordinator
- `GenerationSettings`: Configurable parameters for world creation
- `BiomeManager`: Different environmental themes
- `NavigationMesh`: AI pathfinding grid generation

### Village.js
**Purpose**: Procedural village layout and building placement system
**Responsibilities**:
- Generate village boundaries and layout patterns
- Create and place various building types (houses, shops, wells)
- Establish road networks and pathways
- Manage village population and activity areas
- Handle building destruction and reconstruction

**Key Classes**:
- `Village`: Main village container and manager
- `Building`: Individual structure with interior/exterior
- `Road`: Pathway system for navigation
- `VillageLayout`: Algorithmic layout generation

### Terrain.js
**Purpose**: Ground terrain generation and environmental features
**Responsibilities**:
- Generate base terrain heightmaps
- Create grass, dirt, and stone surface materials
- Place natural features (rocks, flowers, water)
- Manage terrain collision meshes
- Handle terrain modification and damage

**Key Classes**:
- `Terrain`: Main terrain mesh and collision system
- `TerrainChunk`: Optimized terrain segments for LOD
- `EnvironmentalFeature`: Trees, rocks, vegetation
- `WaterSystem`: Ponds, streams, and water effects

## 🏘️ Village Generation Algorithm

### Layout Generation Process
```javascript
const VILLAGE_GENERATION_STEPS = {
    1: 'Define village boundaries (circular or organic shape)',
    2: 'Generate central plaza or well area',
    3: 'Create main roads radiating from center',
    4: 'Subdivide into building plots',
    5: 'Place essential buildings (blacksmith, inn, houses)',
    6: 'Add secondary roads and pathways',
    7: 'Populate with decorative elements',
    8: 'Generate navigation mesh for AI'
};
```

### Building Types and Specifications
```javascript
const BUILDING_TYPES = {
    HOUSE: {
        size: { width: 8, depth: 8, height: 6 },
        probability: 0.6,
        materials: ['wood', 'stone', 'thatch'],
        features: ['door', 'windows', 'chimney']
    },
    BLACKSMITH: {
        size: { width: 10, depth: 12, height: 8 },
        probability: 0.1,
        materials: ['stone', 'metal', 'wood'],
        features: ['forge', 'anvil', 'large_door']
    },
    INN: {
        size: { width: 12, depth: 10, height: 10 },
        probability: 0.05,
        materials: ['wood', 'stone'],
        features: ['sign', 'multiple_doors', 'balcony']
    },
    WELL: {
        size: { width: 4, depth: 4, height: 3 },
        probability: 0.05,
        materials: ['stone'],
        features: ['water', 'bucket', 'rope']
    }
};
```

## 🌍 Terrain Generation System

### Heightmap Generation
```javascript
class TerrainGenerator {
    generateHeightmap(width, height, settings) {
        const heightmap = new Float32Array(width * height);
        
        // Base terrain using Perlin noise
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < height; z++) {
                const index = x + z * width;
                
                // Multiple octaves for natural variation
                let elevation = 0;
                elevation += this.noise(x * 0.01, z * 0.01) * 10; // Large features
                elevation += this.noise(x * 0.05, z * 0.05) * 3;  // Medium details
                elevation += this.noise(x * 0.1, z * 0.1) * 1;    // Fine details
                
                // Flatten village area
                const distanceFromCenter = Math.sqrt(
                    Math.pow(x - width/2, 2) + Math.pow(z - height/2, 2)
                );
                
                if (distanceFromCenter < settings.villageRadius) {
                    const flattenFactor = 1 - (distanceFromCenter / settings.villageRadius);
                    elevation *= (1 - flattenFactor * 0.8);
                }
                
                heightmap[index] = elevation;
            }
        }
        
        return heightmap;
    }
}
```

### Environmental Features
```javascript
const ENVIRONMENTAL_FEATURES = {
    TREES: {
        types: ['oak', 'birch', 'pine'],
        density: 0.3, // per square unit
        minDistance: 5, // from buildings
        heightVariation: 0.2
    },
    ROCKS: {
        types: ['boulder', 'stone_pile', 'crystal'],
        density: 0.1,
        minDistance: 3,
        sizeVariation: 0.5
    },
    VEGETATION: {
        types: ['grass_patch', 'flowers', 'bushes'],
        density: 0.8,
        minDistance: 1,
        seasonalVariation: true
    }
};
```

## 🏗️ Building Generation System

### Procedural Architecture
```javascript
class BuildingGenerator {
    generateBuilding(type, position, settings) {
        const building = new Building(type, position);
        
        // Generate base structure
        this.createFoundation(building, settings);
        this.createWalls(building, settings);
        this.createRoof(building, settings);
        
        // Add architectural features
        this.addDoors(building, settings);
        this.addWindows(building, settings);
        this.addDecorations(building, settings);
        
        // Create interior (simplified for performance)
        this.generateInterior(building, settings);
        
        return building;
    }
    
    createWalls(building, settings) {
        const { width, depth, height } = building.dimensions;
        const wallThickness = 0.3;
        
        // Generate wall segments with openings for doors/windows
        const walls = [
            this.createWallSegment('north', width, height, wallThickness),
            this.createWallSegment('south', width, height, wallThickness),
            this.createWallSegment('east', depth, height, wallThickness),
            this.createWallSegment('west', depth, height, wallThickness)
        ];
        
        building.addWalls(walls);
    }
}
```

### Material System
```javascript
const BUILDING_MATERIALS = {
    WOOD: {
        texture: 'wood_planks.png',
        color: 0x8B4513,
        roughness: 0.8,
        durability: 0.7
    },
    STONE: {
        texture: 'cobblestone.png',
        color: 0x696969,
        roughness: 0.9,
        durability: 1.0
    },
    THATCH: {
        texture: 'thatch_roof.png',
        color: 0xDAA520,
        roughness: 1.0,
        durability: 0.5
    }
};
```

## 🗺️ Navigation Mesh Generation

### Pathfinding Grid Creation
```javascript
class NavigationMesh {
    generateNavMesh(terrain, buildings, gridSize = 1) {
        const bounds = terrain.getBounds();
        const width = Math.ceil(bounds.width / gridSize);
        const height = Math.ceil(bounds.height / gridSize);
        
        this.grid = new Array(width * height);
        
        // Mark walkable areas
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < height; z++) {
                const worldX = bounds.min.x + x * gridSize;
                const worldZ = bounds.min.z + z * gridSize;
                const index = x + z * width;
                
                // Check if position is walkable
                const isWalkable = this.isPositionWalkable(
                    worldX, worldZ, terrain, buildings
                );
                
                this.grid[index] = {
                    x: worldX,
                    z: worldZ,
                    walkable: isWalkable,
                    cost: isWalkable ? 1 : Infinity
                };
            }
        }
        
        // Generate connections between adjacent walkable nodes
        this.generateConnections();
    }
    
    isPositionWalkable(x, z, terrain, buildings) {
        // Check terrain slope
        const slope = terrain.getSlopeAt(x, z);
        if (slope > 0.5) return false;
        
        // Check building collisions
        for (const building of buildings) {
            if (building.containsPoint(x, z)) return false;
        }
        
        return true;
    }
}
```

## 🎨 Visual Aesthetics

### Low-Poly Modeling Guidelines
- **Vertex Count**: Maximum 1000 vertices per building
- **Texture Resolution**: 64x64 or 128x128 pixels
- **Color Palette**: Limited to 16 colors per texture
- **Geometric Style**: Sharp edges, minimal curves

### Lighting and Atmosphere
```javascript
const LIGHTING_SETTINGS = {
    SUN: {
        color: 0xFFFFE0,
        intensity: 1.0,
        position: new THREE.Vector3(100, 100, 50),
        castShadow: true
    },
    AMBIENT: {
        color: 0x404040,
        intensity: 0.3
    },
    FOG: {
        color: 0xCCCCCC,
        near: 50,
        far: 200,
        density: 0.01
    }
};
```

### Seasonal Variations
```javascript
const SEASONAL_THEMES = {
    SPRING: {
        grassColor: 0x90EE90,
        treeColor: 0x228B22,
        skyColor: 0x87CEEB,
        weatherEffects: ['light_rain']
    },
    SUMMER: {
        grassColor: 0x32CD32,
        treeColor: 0x006400,
        skyColor: 0x4169E1,
        weatherEffects: ['clear']
    },
    AUTUMN: {
        grassColor: 0xDAA520,
        treeColor: 0xFF8C00,
        skyColor: 0x708090,
        weatherEffects: ['falling_leaves']
    },
    WINTER: {
        grassColor: 0xF0F8FF,
        treeColor: 0x2F4F4F,
        skyColor: 0x778899,
        weatherEffects: ['snow']
    }
};
```

## ⚡ Performance Optimization

### Level of Detail (LOD) System
```javascript
class LODManager {
    updateLOD(camera, objects) {
        objects.forEach(object => {
            const distance = camera.position.distanceTo(object.position);
            
            if (distance < 25) {
                object.setLOD('high');
            } else if (distance < 75) {
                object.setLOD('medium');
            } else {
                object.setLOD('low');
            }
        });
    }
}
```

### Chunk-based Loading
- **Chunk Size**: 64x64 units
- **Active Chunks**: 3x3 grid around player
- **Streaming**: Load/unload chunks based on player movement
- **Memory Management**: Dispose unused geometries and textures

### Occlusion Culling
- **Frustum Culling**: Only render objects in camera view
- **Distance Culling**: Hide objects beyond render distance
- **Building Interiors**: Only render when player is inside

## 🔗 System Integration

### Physics Integration
- **Collision Meshes**: Simplified geometry for physics simulation
- **Trigger Zones**: Areas for resource spawning and events
- **Destructible Elements**: Buildings that can be damaged

### Audio Integration
- **Ambient Sounds**: Wind, birds, village activity
- **Spatial Audio**: 3D positioned environmental sounds
- **Dynamic Music**: Adaptive soundtrack based on location

### Gameplay Integration
- **Spawn Points**: Designated areas for enemy waves
- **Safe Zones**: Areas where enemies cannot spawn
- **Interactive Elements**: Doors, chests, village NPCs (future)

## 🧪 Testing and Validation

### Generation Testing
- **Consistency**: Same seed produces identical worlds
- **Performance**: Generation time under 5 seconds
- **Variety**: Different layouts with same parameters
- **Collision**: No overlapping buildings or invalid placements

### Visual Quality
- **Aesthetic Consistency**: Unified art style across all elements
- **Performance**: Maintain 60 FPS with full village loaded
- **Memory Usage**: Under 200MB for complete world
- **Loading Time**: Progressive loading with visual feedback

---

**Note**: The world generation system is designed to be deterministic and reproducible, allowing for consistent gameplay experiences while maintaining visual variety and performance optimization. 