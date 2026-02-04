
class MinijuegoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MinijuegoScene' });
        this.currentGame = 0;
        this.score = 0;
        this.totalGames = 3;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const isMobile = width < 600;

        // Fondo animado con partículas
        this.createAnimatedBackground(width, height);

        // Barra superior con gradiente
        this.createGradientHeader(width, isMobile);

        // Título
        const titleY = isMobile ? 55 : 70;
        this.gameTitle = this.add.text(width / 2, titleY, 'Minijuegos', {
            fontSize: this.getFontSize(isMobile ? 28 : 36),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#1565C0',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Puntuación con badge animado
        this.createScoreBadge(width, isMobile);

        // Botón volver
        this.createBackButton(isMobile);

        // Contenedor del juego
        this.gameContainer = this.add.container(width / 2, height / 2 + 15);

        // Iniciar primer minijuego
        this.startGame(0);

        // Animación de entrada
        this.animateEntrance();
    }

    createAnimatedBackground(width, height) {
        // Fondo base degradado azul
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0xE3F2FD, 0xE1F5FE, 0xBBDEFB, 0xB3E5FC, 1);
        graphics.fillRect(0, 0, width, height);

        // Partículas flotantes
        this.particles = [];
        const colors = [0xFFD700, 0xFF6B35, 0x4CAF50, 0x2196F3, 0x9C27B0];

        for (let i = 0; i < 12; i++) {
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(150, height - 150);
            const size = Phaser.Math.Between(4, 10);
            const color = Phaser.Utils.Array.GetRandom(colors);

            const particle = this.add.circle(x, y, size, color, 0.5);

            this.tweens.add({
                targets: particle,
                y: y + Phaser.Math.Between(15, 40),
                x: x + Phaser.Math.Between(-20, 20),
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut',
                delay: Phaser.Math.Between(0, 1000)
            });

            this.tweens.add({
                targets: particle,
                alpha: { from: 0.3, to: 0.7 },
                scale: { from: 0.8, to: 1.2 },
                duration: Phaser.Math.Between(1500, 2500),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 500)
            });
        }

        // Estrellas brillantes
        for (let i = 0; i < 15; i++) {
            const star = this.add.star(
                Phaser.Math.Between(20, width - 20),
                Phaser.Math.Between(20, height - 20),
                5, 3, 6, 0xFFD700, 0.4
            );

            this.tweens.add({
                targets: star,
                rotation: 360,
                scale: { from: 0.5, to: 1 },
                alpha: { from: 0.2, to: 0.6 },
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }

    createGradientHeader(width, isMobile) {
        const bar = this.add.graphics();
        bar.fillGradientStyle(0x2196F3, 0x2196F3, 0x1976D2, 0x1976D2, 1);
        bar.fillRect(0, 0, width, isMobile ? 110 : 130);

        // Onda animada
        const wave = this.add.graphics();
        let offset = 0;

        this.time.addEvent({
            delay: 50,
            callback: () => {
                offset += 2;
                wave.clear();
                wave.fillStyle(0x1976D2, 1);
                wave.beginPath();
                wave.moveTo(0, isMobile ? 110 : 130);

                for (let x = 0; x <= width; x += 10) {
                    wave.lineTo(x, (isMobile ? 110 : 130) + Math.sin((x + offset) * 0.02) * 12);
                }

                wave.lineTo(width, 0);
                wave.lineTo(0, 0);
                wave.closePath();
                wave.fill();
            },
            loop: true
        });
    }

    createScoreBadge(width, isMobile) {
        const x = width - (isMobile ? 65 : 90);
        const y = isMobile ? 55 : 70;
        const size = isMobile ? 55 : 70;

        // Círculo dorado con animación
        const badge = this.add.container(x, y);

        const shadow = this.add.circle(3, 4, size/2, 0x000000, 0.2);
        const circle = this.add.circle(0, 0, size/2, 0xFFD700);
        const border = this.add.circle(0, 0, size/2 - 3, 0xFFD700);
        border.setStrokeStyle(3, 0xFFFFFF, 0.6);
        const highlight = this.add.ellipse(-size/5, -size/5, size/3, size/4, 0xFFFFFF, 0.4);

        this.scoreText = this.add.text(0, 0, `${this.score}`, {
            fontSize: this.getFontSize(isMobile ? 18 : 22),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        badge.add([shadow, circle, border, highlight, this.scoreText]);

        // Animación idle
        this.tweens.add({
            targets: badge,
            scale: { from: 1, to: 1.05 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
    }

    getFontSize(baseSize) {
        const width = this.scale.width;
        if (width < 400) return Math.floor(baseSize * 0.7) + 'px';
        if (width < 600) return Math.floor(baseSize * 0.85) + 'px';
        return baseSize + 'px';
    }

    createBackButton(isMobile) {
        const btn = this.add.container(isMobile ? 55 : 85, isMobile ? 55 : 70);
        const size = isMobile ? 50 : 60;

        const shadow = this.add.circle(3, 4, size/2, 0x000000, 0.2);
        const circle = this.add.circle(0, 0, size/2, 0xFF6B35);
        const border = this.add.circle(0, 0, size/2 - 3, 0xFF6B35);
        border.setStrokeStyle(3, 0xFFFFFF, 0.5);
        const highlight = this.add.ellipse(-size/5, -size/5, size/3, size/4, 0xFFFFFF, 0.4);

        const label = this.add.text(0, 0, '←', {
            fontSize: this.getFontSize(24),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([shadow, circle, border, highlight, label]);
        btn.setSize(size, size);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            this.tweens.add({ targets: [circle, border, highlight], scale: 1.12, duration: 150 });
        });

        btn.on('pointerout', () => {
            this.tweens.add({ targets: [circle, border, highlight], scale: 1, duration: 150 });
        });

        btn.on('pointerdown', () => this.scene.start('ContextoScene'));
    }

    startGame(gameIndex) {
        this.gameContainer.removeAll(true);
        this.currentGame = gameIndex;

        switch(gameIndex) {
            case 0:
                this.gameTitle.setText('¡Conecta!');
                this.circuitGame();
                break;
            case 1:
                this.gameTitle.setText('¿Seguro?');
                this.safetyGame();
                break;
            case 2:
                this.gameTitle.setText('¡Clasifica!');
                this.materialsGame();
                break;
        }

        this.gameContainer.setAlpha(0);
        this.gameContainer.y += 30;
        this.gameContainer.setScale(0.9);

        this.tweens.add({
            targets: this.gameContainer,
            alpha: 1,
            y: this.gameContainer.y - 30,
            scale: 1,
            duration: 500,
            ease: 'Back.out'
        });
    }

    getYOffset() {
        const isMobile = this.scale.width < 600;
        return isMobile ? 30 : 40;
    }

    circuitGame() {
        const isMobile = this.scale.width < 600;
        const scale = isMobile ? 0.55 : 0.7;
        const offset = this.getYOffset();

        // Título
        const title = this.add.text(0, -110 + offset, 'Une la pila con el foco', {
            fontSize: this.getFontSize(isMobile ? 20 : 24),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#1565C0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Pila
        const batteryBg = this.add.circle(-140 * scale, 0 + offset, isMobile ? 50 : 65, 0x4CAF50, 0.2);
        const battery = this.add.text(-140 * scale, 0 + offset, '🔋', {
            fontSize: isMobile ? '60px' : '75px'
        }).setOrigin(0.5);

        // Foco
        const bulbBg = this.add.circle(140 * scale, 0 + offset, isMobile ? 50 : 65, 0xFFC107, 0.1);
        const bulb = this.add.text(140 * scale, 0 + offset, '💡', {
            fontSize: isMobile ? '60px' : '75px'
        }).setOrigin(0.5);
        bulb.setAlpha(0.3);

        // Línea guía (punteada manualmente)
        const line = this.add.graphics();
        line.lineStyle(3, 0x90A4AE, 0.5);

        // Dibujar línea punteada manualmente
        const dashLength = 10;
        const gapLength = 6;
        const startX = -80 * scale;
        const endX = 80 * scale;
        const y = 30 + offset;

        for (let x = startX; x < endX; x += dashLength + gapLength) {
            line.lineBetween(x, y, Math.min(x + dashLength, endX), y);
        }

        // Cable
        const cableBg = this.add.circle(0, 80 + offset, isMobile ? 40 : 50, 0x2196F3, 0.2);
        const cable = this.add.text(0, 80 + offset, '〰️', {
            fontSize: isMobile ? '45px' : '60px'
        }).setOrigin(0.5);
        cable.setInteractive({ draggable: true, useHandCursor: true });

        this.gameContainer.add([title, batteryBg, battery, bulbBg, bulb, line, cableBg, cable]);

        let completed = false;
        this.input.setDraggable(cable);

        cable.on('drag', (pointer, dragX, dragY) => {
            if (!completed) {
                cable.x = Phaser.Math.Clamp(dragX, -170 * scale, 170 * scale);
                cable.y = Phaser.Math.Clamp(dragY, -20 + offset, 100 + offset);
                cableBg.x = cable.x;
                cableBg.y = cable.y;
            }
        });

        cable.on('dragend', () => {
            if (!completed) {
                const dist = Phaser.Math.Distance.Between(cable.x, cable.y, 0, 30 + offset);
                if (dist < 45 * scale) {
                    completed = true;
                    cable.setPosition(0, 30 + offset);
                    cableBg.setPosition(0, 30 + offset);
                    cable.disableInteractive();

                    bulb.setAlpha(1);
                    bulbBg.setFillStyle(0xFFC107, 0.3);

                    // Animación de éxito
                    this.tweens.add({
                        targets: [bulb, bulbBg],
                        scale: { from: 1, to: 1.25 },
                        duration: 300,
                        yoyo: true,
                        repeat: 3
                    });

                    this.score += 100;
                    this.scoreText.setText(`${this.score}`);

                    this.time.delayedCall(1500, () => {
                        this.showSuccessMessage('¡Bien hecho!', () => this.startGame(1));
                    });
                } else {
                    this.tweens.add({
                        targets: [cable, cableBg],
                        x: 0,
                        y: 80 + offset,
                        duration: 300,
                        ease: 'Power2'
                    });
                }
            }
        });

        // Animaciones idle
        this.tweens.add({
            targets: battery,
            y: battery.y - 5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });
    }

    safetyGame() {
        const offset = this.getYOffset();
        const isMobile = this.scale.width < 600;

        const title = this.add.text(0, -120 + offset, '¿Es seguro o peligroso?', {
            fontSize: this.getFontSize(isMobile ? 20 : 24),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#1565C0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const items = [
            { 
                emoji: '💧', 
                name: 'Agua + electricidad', 
                isSafe: false,
                correctMsg: '¡Correcto! El agua conduce la electricidad y puede ser muy peligrosa.',
                wrongMsg: '¡Cuidado! El agua conduce la electricidad. Nunca toques aparatos eléctricos con las manos mojadas.'
            },
            { 
                emoji: '🔌', 
                name: 'Tocar enchufes', 
                isSafe: false,
                correctMsg: '¡Correcto! Los enchufes tienen electricidad y pueden hacerte daño.',
                wrongMsg: '¡No es seguro! Los enchufes tienen electricidad que puede causar una descarga eléctrica.'
            },
            { 
                emoji: '🧤', 
                name: 'Guantes', 
                isSafe: true,
                correctMsg: '¡Correcto! Los guantes de goma protegen porque no dejan pasar la electricidad.',
                wrongMsg: '¡Incorrecto! Los guantes de goma son aislantes, no dejan pasar la electricidad y te protegen.'
            },
            { 
                emoji: '✋', 
                name: 'Manos secas', 
                isSafe: true,
                correctMsg: '¡Correcto! Con las manos secas no hay peligro de que la electricidad te afecte.',
                wrongMsg: '¡Incorrecto! Las manos secas son seguras porque el agua es la que conduce la electricidad.'
            }
        ];

        let currentItem = 0;
        let itemContainer = this.add.container(0, -35 + offset);

        const showItem = () => {
            itemContainer.removeAll(true);

            if (currentItem >= items.length) {
                this.score += 150;
                this.scoreText.setText(`${this.score}`);
                this.showSuccessMessage('¡Excelente!', () => this.startGame(2));
                return;
            }

            const item = items[currentItem];

            const bg = this.add.circle(0, 0 + offset, isMobile ? 75 : 90, 0xBBDEFB, 0.6);
            const emoji = this.add.text(0, -10 + offset, item.emoji, {
                fontSize: isMobile ? '80px' : '100px'
            }).setOrigin(0.5);

            const label = this.add.text(0, 70 + offset, item.name, {
                fontSize: this.getFontSize(isMobile ? 17 : 20),
                fontFamily: '"Nunito", sans-serif',
                color: '#37474F',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            itemContainer.add([bg, emoji, label]);

            this.tweens.add({
                targets: itemContainer,
                scale: { from: 0.8, to: 1 },
                alpha: { from: 0, to: 1 },
                duration: 400,
                ease: 'Back.out'
            });

            this.tweens.add({
                targets: emoji,
                y: emoji.y - 8,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut'
            });
        };

        this.gameContainer.add([title, itemContainer]);

        // Botones - más abajo para no tapar el texto
        const safeBtn = this.createGameButton(-120, 140 + offset, '✓ Seguro', 0x4CAF50, () => {
            this.checkAnswerWithFeedback(items[currentItem], true, (isCorrect) => {
                if (isCorrect) {
                    currentItem++;
                    showItem();
                }
            });
        }, isMobile);

        const dangerBtn = this.createGameButton(120, 140 + offset, '✗ Peligroso', 0xF44336, () => {
            this.checkAnswerWithFeedback(items[currentItem], false, (isCorrect) => {
                if (isCorrect) {
                    currentItem++;
                    showItem();
                }
            });
        }, isMobile);

        this.gameContainer.add([safeBtn, dangerBtn]);

        showItem();
    }

    createGameButton(x, y, text, color, callback, isMobile) {
        const btn = this.add.container(x, y);
        const w = isMobile ? 120 : 150;
        const h = isMobile ? 50 : 60;

        const shadow = this.add.rectangle(3, 4, w, h, 0x000000, 0.2);
        const bg = this.add.rectangle(0, 0, w, h, color);
        const border = this.add.rectangle(0, 0, w - 4, h - 4, color);
        border.setStrokeStyle(3, 0xFFFFFF, 0.4);

        const label = this.add.text(0, 0, text, {
            fontSize: this.getFontSize(isMobile ? 16 : 18),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([shadow, bg, border, label]);
        btn.setSize(w, h);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });

        btn.on('pointerout', () => {
            this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 });
        });

        btn.on('pointerdown', callback);

        return btn;
    }

    checkAnswer(item, answeredSafe, callback) {
        const isCorrect = item.isSafe === answeredSafe;

        if (isCorrect) {
            this.score += 25;
            this.scoreText.setText(`${this.score}`);
        }

        callback();
    }

    checkAnswerWithFeedback(item, answeredSafe, callback) {
        const isCorrect = item.isSafe === answeredSafe;
        const isMobile = this.scale.width < 600;

        if (isCorrect) {
            // Respuesta correcta - sumar puntos y continuar
            this.score += 25;
            this.scoreText.setText(`${this.score}`);
            
            // Mostrar mensaje de éxito
            this.showFeedbackMessage(item.correctMsg, true, () => {
                callback(true);
            });
        } else {
            // Respuesta incorrecta - mostrar mensaje educativo y NO continuar
            this.showFeedbackMessage(item.wrongMsg, false, () => {
                callback(false);
            });
        }
    }

    showFeedbackMessage(messageText, isCorrect, callback) {
        const isMobile = this.scale.width < 600;
        
        // Crear overlay semi-transparente
        const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6);
        overlay.setOrigin(0);
        
        // Panel de mensaje
        const panel = this.add.container(this.scale.width / 2, this.scale.height / 2);
        
        // Fondo del panel
        const panelWidth = isMobile ? 300 : 380;
        const panelHeight = isMobile ? 180 : 200;
        const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0xFFFFFF);
        bg.setStrokeStyle(4, isCorrect ? 0x4CAF50 : 0xFF9800);
        
        // Icono según el resultado
        const icon = this.add.text(0, -60, isCorrect ? '✓' : '⚠️', {
            fontSize: isMobile ? '50px' : '60px'
        }).setOrigin(0.5);
        
        // Mensaje
        const msg = this.add.text(0, 10, messageText, {
            fontSize: this.getFontSize(isMobile ? 14 : 16),
            fontFamily: '"Nunito", sans-serif',
            color: '#37474F',
            align: 'center',
            wordWrap: { width: panelWidth - 40 }
        }).setOrigin(0.5);
        
        panel.add([bg, icon, msg]);
        
        // Botón "Continuar"
        const btn = this.add.container(0, 70);
        const btnBg = this.add.rectangle(0, 0, isMobile ? 130 : 150, isMobile ? 42 : 48, isCorrect ? 0x4CAF50 : 0x2196F3);
        const btnLabel = this.add.text(0, 0, isCorrect ? 'Continuar →' : 'Intentar de nuevo', {
            fontSize: this.getFontSize(isMobile ? 13 : 15),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        btn.add([btnBg, btnLabel]);
        btn.setSize(isMobile ? 130 : 150, isMobile ? 42 : 48);
        btn.setInteractive({ useHandCursor: true });
        
        btn.on('pointerover', () => {
            btnBg.setFillStyle(isCorrect ? 0x66BB6A : 0x42A5F5);
        });
        
        btn.on('pointerout', () => {
            btnBg.setFillStyle(isCorrect ? 0x4CAF50 : 0x2196F3);
        });
        
        btn.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
            callback();
        });
        
        panel.add(btn);
        
        // Animación de entrada
        this.tweens.add({
            targets: panel,
            scale: { from: 0, to: 1 },
            duration: 400,
            ease: 'Back.out'
        });
    }

    materialsGame() {
        const offset = this.getYOffset();
        const isMobile = this.scale.width < 600;

        // Title at top
        const title = this.add.text(0, -150 + offset, '¿Conductor o Aislante?', {
            fontSize: this.getFontSize(isMobile ? 20 : 24),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#1565C0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Zone dimensions - wide rectangles at bottom
        const zoneWidth = isMobile ? 120 : 140;
        const zoneHeight = isMobile ? 70 : 80;
        const zoneY = 80 + offset;
        const zoneSpacing = isMobile ? 20 : 30;

        // Left zone (Conductor) - positioned at bottom left
        const leftZoneX = -(zoneWidth/2 + zoneSpacing/2);
        const leftZone = this.add.rectangle(leftZoneX, zoneY, zoneWidth, zoneHeight, 0x4CAF50, 0.25);
        leftZone.setStrokeStyle(4, 0x4CAF50, 1);

        // Label above left zone
        const leftLabel = this.add.text(leftZoneX, zoneY - zoneHeight/2 - 20, 'CONDUCTOR', {
            fontSize: this.getFontSize(isMobile ? 13 : 15),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#2E7D32'
        }).setOrigin(0.5);

        // Icon inside left zone
        const leftIcon = this.add.text(leftZoneX, zoneY, '⚡', {
            fontSize: isMobile ? '30px' : '36px'
        }).setOrigin(0.5);

        // Right zone (Aislante) - positioned at bottom right
        const rightZoneX = zoneWidth/2 + zoneSpacing/2;
        const rightZone = this.add.rectangle(rightZoneX, zoneY, zoneWidth, zoneHeight, 0xFF9800, 0.25);
        rightZone.setStrokeStyle(4, 0xFF9800, 1);

        // Label above right zone
        const rightLabel = this.add.text(rightZoneX, zoneY - zoneHeight/2 - 20, 'AISLANTE', {
            fontSize: this.getFontSize(isMobile ? 13 : 15),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#E65100'
        }).setOrigin(0.5);

        // Icon inside right zone
        const rightIcon = this.add.text(rightZoneX, zoneY, '🛡️', {
            fontSize: isMobile ? '30px' : '36px'
        }).setOrigin(0.5);

        // Add instruction text
        const instruction = this.add.text(0, -120 + offset, 'Arrastra el material a la zona correcta', {
            fontSize: this.getFontSize(isMobile ? 12 : 14),
            fontFamily: '"Nunito", sans-serif',
            color: '#546E7A'
        }).setOrigin(0.5);

        this.gameContainer.add([title, instruction, leftZone, leftLabel, leftIcon, rightZone, rightLabel, rightIcon]);

        const materials = [
            { emoji: '🥄', name: 'Metal', isConductor: true },
            { emoji: '🧤', name: 'Goma', isConductor: false },
            { emoji: '📎', name: 'Clip', isConductor: true },
            { emoji: '🪵', name: 'Madera', isConductor: false }
        ];

        let placedCount = 0;
        let currentMaterial = 0;

        const showMaterial = () => {
            if (currentMaterial >= materials.length) {
                if (placedCount === materials.length) {
                    this.score += 200;
                    this.scoreText.setText(`${this.score}`);
                    this.time.delayedCall(600, () => this.showFinalMessage());
                }
                return;
            }

            const mat = materials[currentMaterial];

            // Draggable item at center-top
            const container = this.add.container(0, -50 + offset);

            const bg = this.add.rectangle(0, 0, isMobile ? 110 : 130, isMobile ? 85 : 100, 0xFFFFFF);
            bg.setStrokeStyle(3, 0xBBDEFB);

            const emoji = this.add.text(0, -15, mat.emoji, {
                fontSize: isMobile ? '55px' : '65px'
            }).setOrigin(0.5);

            const label = this.add.text(0, 32, mat.name, {
                fontSize: this.getFontSize(isMobile ? 16 : 18),
                fontFamily: '"Nunito", sans-serif',
                color: '#455A64',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            container.add([bg, emoji, label]);
            container.setSize(isMobile ? 110 : 130, isMobile ? 85 : 100);
            container.setInteractive({ draggable: true, useHandCursor: true });

            this.gameContainer.add(container);
            this.input.setDraggable(container);

            // Drag handler with bounds
            container.on('drag', (pointer, dragX, dragY) => {
                container.x = dragX;
                container.y = Math.max(-130 + offset, Math.min(dragY, 110 + offset));
            });

            // Drag end with proper zone detection
            container.on('dragend', () => {
                const containerX = container.x;
                const containerY = container.y;

                // Check if dropped in left zone (Conductor)
                const inLeftZone = (
                    containerX >= leftZoneX - zoneWidth/2 &&
                    containerX <= leftZoneX + zoneWidth/2 &&
                    containerY >= zoneY - zoneHeight/2 &&
                    containerY <= zoneY + zoneHeight/2
                );

                // Check if dropped in right zone (Aislante)
                const inRightZone = (
                    containerX >= rightZoneX - zoneWidth/2 &&
                    containerX <= rightZoneX + zoneWidth/2 &&
                    containerY >= zoneY - zoneHeight/2 &&
                    containerY <= zoneY + zoneHeight/2
                );

                if (inLeftZone && mat.isConductor) {
                    // Correct: placed in conductor zone
                    container.setPosition(leftZoneX, zoneY);
                    container.disableInteractive();
                    this.tweens.add({
                        targets: container,
                        scale: 0.7,
                        duration: 200,
                        ease: 'Power2'
                    });
                    placedCount++;
                    currentMaterial++;
                    this.score += 50;
                    this.scoreText.setText(`${this.score}`);
                    showMaterial();
                } else if (inRightZone && !mat.isConductor) {
                    // Correct: placed in aislante zone
                    container.setPosition(rightZoneX, zoneY);
                    container.disableInteractive();
                    this.tweens.add({
                        targets: container,
                        scale: 0.7,
                        duration: 200,
                        ease: 'Power2'
                    });
                    placedCount++;
                    currentMaterial++;
                    this.score += 50;
                    this.scoreText.setText(`${this.score}`);
                    showMaterial();
                } else if (inLeftZone || inRightZone) {
                    // Wrong zone - show feedback and return
                    const wrongMsg = mat.isConductor 
                        ? '¡No! El ' + mat.name + ' es un CONDUCTOR. La electricidad puede pasar a través de él.'
                        : '¡No! El ' + mat.name + ' es un AISLANTE. No deja pasar la electricidad y nos protege.';
                    
                    this.showFeedbackMessage(wrongMsg, false, () => {
                        this.tweens.add({
                            targets: container,
                            x: 0,
                            y: -50 + offset,
                            duration: 300,
                            ease: 'Power2'
                        });
                    });
                } else {
                    // Not dropped in any zone - return to start
                    this.tweens.add({
                        targets: container,
                        x: 0,
                        y: -50 + offset,
                        duration: 350,
                        ease: 'Power2'
                    });
                }
            });
        };

        showMaterial();
    }

    showSuccessMessage(text, callback) {
        const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5);
        overlay.setOrigin(0);

        const panel = this.add.container(this.scale.width / 2, this.scale.height / 2);

        const bg = this.add.rectangle(0, 0, 300, 160, 0xFFFFFF);
        bg.setStrokeStyle(4, 0x4CAF50);

        const message = this.add.text(0, 0, text, {
            fontSize: this.getFontSize(30),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#4CAF50'
        }).setOrigin(0.5);

        panel.add([bg, message]);

        this.tweens.add({
            targets: panel,
            scale: { from: 0, to: 1 },
            duration: 350,
            ease: 'Back.out'
        });

        this.time.delayedCall(1400, () => {
            overlay.destroy();
            panel.destroy();
            callback();
        });
    }

    showFinalMessage() {
        const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6);
        overlay.setOrigin(0);

        const panel = this.add.container(this.scale.width / 2, this.scale.height / 2);

        const bg = this.add.rectangle(0, 0, 420, 360, 0xFFFFFF);
        bg.setStrokeStyle(5, 0xFFD700);

        const trophy = this.add.text(0, -120, '🏆', {
            fontSize: '75px'
        }).setOrigin(0.5);

        const message = this.add.text(0, -45, '¡Felicidades!', {
            fontSize: this.getFontSize(34),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#1565C0'
        }).setOrigin(0.5);

        const subMessage = this.add.text(0, 5, '¡Eres un experto en', {
            fontSize: this.getFontSize(18),
            fontFamily: '"Nunito", sans-serif',
            color: '#546E7A'
        }).setOrigin(0.5);

        const subMessage2 = this.add.text(0, 28, 'electricidad y materiales!', {
            fontSize: this.getFontSize(18),
            fontFamily: '"Nunito", sans-serif',
            color: '#546E7A'
        }).setOrigin(0.5);

        const scoreMsg = this.add.text(0, 75, `${this.score} puntos`, {
            fontSize: this.getFontSize(30),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#4CAF50'
        }).setOrigin(0.5);

        panel.add([bg, trophy, message, subMessage, subMessage2, scoreMsg]);

        this.tweens.add({
            targets: panel,
            scale: { from: 0, to: 1 },
            duration: 450,
            ease: 'Back.out'
        });
    }

    animateEntrance() {
        this.tweens.add({
            targets: [this.gameTitle],
            y: { from: -50, to: this.gameTitle.y },
            alpha: { from: 0, to: 1 },
            duration: 800,
            ease: 'Back.out'
        });
    }
}
