// Asset loader for managing game assets
class AssetLoader {
    constructor() {
        this.loadedAssets = new Map();
        this.loadingPromises = new Map();
        this.totalAssets = 0;
        this.loadedCount = 0;
        this.onProgress = null;
        
        // Three.js loaders
        this.textureLoader = new THREE.TextureLoader();
        
        // Initialize GLTFLoader only if available
        if (THREE.GLTFLoader) {
            this.gltfLoader = new THREE.GLTFLoader();
        } else {
            console.warn('GLTFLoader not available, using placeholder models');
            this.gltfLoader = null;
        }
        
        // Asset manifest - defines what assets to load
        this.assetManifest = {
            textures: {
                'grass': 'assets/textures/grass.png',
                'dirt': 'assets/textures/dirt.png',
                'stone': 'assets/textures/stone.png',
                'wood': 'assets/textures/wood.png',
                'iron': 'assets/textures/iron.png'
            },
            models: {
                'iron_golem': 'assets/models/iron_golem.glb',
                'zombie': 'assets/models/zombie.glb',
                'skeleton': 'assets/models/skeleton.glb',
                'house': 'assets/models/house.glb'
            },
            audio: {
                'attack': 'assets/audio/attack.ogg',
                'footstep': 'assets/audio/footstep.ogg',
                'ambient': 'assets/audio/ambient.ogg'
            }
        };
        
        // Critical assets that must load before game starts
        this.criticalAssets = [
            'textures/grass',
            'textures/dirt',
            'textures/stone'
        ];
    }

    async loadCriticalAssets() {
        console.log('Loading critical assets...');
        
        // Create placeholder assets for development
        await this.createPlaceholderAssets();
        
        // Calculate total assets for progress tracking
        this.totalAssets = this.criticalAssets.length;
        this.loadedCount = 0;
        
        // Load critical assets
        const promises = this.criticalAssets.map(assetPath => {
            return this.loadAsset(assetPath);
        });
        
        await Promise.all(promises);
        
        console.log('Critical assets loaded');
    }

    async createPlaceholderAssets() {
        // Create placeholder textures using canvas
        this.createPlaceholderTexture('grass', '#4CAF50'); // Green
        this.createPlaceholderTexture('dirt', '#8D6E63'); // Brown
        this.createPlaceholderTexture('stone', '#9E9E9E'); // Gray
        this.createPlaceholderTexture('wood', '#795548'); // Dark brown
        this.createPlaceholderTexture('iron', '#607D8B'); // Blue gray
        
        // Create placeholder geometries
        this.createPlaceholderGeometries();
        
        console.log('Placeholder assets created');
    }

    createPlaceholderTexture(name, color) {
        // Create a 32x32 canvas with solid color
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 32, 32);
        
        // Add some texture pattern
        ctx.fillStyle = this.lightenColor(color, 20);
        for (let x = 0; x < 32; x += 4) {
            for (let y = 0; y < 32; y += 4) {
                if ((x + y) % 8 === 0) {
                    ctx.fillRect(x, y, 2, 2);
                }
            }
        }
        
