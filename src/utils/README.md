# Utilities Module

This module provides essential utility functions and helper classes used throughout the Iron Golem 3D game, including mathematical operations, geometry utilities, and local storage management.

## 📁 Files Overview

### MathUtils.js
**Purpose**: Mathematical helper functions and constants for game calculations
**Responsibilities**:
- Vector and matrix operations
- Trigonometric calculations for movement and rotation
- Random number generation with seeding
- Interpolation and easing functions
- Distance and collision calculations

**Key Functions**:
- `lerp()`: Linear interpolation between values
- `clamp()`: Constrain values within bounds
- `randomRange()`: Generate random numbers in range
- `vectorDistance()`: Calculate distance between points
- `angleToTarget()`: Calculate rotation angle to target

### GeometryUtils.js
**Purpose**: 3D geometry creation and manipulation utilities
**Responsibilities**:
- Procedural geometry generation (cubes, spheres, etc.)
- Mesh optimization and simplification
- UV mapping and texture coordinate generation
- Collision shape creation
- Low-poly mesh generation for Minecraft aesthetic

**Key Functions**:
- `createCube()`: Generate optimized cube geometry
- `createLowPolySphere()`: Create blocky sphere meshes
- `generateUVs()`: Calculate texture coordinates
- `optimizeMesh()`: Reduce vertex count and draw calls
- `createCollisionMesh()`: Generate simplified collision geometry

### StorageManager.js
**Purpose**: Local storage management for game persistence
**Responsibilities**:
- Save and load game progress and settings
- High score tracking and statistics
- Player preferences and configuration
- Data validation and error handling
- Storage quota management

**Key Functions**:
- `saveGame()`: Persist current game state
- `loadGame()`: Restore saved game data
- `saveHighScore()`: Record best performance
- `getSettings()`: Retrieve player preferences
- `clearData()`: Reset all stored data

## 🧮 Mathematical Utilities

### Core Math Functions
```javascript
class MathUtils {
    // Linear interpolation between two values
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    // Constrain value within min/max bounds
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    // Generate random number in range
    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Generate random integer in range
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Calculate distance between two 3D points
    static distance3D(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const dz = point2.z - point1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    // Calculate 2D distance (ignoring Y axis)
    static distance2D(point1, point2) {
        const dx = point2.x - point1.x;
        const dz = point2.z - point1.z;
        return Math.sqrt(dx * dx + dz * dz);
    }
    
    // Calculate angle from one point to another
    static angleToTarget(from, to) {
        const dx = to.x - from.x;
        const dz = to.z - from.z;
        return Math.atan2(dz, dx);
    }
    
    // Normalize angle to 0-2π range
    static normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    }
}
```

### Easing and Animation Functions
```javascript
class EasingUtils {
    // Smooth step interpolation
    static smoothStep(edge0, edge1, x) {
        const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    }
    
    // Ease in quadratic
    static easeInQuad(t) {
        return t * t;
    }
    
    // Ease out quadratic
    static easeOutQuad(t) {
        return t * (2 - t);
    }
    
    // Ease in-out quadratic
    static easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    // Elastic ease out (bouncy effect)
    static easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : 
               Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
    
    // Bounce ease out
    static easeOutBounce(t) {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }
}
```

### Seeded Random Number Generation
```javascript
class SeededRandom {
    constructor(seed = Date.now()) {
        this.seed = seed;
        this.current = seed;
    }
    
    // Generate next random number (0-1)
    next() {
        this.current = (this.current * 9301 + 49297) % 233280;
        return this.current / 233280;
    }
    
    // Generate random number in range
    range(min, max) {
        return min + this.next() * (max - min);
    }
    
    // Generate random integer in range
    int(min, max) {
        return Math.floor(this.range(min, max + 1));
    }
    
    // Reset to original seed
    reset() {
        this.current = this.seed;
    }
    
    // Set new seed
    setSeed(newSeed) {
        this.seed = newSeed;
        this.current = newSeed;
    }
}
```

