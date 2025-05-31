// Geometry utility functions for creating and manipulating 3D objects
class GeometryUtils {
    // Create optimized cube geometry for Minecraft-style blocks
    static createCube(size = 1) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        return geometry;
    }
    
    // Create low-poly sphere with blocky appearance
    static createLowPolySphere(radius = 1, segments = 8) {
        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        geometry.computeVertexNormals();
        return geometry;
    }
    
    // Create a simple house geometry
    static createHouseGeometry(width = 8, height = 6, depth = 8) {
        const house = new THREE.Group();
        
        // Walls
        const wallGeometry = new THREE.BoxGeometry(width, height, depth);
        const walls = new THREE.Mesh(wallGeometry);
        walls.position.y = height / 2;
        house.add(walls);
        
        // Roof
        const roofGeometry = new THREE.ConeGeometry(Math.max(width, depth) * 0.7, height * 0.5, 4);
        const roof = new THREE.Mesh(roofGeometry);
        roof.position.y = height + height * 0.25;
        roof.rotation.y = Math.PI / 4;
        house.add(roof);
        
        return house;
    }
    
    // Create tree geometry
    static createTreeGeometry() {
        const tree = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4);
        const trunk = new THREE.Mesh(trunkGeometry);
        trunk.position.y = 2;
        tree.add(trunk);
        
        // Leaves
        const leavesGeometry = new THREE.SphereGeometry(2.5, 8, 6);
        const leaves = new THREE.Mesh(leavesGeometry);
        leaves.position.y = 5;
        tree.add(leaves);
        
        return tree;
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
            const norm = geometry.attributes.normal ? geometry.attributes.normal.array : [];
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

// Make GeometryUtils globally accessible
window.GeometryUtils = GeometryUtils; 