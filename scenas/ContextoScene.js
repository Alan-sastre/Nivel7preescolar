class ContextoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ContextoScene' });
        this.currentPage = 0;
        this.totalPages = 5;
    }

    preload() {
        this.load.setBaseURL('');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const isMobile = width < 600;

        // Fondo animado con partículas
        this.createAnimatedBackground(width, height);

        // Panel superior con gradiente
        this.createGradientHeader(width, isMobile);

        // Título con animación
        const titleY = isMobile ? 55 : 70;
        this.titleText = this.add.text(width / 2, titleY, 'La Electricidad', {
            fontSize: this.getFontSize(isMobile ? 28 : 36),
            fontFamily: '"Fredoka One", "Nunito", sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#1565C0',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Emoji estático al lado del título (sin animación)
        this.titleIcon = this.add.text(width / 2 + this.titleText.width / 2 + 25, titleY, '⚡', {
            fontSize: this.getFontSize(isMobile ? 32 : 40)
        }).setOrigin(0.5);

        // Contenedor de contenido
        this.contentContainer = this.add.container(width / 2, height / 2 + 10);

        // Botones flotantes con mejor diseño
        this.createFloatingButtons(width, height, isMobile);

        // Indicador de página tipo dots
        this.createPageDots(width, height, isMobile);

        // Mostrar primera página
        this.showPage(0);

        // Animación de entrada
        this.animateEntrance();
    }

    createAnimatedBackground(width, height) {
        // Fondo base degradado azul
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0xE3F2FD, 0xE1F5FE, 0xBBDEFB, 0xB3E5FC, 1);
        graphics.fillRect(0, 0, width, height);

        // Partículas flotantes tipo "electricidad"
        this.particles = [];
        const colors = [0xFFD700, 0xFF6B35, 0x4CAF50, 0x2196F3, 0x9C27B0];
        
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(150, height - 150);
            const size = Phaser.Math.Between(4, 10);
            const color = Phaser.Utils.Array.GetRandom(colors);
            
            const particle = this.add.circle(x, y, size, color, 0.6);
            particle.originalY = y;
            particle.speed = Phaser.Math.FloatBetween(0.5, 2);
            particle.amplitude = Phaser.Math.Between(10, 30);
            
            this.particles.push(particle);
            
            // Animación flotante
            this.tweens.add({
                targets: particle,
                y: y + particle.amplitude,
                x: x + Phaser.Math.Between(-20, 20),
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut',
                delay: Phaser.Math.Between(0, 1000)
            });

            // Pulso de opacidad
            this.tweens.add({
                targets: particle,
                alpha: { from: 0.3, to: 0.8 },
                scale: { from: 0.8, to: 1.2 },
                duration: Phaser.Math.Between(1500, 2500),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut',
                delay: Phaser.Math.Between(0, 500)
            });
        }

        // Líneas de conexión animadas (circuitos)
        this.circuitLines = [];
        for (let i = 0; i < 8; i++) {
            const line = this.add.graphics();
            const startX = Phaser.Math.Between(0, width);
            const startY = Phaser.Math.Between(0, height);
            const endX = startX + Phaser.Math.Between(-100, 100);
            const endY = startY + Phaser.Math.Between(-100, 100);
            
            line.lineStyle(2, Phaser.Utils.Array.GetRandom(colors), 0.3);
            line.lineBetween(startX, startY, endX, endY);
            line.setAlpha(0);
            
            this.circuitLines.push(line);
            
            // Animación de aparición
            this.tweens.add({
                targets: line,
                alpha: { from: 0, to: 0.5 },
                duration: Phaser.Math.Between(1000, 2000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.InOut',
                delay: i * 300
            });
        }

        // Estrellas brillantes
        for (let i = 0; i < 20; i++) {
            const star = this.add.star(
                Phaser.Math.Between(20, width - 20),
                Phaser.Math.Between(20, height - 20),
                5,
                3,
                6,
                0xFFD700,
                0.4
            );
            
            this.tweens.add({
                targets: star,
                rotation: 360,
                scale: { from: 0.5, to: 1 },
                alpha: { from: 0.2, to: 0.6 },
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.InOut',
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }

    createGradientHeader(width, isMobile) {
        // Barra con gradiente
        const bar = this.add.graphics();
        bar.fillGradientStyle(0x2196F3, 0x2196F3, 0x1976D2, 0x1976D2, 1);
        bar.fillRect(0, 0, width, isMobile ? 110 : 130);
        
        // Onda decorativa animada
        const wave = this.add.graphics();
        this.animateWave(wave, width, isMobile ? 110 : 130);
    }

    animateWave(graphics, width, yPosition) {
        const drawWave = (offset) => {
            graphics.clear();
            graphics.fillStyle(0x1976D2, 1);
            graphics.beginPath();
            graphics.moveTo(0, yPosition);
            
            for (let x = 0; x <= width; x += 10) {
                const y = yPosition + Math.sin((x + offset) * 0.02) * 12;
                graphics.lineTo(x, y);
            }
            
            graphics.lineTo(width, 0);
            graphics.lineTo(0, 0);
            graphics.closePath();
            graphics.fill();
        };

        let offset = 0;
        this.time.addEvent({
            delay: 50,
            callback: () => {
                offset += 2;
                drawWave(offset);
            },
            loop: true
        });
    }

    getFontSize(baseSize) {
        const width = this.scale.width;
        if (width < 400) return Math.floor(baseSize * 0.7) + 'px';
        if (width < 600) return Math.floor(baseSize * 0.85) + 'px';
        return baseSize + 'px';
    }

    createFloatingButtons(width, height, isMobile) {
        const btnY = height - (isMobile ? 75 : 95);
        const btnSize = isMobile ? 55 : 70;

        // Botón anterior
        this.prevBtn = this.createCircleButton(
            isMobile ? 55 : 85,
            btnY,
            '←',
            0xFF6B35,
            () => {
                if (this.currentPage > 0) {
                    this.currentPage--;
                    this.showPage(this.currentPage);
                    this.updatePageDots();
                }
            },
            btnSize
        );

        // Botón siguiente
        this.nextBtn = this.createCircleButton(
            width - (isMobile ? 55 : 85),
            btnY,
            '→',
            0xFF6B35,
            () => {
                if (this.currentPage < this.totalPages - 1) {
                    this.currentPage++;
                    this.showPage(this.currentPage);
                    this.updatePageDots();
                } else {
                    this.scene.start('MinijuegoScene');
                }
            },
            btnSize
        );

        // Botón jugar - más grande y destacado
        this.playBtn = this.createCircleButton(
            width / 2,
            btnY,
            '▶',
            0xFFD700,
            () => this.scene.start('MinijuegoScene'),
            isMobile ? 75 : 90,
            true
        );
        this.playBtn.setVisible(false);
    }

    createCircleButton(x, y, text, color, callback, size, isPlayButton = false) {
        const btn = this.add.container(x, y);
        
        // Sombra
        const shadow = this.add.circle(3, 4, size/2, 0x000000, 0.2);
        
        // Círculo principal con borde
        const circle = this.add.circle(0, 0, size/2, color);
        const border = this.add.circle(0, 0, size/2 - 3, color);
        border.setStrokeStyle(3, 0xFFFFFF, 0.5);
        
        // Brillo superior
        const highlight = this.add.ellipse(-size/5, -size/5, size/3, size/4, 0xFFFFFF, 0.4);
        
        const label = this.add.text(0, 0, text, {
            fontSize: this.getFontSize(size > 75 ? 32 : 26),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([shadow, circle, border, highlight, label]);
        btn.setSize(size, size);
        btn.setInteractive({ useHandCursor: true });

        // Animación idle para botón de jugar
        if (isPlayButton) {
            this.tweens.add({
                targets: btn,
                scale: { from: 1, to: 1.08 },
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut'
            });
        }

        btn.on('pointerover', () => {
            this.tweens.add({
                targets: [circle, border, highlight],
                scale: 1.12,
                duration: 150,
                ease: 'Back.out'
            });
            
            // Efecto de brillo
            this.tweens.add({
                targets: highlight,
                alpha: 0.7,
                duration: 150
            });
        });

        btn.on('pointerout', () => {
            this.tweens.add({
                targets: [circle, border, highlight],
                scale: 1,
                duration: 150,
                ease: 'Power2'
            });
            
            this.tweens.add({
                targets: highlight,
                alpha: 0.4,
                duration: 150
            });
        });

        btn.on('pointerdown', () => {
            this.tweens.add({
                targets: [circle, label],
                scale: 0.9,
                duration: 80,
                yoyo: true,
                onComplete: callback
            });
        });

        return btn;
    }

    createPageDots(width, height, isMobile) {
        this.dotsContainer = this.add.container(width / 2, height - (isMobile ? 35 : 40));
        this.dots = [];
        
        const spacing = isMobile ? 15 : 18;
        const startX = -((this.totalPages - 1) * spacing) / 2;
        
        for (let i = 0; i < this.totalPages; i++) {
            const dot = this.add.circle(startX + i * spacing, 0, isMobile ? 6 : 7, 0xFFFFFF, 0.5);
            dot.setStrokeStyle(2, 0x2196F3, 0.5);
            this.dots.push(dot);
            this.dotsContainer.add(dot);
        }
        
        this.updatePageDots();
    }

    updatePageDots() {
        for (let i = 0; i < this.dots.length; i++) {
            if (i === this.currentPage) {
                this.dots[i].setFillStyle(0xFFD700);
                this.dots[i].setStrokeStyle(2, 0xFF6B35);
                
                // Animación de pulso
                this.tweens.add({
                    targets: this.dots[i],
                    scale: { from: 1.3, to: 1.5 },
                    duration: 500,
                    yoyo: true,
                    repeat: 2
                });
            } else {
                this.dots[i].setFillStyle(0xFFFFFF, 0.5);
                this.dots[i].setStrokeStyle(2, 0x2196F3, 0.5);
                this.tweens.add({
                    targets: this.dots[i],
                    scale: 1,
                    duration: 200
                });
            }
        }
    }

    showPage(pageIndex) {
        this.contentContainer.removeAll(true);

        const width = this.scale.width;
        const isMobile = width < 600;

        switch(pageIndex) {
            case 0:
                this.showPage1(isMobile);
                break;
            case 1:
                this.showPage2(isMobile);
                break;
            case 2:
                this.showPage3(isMobile);
                break;
            case 3:
                this.showPage4(isMobile);
                break;
            case 4:
                this.showPage5(isMobile);
                break;
        }

        this.prevBtn.setVisible(pageIndex > 0);
        this.nextBtn.setVisible(pageIndex < this.totalPages - 1);
        this.playBtn.setVisible(pageIndex === this.totalPages - 1);

        // Animación de entrada del contenido
        this.contentContainer.setAlpha(0);
        this.contentContainer.y += 30;
        this.contentContainer.setScale(0.9);
        
        this.tweens.add({
            targets: this.contentContainer,
            alpha: 1,
            y: this.contentContainer.y - 30,
            scale: 1,
            duration: 500,
            ease: 'Back.out'
        });
    }

    showPage1(isMobile) {
        const yBase = isMobile ? -30 : -20;
        
        // Círculo decorativo detrás del icono
        const iconBg = this.add.circle(0, yBase - 50, isMobile ? 75 : 95, 0xFFD700, 0.2);
        
        // Icono grande animado
        const icon = this.add.text(0, yBase - 50, '⚡', {
            fontSize: isMobile ? '90px' : '110px'
        }).setOrigin(0.5);

        const title = this.add.text(0, yBase + 45, '¿Qué es la Electricidad?', {
            fontSize: this.getFontSize(isMobile ? 22 : 28),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#1565C0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const text = this.add.text(0, yBase + 100, 
            '¡Es energía mágica que enciende\nluces y hace funcionar juguetes!', {
            fontSize: this.getFontSize(isMobile ? 16 : 19),
            fontFamily: '"Nunito", sans-serif',
            color: '#455A64',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        this.contentContainer.add([iconBg, icon, title, text]);

        // Animaciones
        this.tweens.add({
            targets: iconBg,
            scale: { from: 0.8, to: 1.2 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });

        this.tweens.add({
            targets: icon,
            rotation: { from: -5, to: 5 },
            scale: { from: 1, to: 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });
    }

    showPage2(isMobile) {
        const yBase = isMobile ? -40 : -30;
        
        // Grid de iconos con fondos de colores
        const icons = [
            { emoji: '☀️', x: -80, y: yBase, color: 0xFF9800, delay: 0 },
            { emoji: '💨', x: 80, y: yBase, color: 0x4CAF50, delay: 100 },
            { emoji: '💧', x: -80, y: yBase + 80, color: 0x2196F3, delay: 200 },
            { emoji: '🔋', x: 80, y: yBase + 80, color: 0x9C27B0, delay: 300 }
        ];

        icons.forEach(iconData => {
            const bg = this.add.circle(iconData.x, iconData.y, isMobile ? 40 : 50, iconData.color, 0.2);
            const icon = this.add.text(iconData.x, iconData.y, iconData.emoji, {
                fontSize: isMobile ? '50px' : '65px'
            }).setOrigin(0.5);

            this.contentContainer.add([bg, icon]);

            // Animación escalonada
            this.tweens.add({
                targets: [bg, icon],
                scale: { from: 0, to: 1 },
                duration: 400,
                delay: iconData.delay,
                ease: 'Back.out'
            });

            // Idle animation
            this.tweens.add({
                targets: icon,
                y: iconData.y - 5,
                duration: 1500 + iconData.delay,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut',
                delay: iconData.delay
            });
        });

        const title = this.add.text(0, yBase + 155, '¿De dónde viene?', {
            fontSize: this.getFontSize(isMobile ? 22 : 28),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#1565C0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const text = this.add.text(0, yBase + 205, 'Del sol, viento, agua y pilas', {
            fontSize: this.getFontSize(isMobile ? 16 : 19),
            fontFamily: '"Nunito", sans-serif',
            color: '#455A64'
        }).setOrigin(0.5);

        this.contentContainer.add([title, text]);
    }

    showPage3(isMobile) {
        const yBase = isMobile ? -30 : -20;
        
        // Dos columnas con iconos y explicaciones
        const leftBg = this.add.circle(-90, yBase - 20, isMobile ? 55 : 70, 0x4CAF50, 0.15);
        const leftIcon = this.add.text(-90, yBase - 20, '🔌', {
            fontSize: isMobile ? '60px' : '75px'
        }).setOrigin(0.5);

        const rightBg = this.add.circle(90, yBase - 20, isMobile ? 55 : 70, 0xFF9800, 0.15);
        const rightIcon = this.add.text(90, yBase - 20, '🛡️', {
            fontSize: isMobile ? '60px' : '75px'
        }).setOrigin(0.5);

        const title = this.add.text(0, yBase + 65, 'Conductores y Aislantes', {
            fontSize: this.getFontSize(isMobile ? 21 : 27),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#1565C0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const leftText = this.add.text(-90, yBase + 125, 'Metales\nSí dejan pasar', {
            fontSize: this.getFontSize(isMobile ? 14 : 16),
            fontFamily: '"Nunito", sans-serif',
            color: '#4CAF50',
            align: 'center',
            lineSpacing: 5
        }).setOrigin(0.5);

        const rightText = this.add.text(90, yBase + 125, 'Plástico/Goma\nNo dejan pasar', {
            fontSize: this.getFontSize(isMobile ? 14 : 16),
            fontFamily: '"Nunito", sans-serif',
            color: '#FF9800',
            align: 'center',
            lineSpacing: 5
        }).setOrigin(0.5);

        this.contentContainer.add([leftBg, leftIcon, rightBg, rightIcon, title, leftText, rightText]);

        // Animaciones
        [leftBg, leftIcon, rightBg, rightIcon].forEach((item, i) => {
            this.tweens.add({
                targets: item,
                y: item.y - 8,
                duration: 1500 + i * 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.inOut'
            });
        });
    }

    showPage4(isMobile) {
        const yBase = isMobile ? -30 : -20;
        
        const iconBg = this.add.circle(0, yBase - 50, isMobile ? 65 : 80, 0xF44336, 0.15);
        const icon = this.add.text(0, yBase - 50, '⚠️', {
            fontSize: isMobile ? '80px' : '100px'
        }).setOrigin(0.5);

        const title = this.add.text(0, yBase + 40, '¡Cuidado!', {
            fontSize: this.getFontSize(isMobile ? 26 : 32),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#D32F2F',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const text = this.add.text(0, yBase + 100, 
            '• No toques con manos mojadas\n• No metas objetos\n• Pide ayuda', {
            fontSize: this.getFontSize(isMobile ? 15 : 17),
            fontFamily: '"Nunito", sans-serif',
            color: '#455A64',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        this.contentContainer.add([iconBg, icon, title, text]);
    }

    showPage5(isMobile) {
        const yBase = isMobile ? -80 : -70;
        
        // Circuito animado - más compacto
        const circuitContainer = this.add.container(0, yBase);
        const scale = isMobile ? 0.7 : 0.85;
        
        // Dibujar circuito simple
        const graphics = this.add.graphics();
        graphics.lineStyle(4, 0xFFD700, 0.5);
        graphics.strokeCircle(0, 0, 60 * scale);
        
        const battery = this.add.text(-45 * scale, 0, '🔋', {
            fontSize: isMobile ? '32px' : '40px'
        }).setOrigin(0.5);
        
        const bulb = this.add.text(45 * scale, 0, '💡', {
            fontSize: isMobile ? '32px' : '40px'
        }).setOrigin(0.5);

        const cable = this.add.text(0, -42 * scale, '〰️', {
            fontSize: isMobile ? '28px' : '36px'
        }).setOrigin(0.5);

        const cable2 = this.add.text(0, 42 * scale, '〰️', {
            fontSize: isMobile ? '28px' : '36px'
        }).setOrigin(0.5);
        cable2.setRotation(Math.PI);

        circuitContainer.add([graphics, battery, bulb, cable, cable2]);

        const title = this.add.text(0, yBase + 55, 'Los Circuitos', {
            fontSize: this.getFontSize(isMobile ? 22 : 26),
            fontFamily: '"Fredoka One", sans-serif',
            color: '#1565C0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const text = this.add.text(0, yBase + 100, 'La energía viaja en círculo', {
            fontSize: this.getFontSize(isMobile ? 15 : 17),
            fontFamily: '"Nunito", sans-serif',
            color: '#455A64'
        }).setOrigin(0.5);

        this.contentContainer.add([circuitContainer, title, text]);

        // Animar circuito
        this.tweens.add({
            targets: circuitContainer,
            rotation: 360,
            duration: 15000,
            repeat: -1
        });

        this.tweens.add({
            targets: bulb,
            scale: { from: 1, to: 1.2 },
            alpha: { from: 0.7, to: 1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    animateEntrance() {
        this.tweens.add({
            targets: [this.titleText, this.titleIcon],
            y: { from: -50, to: this.titleText.y },
            alpha: { from: 0, to: 1 },
            duration: 800,
            ease: 'Back.out'
        });
    }
}