## 🔺 Geometry Utilities

### Low-Poly Mesh Generation
```javascript
class GeometryUtils {
    // Create optimized cube geometry for Minecraft-style blocks
    static createCube(size = 1, materials = null) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        
        // Optimize for low-poly aesthetic
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        
        // Generate UV coordinates for texture atlas
        if (materials) {
            this.generateCubeUVs(geometry, materials);
        }
        
        return geometry;
    }
    
    // Create low-poly sphere with blocky appearance
    static createLowPolySphere(radius = 1, segments = 8) {
        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        
        // Flatten vertices for blocky appearance
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Quantize positions to create blocky effect
            positions[i] = Math.round(x * 4) / 4;
            positions[i + 1] = Math.round(y * 4) / 4;
            positions[i + 2] = Math.round(z * 4) / 4;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return geometry;
    }
    
    // Generate UV coordinates for cube faces
    static generateCubeUVs(geometry, materialMap) {
        const uvs = [];
        const faceUVs = {
            front: materialMap.front || [0, 0, 1, 1],
            back: materialMap.back || [0, 0, 1, 1],
            top: materialMap.top || [0, 0, 1, 1],
            bottom: materialMap.bottom || [0, 0, 1, 1],
            left: materialMap.left || [0, 0, 1, 1],
            right: materialMap.right || [0, 0, 1, 1]
        };
        
        // Apply UVs for each face
        Object.values(faceUVs).forEach(uv => {
            uvs.push(
                uv[0], uv[1],  // bottom-left
                uv[2], uv[1],  // bottom-right
                uv[2], uv[3],  // top-right
                uv[0], uv[3]   // top-left
            );
        });
        
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    }
    
    // Create simplified collision mesh
    static createCollisionMesh(originalGeometry, simplificationFactor = 0.5) {
        const simplified = originalGeometry.clone();
        
        // Reduce vertex count for performance
        const positions = simplified.attributes.position.array;
        const newPositions = [];
        
        for (let i = 0; i < positions.length; i += 9) { // Every triangle
            if (Math.random() < simplificationFactor) {
                // Keep this triangle
                for (let j = 0; j < 9; j++) {
                    newPositions.push(positions[i + j]);
                }
            }
        }
        
        simplified.setAttribute('position', 
            new THREE.Float32BufferAttribute(newPositions, 3));
        simplified.computeVertexNormals();
        
        return simplified;
    }
    
    // Merge multiple geometries for batching
    static mergeGeometries(geometries, transforms = []) {
        const merged = new THREE.BufferGeometry();
        const positions = [];
        const normals = [];
        const uvs = [];
        
        geometries.forEach((geometry, index) => {
            const transform = transforms[index] || new THREE.Matrix4();
            
            // Transform vertices
            const pos = geometry.attributes.position.array;
            const norm = geometry.attributes.normal.array;
            const uv = geometry.attributes.uv ? geometry.attributes.uv.array : [];
            
            for (let i = 0; i < pos.length; i += 3) {
                const vertex = new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2]);
                vertex.applyMatrix4(transform);
                
                positions.push(vertex.x, vertex.y, vertex.z);
                
                if (norm.length > i + 2) {
                    const normal = new THREE.Vector3(norm[i], norm[i + 1], norm[i + 2]);
                    normal.transformDirection(transform);
                    normals.push(normal.x, normal.y, normal.z);
                }
            }
            
            // Copy UVs
            uvs.push(...uv);
        });
        
        merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        if (normals.length > 0) {
            merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        }
        if (uvs.length > 0) {
            merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        }
        
        return merged;
    }
}
```

