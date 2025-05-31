// Audio manager for handling sound effects and music
class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.musicTracks = new Map();
        this.currentMusic = null;
        this.currentMusicSource = null;
        
        // Volume settings
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        
        // Audio context
        this.audioContext = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        
        // Sound buffers
        this.soundBuffers = new Map();
        
        // Initialize audio system
        this.initialize();
        
        console.log('AudioManager initialized');
    }

    // Initialize audio system
    initialize() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes
            this.masterGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            
            // Connect gain nodes
            this.sfxGain.connect(this.masterGain);
            this.musicGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            // Set initial volumes
            this.updateVolumes();
            
            // Create sound effects using oscillators and noise
            this.createSoundEffects();
            
            // Start background music
            this.playBackgroundMusic();
            
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    createSoundEffects() {
        // Create procedural sound effects
        this.createFootstepSound();
        this.createAttackSound();
        this.createHitSound();
        this.createResourceCollectSound();
        this.createEnemyDeathSound();
        this.createWaveStartSound();
    }

    createFootstepSound() {
        // Create a short noise burst for footsteps
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1 * Math.exp(-i / (sampleRate * 0.05));
        }
        
        this.soundBuffers.set('footstep', buffer);
    }

    createAttackSound() {
        // Create a whoosh sound for attacks
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const frequency = 200 - t * 150; // Descending frequency
            data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3 * Math.exp(-t * 5);
        }
        
        this.soundBuffers.set('attack', buffer);
    }

    createHitSound() {
        // Create a impact sound
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            data[i] = (Math.random() * 2 - 1) * 0.4 * Math.exp(-t * 10);
        }
        
        this.soundBuffers.set('hit', buffer);
    }

    createResourceCollectSound() {
        // Create a pleasant collection sound
        const duration = 0.4;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const frequency = 440 + t * 220; // Ascending frequency
            data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.2 * Math.exp(-t * 2);
        }
        
        this.soundBuffers.set('resource_collect', buffer);
    }

    createEnemyDeathSound() {
        // Create enemy death sound
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const frequency = 100 - t * 80; // Deep descending sound
            data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3 * Math.exp(-t * 3);
        }
        
        this.soundBuffers.set('enemy_death', buffer);
    }

    createWaveStartSound() {
        // Create wave start notification sound
        const duration = 1.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const frequency = 330 + Math.sin(t * 8) * 50; // Warbling frequency
            data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.25 * Math.exp(-t * 1);
        }
        
        this.soundBuffers.set('wave_start', buffer);
    }

    // Play a sound effect
    playSound(soundName, position = null, volume = 1.0) {
        if (!this.audioContext || !this.soundBuffers.has(soundName)) {
            console.log(`Playing sound: ${soundName}`, position ? `at position ${position.x}, ${position.y}, ${position.z}` : 'globally');
            return;
        }

        try {
            const buffer = this.soundBuffers.get(soundName);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            source.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            // Set volume
            gainNode.gain.value = volume * this.sfxVolume;
            
            // 3D positioning (simplified)
            if (position && window.game?.gameEngine?.ironGolem) {
                const player = window.game.gameEngine.ironGolem;
                const distance = position.distanceTo(player.position);
                const maxDistance = 20;
                const distanceVolume = Math.max(0, 1 - distance / maxDistance);
                gainNode.gain.value *= distanceVolume;
            }
            
            source.start();
            
            // Clean up after sound finishes
            source.onended = () => {
                source.disconnect();
                gainNode.disconnect();
            };
            
        } catch (error) {
            console.warn('Failed to play sound:', error);
        }
    }

    // Play background music
    playBackgroundMusic() {
        if (!this.audioContext) return;
        
        try {
            // Create a simple ambient background track
            this.createBackgroundMusic();
        } catch (error) {
            console.warn('Failed to start background music:', error);
        }
    }

    createBackgroundMusic() {
        // Create peaceful nature ambience
        this.createNatureAmbience();
    }

    createNatureAmbience() {
        // Create multiple layers for rich nature soundscape
        const layers = [];
        
        // Layer 1: Gentle wind (filtered noise)
        const windNoise = this.audioContext.createBufferSource();
        const windBuffer = this.createWindSound();
        const windGain = this.audioContext.createGain();
        const windFilter = this.audioContext.createBiquadFilter();
        
        windNoise.buffer = windBuffer;
        windNoise.loop = true;
        windFilter.type = 'lowpass';
        windFilter.frequency.setValueAtTime(400, this.audioContext.currentTime);
        windGain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        
        windNoise.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(this.musicGain);
        windNoise.start();
        layers.push({ source: windNoise, gain: windGain });
        
        // Layer 2: Gentle harmonic drone (peaceful base)
        const drone1 = this.audioContext.createOscillator();
        const drone2 = this.audioContext.createOscillator();
        const droneGain = this.audioContext.createGain();
        
        drone1.type = 'sine';
        drone1.frequency.setValueAtTime(55, this.audioContext.currentTime); // Low A
        drone2.type = 'sine';
        drone2.frequency.setValueAtTime(82.5, this.audioContext.currentTime); // E above
        
        droneGain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        
        drone1.connect(droneGain);
        drone2.connect(droneGain);
        droneGain.connect(this.musicGain);
        
        drone1.start();
        drone2.start();
        layers.push({ source: drone1, gain: droneGain }, { source: drone2, gain: droneGain });
        
        // Layer 3: Occasional bird chirps
        this.scheduleBirdSounds();
        
        // Layer 4: Gentle water sounds (filtered noise)
        const waterNoise = this.audioContext.createBufferSource();
        const waterBuffer = this.createWaterSound();
        const waterGain = this.audioContext.createGain();
        const waterFilter = this.audioContext.createBiquadFilter();
        
        waterNoise.buffer = waterBuffer;
        waterNoise.loop = true;
        waterFilter.type = 'highpass';
        waterFilter.frequency.setValueAtTime(200, this.audioContext.currentTime);
        waterGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        waterNoise.connect(waterFilter);
        waterFilter.connect(waterGain);
        waterGain.connect(this.musicGain);
        waterNoise.start();
        layers.push({ source: waterNoise, gain: waterGain });
        
        // Store references for cleanup
        this.currentMusicSource = { layers, drone1, drone2 };
        
        // Add gentle modulation
        this.modulateNatureAmbience(drone1, drone2, windGain, waterGain);
        
        console.log('Peaceful nature ambience started');
    }

    createWindSound() {
        const duration = 4.0; // Loop every 4 seconds
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Create gentle wind noise with slow modulation
            const noise = (Math.random() * 2 - 1) * 0.3;
            const modulation = Math.sin(t * 0.5) * 0.5 + 0.5; // Slow breathing pattern
            data[i] = noise * modulation * 0.4;
        }
        
        return buffer;
    }

    createWaterSound() {
        const duration = 3.0; // Loop every 3 seconds
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Create gentle water babbling
            const noise = (Math.random() * 2 - 1) * 0.2;
            const bubble = Math.sin(t * 20 + Math.sin(t * 3) * 2) * 0.1;
            data[i] = (noise + bubble) * 0.3;
        }
        
        return buffer;
    }

    scheduleBirdSounds() {
        const playBirdChirp = () => {
            if (!this.currentMusicSource) return;
            
            // Create a simple bird chirp
            const chirp = this.audioContext.createOscillator();
            const chirpGain = this.audioContext.createGain();
            const chirpFilter = this.audioContext.createBiquadFilter();
            
            chirp.type = 'sine';
            chirpFilter.type = 'bandpass';
            chirpFilter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            chirpFilter.Q.setValueAtTime(5, this.audioContext.currentTime);
            
            const startFreq = 800 + Math.random() * 1200;
            const endFreq = startFreq + (Math.random() - 0.5) * 400;
            
            chirp.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
            chirp.frequency.linearRampToValueAtTime(endFreq, this.audioContext.currentTime + 0.2);
            
            chirpGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            chirpGain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.01);
            chirpGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
            
            chirp.connect(chirpFilter);
            chirpFilter.connect(chirpGain);
            chirpGain.connect(this.musicGain);
            
            chirp.start();
            chirp.stop(this.audioContext.currentTime + 0.2);
            
            // Schedule next bird sound (random interval between 8-25 seconds)
            const nextChirp = 8000 + Math.random() * 17000;
            setTimeout(playBirdChirp, nextChirp);
        };
        
        // Start first bird sound after 5-15 seconds
        const firstChirp = 5000 + Math.random() * 10000;
        setTimeout(playBirdChirp, firstChirp);
    }

    modulateNatureAmbience(drone1, drone2, windGain, waterGain) {
        const modulate = () => {
            if (!this.currentMusicSource) return;
            
            const time = this.audioContext.currentTime;
            
            // Very gentle frequency modulation for drones
            const variation = Math.sin(time * 0.02) * 2; // Very slow and subtle
            drone1.frequency.setValueAtTime(55 + variation, time);
            drone2.frequency.setValueAtTime(82.5 + variation * 0.5, time);
            
            // Gentle volume breathing for wind and water
            const breathe = Math.sin(time * 0.03) * 0.05 + 1;
            windGain.gain.setValueAtTime(0.15 * breathe, time);
            waterGain.gain.setValueAtTime(0.1 * breathe, time);
            
            setTimeout(modulate, 200); // Update every 200ms
        };
        
        modulate();
    }

    // Stop current music
    stopMusic() {
        if (this.currentMusicSource) {
            try {
                this.currentMusicSource.drone1.stop();
                this.currentMusicSource.drone2.stop();
                this.currentMusicSource = null;
                console.log('Background music stopped');
            } catch (error) {
                console.warn('Error stopping music:', error);
            }
        }
    }

    // Set volume levels
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    updateVolumes() {
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }

    // Resume audio context (required for user interaction)
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Update method (called each frame)
    update(deltaTime) {
        // Resume audio context if needed
        this.resumeAudioContext();
    }

    // Cleanup
    dispose() {
        this.stopMusic();
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.sounds.clear();
        this.musicTracks.clear();
        this.soundBuffers.clear();
        console.log('AudioManager disposed');
    }
}

// Make AudioManager globally accessible
window.AudioManager = AudioManager; 