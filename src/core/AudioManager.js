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
        this.musicVolume = 0.6; // Increased from 0.3 to 0.6 (2x louder)
        
        // Audio context
        this.audioContext = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        
        // Audio buffers for real sounds
        this.audioBuffers = new Map();
        this.loadingPromises = new Map();
        
        // Audio file URLs (local files first, then fallbacks)
        this.audioUrls = {
            // Use the uploaded MP3 files
            'background_music': [
                'assets/audio/forest_ambience.mp3'
            ],
            'footstep': [
                'assets/audio/footstep.mp3'
            ],
            'attack': [
                'assets/audio/sword_slash.mp3'
            ],
            'enemy_attack': [
                'assets/audio/zombie_attack_sound.mp3',  // Use the new zombie attack sound
                'assets/audio/sword_slash.mp3'     // Fallback to sword slash if zombie sound is missing
            ],
            'hit': [
                'assets/audio/metal_hit.mp3'
            ],
            'resource_collect': [
                'assets/audio/pickup.mp3'
            ],
            'enemy_death': [
                'assets/audio/enemy_death.mp3'
            ],
            'wave_start': [
                'assets/audio/wave_start.mp3'
            ]
        };
        
        // Initialize audio system
        this.initialize();
        
        console.log('AudioManager initialized with real audio files');
    }

    // Initialize audio system
    async initialize() {
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
            
            // Load audio files
            await this.loadAudioFiles();
            
            // Start background music
            this.playBackgroundMusic();
            
            console.log('Audio system initialized successfully with real sounds');
        } catch (error) {
            console.warn('Audio initialization failed, falling back to simple tones:', error);
            this.createFallbackSounds();
        }
    }

    async loadAudioFiles() {
        console.log('Loading real audio files...');
        
        const loadPromises = Object.entries(this.audioUrls).map(async ([soundName, urls]) => {
            try {
                const buffer = await this.loadAudioFile(urls);
                this.audioBuffers.set(soundName, buffer);
                console.log(`✅ Loaded: ${soundName}`);
            } catch (error) {
                console.warn(`❌ Failed to load ${soundName}:`, error);
                // Create fallback sound
                this.createFallbackSound(soundName);
            }
        });
        
        await Promise.allSettled(loadPromises);
        console.log(`Loaded ${this.audioBuffers.size} audio files`);
    }

    async loadAudioFile(urls) {
        if (this.loadingPromises.has(urls)) {
            return this.loadingPromises.get(urls);
        }
        
        const promise = new Promise(async (resolve, reject) => {
            try {
                // Try to fetch the audio file
                for (const url of urls) {
                    console.log(`🔄 Trying to load: ${url}`);
                    try {
                        const response = await fetch(url); // Remove CORS for same-origin
                        console.log(`📡 Response status for ${url}:`, response.status, response.statusText);
                        if (response.ok) {
                            console.log(`✅ Successfully fetched ${url}, decoding audio...`);
                            const arrayBuffer = await response.arrayBuffer();
                            console.log(`📊 Audio buffer size: ${arrayBuffer.byteLength} bytes`);
                            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                            console.log(`🎵 Audio decoded successfully: ${audioBuffer.duration.toFixed(2)}s, ${audioBuffer.numberOfChannels} channels`);
                            resolve(audioBuffer);
                            return;
                        } else {
                            console.warn(`❌ Failed to fetch ${url}: ${response.status} ${response.statusText}`);
                        }
                    } catch (fetchError) {
                        console.warn(`❌ Fetch error for ${url}:`, fetchError);
                    }
                }
                throw new Error('All audio files failed to load');
            } catch (error) {
                console.error('❌ loadAudioFile error:', error);
                reject(error);
            }
        });
        
        this.loadingPromises.set(urls, promise);
        return promise;
    }

    createFallbackSounds() {
        console.log('Creating fallback synthetic sounds...');
        
        // Create simple fallback sounds for when real audio fails
        this.createFallbackSound('footstep');
        this.createFallbackSound('attack');
        this.createFallbackSound('enemy_attack');
        this.createFallbackSound('hit');
        this.createFallbackSound('resource_collect');
        this.createFallbackSound('enemy_death');
        this.createFallbackSound('wave_start');
    }

    createFallbackSound(soundName) {
        let duration, frequency, type;
        
        switch (soundName) {
            case 'footstep':
                duration = 0.1;
                frequency = 100;
                type = 'noise';
                break;
            case 'attack':
                duration = 0.3;
                frequency = 200;
                type = 'sweep';
                break;
            case 'enemy_attack':
                duration = 0.3;
                frequency = 180;
                type = 'sweep';
                break;
            case 'hit':
                duration = 0.2;
                frequency = 150;
                type = 'noise';
                break;
            case 'resource_collect':
                duration = 0.4;
                frequency = 440;
                type = 'tone';
                break;
            case 'enemy_death':
                duration = 0.5;
                frequency = 100;
                type = 'sweep_down';
                break;
            case 'wave_start':
                duration = 1.0;
                frequency = 330;
                type = 'warble';
                break;
            default:
                duration = 0.2;
                frequency = 220;
                type = 'tone';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            let sample = 0;
            
            switch (type) {
                case 'noise':
                    sample = (Math.random() * 2 - 1) * 0.3 * Math.exp(-t * 5);
                    break;
                case 'tone':
                    sample = Math.sin(2 * Math.PI * frequency * t) * 0.3 * Math.exp(-t * 2);
                    break;
                case 'sweep':
                    const sweepFreq = frequency - t * 100;
                    sample = Math.sin(2 * Math.PI * sweepFreq * t) * 0.3 * Math.exp(-t * 3);
                    break;
                case 'sweep_down':
                    const downFreq = frequency - t * 80;
                    sample = Math.sin(2 * Math.PI * downFreq * t) * 0.3 * Math.exp(-t * 2);
                    break;
                case 'warble':
                    const warbleFreq = frequency + Math.sin(t * 8) * 50;
                    sample = Math.sin(2 * Math.PI * warbleFreq * t) * 0.25 * Math.exp(-t * 1);
                    break;
            }
            
            data[i] = sample;
        }
        
        this.audioBuffers.set(soundName, buffer);
        console.log(`Created fallback sound: ${soundName}`);
    }

    // Play a sound effect
    playSound(soundName, position = null, volume = 1.0) {
        if (!this.audioContext) {
            console.log(`Playing sound: ${soundName}`, position ? `at position ${position.x}, ${position.y}, ${position.z}` : 'globally');
            return;
        }

        const buffer = this.audioBuffers.get(soundName);
        if (!buffer) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }

        // Debug: Check if this is a real audio file or synthetic
        const isRealAudio = buffer.duration > 0.5 || buffer.numberOfChannels > 1;
        const audioType = isRealAudio ? '🎵 REAL AUDIO' : '🔧 SYNTHETIC';
        console.log(`${audioType} Playing: ${soundName} (${buffer.duration.toFixed(2)}s, ${buffer.numberOfChannels}ch)`);

        try {
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
            const musicBuffer = this.audioBuffers.get('background_music');
            if (musicBuffer) {
                console.log(`🎵 Found background music buffer: ${musicBuffer.duration.toFixed(2)}s, ${musicBuffer.numberOfChannels}ch`);
                this.playRealBackgroundMusic(musicBuffer);
            } else {
                console.log('🔧 No background music buffer found, using synthetic music');
                // Fallback to simple ambient music
                this.createSimpleBackgroundMusic();
            }
        } catch (error) {
            console.warn('Failed to start background music:', error);
            this.createSimpleBackgroundMusic();
        }
    }

    playRealBackgroundMusic(buffer) {
        // Stop current music if playing
        this.stopMusic();
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.loop = true; // Loop the background music
        source.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        // Set volume (2x louder than before)
        gainNode.gain.value = this.musicVolume;
        
        source.start();
        
        // Store reference for cleanup
        this.currentMusicSource = { source, gainNode };
        
        console.log(`🎵 Real background music started at volume: ${this.musicVolume} (2x louder)`);
    }

    createSimpleBackgroundMusic() {
        // Create simple, pleasant background music as fallback
        const layers = [];
        
        // Layer 1: Main melody (gentle sine wave)
        const melody = this.audioContext.createOscillator();
        const melodyGain = this.audioContext.createGain();
        
        melody.type = 'sine';
        melody.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
        melodyGain.gain.setValueAtTime(0.1, this.audioContext.currentTime); // 2x louder (was 0.05)
        
        melody.connect(melodyGain);
        melodyGain.connect(this.musicGain);
        melody.start();
        layers.push({ source: melody, gain: melodyGain });
        
        // Layer 2: Harmony (perfect fifth)
        const harmony = this.audioContext.createOscillator();
        const harmonyGain = this.audioContext.createGain();
        
        harmony.type = 'sine';
        harmony.frequency.setValueAtTime(330, this.audioContext.currentTime); // E4
        harmonyGain.gain.setValueAtTime(0.08, this.audioContext.currentTime); // 2x louder (was 0.04)
        
        harmony.connect(harmonyGain);
        harmonyGain.connect(this.musicGain);
        harmony.start();
        layers.push({ source: harmony, gain: harmonyGain });
        
        // Store references for cleanup
        this.currentMusicSource = { layers, melody, harmony };
        
        // Add gentle musical modulation
        this.modulateBackgroundMusic(melody, harmony, melodyGain, harmonyGain);
        
        console.log('Simple background music started (fallback)');
    }

    modulateBackgroundMusic(melody, harmony, melodyGain, harmonyGain) {
        const modulate = () => {
            if (!this.currentMusicSource) return;
            
            const time = this.audioContext.currentTime;
            
            // Very gentle frequency modulation
            const variation = Math.sin(time * 0.01) * 1; // Very slow and subtle
            melody.frequency.setValueAtTime(220 + variation, time);
            harmony.frequency.setValueAtTime(330 + variation * 0.5, time);
            
            // Gentle volume breathing
            const breathe = Math.sin(time * 0.02) * 0.02 + 1;
            melodyGain.gain.setValueAtTime(0.1 * breathe, time);
            harmonyGain.gain.setValueAtTime(0.08 * breathe, time);
            
            setTimeout(modulate, 500); // Update every 500ms
        };
        
        modulate();
    }

    // Stop current music
    stopMusic() {
        if (this.currentMusicSource) {
            try {
                if (this.currentMusicSource.source) {
                    // Real audio source
                    this.currentMusicSource.source.stop();
                    this.currentMusicSource.source.disconnect();
                    this.currentMusicSource.gainNode.disconnect();
                } else if (this.currentMusicSource.melody) {
                    // Synthetic music
                    this.currentMusicSource.melody.stop();
                    this.currentMusicSource.harmony.stop();
                }
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
        this.audioBuffers.clear();
        this.loadingPromises.clear();
        console.log('AudioManager disposed');
    }
}

// Make AudioManager globally accessible
window.AudioManager = AudioManager; 