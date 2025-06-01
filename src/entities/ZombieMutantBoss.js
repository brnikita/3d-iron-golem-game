// Zombie Mutant Boss - появляется после уничтожения всех зомби в волне
class ZombieMutantBoss extends Enemy {
    constructor(position = new THREE.Vector3()) {
        super(position);
        
        // Усиленные характеристики босса-мутанта
        this.maxHealth = 200;
        this.currentHealth = this.maxHealth;
        this.moveSpeed = 1.2; // Медленнее, но очень опасен
        this.attackDamage = 35;
        this.attackRange = 4.0;
        this.attackCooldown = 3000; // 3 секунды между атаками
        this.detectionRange = 30.0; // Видит издалека
        this.isBoss = true;
        this.isMutant = true;
        
        // Специальные способности
        this.canRage = true;
        this.rageThreshold = 0.5; // Активируется при 50% здоровья
        this.isRaging = false;
        this.regenerationRate = 2; // Восстанавливает 2 HP в секунду
        this.lastRegenTime = 0;
        
        console.log('🧟‍♂️💀 Zombie Mutant Boss created!');
    }

    createMesh() {
        // Создаем модель босса-мутанта (больше и страшнее обычного зомби)
        this.mesh = new THREE.Group();
        this.mesh.name = 'ZombieMutantBoss';
        
        // Материалы с мутантной цветовой схемой
        const mutantSkinMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 }); // Темно-красная кожа
        const mutantClothesMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F }); // Темная одежда
        const glowingEyeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF0000,
            emissive: 0x440000 // Светящиеся глаза
        });
        const mutantHairMaterial = new THREE.MeshLambertMaterial({ color: 0x1A1A1A }); // Черные волосы
        
        // Увеличиваем размер босса в 2 раза
        const scale = 2.0;
        
        // Голова (деформированная)
        const headGeometry = new THREE.BoxGeometry(0.9 * scale, 0.9 * scale, 0.9 * scale);
        const head = new THREE.Mesh(headGeometry, mutantSkinMaterial);
        head.position.y = 2.8 * scale;
        head.castShadow = true;
        this.mesh.add(head);
        
        // Светящиеся красные глаза
        const eyeGeometry = new THREE.BoxGeometry(0.2 * scale, 0.2 * scale, 0.15 * scale);
        const leftEye = new THREE.Mesh(eyeGeometry, glowingEyeMaterial);
        leftEye.position.set(-0.25 * scale, 2.9 * scale, 0.45 * scale);
        this.mesh.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, glowingEyeMaterial);
        rightEye.position.set(0.25 * scale, 2.9 * scale, 0.45 * scale);
        this.mesh.add(rightEye);
        
        // Мутантные волосы (растрепанные)
        const hairGeometry = new THREE.BoxGeometry(1.0 * scale, 0.4 * scale, 1.0 * scale);
        const hair = new THREE.Mesh(hairGeometry, mutantHairMaterial);
        hair.position.y = 3.4 * scale;
        this.mesh.add(hair);
        
        // Массивное тело
        const bodyGeometry = new THREE.BoxGeometry(1.2 * scale, 1.8 * scale, 0.8 * scale);
        const body = new THREE.Mesh(bodyGeometry, mutantClothesMaterial);
        body.position.y = 1.95 * scale;
        body.castShadow = true;
        this.mesh.add(body);
        
        // Мощные руки
        const armGeometry = new THREE.BoxGeometry(0.5 * scale, 1.4 * scale, 0.5 * scale);
        
        const leftArm = new THREE.Mesh(armGeometry, mutantSkinMaterial);
        leftArm.position.set(-1.0 * scale, 1.95 * scale, 0);
        leftArm.rotation.z = 0.2;
        leftArm.castShadow = true;
        this.mesh.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, mutantSkinMaterial);
        rightArm.position.set(1.0 * scale, 1.95 * scale, 0);
        rightArm.rotation.z = -0.2;
        rightArm.castShadow = true;
        this.mesh.add(rightArm);
        
        // Когтистые руки
        const clawGeometry = new THREE.BoxGeometry(0.4 * scale, 0.4 * scale, 0.4 * scale);
        
        const leftClaw = new THREE.Mesh(clawGeometry, mutantSkinMaterial);
        leftClaw.position.set(-1.2 * scale, 1.2 * scale, 0.3 * scale);
        leftClaw.castShadow = true;
        this.mesh.add(leftClaw);
        
        const rightClaw = new THREE.Mesh(clawGeometry, mutantSkinMaterial);
        rightClaw.position.set(1.2 * scale, 1.2 * scale, 0.3 * scale);
        rightClaw.castShadow = true;
        this.mesh.add(rightClaw);
        
        // Когти на руках
        for (let i = 0; i < 3; i++) {
            const clawSpike = new THREE.ConeGeometry(0.05 * scale, 0.3 * scale, 6);
            const leftSpike = new THREE.Mesh(clawSpike, new THREE.MeshLambertMaterial({ color: 0x333333 }));
            leftSpike.position.set(-1.2 * scale + i * 0.1 * scale, 1.0 * scale, 0.5 * scale);
            leftSpike.rotation.x = Math.PI;
            this.mesh.add(leftSpike);
            
            const rightSpike = new THREE.Mesh(clawSpike, new THREE.MeshLambertMaterial({ color: 0x333333 }));
            rightSpike.position.set(1.2 * scale - i * 0.1 * scale, 1.0 * scale, 0.5 * scale);
            rightSpike.rotation.x = Math.PI;
            this.mesh.add(rightSpike);
        }
        
        // Ноги
        const legGeometry = new THREE.BoxGeometry(0.6 * scale, 1.4 * scale, 0.6 * scale);
        
        const leftLeg = new THREE.Mesh(legGeometry, mutantClothesMaterial);
        leftLeg.position.set(-0.4 * scale, 0.7 * scale, 0);
        leftLeg.castShadow = true;
        this.mesh.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, mutantClothesMaterial);
        rightLeg.position.set(0.4 * scale, 0.7 * scale, 0);
        rightLeg.castShadow = true;
        this.mesh.add(rightLeg);
        
        // Большие ступни
        const footGeometry = new THREE.BoxGeometry(0.8 * scale, 0.4 * scale, 1.0 * scale);
        
        const leftFoot = new THREE.Mesh(footGeometry, mutantSkinMaterial);
        leftFoot.position.set(-0.4 * scale, 0.2 * scale, 0.1 * scale);
        leftFoot.castShadow = true;
        this.mesh.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, mutantSkinMaterial);
        rightFoot.position.set(0.4 * scale, 0.2 * scale, 0.1 * scale);
        rightFoot.castShadow = true;
        this.mesh.add(rightFoot);
        
        // Мутантные наросты на теле
        for (let i = 0; i < 5; i++) {
            const growthGeometry = new THREE.SphereGeometry(0.1 * scale, 6, 6);
            const growth = new THREE.Mesh(growthGeometry, mutantSkinMaterial);
            growth.position.set(
                (Math.random() - 0.5) * 1.0 * scale,
                1.5 * scale + Math.random() * 1.0 * scale,
                0.4 * scale + Math.random() * 0.2 * scale
            );
            this.mesh.add(growth);
        }
        
        // Установка трансформации
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        this.mesh.scale.copy(this.scale);
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Сохранение ссылки
        this.mesh.userData.entity = this;
        this.mesh.userData.type = 'zombie_mutant_boss';
        
        // Сохранение частей тела для анимации
        this.bodyParts = {
            head: head,
            body: body,
            leftArm: leftArm,
            rightArm: rightArm,
            leftClaw: leftClaw,
            rightClaw: rightClaw,
            leftLeg: leftLeg,
            rightLeg: rightLeg,
            leftEye: leftEye,
            rightEye: rightEye
        };
        
        // Создание улучшенной полосы здоровья
        this.createBossHealthBar();
    }

    createBossHealthBar() {
        // Создаем большую полосу здоровья для босса
        const healthBarGroup = new THREE.Group();
        
        // Фон полосы здоровья (красный)
        const bgGeometry = new THREE.PlaneGeometry(4.0, 0.4);
        const bgMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x8B0000, 
            transparent: true, 
            opacity: 0.9 
        });
        const bgBar = new THREE.Mesh(bgGeometry, bgMaterial);
        healthBarGroup.add(bgBar);
        
        // Полоса здоровья (зеленая/красная)
        const healthGeometry = new THREE.PlaneGeometry(4.0, 0.4);
        const healthMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FF00, 
            transparent: true, 
            opacity: 1.0 
        });
        this.healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
        this.healthBar.position.z = 0.01;
        healthBarGroup.add(this.healthBar);
        
        // Рамка полосы здоровья
        const frameGeometry = new THREE.RingGeometry(2.0, 2.1, 16);
        const frameMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF, 
            transparent: true, 
            opacity: 0.8 
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.rotation.x = -Math.PI / 2;
        healthBarGroup.add(frame);
        
        // Позиционирование полосы здоровья над боссом
        healthBarGroup.position.y = 8.0;
        healthBarGroup.lookAt(0, 8.0, 1);
        
        this.mesh.add(healthBarGroup);
        this.healthBarGroup = healthBarGroup;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.isDead) return;
        
        // Регенерация здоровья
        this.updateRegeneration(deltaTime);
        
        // Проверка активации ярости
        this.checkRageMode();
        
        // Обновление эффектов ярости
        if (this.isRaging) {
            this.updateRageEffects(deltaTime);
        }
    }

    updateRegeneration(deltaTime) {
        const currentTime = Date.now();
        
        if (currentTime - this.lastRegenTime >= 1000) { // Каждую секунду
            if (this.currentHealth < this.maxHealth) {
                this.currentHealth = Math.min(this.maxHealth, this.currentHealth + this.regenerationRate);
                console.log(`🧟‍♂️💚 Mutant Boss regenerates! Health: ${this.currentHealth}/${this.maxHealth}`);
            }
            this.lastRegenTime = currentTime;
        }
    }

    checkRageMode() {
        const healthPercent = this.currentHealth / this.maxHealth;
        
        if (!this.isRaging && this.canRage && healthPercent <= this.rageThreshold) {
            this.activateRage();
        }
    }

    activateRage() {
        this.isRaging = true;
        this.canRage = false; // Ярость активируется только один раз
        
        // Увеличиваем характеристики в ярости
        this.moveSpeed *= 1.5;
        this.attackDamage *= 1.3;
        this.attackCooldown *= 0.7; // Быстрее атакует
        
        console.log('🧟‍♂️🔥 MUTANT BOSS ENTERS RAGE MODE!');
        
        // Визуальные эффекты ярости
        this.createRageEffect();
        
        // Звук ярости
        const audioManager = window.game?.gameEngine?.audioManager;
        if (audioManager) {
            audioManager.playSound('enemy_attack', this.position, 1.0);
        }
    }

    createRageEffect() {
        // Красное свечение вокруг босса
        const scene = window.game?.gameEngine?.scene;
        if (!scene) return;
        
        // Создаем красную ауру
        const auraGeometry = new THREE.SphereGeometry(6, 16, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF0000,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        this.rageAura = new THREE.Mesh(auraGeometry, auraMaterial);
        this.rageAura.position.copy(this.position);
        this.rageAura.position.y += 3;
        scene.add(this.rageAura);
        
        // Изменяем цвет глаз на более яркий
        if (this.bodyParts.leftEye && this.bodyParts.rightEye) {
            this.bodyParts.leftEye.material.emissive.setHex(0xFF0000);
            this.bodyParts.rightEye.material.emissive.setHex(0xFF0000);
        }
    }

    updateRageEffects(deltaTime) {
        // Анимация ауры ярости
        if (this.rageAura) {
            this.rageAura.position.copy(this.position);
            this.rageAura.position.y += 3;
            this.rageAura.rotation.y += deltaTime * 2;
            
            // Пульсация ауры
            const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 0.3;
            this.rageAura.material.opacity = pulse;
        }
    }

    // Переопределяем атаку для более мощного эффекта
    attack(target) {
        if (Date.now() - this.lastAttackTime < this.attackCooldown) {
            return false;
        }
        
        this.lastAttackTime = Date.now();
        
        console.log('🧟‍♂️💀 MUTANT BOSS ATTACKS!');
        
        // Анимация атаки
        this.playAttackAnimation();
        
        // Звук атаки (громче)
        const audioManager = window.game?.gameEngine?.audioManager;
        if (audioManager) {
            audioManager.playSound('enemy_attack', this.position, 1.0);
        }
        
        // Урон цели
        if (target && typeof target.takeDamage === 'function') {
            target.takeDamage(this.attackDamage, this);
            console.log(`💥 Mutant Boss deals ${this.attackDamage} damage!`);
        }
        
        // Создаем ударную волну
        this.createShockwave();
        
        return true;
    }

    createShockwave() {
        const scene = window.game?.gameEngine?.scene;
        if (!scene) return;
        
        // Создаем ударную волну
        const waveGeometry = new THREE.RingGeometry(1, 8, 16);
        const waveMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF4444,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const wave = new THREE.Mesh(waveGeometry, waveMaterial);
        
        wave.position.copy(this.position);
        wave.position.y = 0.1;
        wave.rotation.x = -Math.PI / 2;
        
        scene.add(wave);
        
        // Анимация ударной волны
        let scale = 0.1;
        let opacity = 0.8;
        const animateWave = () => {
            scale += 0.3;
            opacity -= 0.05;
            
            wave.scale.setScalar(scale);
            wave.material.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animateWave);
            } else {
                scene.remove(wave);
                wave.geometry.dispose();
                wave.material.dispose();
            }
        };
        
        animateWave();
    }

    // Переопределяем смерть для драматического эффекта
    die(attacker = null) {
        if (this.isDead) return;
        
        this.isDead = true;
        this.state = 'dead';
        
        console.log('🧟‍♂️💀 MUTANT BOSS DEFEATED!');
        
        // Call onDeath to notify systems (including wave system)
        this.onDeath();
        
        // Удаляем ауру ярости
        if (this.rageAura && this.rageAura.parent) {
            this.rageAura.parent.remove(this.rageAura);
        }
        
        // Звук смерти
        const audioManager = window.game?.gameEngine?.audioManager;
        if (audioManager) {
            audioManager.playSound('enemy_death', this.position, 1.0);
        }
        
        // Дропаем много ресурсов
        this.dropMutantBossResources();
        
        // Создаем эффект смерти
        this.createMutantDeathEffect();
        
        // Удаляем через некоторое время
        setTimeout(() => {
            if (this.mesh && this.mesh.parent) {
                this.mesh.parent.remove(this.mesh);
            }
            
            if (window.game?.gameEngine) {
                window.game.gameEngine.removeEnemy(this);
            }
        }, 3000);
    }

    dropMutantBossResources() {
        const resourceSystem = window.game?.gameEngine?.resourceSystem;
        if (!resourceSystem) return;
        
        // Дропаем 20-30 железных слитков
        const ironCount = Math.floor(Math.random() * 11) + 20;
        for (let i = 0; i < ironCount; i++) {
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                0,
                (Math.random() - 0.5) * 5
            );
            const position = this.position.clone().add(offset);
            position.y = 0.5;
            
            resourceSystem.spawnResource('ironIngots', position);
        }
        
        // Дропаем 5-8 костей
        const boneCount = Math.floor(Math.random() * 4) + 5;
        for (let i = 0; i < boneCount; i++) {
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                0,
                (Math.random() - 0.5) * 4
            );
            const position = this.position.clone().add(offset);
            position.y = 0.5;
            
            resourceSystem.spawnResource('bones', position);
        }
        
        // Гарантированно дропаем 2-3 изумруда
        const emeraldCount = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < emeraldCount; i++) {
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                0,
                (Math.random() - 0.5) * 3
            );
            const position = this.position.clone().add(offset);
            position.y = 0.5;
            
            resourceSystem.spawnResource('emeralds', position);
        }
    }

    createMutantDeathEffect() {
        const scene = window.game?.gameEngine?.scene;
        if (!scene) return;
        
        // Большой взрыв частиц
        for (let i = 0; i < 50; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.15, 6, 6);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random() * 0.1, 1, 0.5), // Красно-оранжевые частицы
                transparent: true,
                opacity: 1.0
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            particle.position.copy(this.position);
            particle.position.y += 3;
            
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                Math.random() * 6 + 2,
                (Math.random() - 0.5) * 8
            );
            
            scene.add(particle);
            
            const animate = () => {
                particle.position.add(velocity.clone().multiplyScalar(0.05));
                velocity.y -= 0.15; // Гравитация
                particle.material.opacity -= 0.015;
                
                if (particle.material.opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    scene.remove(particle);
                    particle.geometry.dispose();
                    particle.material.dispose();
                }
            };
            
            animate();
        }
        
        // Яркая вспышка света
        const flashLight = new THREE.PointLight(0xFF4444, 5, 15);
        flashLight.position.copy(this.position);
        flashLight.position.y += 3;
        scene.add(flashLight);
        
        let intensity = 5;
        const fadeLight = () => {
            intensity -= 0.15;
            flashLight.intensity = Math.max(0, intensity);
            
            if (intensity > 0) {
                requestAnimationFrame(fadeLight);
            } else {
                scene.remove(flashLight);
            }
        };
        
        fadeLight();
    }
}

// Делаем ZombieMutantBoss глобально доступным
window.ZombieMutantBoss = ZombieMutantBoss; 