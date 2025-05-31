// World generator for creating the village environment
class WorldGenerator {
    constructor() {
        this.worldSize = 100;
        this.villageRadius = 20;
        console.log('WorldGenerator initialized');
    }

    generateWorld() {
        const world = new THREE.Group();
        world.name = 'World';
        
        // Generate terrain
        const terrain = this.generateTerrain();
        world.add(terrain);
        
        // Generate village buildings
        const village = this.generateVillage();
        world.add(village);
        
        // Generate environment objects
        const environment = this.generateEnvironment();
        world.add(environment);
        
        console.log('World generated');
        return world;
    }

    generateTerrain() {
        const terrain = new THREE.Group();
        terrain.name = 'Terrain';
        
        // Create ground plane
        const groundGeometry = new THREE.PlaneGeometry(this.worldSize, this.worldSize);
        const assetLoader = window.game?.gameEngine?.assetLoader;
        const grassTexture = assetLoader?.getAsset('textures/grass');
        
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            map: grassTexture,
            color: 0x4CAF50 
        });
        
        if (grassTexture) {
            grassTexture.wrapS = THREE.RepeatWrapping;
            grassTexture.wrapT = THREE.RepeatWrapping;
            grassTexture.repeat.set(20, 20);
        }
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.name = 'Ground';
        
        terrain.add(ground);
        
        return terrain;
    }

    generateVillage() {
        const village = new THREE.Group();
        village.name = 'Village';
        
        // Generate a few simple buildings
        const buildingPositions = [
            { x: 10, z: 10 },
            { x: -10, z: 10 },
            { x: 10, z: -10 },
            { x: -10, z: -10 },
            { x: 0, z: 15 }
        ];
        
        buildingPositions.forEach((pos, index) => {
            const building = this.createBuilding(pos.x, pos.z);
            building.name = `Building_${index}`;
            village.add(building);
        });
        
        // Add a central well
        const well = this.createWell();
        well.position.set(0, 0, 0);
        well.name = 'Well';
        village.add(well);
        
        return village;
    }

    createBuilding(x, z) {
        const building = new THREE.Group();
        
        // Building dimensions
        const width = 6 + Math.random() * 4;
        const height = 4 + Math.random() * 2;
        const depth = 6 + Math.random() * 4;
        
        // Get textures
        const assetLoader = window.game?.gameEngine?.assetLoader;
        const woodTexture = assetLoader?.getAsset('textures/wood');
        const stoneTexture = assetLoader?.getAsset('textures/stone');
        
        // Create walls
        const wallGeometry = new THREE.BoxGeometry(width, height, depth);
        const wallMaterial = new THREE.MeshLambertMaterial({ 
            map: woodTexture,
            color: 0x8D6E63 
        });
        
        const walls = new THREE.Mesh(wallGeometry, wallMaterial);
        walls.position.y = height / 2;
        walls.castShadow = true;
        walls.receiveShadow = true;
        
        building.add(walls);
        
        // Create roof
        const roofGeometry = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, height * 0.5, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513 
        });
        
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = height + height * 0.25;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        
        building.add(roof);
        
        // Position building
        building.position.set(x, 0, z);
        
        return building;
    }

    createWell() {
        const well = new THREE.Group();
        
        // Get stone texture
        const assetLoader = window.game?.gameEngine?.assetLoader;
        const stoneTexture = assetLoader?.getAsset('textures/stone');
        
        // Well base
        const baseGeometry = new THREE.CylinderGeometry(2, 2, 1);
        const baseMaterial = new THREE.MeshLambertMaterial({ 
            map: stoneTexture,
            color: 0x9E9E9E 
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        base.castShadow = true;
        base.receiveShadow = true;
        
        well.add(base);
        
        // Well rim
        const rimGeometry = new THREE.TorusGeometry(2, 0.2, 8, 16);
        const rim = new THREE.Mesh(rimGeometry, baseMaterial);
        rim.position.y = 1;
        rim.castShadow = true;
        
        well.add(rim);
        
        return well;
    }

    generateEnvironment() {
        const environment = new THREE.Group();
        environment.name = 'Environment';
        
        // Generate trees around the village
        for (let i = 0; i < 20; i++) {
            const tree = this.createTree();
            
            // Position trees outside village area
            let x, z;
            do {
                x = (Math.random() - 0.5) * this.worldSize * 0.8;
                z = (Math.random() - 0.5) * this.worldSize * 0.8;
            } while (Math.sqrt(x * x + z * z) < this.villageRadius + 5);
            
            tree.position.set(x, 0, z);
            tree.name = `Tree_${i}`;
            environment.add(tree);
        }
        
        // Generate rocks
        for (let i = 0; i < 10; i++) {
            const rock = this.createRock();
            
            let x, z;
            do {
                x = (Math.random() - 0.5) * this.worldSize * 0.6;
                z = (Math.random() - 0.5) * this.worldSize * 0.6;
            } while (Math.sqrt(x * x + z * z) < this.villageRadius + 2);
            
            rock.position.set(x, 0, z);
            rock.name = `Rock_${i}`;
            environment.add(rock);
        }
        
        return environment;
    }

    createTree() {
        const tree = new THREE.Group();
        
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        
        tree.add(trunk);
        
        // Tree leaves
        const leavesGeometry = new THREE.SphereGeometry(2.5, 8, 6);
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 5;
        leaves.castShadow = true;
        
        tree.add(leaves);
        
        return tree;
    }

    createRock() {
        const rock = new THREE.Group();
        
        // Random rock shape
        const size = 0.5 + Math.random() * 1.5;
        const rockGeometry = new THREE.DodecahedronGeometry(size);
        const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        
        const rockMesh = new THREE.Mesh(rockGeometry, rockMaterial);
        rockMesh.position.y = size * 0.5;
        rockMesh.rotation.x = Math.random() * Math.PI;
        rockMesh.rotation.y = Math.random() * Math.PI;
        rockMesh.rotation.z = Math.random() * Math.PI;
        rockMesh.castShadow = true;
        rockMesh.receiveShadow = true;
        
        rock.add(rockMesh);
        
        return rock;
    }

    // Get spawn points for enemies (around village perimeter)
    getEnemySpawnPoints(count) {
        const spawnPoints = [];
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
            const distance = this.villageRadius + 10 + Math.random() * 10;
            
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            
            spawnPoints.push(new THREE.Vector3(x, 0, z));
        }
        
        return spawnPoints;
    }
}

// Make WorldGenerator globally accessible
window.WorldGenerator = WorldGenerator; 