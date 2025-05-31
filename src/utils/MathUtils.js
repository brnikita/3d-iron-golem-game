// Mathematical utility functions for the game
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
    
    // Convert degrees to radians
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Convert radians to degrees
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
}

// Make MathUtils globally accessible
window.MathUtils = MathUtils; 