### Procedural Building Generation
```javascript
class BuildingGeometry {
    // Generate house geometry with Minecraft-style architecture
    static createHouse(width, height, depth, options = {}) {
        const geometries = [];
        
        // Foundation
        const foundation = GeometryUtils.createCube(1);
        foundation.scale(width, 0.5, depth);
        foundation.translate(0, -0.25, 0);
        geometries.push(foundation);
        
        // Walls
        const wallThickness = 0.3;
        
        // Front and back walls
        for (let side of [-1, 1]) {
            const wall = GeometryUtils.createCube(1);
            wall.scale(width, height, wallThickness);
            wall.translate(0, height / 2, side * (depth / 2 - wallThickness / 2));
            geometries.push(wall);
        }
        
        // Left and right walls
        for (let side of [-1, 1]) {
            const wall = GeometryUtils.createCube(1);
            wall.scale(wallThickness, height, depth - wallThickness * 2);
            wall.translate(side * (width / 2 - wallThickness / 2), height / 2, 0);
            geometries.push(wall);
        }
        
        // Roof
        if (options.roofType === 'peaked') {
            const roof = this.createPeakedRoof(width, depth, height * 0.3);
            roof.translate(0, height + height * 0.15, 0);
            geometries.push(roof);
        } else {
            const roof = GeometryUtils.createCube(1);
            roof.scale(width + 0.2, 0.3, depth + 0.2);
            roof.translate(0, height + 0.15, 0);
            geometries.push(roof);
        }
        
        return GeometryUtils.mergeGeometries(geometries);
    }
    
    // Create peaked roof geometry
    static createPeakedRoof(width, depth, height) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        
        // Roof vertices
        const hw = width / 2;
        const hd = depth / 2;
        
        // Base rectangle
        vertices.push(-hw, 0, -hd);  // 0
        vertices.push(hw, 0, -hd);   // 1
        vertices.push(hw, 0, hd);    // 2
        vertices.push(-hw, 0, hd);   // 3
        
        // Peak points
        vertices.push(0, height, -hd); // 4
        vertices.push(0, height, hd);  // 5
        
        // Triangular faces
        indices.push(0, 1, 4);  // Front triangle
        indices.push(2, 3, 5);  // Back triangle
        indices.push(1, 2, 4);  // Right triangle
        indices.push(4, 2, 5);  // Right triangle
        indices.push(3, 0, 5);  // Left triangle
        indices.push(5, 0, 4);  // Left triangle
        
        geometry.setAttribute('position', 
            new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        return geometry;
    }
}
```

## 💾 Storage Management

