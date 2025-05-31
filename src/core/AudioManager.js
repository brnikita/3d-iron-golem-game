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
        // Create simple, pleasant background music instead of noisy nature sounds
        this.createNatureAmbience();
    }

    createNatureAmbience() {
        // Create simple, pleasant background music instead of noisy nature sounds
        const layers = [];
        
        // Layer 1: Main melody (gentle sine wave)
        const melody = this.audioContext.createOscillator();
        const melodyGain = this.audioContext.createGain();
        
        melody.type = 'sine';
        melody.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
        melodyGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        melody.connect(melodyGain);
        melodyGain.connect(this.musicGain);
        melody.start();
        layers.push({ source: melody, gain: melodyGain });
        
        // Layer 2: Harmony (perfect fifth)
        const harmony = this.audioContext.createOscillator();
        const harmonyGain = this.audioContext.createGain();
        
        harmony.type = 'sine';
        harmony.frequency.setValueAtTime(330, this.audioContext.currentTime); // E4
        harmonyGain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        
        harmony.connect(harmonyGain);
        harmonyGain.connect(this.musicGain);
        harmony.start();
        layers.push({ source: harmony, gain: harmonyGain });
        
        // Layer 3: Bass foundation
        const bass = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        
        bass.type = 'triangle';
        bass.frequency.setValueAtTime(110, this.audioContext.currentTime); // A2
        bassGain.gain.setValueAtTime(0.06, this.audioContext.currentTime);
        
        bass.connect(bassGain);
        bassGain.connect(this.musicGain);
        bass.start();
        layers.push({ source: bass, gain: bassGain });
        
        // Layer 4: Gentle pad (soft background)
        const pad = this.audioContext.createOscillator();
        const padGain = this.audioContext.createGain();
        
        pad.type = 'triangle';
        pad.frequency.setValueAtTime(165, this.audioContext.currentTime); // E3
        padGain.gain.setValueAtTime(0.04, this.audioContext.currentTime);
        
        pad.connect(padGain);
        padGain.connect(this.musicGain);
        pad.start();
        layers.push({ source: pad, gain: padGain });
        
        // Store references for cleanup
        this.currentMusicSource = { layers, melody, harmony, bass, pad };
        
        // Add gentle musical modulation
        this.modulateBackgroundMusic(melody, harmony, bass, pad, melodyGain, harmonyGain, bassGain, padGain);
        
        console.log('Pleasant background music started');
    }

    modulateBackgroundMusic(melody, harmony, bass, pad, melodyGain, harmonyGain, bassGain, padGain) {
        const modulate = () => {
            if (!this.currentMusicSource) return;
            
            const time = this.audioContext.currentTime;
            
            // Very gentle frequency modulation for melody
            const variation = Math.sin(time * 0.02) * 2; // Very slow and subtle
            melody.frequency.setValueAtTime(220 + variation, time);
            harmony.frequency.setValueAtTime(330 + variation * 0.5, time);
            bass.frequency.setValueAtTime(110 + variation * 0.25, time);
            pad.frequency.setValueAtTime(165 + variation * 0.125, time);
            
            // Gentle volume breathing for melody, harmony, bass, and pad
            const breathe = Math.sin(time * 0.03) * 0.05 + 1;
            melodyGain.gain.setValueAtTime(0.1 * breathe, time);
            harmonyGain.gain.setValueAtTime(0.08 * breathe, time);
            bassGain.gain.setValueAtTime(0.06 * breathe, time);
            padGain.gain.setValueAtTime(0.04 * breathe, time);
            
            setTimeout(modulate, 200); // Update every 200ms
        };
        
        modulate();
    }

    // Stop current music
    stopMusic() {
        if (this.currentMusicSource) {
            try {
                this.currentMusicSource.melody.stop();
                this.currentMusicSource.harmony.stop();
                this.currentMusicSource.bass.stop();
                this.currentMusicSource.pad.stop();
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