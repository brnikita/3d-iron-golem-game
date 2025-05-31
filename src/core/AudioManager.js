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
        // Create a simple ambient drone
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(110, this.audioContext.currentTime); // Low A
        
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(165, this.audioContext.currentTime); // E above
        
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        oscillator1.connect(filterNode);
        oscillator2.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        oscillator1.start();
        oscillator2.start();
        
        // Add some variation over time
        this.modulateBackgroundMusic(oscillator1, oscillator2, filterNode);
        
        this.currentMusicSource = { oscillator1, oscillator2, gainNode, filterNode };
        console.log('Background music started');
    }

    modulateBackgroundMusic(osc1, osc2, filter) {
        const modulate = () => {
            if (!this.currentMusicSource) return;
            
            const time = this.audioContext.currentTime;
            const variation = Math.sin(time * 0.1) * 10;
            
            osc1.frequency.setValueAtTime(110 + variation, time);
            osc2.frequency.setValueAtTime(165 + variation * 0.5, time);
            filter.frequency.setValueAtTime(800 + Math.sin(time * 0.05) * 200, time);
            
            setTimeout(modulate, 100);
        };
        
        modulate();
    }

    // Stop current music
    stopMusic() {
        if (this.currentMusicSource) {
            try {
                this.currentMusicSource.oscillator1.stop();
                this.currentMusicSource.oscillator2.stop();
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