### Local Storage Wrapper
```javascript
class StorageManager {
    constructor(gameId = 'iron_golem_survival') {
        this.gameId = gameId;
        this.prefix = `${gameId}_`;
        this.maxStorageSize = 5 * 1024 * 1024; // 5MB limit
    }
    
    // Save game state
    saveGame(gameState) {
        try {
            const data = {
                timestamp: Date.now(),
                version: '1.0.0',
                gameState: gameState
            };
            
            const serialized = JSON.stringify(data);
            
            // Check storage size
            if (this.getStorageSize() + serialized.length > this.maxStorageSize) {
                this.cleanupOldData();
            }
            
            localStorage.setItem(`${this.prefix}save_game`, serialized);
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }
    
    // Load game state
    loadGame() {
        try {
            const data = localStorage.getItem(`${this.prefix}save_game`);
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            
            // Validate data structure
            if (!this.validateSaveData(parsed)) {
                console.warn('Invalid save data detected');
                return null;
            }
            
            return parsed.gameState;
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }
    
    // Save high score
    saveHighScore(score, waveNumber, statistics) {
        try {
            const highScores = this.getHighScores();
            
            const newScore = {
                score: score,
                wave: waveNumber,
                date: Date.now(),
                statistics: statistics
            };
            
            highScores.push(newScore);
            highScores.sort((a, b) => b.score - a.score);
            
            // Keep only top 10 scores
            const topScores = highScores.slice(0, 10);
            
            localStorage.setItem(`${this.prefix}high_scores`, 
                JSON.stringify(topScores));
            
            return true;
        } catch (error) {
            console.error('Failed to save high score:', error);
            return false;
        }
    }
    
    // Get high scores
    getHighScores() {
        try {
            const data = localStorage.getItem(`${this.prefix}high_scores`);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load high scores:', error);
            return [];
        }
    }
    
    // Save player settings
    saveSettings(settings) {
        try {
            const data = {
                timestamp: Date.now(),
                settings: settings
            };
            
            localStorage.setItem(`${this.prefix}settings`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }
    
    // Get player settings
    getSettings() {
        try {
            const data = localStorage.getItem(`${this.prefix}settings`);
            if (!data) return this.getDefaultSettings();
            
            const parsed = JSON.parse(data);
            return { ...this.getDefaultSettings(), ...parsed.settings };
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.getDefaultSettings();
        }
    }
    
    // Default settings
    getDefaultSettings() {
        return {
            masterVolume: 0.7,
            sfxVolume: 0.8,
            musicVolume: 0.5,
            graphics: 'medium',
            showFPS: false,
            mouseSensitivity: 1.0,
            invertY: false
        };
    }
    
    // Validate save data integrity
    validateSaveData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.timestamp || !data.version || !data.gameState) return false;
        
        const gameState = data.gameState;
        if (!gameState.player || !gameState.world || !gameState.progress) {
            return false;
        }
        
        return true;
    }
    
    // Get current storage usage
    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (key.startsWith(this.prefix)) {
                total += localStorage[key].length;
            }
        }
        return total;
    }
    
    // Clean up old data to free space
    cleanupOldData() {
        const keys = Object.keys(localStorage).filter(key => 
            key.startsWith(this.prefix));
        
        // Remove oldest saves first
        const saves = keys.filter(key => key.includes('save_game'))
            .map(key => ({
                key: key,
                data: JSON.parse(localStorage[key])
            }))
            .sort((a, b) => a.data.timestamp - b.data.timestamp);
        
        // Remove oldest 50% of saves
        const toRemove = saves.slice(0, Math.floor(saves.length / 2));
        toRemove.forEach(save => {
            localStorage.removeItem(save.key);
        });
    }
    
    // Clear all game data
    clearAllData() {
        const keys = Object.keys(localStorage).filter(key => 
            key.startsWith(this.prefix));
        
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
    }
    
    // Export save data for backup
    exportData() {
        const data = {};
        const keys = Object.keys(localStorage).filter(key => 
            key.startsWith(this.prefix));
        
        keys.forEach(key => {
            data[key] = localStorage[key];
        });
        
        return JSON.stringify(data, null, 2);
    }
    
    // Import save data from backup
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            Object.keys(data).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.setItem(key, data[key]);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
}
```

## 🔧 Performance Utilities

### Object Pooling System
```javascript
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = new Set();
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    // Get object from pool
    acquire() {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFn();
        }
        
        this.active.add(obj);
        return obj;
    }
    
    // Return object to pool
    release(obj) {
        if (this.active.has(obj)) {
            this.active.delete(obj);
            this.resetFn(obj);
            this.pool.push(obj);
        }
    }
    
    // Release all active objects
    releaseAll() {
        this.active.forEach(obj => {
            this.resetFn(obj);
            this.pool.push(obj);
        });
        this.active.clear();
    }
    
    // Get pool statistics
    getStats() {
        return {
            pooled: this.pool.length,
            active: this.active.size,
            total: this.pool.length + this.active.size
        };
    }
}
```

## 🧪 Testing Utilities

### Performance Monitoring
```javascript
class PerformanceUtils {
    static measureFunction(fn, iterations = 1000) {
        const start = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            fn();
        }
        
        const end = performance.now();
        return {
            totalTime: end - start,
            averageTime: (end - start) / iterations,
            iterations: iterations
        };
    }
    
    static measureMemory() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }
    
    static createProfiler(name) {
        return {
            start: () => console.time(name),
            end: () => console.timeEnd(name),
            mark: (label) => console.timeStamp(`${name}: ${label}`)
        };
    }
}
```

---

**Note**: All utility functions are designed to be pure (no side effects) where possible, making them easy to test and reuse throughout the game codebase. The utilities prioritize performance and memory efficiency to maintain smooth gameplay. 