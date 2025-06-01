// World generator for creating the village environment
class WorldGenerator {
    constructor() {
        this.worldSize = 100;
        this.villageRadius = 20;
        this.playgroundRadius = 35; // Safe area for players
        this.forestBoundaryRadius = 45; // Dense forest boundary
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
        
        // Generate forest boundaries
        const forestBoundary = this.generateForestBoundary();
        world.add(forestBoundary);
        
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
        
        // Add collision data for physics system
        building.userData.isCollider = true;
        building.userData.collisionRadius = Math.max(width, depth) * 0.6; // Slightly smaller than visual size
        building.userData.type = 'building';
        
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
        
        // Add collision data for physics system
        well.userData.isCollider = true;
        well.userData.collisionRadius = 2.2; // Slightly larger than visual radius
        well.userData.type = 'well';
        
        return well;
    }

    generateEnvironment() {
        const environment = new THREE.Group();
        environment.name = 'Environment';
        
        // Generate trees around the village (but inside playground area)
        for (let i = 0; i < 15; i++) {
            const tree = this.createTree();
            
            // Position trees outside village area but inside playground
            let x, z;
            do {
                x = (Math.random() - 0.5) * this.playgroundRadius * 1.5;
                z = (Math.random() - 0.5) * this.playgroundRadius * 1.5;
            } while (Math.sqrt(x * x + z * z) < this.villageRadius + 5 || 
                     Math.sqrt(x * x + z * z) > this.playgroundRadius - 5);
            
            tree.position.set(x, 0, z);
            tree.name = `Tree_${i}`;
            
            // Add collision data for physics system
            tree.userData.isCollider = true;
            tree.userData.collisionRadius = 2.0; // Account for trunk and lower branches
            tree.userData.type = 'tree';
            
            environment.add(tree);
        }
        
        // Generate rocks
        for (let i = 0; i < 8; i++) {
            const rock = this.createRock();
            
            let x, z;
            do {
                x = (Math.random() - 0.5) * this.playgroundRadius * 1.2;
                z = (Math.random() - 0.5) * this.playgroundRadius * 1.2;
            } while (Math.sqrt(x * x + z * z) < this.villageRadius + 2);
            
            rock.position.set(x, 0, z);
            rock.name = `Rock_${i}`;
            
            // Add collision data for physics system
            rock.userData.isCollider = true;
            rock.userData.collisionRadius = rock.userData.size + 0.5; // Slightly larger than visual size
            rock.userData.type = 'rock';
            
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
        
        // Store size for collision detection
        rock.userData.size = size;
        
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

    generateForestBoundary() {
        const forestBoundary = new THREE.Group();
        forestBoundary.name = 'ForestBoundary';
        
        // Create dense forest wall around the playground
        const treeCount = 80; // Dense forest
        for (let i = 0; i < treeCount; i++) {
            const tree = this.createBoundaryTree();
            
            // Position trees in a ring around the playground
            const angle = (i / treeCount) * Math.PI * 2;
            const radiusVariation = (Math.random() - 0.5) * 8; // Random depth
            const radius = this.forestBoundaryRadius + radiusVariation;
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            tree.position.set(x, 0, z);
            tree.name = `BoundaryTree_${i}`;
            
            // Add collision data
            tree.userData.isCollider = true;
            tree.userData.collisionRadius = 2.0;
            
            forestBoundary.add(tree);
        }
        
        // Add some additional random trees for density
        for (let i = 0; i < 40; i++) {
            const tree = this.createBoundaryTree();
            
            // Position between boundary and edge
            const angle = Math.random() * Math.PI * 2;
            const radius = this.forestBoundaryRadius + 5 + Math.random() * 15;
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            tree.position.set(x, 0, z);
            tree.name = `ExtraTree_${i}`;
            
            // Add collision data
            tree.userData.isCollider = true;
            tree.userData.collisionRadius = 2.0;
            
            forestBoundary.add(tree);
        }
        
        // Create invisible collision boundary
        this.createInvisibleBoundary(forestBoundary);
        
        return forestBoundary;
    }

    createBoundaryTree() {
        const tree = new THREE.Group();
        
        // Larger, more imposing trees for boundary
        const trunkHeight = 6 + Math.random() * 4;
        const trunkRadius = 0.4 + Math.random() * 0.3;
        
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        
        tree.add(trunk);
        
        // Tree leaves (larger and darker)
        const leavesRadius = 3 + Math.random() * 2;
        const leavesGeometry = new THREE.SphereGeometry(leavesRadius, 8, 6);
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x1B5E20 }); // Darker green
        
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = trunkHeight + leavesRadius * 0.5;
        leaves.castShadow = true;
        
        tree.add(leaves);
        
        // Add some undergrowth
        if (Math.random() > 0.5) {
            const bushGeometry = new THREE.SphereGeometry(1 + Math.random() * 0.5, 6, 4);
            const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x2E7D32 });
            
            const bush = new THREE.Mesh(bushGeometry, bushMaterial);
            bush.position.y = 0.5;
            bush.position.x = (Math.random() - 0.5) * 2;
            bush.position.z = (Math.random() - 0.5) * 2;
            bush.castShadow = true;
            
            tree.add(bush);
        }
        
        return tree;
    }

    createInvisibleBoundary(forestBoundary) {
        // Create invisible collision cylinders around the boundary
        const boundarySegments = 32;
        for (let i = 0; i < boundarySegments; i++) {
            const angle = (i / boundarySegments) * Math.PI * 2;
            const x = Math.cos(angle) * this.forestBoundaryRadius;
            const z = Math.sin(angle) * this.forestBoundaryRadius;
            
            // Create invisible collision object
            const colliderGeometry = new THREE.CylinderGeometry(3, 3, 10);
            const colliderMaterial = new THREE.MeshBasicMaterial({ 
                transparent: true, 
                opacity: 0,
                visible: false 
            });
            
            const collider = new THREE.Mesh(colliderGeometry, colliderMaterial);
            collider.position.set(x, 5, z);
            collider.name = `BoundaryCollider_${i}`;
            
            // Add collision data
            collider.userData.isCollider = true;
            collider.userData.isBoundary = true;
            collider.userData.collisionRadius = 3.0;
            
            forestBoundary.add(collider);
        }
    }
}

// Make WorldGenerator globally accessible
window.WorldGenerator = WorldGenerator; 