        // Create Three.js texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        this.loadedAssets.set(`textures/${name}`, texture);
    }

    createPlaceholderGeometries() {
        // Iron Golem geometry (simple box for now)
        const ironGolemGeometry = new THREE.BoxGeometry(2, 4, 1);
        this.loadedAssets.set('models/iron_golem', {
            scene: new THREE.Mesh(ironGolemGeometry, new THREE.MeshLambertMaterial({ 
                map: this.getAsset('textures/iron') 
            })),
            animations: []
        });
        
        // Enemy geometries
        const zombieGeometry = new THREE.BoxGeometry(1, 2, 0.5);
        this.loadedAssets.set('models/zombie', {
            scene: new THREE.Mesh(zombieGeometry, new THREE.MeshLambertMaterial({ 
                color: 0x4CAF50 
            })),
            animations: []
        });
        
        const skeletonGeometry = new THREE.BoxGeometry(0.8, 2, 0.4);
        this.loadedAssets.set('models/skeleton', {
            scene: new THREE.Mesh(skeletonGeometry, new THREE.MeshLambertMaterial({ 
                color: 0xF5F5DC 
            })),
            animations: []
        });
        
        // Building geometry
        const houseGeometry = new THREE.BoxGeometry(8, 6, 8);
        this.loadedAssets.set('models/house', {
            scene: new THREE.Mesh(houseGeometry, new THREE.MeshLambertMaterial({ 
                map: this.getAsset('textures/wood') 
            })),
            animations: []
        });
        
        console.log('Placeholder geometries created');
    }

    lightenColor(color, percent) {
        // Simple color lightening function
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    async loadAsset(assetPath) {
        // Check if already loaded
        if (this.loadedAssets.has(assetPath)) {
            return this.loadedAssets.get(assetPath);
        }
        
        // Check if already loading
        if (this.loadingPromises.has(assetPath)) {
            return this.loadingPromises.get(assetPath);
        }
        
        // Determine asset type and load accordingly
        const [type, name] = assetPath.split('/');
        let promise;
        
        switch (type) {
            case 'textures':
                promise = this.loadTexture(this.assetManifest.textures[name]);
                break;
            case 'models':
                promise = this.loadModel(this.assetManifest.models[name]);
                break;
            case 'audio':
                promise = this.loadAudio(this.assetManifest.audio[name]);
                break;
            default:
                throw new Error(`Unknown asset type: ${type}`);
        }
        
        this.loadingPromises.set(assetPath, promise);
        
        try {
            const asset = await promise;
            this.loadedAssets.set(assetPath, asset);
            this.loadedCount++;
            
            // Update progress
            if (this.onProgress) {
                this.onProgress(this.loadedCount / this.totalAssets);
            }
            
            return asset;
        } catch (error) {
            console.warn(`Failed to load asset ${assetPath}:`, error);
            // Return placeholder or null
            return null;
        } finally {
            this.loadingPromises.delete(assetPath);
        }
    }

    async loadTexture(url) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject(new Error('No URL provided for texture'));
                return;
            }
            
            this.textureLoader.load(
                url,
                (texture) => {
                    // Configure texture for pixel art style
                    texture.magFilter = THREE.NearestFilter;
                    texture.minFilter = THREE.NearestFilter;
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    resolve(texture);
                },
                (progress) => {
                    // Loading progress
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    async loadModel(url) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject(new Error('No URL provided for model'));
                return;
            }
            
            if (this.gltfLoader) {
                this.gltfLoader.load(
                    url,
                    (gltf) => {
                        // Process the loaded model
                        gltf.scene.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                                
                                // Ensure materials are compatible
                                if (child.material) {
                                    child.material.needsUpdate = true;
                                }
                            }
                        });
                        
                        resolve(gltf);
                    },
                    (progress) => {
                        // Loading progress
                    },
                    (error) => {
                        reject(error);
                    }
                );
            } else {
                // Return placeholder model when GLTFLoader is not available
                console.log(`Creating placeholder for model: ${url}`);
                resolve(null);
            }
        });
    }

    async loadAudio(url) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject(new Error('No URL provided for audio'));
                return;
            }
            
            // For now, just resolve with a placeholder
            // In a full implementation, you'd use THREE.AudioLoader
            resolve({
                url: url,
                buffer: null // Placeholder
            });
        });
    }

    getAsset(assetPath) {
        return this.loadedAssets.get(assetPath);
    }

    hasAsset(assetPath) {
        return this.loadedAssets.has(assetPath);
    }

    // Preload additional assets in background
    async preloadAssets(assetPaths) {
        const promises = assetPaths.map(path => this.loadAsset(path));
        return Promise.allSettled(promises);
    }

    // Get loading progress
    getProgress() {
        return this.totalAssets > 0 ? this.loadedCount / this.totalAssets : 0;
    }

    // Clear loaded assets to free memory
    clearAssets() {
        this.loadedAssets.forEach((asset, key) => {
            if (asset && asset.dispose) {
                asset.dispose();
            }
        });
        this.loadedAssets.clear();
        this.loadingPromises.clear();
        this.loadedCount = 0;
    }

    // Get memory usage estimate
    getMemoryUsage() {
        let totalSize = 0;
        this.loadedAssets.forEach((asset, key) => {
            if (asset && asset.image) {
                totalSize += asset.image.width * asset.image.height * 4; // RGBA
            }
        });
        return totalSize;
    }
}

// Make AssetLoader globally accessible
window.AssetLoader = AssetLoader; 