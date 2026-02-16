class MinijuegoScene extends Phaser.Scene {
  constructor() {
    super({ key: "MinijuegoScene" });
    this.currentGame = 0;
    this.totalGames = 3;
  }

  preload() {
    this.load.audio("musica1", "musica1.mp3");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.isMobile = width < 600;

    // Música de fondo
    this.bgMusic = this.sound.add("musica1", { loop: true, volume: 0.5 });
    this.bgMusic.play();

    // 1. Fondo animado
    this.createAnimatedBackground(width, height);

    // 2. UI Simplificada
    this.createUI(width);

    // 3. Contenedor del juego principal
    this.gameContainer = this.add.container(width / 2, height / 2);

    // Iniciar primer puzzle
    this.startPuzzle(0);
  }

  createUI(width) {
    // Progreso Visual (5 Estrellas realistas)
    this.stars = [];
    const startX = width - 180;
    for (let i = 0; i < 5; i++) {
      const star = this.createStarGraphics(startX + i * 35, 50, 0x555555); // Apagada
      star.setAlpha(0.5);
      this.stars.push(star);
    }

    // --- Control de Audio ---
    const audioContainer = this.add.container(20, 20);

    // Fondo del panel de audio
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x000000, 0.6);
    panelBg.fillRoundedRect(-10, -10, 220, 60, 15);
    panelBg.lineStyle(2, 0xffffff, 0.5);
    panelBg.strokeRoundedRect(-10, -10, 220, 60, 15);
    audioContainer.add(panelBg);

    // Botón de Mute (Gráfico)
    const muteBtnContainer = this.add.container(20, 20);
    const muteBtnBg = this.add.graphics();
    muteBtnBg.fillStyle(0x34495e, 1);
    muteBtnBg.fillCircle(0, 0, 20);
    muteBtnBg.lineStyle(2, 0xffffff);
    muteBtnBg.strokeCircle(0, 0, 20);

    const muteIcon = this.add
      .text(0, 0, "🔊", { fontSize: "24px" })
      .setOrigin(0.5);

    muteBtnContainer.add([muteBtnBg, muteIcon]);
    muteBtnContainer.setSize(40, 40);
    muteBtnContainer.setInteractive({ useHandCursor: true });

    muteBtnContainer.on("pointerdown", () => {
      this.bgMusic.mute = !this.bgMusic.mute;
      muteIcon.setText(this.bgMusic.mute ? "🔇" : "🔊");
      // Animación de pulsación
      this.tweens.add({
        targets: muteBtnContainer,
        scale: 0.9,
        duration: 100,
        yoyo: true,
      });
    });

    // Barra de Volumen (Fondo)
    const barX = 60;
    const barY = 20;
    const barWidth = 120;
    const barHeight = 12;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x555555, 1);
    barBg.fillRoundedRect(barX, barY - barHeight / 2, barWidth, barHeight, 6);

    // Barra de Volumen (Nivel)
    const barLevel = this.add.graphics();
    const updateBar = (vol) => {
      barLevel.clear();
      barLevel.fillStyle(0x2ecc71, 1); // Verde brillante
      barLevel.fillRoundedRect(
        barX,
        barY - barHeight / 2,
        barWidth * vol,
        barHeight,
        6,
      );
    };
    updateBar(this.bgMusic.volume);

    // Knob (Control deslizante - Mejorado)
    const knob = this.add.container(
      barX + barWidth * this.bgMusic.volume,
      barY,
    );
    const knobG = this.add.graphics();
    knobG.fillStyle(0xffffff, 1);
    knobG.fillCircle(0, 0, 10);
    knobG.lineStyle(2, 0xbdc3c7);
    knobG.strokeCircle(0, 0, 10);
    knob.add(knobG);

    knob.setSize(20, 20);
    knob.setInteractive({ draggable: true, useHandCursor: true });

    // Lógica de arrastre del knob
    this.input.setDraggable(knob);

    knob.on("drag", (pointer, dragX, dragY) => {
      // Limitar movimiento horizontal
      let newX = Phaser.Math.Clamp(dragX, barX, barX + barWidth);
      knob.x = newX;

      // Calcular volumen
      const volume = (newX - barX) / barWidth;
      this.bgMusic.setVolume(volume);
      updateBar(volume);

      // Actualizar icono si es 0
      if (volume <= 0.01) {
        muteIcon.setText("🔇");
      } else {
        if (this.bgMusic.mute) {
          this.bgMusic.mute = false;
        }
        muteIcon.setText("🔊");
      }
    });

    // Click en la barra para cambiar volumen
    const barZone = this.add
      .zone(barX + barWidth / 2, barY, barWidth, 30)
      .setInteractive({ useHandCursor: true });

    barZone.on("pointerdown", (pointer) => {
      // Ajustar coordenada local relativa al contenedor
      const localX = pointer.x - audioContainer.x;
      let newX = Phaser.Math.Clamp(localX, barX, barX + barWidth);

      knob.x = newX;
      const volume = (newX - barX) / barWidth;
      this.bgMusic.setVolume(volume);
      updateBar(volume);

      // Animación del knob al saltar
      this.tweens.add({
        targets: knob,
        scale: 1.2,
        duration: 100,
        yoyo: true,
      });

      if (volume <= 0.01) {
        muteIcon.setText("🔇");
      } else {
        if (this.bgMusic.mute) {
          this.bgMusic.mute = false;
        }
        muteIcon.setText("🔊");
      }
    });

    audioContainer.add([muteBtnContainer, barBg, barLevel, barZone, knob]);
    this.audioContainer = audioContainer; // Referencia
  }

  createStarGraphics(x, y, color) {
    const star = this.add.graphics({ x: x, y: y });
    star.fillStyle(color, 1);
    star.beginPath();
    const points = 5;
    const outer = 15;
    const inner = 7;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / points - Math.PI / 2;
      star.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    star.closePath();
    star.fillPath();
    star.lineStyle(1, 0xffffff);
    star.strokePath();
    return star;
  }

  startPuzzle(index) {
    this.gameContainer.removeAll(true);
    this.input.removeAllListeners();
    this.currentGame = index;

    this.gameContainer.setAlpha(0);
    this.tweens.add({
      targets: this.gameContainer,
      alpha: 1,
      duration: 500,
    });

    switch (index) {
      case 0:
        this.puzzlePlug();
        break;
      case 1:
        this.puzzleBattery();
        break;
      case 2:
        this.puzzleSwitch();
        break;
      case 3:
        this.puzzleFan();
        break;
      case 4:
        this.puzzleCar();
        break;
      default:
        this.showFinalCelebration();
    }
  }

  // --- PUZZLE 1: ENCHUFE ---
  puzzlePlug() {
    // 1. Tomacorriente (Meta)
    const socket = this.add.container(0, -80);

    // Placa base (Sombra)
    const plateShadow = this.add.graphics();
    plateShadow.fillStyle(0xaaaaaa, 1); // Sombra más oscura
    plateShadow.fillRoundedRect(-58, -58, 120, 120, 12);

    // Placa principal
    const plate = this.add.graphics();
    plate.fillStyle(0xffffff, 1);
    plate.fillRoundedRect(-60, -60, 120, 120, 10);
    plate.lineStyle(3, 0xc0c0c0); // Borde más suave
    plate.strokeRoundedRect(-60, -60, 120, 120, 10);
    // Bisel interior
    plate.lineStyle(1, 0xf0f0f0);
    plate.strokeRoundedRect(-58, -58, 116, 116, 9);

    // Tornillos (más detallados y 3D)
    const screw1 = this.add.graphics();
    screw1.fillStyle(0x888888, 1); // Color base del tornillo
    screw1.fillCircle(0, -45, 6);
    screw1.lineStyle(1, 0x555555); // Borde oscuro
    screw1.strokeCircle(0, -45, 6);
    screw1.lineStyle(2, 0xaaaaaa); // Ranura más realista
    screw1.beginPath();
    screw1.moveTo(-4, -45);
    screw1.lineTo(4, -45);
    screw1.strokePath();

    const screw2 = this.add.graphics();
    screw2.fillStyle(0x888888, 1);
    screw2.fillCircle(0, 45, 6);
    screw2.lineStyle(1, 0x555555);
    screw2.strokeCircle(0, 45, 6);
    screw2.lineStyle(2, 0xaaaaaa);
    screw2.beginPath();
    screw2.moveTo(-4, 45);
    screw2.lineTo(4, 45);
    screw2.strokePath();

    // Enchufe Hembra (Holes) con profundidad y brillo metálico
    const holeGroup = this.add.graphics();
    // Fondo oscuro (profundidad)
    holeGroup.fillStyle(0x1a1a1a, 1); // Más oscuro para mayor profundidad
    holeGroup.fillRoundedRect(-30, -15, 12, 30, 4); // Izquierda
    holeGroup.fillRoundedRect(18, -15, 12, 30, 4); // Derecha
    // Borde interior (brillo metálico)
    holeGroup.lineStyle(2, 0xcccccc); // Brillo más claro
    holeGroup.strokeRoundedRect(-30, -15, 12, 30, 4);
    holeGroup.strokeRoundedRect(18, -15, 12, 30, 4);
    // Contactos internos (simulación de metal)
    holeGroup.fillStyle(0xaaaaaa, 1);
    holeGroup.fillRect(-28, -13, 8, 26);
    holeGroup.fillRect(20, -13, 8, 26);
    holeGroup.fillStyle(0xffffff, 0.3); // Brillo en los contactos
    holeGroup.fillRect(-26, -13, 4, 26);
    holeGroup.fillRect(22, -13, 4, 26);

    // Tierra (Tercer agujero opcional para realismo)
    holeGroup.fillStyle(0x1a1a1a, 1);
    holeGroup.fillCircle(0, 25, 8);
    holeGroup.lineStyle(2, 0xcccccc);
    holeGroup.strokeCircle(0, 25, 8);
    // Contacto interno de tierra
    holeGroup.fillStyle(0xaaaaaa, 1);
    holeGroup.fillCircle(0, 25, 5);
    holeGroup.fillStyle(0xffffff, 0.3);
    holeGroup.fillCircle(0, 25, 3);

    socket.add([plateShadow, plate, screw1, screw2, holeGroup]);

    // Zona de caída
    const dropZone = this.add
      .zone(0, -80, 100, 100)
      .setRectangleDropZone(100, 100);
    this.gameContainer.add([socket, dropZone]);

    // 2. Enchufes
    // Correcto (Macho estándar)
    const plugCorrect = this.createRealisticPlug("correct", 0, 150, 0x34495e);

    // Incorrectos (Destornillador y Moneda)
    const screwdriver = this.createScrewdriver("screwdriver", -150, 150);
    const coin = this.createCoin("coin", 150, 150);

    // Lógica de arrastre
    this.setupDragDrop(plugCorrect, dropZone, 0, () => {
      // Animación de cable conectado
      const cord = this.add.graphics();
      cord.lineStyle(8, 0x2c3e50);

      const startPoint = new Phaser.Math.Vector2(0, -20);
      const controlPoint = new Phaser.Math.Vector2(0, 150);
      const endPoint = new Phaser.Math.Vector2(0, 300);

      const curve = new Phaser.Curves.QuadraticBezier(
        startPoint,
        controlPoint,
        endPoint,
      );
      curve.draw(cord);
      // Sombra del cable
      cord.lineStyle(8, 0x000000, 0.3);
      const shadowCurve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(startPoint.x + 2, startPoint.y),
        new Phaser.Math.Vector2(controlPoint.x + 5, controlPoint.y + 10),
        new Phaser.Math.Vector2(endPoint.x + 2, endPoint.y),
      );
      shadowCurve.draw(cord);
      // Brillo sutil
      cord.lineStyle(2, 0xffffff, 0.1);
      const highlightCurve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(startPoint.x - 2, startPoint.y),
        new Phaser.Math.Vector2(controlPoint.x - 5, controlPoint.y - 10),
        new Phaser.Math.Vector2(endPoint.x - 2, endPoint.y),
      );
      highlightCurve.draw(cord);

      this.gameContainer.addAt(cord, 0);
    });

    // Configurar arrastre para objetos incorrectos
    this.setupDragDrop(screwdriver, dropZone, -1); // -1 indica objeto incorrecto
    this.setupDragDrop(coin, dropZone, -1); // -1 indica objeto incorrecto

    // Mostrar pista de mano
    this.showDragHint(plugCorrect, dropZone);
  }

  createRealisticPlug(name, x, y, color) {
    const container = this.add.container(x, y);
    container.name = name;

    // Highlight Circle
    const highlight = this.createHighlightCircle(80, 120);
    container.add(highlight);

    // Cable saliendo del enchufe
    const cable = this.add.graphics();
    cable.lineStyle(6, 0x2c3e50); // Color del cable oscuro
    const p1 = new Phaser.Math.Vector2(0, 35);
    const p2 = new Phaser.Math.Vector2(0, 60);
    const p3 = new Phaser.Math.Vector2(-20, 80);
    const curve = new Phaser.Curves.QuadraticBezier(p1, p2, p3);
    curve.draw(cable);

    // Cuerpo del enchufe
    const body = this.add.graphics();
    body.fillStyle(color, 1);
    body.fillRoundedRect(-35, -35, 70, 70, 15);
    // Sombra lateral para volumen
    body.fillStyle(0x000000, 0.2); // Sombra más pronunciada
    body.fillRect(25, -35, 10, 70);
    // Brillo superior
    body.fillStyle(0xffffff, 0.3); // Brillo más intenso
    body.fillRoundedRect(-25, -25, 50, 20, 10);
    // Biselado
    body.lineStyle(1, 0xcccccc);
    body.strokeRoundedRect(-35, -35, 70, 70, 15);

    // Grips (agarre)
    body.fillStyle(0x000000, 0.3); // Más oscuro y pronunciado
    for (let i = 0; i < 3; i++) {
      body.fillRoundedRect(-25, -10 + i * 15, 50, 5, 2);
    }
    // Textura sutil
    body.fillStyle(0x000000, 0.1);
    body.fillRoundedRect(-25, -10, 50, 35, 2);

    // Patas metálicas
    const prongs = this.add.graphics();
    // Base de las patas
    prongs.fillStyle(0xaaaaaa, 1); // Color base metálico
    prongs.fillRoundedRect(-20, -60, 10, 30, 2); // Pata izq
    prongs.fillRoundedRect(10, -60, 10, 30, 2); // Pata der
    // Brillo metálico
    prongs.fillStyle(0xffffff, 0.6); // Brillo más fuerte
    prongs.fillRect(-18, -60, 4, 28);
    prongs.fillRect(12, -60, 4, 28);
    // Sombra para dar volumen
    prongs.fillStyle(0x555555, 0.3);
    prongs.fillRect(-20, -60, 10, 30);
    prongs.fillRect(10, -60, 10, 30);
    // Biselado
    prongs.lineStyle(1, 0x777777);
    prongs.strokeRoundedRect(-20, -60, 10, 30, 2);
    prongs.strokeRoundedRect(10, -60, 10, 30, 2);

    // Cable saliendo
    const cord = this.add.graphics();
    cord.lineStyle(8, color);
    cord.beginPath();
    cord.moveTo(0, 35);
    cord.lineTo(0, 60);
    cord.strokePath();
    // Sombra del cable
    cord.lineStyle(8, 0x000000, 0.2);
    cord.beginPath();
    cord.moveTo(2, 35);
    cord.lineTo(2, 60);
    cord.strokePath();
    // Textura sutil del cable
    cord.lineStyle(1, 0xffffff, 0.1);
    cord.beginPath();
    cord.moveTo(0, 40);
    cord.lineTo(0, 55);
    cord.strokePath();

    container.add([cord, prongs, body]);
    container.setSize(80, 120);
    container.setInteractive({ draggable: true });
    this.gameContainer.add(container);
    return container;
  }

  createCoin(name, x, y) {
    const container = this.add.container(x, y);
    container.name = name;

    // Highlight Circle
    const highlight = this.createHighlightCircle(40, 40);
    container.add(highlight);

    const g = this.add.graphics();

    // Moneda (cuerpo)
    g.fillStyle(0xffd700, 1); // Oro
    g.fillCircle(0, 0, 20);
    // Borde
    g.lineStyle(2, 0xb8860b); // Marrón oscuro
    g.strokeCircle(0, 0, 20);
    // Relieve (simulado)
    g.lineStyle(1, 0xffeb3b); // Brillo
    g.strokeCircle(0, 0, 18);
    g.lineStyle(1, 0xccac00); // Sombra
    g.strokeCircle(0, 0, 16);

    container.add(g);
    container.setSize(40, 40);
    container.setInteractive({ draggable: true });
    this.gameContainer.add(container);
    return container;
  }

  createScrewdriver(name, x, y) {
    const container = this.add.container(x, y);
    container.name = name;

    // Highlight Circle
    const highlight = this.createHighlightCircle(40, 100);
    container.add(highlight);

    const g = this.add.graphics();

    // Mango (plástico)
    g.fillStyle(0x34495e, 1); // Azul oscuro
    g.fillRoundedRect(-10, -40, 20, 50, 5);
    // Sombra del mango
    g.fillStyle(0x2c3e50, 1);
    g.fillRoundedRect(0, -40, 10, 50, 5);
    // Brillo del mango
    g.fillStyle(0x5dade2, 0.3);
    g.fillRoundedRect(-8, -38, 16, 10, 3);

    // Parte metálica (eje)
    g.fillStyle(0xbdc3c7, 1); // Gris metálico
    g.fillRect(-3, 10, 6, 30);
    // Sombra del eje
    g.fillStyle(0x95a5a6, 1);
    g.fillRect(0, 10, 3, 30);
    // Brillo del eje
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(-2, 12, 2, 26);

    // Punta (plana)
    g.fillStyle(0x7f8c8d, 1); // Gris oscuro
    g.fillTriangle(-8, 40, 8, 40, 0, 50);
    // Sombra de la punta
    g.fillStyle(0x546e7a, 1);
    g.fillTriangle(0, 40, 8, 40, 0, 50);

    container.add(g);
    container.setSize(40, 100); // Ajustar tamaño para interacción
    container.setInteractive({ draggable: true });
    this.gameContainer.add(container);
    return container;
  }

  // --- PUZZLE 2: BATERÍA ---
  puzzleBattery() {
    // Juguete (Robot Mejorado)
    const toy = this.add.container(0, -60);

    // Piernas
    const legs = this.add.graphics();
    legs.fillStyle(0x607d8b, 1); // Gris azulado más oscuro
    legs.fillRoundedRect(-40, 60, 20, 40, 5); // Pierna Izq
    legs.fillRoundedRect(20, 60, 20, 40, 5); // Pierna Der
    legs.fillStyle(0x78909c, 1); // Pies más claros
    legs.fillRoundedRect(-45, 90, 30, 15, 5);
    legs.fillRoundedRect(15, 90, 30, 15, 5);
    // Detalles de articulación
    legs.lineStyle(2, 0x455a64);
    legs.strokeCircle(-30, 60, 5);
    legs.strokeCircle(30, 60, 5);

    // Brazos
    const arms = this.add.graphics();
    arms.fillStyle(0x607d8b, 1);
    arms.fillRoundedRect(-90, -40, 30, 80, 10); // Brazo Izq
    arms.fillRoundedRect(60, -40, 30, 80, 10); // Brazo Der
    // Manos (Pinzas)
    arms.lineStyle(4, 0x78909c);
    arms.beginPath();
    arms.arc(-75, 45, 10, 0, Math.PI, true); // Pinza Izq
    arms.strokePath();
    arms.beginPath();
    arms.arc(75, 45, 10, 0, Math.PI, true); // Pinza Der
    arms.strokePath();
    // Articulaciones de hombro
    arms.lineStyle(2, 0x455a64);
    arms.strokeCircle(-75, -30, 8);
    arms.strokeCircle(75, -30, 8);

    // Cuerpo Principal
    const body = this.add.graphics();
    body.fillStyle(0x3f51b5, 1); // Azul metalizado principal
    body.fillRoundedRect(-60, -80, 120, 140, 20);
    // Sombreado y reflejos para volumen
    body.fillStyle(0x283593, 1); // Sombra
    body.fillRoundedRect(-60, -80, 120, 140, 20);
    body.fillStyle(0x5c6bc0, 0.5); // Reflejo
    body.fillRoundedRect(-50, -70, 100, 20, 10);

    // Panel de control (pecho)
    body.fillStyle(0x2c3e50, 1);
    body.fillRoundedRect(-40, -60, 80, 60, 5);
    // Bisel del panel
    body.lineStyle(2, 0x1a252f);
    body.strokeRoundedRect(-40, -60, 80, 60, 5);
    // Botones 3D
    body.fillStyle(0xe74c3c, 1);
    body.fillCircle(-20, -45, 5);
    body.lineStyle(1, 0xc0392b);
    body.strokeCircle(-20, -45, 5);
    body.fillStyle(0xf1c40f, 1);
    body.fillCircle(0, -45, 5);
    body.lineStyle(1, 0xf39c12);
    body.strokeCircle(0, -45, 5);
    body.fillStyle(0x2ecc71, 1);
    body.fillCircle(20, -45, 5);
    body.lineStyle(1, 0x27ae60);
    body.strokeCircle(20, -45, 5);
    // Rejilla altavoz más definida
    body.lineStyle(2, 0x7f8c8d);
    body.beginPath();
    body.moveTo(-30, -25);
    body.lineTo(30, -25);
    body.moveTo(-30, -20);
    body.lineTo(30, -20);
    body.moveTo(-30, -15);
    body.lineTo(30, -15);
    body.strokePath();
    body.lineStyle(1, 0x7f8c8d);
    body.beginPath();
    body.moveTo(-25, -30);
    body.lineTo(-25, -10);
    body.moveTo(-15, -30);
    body.lineTo(-15, -10);
    body.moveTo(15, -30);
    body.lineTo(15, -10);
    body.moveTo(25, -30);
    body.lineTo(25, -10);
    body.strokePath();

    // Cabeza
    const head = this.add.graphics();
    head.fillStyle(0x5c6bc0, 1);
    head.fillRoundedRect(-50, -150, 100, 65, 15);
    // Sombreado
    head.fillStyle(0x3f51b5, 1);
    head.fillRoundedRect(-50, -150, 100, 65, 15);
    head.fillStyle(0x7986cb, 0.5); // Reflejo
    head.fillRoundedRect(-40, -140, 80, 15, 8);
    // Antena más detallada
    head.lineStyle(4, 0x7f8c8d);
    head.beginPath();
    head.moveTo(0, -150);
    head.lineTo(0, -170);
    head.strokePath();
    head.fillStyle(0xe74c3c, 1);
    head.fillCircle(0, -170, 8); // Bola antena
    head.lineStyle(2, 0xc0392b);
    head.strokeCircle(0, -170, 8); // Borde

    // Ojos (Pantalla LED)
    const facePlate = this.add.graphics();
    facePlate.fillStyle(0x000000, 1);
    facePlate.fillRoundedRect(-40, -140, 80, 40, 5);
    // Borde de la pantalla
    facePlate.lineStyle(2, 0x333333);
    facePlate.strokeRoundedRect(-40, -140, 80, 40, 5);

    // Ojos apagados
    const eyes = this.add.graphics();
    eyes.fillStyle(0x333333, 1);
    eyes.fillCircle(-20, -120, 10);
    eyes.fillCircle(20, -120, 10);
    // Brillo sutil
    eyes.lineStyle(1, 0x555555);
    eyes.strokeCircle(-20, -120, 10);
    eyes.strokeCircle(20, -120, 10);

    // Ranura para batería (Abierta en el pecho/estómago)
    const slot = this.add.graphics();
    slot.fillStyle(0x1a252f, 1); // Fondo oscuro hueco
    slot.fillRoundedRect(-35, 10, 70, 40, 5); // Ubicado abajo del panel
    // Bisel de la ranura
    slot.lineStyle(2, 0x0d1317);
    slot.strokeRoundedRect(-35, 10, 70, 40, 5);
    // Contactos metálicos
    slot.fillStyle(0xc0392b, 1); // Positivo (rojo)
    slot.fillRect(25, 15, 5, 30);
    slot.fillStyle(0x7f8c8d, 1); // Negativo (muelle)
    slot.fillRect(-30, 15, 5, 30);
    // Brillo en contactos
    slot.fillStyle(0xffffff, 0.4);
    slot.fillRect(26, 15, 2, 30);
    slot.fillRect(-29, 15, 2, 30);
    // Indicadores polaridad
    slot.lineStyle(2, 0xffffff);
    // +
    slot.beginPath();
    slot.moveTo(15, 20);
    slot.lineTo(15, 30);
    slot.moveTo(10, 25);
    slot.lineTo(20, 25);
    slot.strokePath();
    // -
    slot.beginPath();
    slot.moveTo(-15, 25);
    slot.lineTo(-5, 25);
    slot.strokePath();

    toy.add([legs, arms, body, head, facePlate, eyes, slot]);
    this.toyEyes = eyes; // Referencia para animar
    this.toyAntenna = head; // Para animar luz antena

    const dropZone = this.add.zone(0, -40, 80, 50).setRectangleDropZone(80, 50);
    this.gameContainer.add([toy, dropZone]);

    // Batería realista
    const battery = this.createRealisticBattery(0, 180);

    // Ayuda (Mano en vez de flecha)
    this.showDragHint(battery, dropZone);

    this.setupDragDrop(battery, dropZone, 1, () => {
      // Encender ojos (Verde brillante)
      this.toyEyes.clear();
      this.toyEyes.fillStyle(0x00ff00, 1);
      this.toyEyes.fillCircle(-20, -120, 10);
      this.toyEyes.fillCircle(20, -120, 10);
      // Brillo ojos
      this.toyEyes.lineStyle(2, 0xa5d6a7);
      this.toyEyes.strokeCircle(-20, -120, 10);
      this.toyEyes.strokeCircle(20, -120, 10);

      // Mover robot (Baile de victoria)
      this.tweens.add({
        targets: toy,
        y: "-=20",
        angle: { from: -5, to: 5 },
        duration: 300,
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          toy.setAngle(0);
        },
      });

      // Parpadeo antena
      this.tweens.add({
        targets: this.toyAntenna,
        alpha: 0.5,
        duration: 200,
        yoyo: true,
        repeat: 10,
      });
    });
  }

  createRealisticBattery(x, y) {
    const container = this.add.container(x, y);

    // Highlight Circle
    const highlight = this.createHighlightCircle(60, 40);
    container.add(highlight);

    const g = this.add.graphics();
    // Cuerpo cilíndrico principal (más metálico)
    g.fillStyle(0x2e7d32, 1); // Verde oscuro más realista
    g.fillRoundedRect(-25, -15, 50, 30, 5);

    // Degradado/Sombreado metálico (simulado con líneas)
    g.fillStyle(0xffffff, 0.2);
    g.fillRect(-25, -5, 50, 10); // Reflejo central horizontal

    // Sombreado lateral para efecto 3D
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-25, -15, 50, 5, { tl: 5, tr: 5, bl: 0, br: 0 }); // Sombra superior
    g.fillRoundedRect(-25, 10, 50, 5, { tl: 0, tr: 0, bl: 5, br: 5 }); // Sombra inferior

    // Polo positivo (+) - Botón dorado/latón
    // Base del polo
    g.fillStyle(0xf1c40f, 1); // Dorado
    g.fillCircle(25, 0, 8); // Centrado en Y
    // Brillo
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(23, -2, 3);
    // Borde
    g.lineStyle(2, 0xb7950b);
    g.strokeCircle(25, 0, 8);

    // Polo negativo (-) - Base plana metálica
    g.fillStyle(0xbdc3c7, 1); // Plata
    g.fillRoundedRect(-28, -10, 3, 20, 1); // Placa de contacto
    g.lineStyle(1, 0x7f8c8d);
    g.strokeRoundedRect(-28, -10, 3, 20, 1);

    // Etiqueta de marca "VOLT"
    g.fillStyle(0x000000, 1); // Banda negra
    g.fillRect(-15, -15, 30, 30);

    // Rayo Icono
    g.fillStyle(0xffff00, 1);
    g.beginPath();
    g.moveTo(-5, -5);
    g.lineTo(5, -5);
    g.lineTo(-2, 5);
    g.lineTo(2, 5);
    g.lineTo(-5, 12);
    g.lineTo(-5, 2);
    g.lineTo(-8, 2);
    g.closePath();
    g.fillPath();

    // Texto "+" y "-"
    g.lineStyle(2, 0xffffff);
    // +
    g.beginPath();
    g.moveTo(15, -8);
    g.lineTo(15, -2);
    g.moveTo(12, -5);
    g.lineTo(18, -5);
    g.strokePath();
    // -
    g.beginPath();
    g.moveTo(-20, -5);
    g.lineTo(-14, -5);
    g.strokePath();

    container.add(g);
    container.setSize(60, 40);
    container.setInteractive({ draggable: true });
    this.gameContainer.add(container);
    return container;
  }

  // --- PUZZLE 3: INTERRUPTOR ---
  puzzleSwitch() {
    // Bombilla realista (Mejorada)
    const bulbContainer = this.add.container(0, -80);

    // Base de rosca (Casquillo)
    const base = this.add.graphics();
    base.fillStyle(0x95a5a6, 1); // Gris metálico claro
    // Espirales de la rosca
    for (let i = 0; i < 3; i++) {
      base.fillRoundedRect(-12, 30 + i * 6, 24, 5, 2);
    }
    // Punta inferior (contacto)
    base.fillStyle(0x2c3e50, 1); // Aislante negro
    base.fillCircle(0, 52, 6);
    base.fillStyle(0x7f8c8d, 1); // Metal punta
    base.fillCircle(0, 52, 3);

    // Cristal (Bulbo)
    const glass = this.add.graphics();
    // Fondo apagado (blanco grisáceo)
    glass.fillStyle(0xe0e0e0, 0.3);
    glass.fillCircle(0, 0, 45);
    // Borde sutil
    glass.lineStyle(2, 0xbdc3c7, 0.8);
    glass.strokeCircle(0, 0, 45);
    // Reflejo realista (brillo en el cristal)
    glass.fillStyle(0xffffff, 0.7);
    const glassPath = new Phaser.Curves.Path(-15, -15);
    glassPath.cubicBezierTo(-10, -25, 10, -25, 15, -15);
    glassPath.cubicBezierTo(10, -18, -10, -18, -15, -15);
    glass.fillPoints(glassPath.getPoints());

    // Filamento (Tungsteno)
    const filament = this.add.graphics();
    filament.lineStyle(2, 0x555555); // Gris oscuro apagado
    // Soportes
    filament.beginPath();
    filament.moveTo(-8, 30);
    filament.lineTo(-8, 10);
    filament.moveTo(8, 30);
    filament.lineTo(8, 10);
    filament.strokePath();
    // Espiral (Zigzag)
    filament.lineStyle(1, 0x555555);
    filament.beginPath();
    filament.moveTo(-8, 10);
    filament.lineTo(-4, 0);
    filament.lineTo(0, 10);
    filament.lineTo(4, 0);
    filament.lineTo(8, 10);
    filament.strokePath();

    bulbContainer.add([base, glass, filament]);
    this.bulbGlass = glass; // Referencia
    this.bulbFilament = filament; // Referencia al filamento

    // Interruptor realista
    const switchContainer = this.add.container(0, 100);

    // Highlight Circle
    const highlight = this.createHighlightCircle(80, 120);
    switchContainer.add(highlight);

    const housing = this.add.graphics();
    housing.fillStyle(0xf5f5f5, 1);
    housing.fillRoundedRect(-40, -60, 80, 120, 10);
    housing.lineStyle(2, 0xbdc3c7);
    housing.strokeRoundedRect(-40, -60, 80, 120, 10);
    // Tornillos del interruptor
    housing.fillStyle(0xbdc3c7, 1);
    housing.fillCircle(0, -50, 3);
    housing.fillCircle(0, 50, 3);

    // Botón basculante
    const button = this.add.graphics();
    button.fillStyle(0xe74c3c, 1); // Rojo (OFF)
    button.fillRoundedRect(-20, -30, 40, 60, 5);
    // Sombra para 3D (Parte inferior sombreada = OFF)
    button.fillStyle(0x000000, 0.2);
    button.fillRect(-20, 0, 40, 30);

    switchContainer.add([housing, button]);
    switchContainer.setSize(80, 120);
    this.isSwitchOn = false; // Estado inicial del interruptor

    switchContainer
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        // Eliminar pista de mano si existe
        if (this.activeHand) {
          this.activeHand.destroy();
          this.activeHand = null;
        }
        if (this.activeHandTween) {
          this.activeHandTween.stop();
          this.activeHandTween = null;
        }

        this.isSwitchOn = !this.isSwitchOn; // Alternar estado

        if (this.isSwitchOn) {
          // Encender
          button.clear();
          button.fillStyle(0x27ae60, 1); // Verde (ON)
          button.fillRoundedRect(-20, -30, 40, 60, 5);
          button.fillStyle(0x000000, 0.2);
          button.fillRect(-20, -30, 40, 30); // Parte superior sombreada (ON)

          // Encender luz
          this.bulbGlass.clear();
          this.bulbGlass.fillStyle(0xf1c40f, 1); // Amarillo brillante
          this.bulbGlass.fillCircle(0, 0, 40);
          this.bulbGlass.lineStyle(2, 0xf39c12);
          this.bulbGlass.strokeCircle(0, 0, 40);
          this.bulbGlass.setAlpha(0.3); // Brillo sutil del vidrio

          this.bulbFilament.clear();
          this.bulbFilament.lineStyle(2, 0xffffff); // Filamento blanco brillante
          this.bulbFilament.beginPath();
          this.bulbFilament.moveTo(-10, 30);
          this.bulbFilament.lineTo(-10, 10);
          this.bulbFilament.lineTo(-5, 0);
          this.bulbFilament.lineTo(5, 0);
          this.bulbFilament.lineTo(10, 10);
          this.bulbFilament.lineTo(10, 30);
          this.bulbFilament.strokePath();
          this.bulbFilament.lineStyle(1, 0xffffff);
          this.bulbFilament.beginPath();
          this.bulbFilament.moveTo(-5, 0);
          this.bulbFilament.lineTo(-2, -5);
          this.bulbFilament.lineTo(2, 0);
          this.bulbFilament.lineTo(5, -5);
          this.bulbFilament.lineTo(5, 0);
          this.bulbFilament.strokePath();
          this.bulbFilament.fillStyle(0xffffff, 0.8); // Brillo intenso en el filamento
          this.bulbFilament.fillCircle(0, 0, 5);
          this.bulbFilament.setAlpha(1);

          // Resplandor
          const glow = this.add.graphics();
          glow.fillStyle(0xf1c40f, 0.3);
          glow.fillCircle(0, 0, 80);
          this.gameContainer.addAt(glow, 0);
          this.tweens.add({
            targets: glow,
            alpha: 0.6,
            scale: 1.2,
            yoyo: true,
            repeat: -1,
            duration: 500,
          });
          this.bulbGlow = glow; // Guardar referencia al resplandor

          this.completeLevel(2);
        } else {
          // Apagar
          button.clear();
          button.fillStyle(0xe74c3c, 1); // Rojo (OFF)
          button.fillRoundedRect(-20, -30, 40, 60, 5);
          button.fillStyle(0x000000, 0.2);
          button.fillRect(-20, 0, 40, 30); // Parte inferior sombreada (OFF)

          // Apagar luz
          this.bulbGlass.clear();
          this.bulbGlass.fillStyle(0xecf0f1, 0.1); // Vidrio muy sutil
          this.bulbGlass.fillCircle(0, 0, 40);
          this.bulbGlass.lineStyle(2, 0xbdc3c7);
          this.bulbGlass.strokeCircle(0, 0, 40);
          this.bulbGlass.setAlpha(1); // Restaurar alpha del vidrio

          this.bulbFilament.clear();
          this.bulbFilament.lineStyle(2, 0x7f8c8d);
          this.bulbFilament.beginPath();
          this.bulbFilament.moveTo(-10, 30);
          this.bulbFilament.lineTo(-10, 10);
          this.bulbFilament.lineTo(-5, 0);
          this.bulbFilament.lineTo(5, 0);
          this.bulbFilament.lineTo(10, 10);
          this.bulbFilament.lineTo(10, 30);
          this.bulbFilament.strokePath();
          this.bulbFilament.lineStyle(1, 0x34495e);
          this.bulbFilament.beginPath();
          this.bulbFilament.moveTo(-5, 0);
          this.bulbFilament.lineTo(-2, -5);
          this.bulbFilament.lineTo(2, 0);
          this.bulbFilament.lineTo(5, -5);
          this.bulbFilament.lineTo(5, 0);
          this.bulbFilament.strokePath();
          this.bulbFilament.fillStyle(0xffffff, 0.1);
          this.bulbFilament.fillCircle(0, 0, 3);
          this.bulbFilament.setAlpha(1); // Restaurar alpha del filamento

          if (this.bulbGlow) {
            this.bulbGlow.destroy();
            this.bulbGlow = null;
          }
        }
      });

    // Animación de pulso en el botón
    this.tweens.add({
      targets: switchContainer,
      scale: 1.05,
      yoyo: true,
      repeat: -1,
      duration: 800,
    });

    // Pista de mano pulsando
    const hand = this.createHand(0, 150);
    this.gameContainer.add(hand);
    this.activeHand = hand;

    this.activeHandTween = this.tweens.add({
      targets: hand,
      y: 130, // Pulsar
      duration: 500,
      yoyo: true,
      repeat: -1,
      hold: 200,
    });

    this.gameContainer.add([bulbContainer, switchContainer]);
  }

  // --- PUZZLE 4: CIRCUITO ROTO Y VENTILADOR ---
  puzzleFan() {
    // Ventilador (Fan)
    const fanContainer = this.add.container(0, -160); // Subido para evitar salir de pantalla

    // Base del ventilador
    const base = this.add.graphics();
    base.fillStyle(0x34495e, 1);
    base.fillRoundedRect(-20, 40, 40, 10, 5);
    base.fillRect(-5, 0, 10, 40);

    // Motor
    const motor = this.add.graphics();
    motor.fillStyle(0x95a5a6, 1);
    motor.fillCircle(0, 0, 15);

    // Aspas (más realistas)
    const blades = this.add.graphics();
    // Aspa 1
    blades.fillStyle(0x95a5a6, 1); // Gris metálico
    blades.fillRoundedRect(-5, -50, 10, 50, 5);
    // Sombra y brillo para volumen
    blades.fillStyle(0x7f8c8d, 1);
    blades.fillRoundedRect(-5, -50, 10, 25, 5);
    blades.fillStyle(0xb0bec5, 0.5);
    blades.fillRoundedRect(-5, -25, 10, 25, 5);

    const bladeGroup = this.add.container(0, 0);
    for (let i = 0; i < 3; i++) {
      const b = this.add.graphics();
      b.fillStyle(0x95a5a6, 1); // Gris metálico
      b.fillRoundedRect(-5, -50, 10, 50, 5);
      b.fillStyle(0x7f8c8d, 1);
      b.fillRoundedRect(-5, -50, 10, 25, 5);
      b.fillStyle(0xb0bec5, 0.5);
      b.fillRoundedRect(-5, -25, 10, 25, 5);
      b.setAngle(i * 120);
      bladeGroup.add(b);
    }

    // Rejilla frontal (más detallada)
    const cage = this.add.graphics();
    cage.lineStyle(3, 0xbdc3c7); // Borde más grueso
    cage.strokeCircle(0, 0, 55);
    // Barras internas
    cage.lineStyle(1, 0xbdc3c7, 0.7);
    for (let i = 0; i < 12; i++) {
      const angle = Phaser.Math.DegToRad(i * 30);
      cage.beginPath();
      cage.moveTo(Math.cos(angle) * 15, Math.sin(angle) * 15);
      cage.lineTo(Math.cos(angle) * 55, Math.sin(angle) * 55);
      cage.strokePath();
    }
    cage.lineStyle(2, 0xbdc3c7);
    cage.strokeCircle(0, 0, 15); // Anillo central

    fanContainer.add([base, motor, bladeGroup, cage]);
    this.fanBlades = bladeGroup; // Referencia para animar

    // Circuito roto (PCB más realista)
    const circuitY = 40; // Subido
    const circuit = this.add.graphics();

    // Base de PCB
    circuit.fillStyle(0x006400, 1); // Verde oscuro PCB
    circuit.fillRoundedRect(-110, circuitY - 30, 220, 60, 8);
    circuit.lineStyle(2, 0x003300); // Borde oscuro
    circuit.strokeRoundedRect(-110, circuitY - 30, 220, 60, 8);

    // Trazas de cobre (más finas y detalladas)
    circuit.lineStyle(2, 0xda8a67); // Cobre
    // Lado izquierdo (Batería a hueco)
    circuit.beginPath();
    circuit.moveTo(-100, circuitY);
    circuit.lineTo(-50, circuitY);
    circuit.strokePath();

    // Lado derecho (Hueco a Ventilador)
    circuit.beginPath();
    circuit.moveTo(50, circuitY);
    circuit.lineTo(90, circuitY);
    circuit.lineTo(90, circuitY - 20); // Sube un poco
    circuit.lineTo(100, circuitY - 20); // Conecta al ventilador
    circuit.strokePath();

    // Componentes: Resistencia
    circuit.fillStyle(0x8b4513, 1); // Marrón resistencia
    circuit.fillRoundedRect(-20, circuitY - 25, 10, 10, 2);
    circuit.lineStyle(1, 0x000000);
    circuit.strokeRoundedRect(-20, circuitY - 25, 10, 10, 2);
    circuit.lineStyle(1, 0x000000);
    circuit.beginPath();
    circuit.moveTo(-25, circuitY - 20);
    circuit.lineTo(-20, circuitY - 20);
    circuit.moveTo(-10, circuitY - 20);
    circuit.lineTo(-5, circuitY - 20);
    circuit.strokePath();

    // Componentes: LED
    circuit.fillStyle(0xff0000, 1); // Rojo LED
    circuit.fillCircle(0, circuitY - 20, 5);
    circuit.lineStyle(1, 0x000000);
    circuit.strokeCircle(0, circuitY - 20, 5);
    circuit.lineStyle(1, 0x000000);
    circuit.beginPath();
    circuit.moveTo(-5, circuitY - 20);
    circuit.lineTo(-2, circuitY - 20);
    circuit.moveTo(2, circuitY - 20);
    circuit.lineTo(5, circuitY - 20);
    circuit.strokePath();

    // Puntos de conexión (pads de soldadura)
    circuit.fillStyle(0xc0c0c0, 1); // Plata
    circuit.fillCircle(-50, circuitY, 8); // Izquierdo
    circuit.fillCircle(50, circuitY, 8); // Derecho
    circuit.lineStyle(1, 0x808080);
    circuit.strokeCircle(-50, circuitY, 8);
    circuit.strokeCircle(50, circuitY, 8);

    // Batería conectada al circuito
    const battery = this.createRealisticBattery(-140, circuitY);
    battery.setScale(0.8);
    battery.disableInteractive(); // Ya está puesta

    this.gameContainer.add([fanContainer, circuit]);

    // Zona de caída (El hueco)
    const dropZone = this.add
      .zone(0, circuitY, 100, 50)
      .setRectangleDropZone(100, 50);
    this.gameContainer.add(dropZone);

    // Pieza faltante (Cable puente mejorado)
    const bridge = this.add.container(0, 140); // Subido

    // Highlight Circle
    const highlight = this.createHighlightCircle(100, 40);
    bridge.add(highlight);

    const wire = this.add.graphics();
    // Cable principal (con volumen y sombra)
    wire.lineStyle(8, 0x2ecc71); // Verde principal
    wire.beginPath();
    wire.moveTo(-40, 0);
    wire.lineTo(40, 0);
    wire.strokePath();
    // Sombra del cable
    wire.lineStyle(8, 0x1e8449, 0.7); // Verde oscuro para sombra
    wire.beginPath();
    wire.moveTo(-40, 2);
    wire.lineTo(40, 2);
    wire.strokePath();
    // Brillo del cable
    wire.lineStyle(2, 0x7dcea0, 0.8); // Verde claro para brillo
    wire.beginPath();
    wire.moveTo(-40, -2);
    wire.lineTo(40, -2);
    wire.strokePath();

    // Conectores del puente (más detallados y metálicos)
    const c1 = this.add.graphics();
    c1.fillStyle(0xbdc3c7, 1); // Gris metálico
    c1.fillCircle(-40, 0, 10);
    c1.lineStyle(2, 0x7f8c8d); // Borde oscuro
    c1.strokeCircle(-40, 0, 10);
    c1.fillStyle(0xffffff, 0.3); // Brillo
    c1.fillCircle(-40, 0, 5);

    const c2 = this.add.graphics();
    c2.fillStyle(0xbdc3c7, 1); // Gris metálico
    c2.fillCircle(40, 0, 10);
    c2.lineStyle(2, 0x7f8c8d); // Borde oscuro
    c2.strokeCircle(40, 0, 10);
    c2.fillStyle(0xffffff, 0.3); // Brillo
    c2.fillCircle(40, 0, 5);

    bridge.add([wire, c1, c2]);
    bridge.setSize(100, 40);
    bridge.setInteractive({ draggable: true });
    this.gameContainer.add(bridge);

    // Distractores (Objetos no conductores)
    const rubberDuck = this.createNonConductor("duck", -150, 160, 0xf1c40f); // Subido
    const woodenStick = this.createNonConductor("wood", 150, 160, 0x8e44ad); // Subido

    // Configurar arrastre para objetos incorrectos
    this.setupDragDrop(rubberDuck, dropZone, -1);
    this.setupDragDrop(woodenStick, dropZone, -1);

    // Mostrar pista de mano
    this.showDragHint(bridge, dropZone);

    this.setupDragDrop(bridge, dropZone, 3, () => {
      // Animación de éxito
      this.tweens.add({
        targets: this.fanBlades,
        angle: 360 * 5,
        duration: 2000,
        repeat: -1,
        ease: "Linear",
      });

      // Chispas en los contactos
      const spark = this.add.particles("spark"); // Si hubiera textura, usaremos círculos
      // Simular chispas con graphics
      this.createSparks(-50, circuitY);
      this.createSparks(50, circuitY);
    });
  }

  createNonConductor(type, x, y, color) {
    const container = this.add.container(x, y);

    // Highlight Circle
    const highlight = this.createHighlightCircle(50, 50);
    container.add(highlight);

    const g = this.add.graphics();
    g.fillStyle(color, 1);

    if (type === "duck") {
      // Patito de goma (Mejorado)
      // Cuerpo
      g.fillEllipse(0, 10, 45, 30);
      // Cabeza
      g.fillCircle(0, -15, 18);
      // Pico
      g.fillStyle(0xe67e22, 1);
      g.beginPath();
      g.moveTo(15, -15);
      g.lineTo(28, -18); // Pico superior
      g.lineTo(28, -12); // Pico inferior
      g.lineTo(15, -10);
      g.fillPath();
      // Ojo
      g.fillStyle(0x000000, 1);
      g.fillCircle(5, -20, 2);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(6, -21, 1);
      // Ala
      g.fillStyle(0xf39c12, 1); // Sombra ala
      const wingPath = new Phaser.Curves.Path(-10, 5);
      wingPath.quadraticBezierTo(5, 5, 15, 15);
      wingPath.quadraticBezierTo(5, 20, -10, 15);
      g.fillPoints(wingPath.getPoints());
    } else {
      // Palo de madera (Mejorado)
      g.fillStyle(0x8d6e63, 1); // Marrón madera
      g.fillRoundedRect(-10, -30, 20, 60, 5);
      // Corteza/Textura
      g.fillStyle(0x5d4037, 0.3);
      g.fillRoundedRect(-10, -30, 5, 60, { tl: 5, bl: 5, tr: 0, br: 0 });
      // Vetas irregulares
      g.lineStyle(2, 0x5d4037);
      const grain1 = new Phaser.Curves.Path(-5, -20);
      grain1.quadraticBezierTo(0, 0, -5, 20);
      g.strokePoints(grain1.getPoints());

      const grain2 = new Phaser.Curves.Path(5, -25);
      grain2.quadraticBezierTo(0, -5, 5, 15);
      g.strokePoints(grain2.getPoints());
      // Nudos
      g.fillStyle(0x4e342e, 1);
      g.fillCircle(0, -5, 3);
    }

    container.add(g);
    container.setSize(50, 50);
    container.setInteractive({ draggable: true });
    this.gameContainer.add(container);
    return container;
  }

  createSparks(x, y) {
    for (let i = 0; i < 5; i++) {
      const spark = this.add.circle(x, y, 3, 0xffff00);
      this.gameContainer.add(spark);
      this.tweens.add({
        targets: spark,
        x: x + Phaser.Math.Between(-20, 20),
        y: y + Phaser.Math.Between(-20, 20),
        alpha: 0,
        duration: 500,
        onComplete: () => spark.destroy(),
      });
    }
  }

  // --- PUZZLE 5: COCHE ELÉCTRICO ---
  puzzleCar() {
    // Coche Eléctrico (Mejorado)
    const carContainer = this.add.container(0, -50);

    // Carrocería principal (con volumen y reflejos)
    const body = this.add.graphics();
    body.fillStyle(0x3498db, 1); // Azul moderno
    // Parte inferior
    body.fillRoundedRect(-90, 0, 180, 50, 10);
    // Parte superior (cabina)
    body.fillRoundedRect(-60, -35, 110, 40, 15);
    // Sombreado para volumen
    body.fillStyle(0x2980b9, 1);
    body.fillRoundedRect(-90, 0, 180, 50, 10);
    body.fillStyle(0x5dade2, 0.5); // Reflejo superior
    body.fillRoundedRect(-80, 5, 160, 20, 8);

    // Parachoques y detalles
    body.fillStyle(0x2c3e50, 1); // Gris oscuro
    body.fillRect(-95, 35, 10, 15); // Parachoques trasero
    body.fillRect(85, 35, 10, 15); // Parachoques delantero
    body.lineStyle(2, 0x1a252f);
    body.strokeRect(-95, 35, 10, 15);
    body.strokeRect(85, 35, 10, 15);

    // Faros (más realistas con brillo)
    // Delantero
    const lights = this.add.graphics();
    lights.fillStyle(0xf1c40f, 1); // Amarillo cálido
    lights.fillRoundedRect(85, 5, 10, 15, 2);
    lights.lineStyle(1, 0xe67e22);
    lights.strokeRoundedRect(85, 5, 10, 15, 2);
    lights.fillStyle(0xffffff, 0.5); // Brillo
    lights.fillRoundedRect(87, 7, 6, 10, 1);
    // Trasero
    lights.fillStyle(0xe74c3c, 1); // Rojo intenso
    lights.fillRoundedRect(-90, 5, 5, 15, 2);
    lights.lineStyle(1, 0xc0392b);
    lights.strokeRoundedRect(-90, 5, 5, 15, 2);
    lights.fillStyle(0xffffff, 0.3); // Brillo
    lights.fillRoundedRect(-89, 7, 3, 10, 1);

    // Ventanas (Con reflejo más pronunciado)
    const windows = this.add.graphics();
    windows.fillStyle(0x95a5a6, 0.8); // Gris azulado semitransparente
    windows.fillRoundedRect(-50, -25, 40, 25, 5); // Trasera
    windows.fillRoundedRect(-5, -25, 50, 25, 5); // Delantera
    // Reflejo
    windows.fillStyle(0xffffff, 0.4);
    windows.beginPath();
    windows.moveTo(-45, -20);
    windows.lineTo(-30, -20);
    windows.lineTo(-35, -10);
    windows.lineTo(-50, -10);
    windows.fillPath();
    windows.beginPath();
    windows.moveTo(0, -20);
    windows.lineTo(20, -20);
    windows.lineTo(15, -10);
    windows.lineTo(-5, -10);
    windows.fillPath();

    // Manija puerta (más 3D)
    const handle = this.add.graphics();
    handle.fillStyle(0xbdc3c7, 1); // Gris metálico
    handle.fillRoundedRect(-5, 5, 15, 4, 2);
    handle.lineStyle(1, 0x7f8c8d);
    handle.strokeRoundedRect(-5, 5, 15, 4, 2);
    handle.fillStyle(0xffffff, 0.3); // Brillo
    handle.fillRoundedRect(-4, 6, 13, 2, 1);

    // Ruedas (Mejoradas con profundidad)
    const wheelGroup = this.add.container(0, 0);
    const createWheel = (wx, wy) => {
      const w = this.add.graphics();
      w.fillStyle(0x2c3e50, 1); // Neumático oscuro
      w.fillCircle(wx, wy, 25); // Más grande
      w.lineStyle(2, 0x1a252f); // Borde del neumático
      w.strokeCircle(wx, wy, 25);

      w.fillStyle(0xbdc3c7, 1); // Llanta metálica
      w.fillCircle(wx, wy, 15); // Más grande
      w.lineStyle(2, 0x7f8c8d); // Borde de la llanta
      w.strokeCircle(wx, wy, 15);

      w.fillStyle(0x7f8c8d, 1); // Eje
      w.fillCircle(wx, wy, 6); // Más grande
      w.lineStyle(1, 0x555555);
      w.strokeCircle(wx, wy, 6);
      return w;
    };
    wheelGroup.add([createWheel(-55, 50), createWheel(55, 50)]);

    // Puerto de carga (Integrado y realista)
    const port = this.add.graphics();
    // Base del puerto
    port.fillStyle(0x2c3e50, 1); // Gris oscuro
    port.fillRoundedRect(-85, 5, 15, 20, 5);
    port.lineStyle(2, 0x1a252f);
    port.strokeRoundedRect(-85, 5, 15, 20, 5);
    // Conector interno
    port.fillStyle(0x7f8c8d, 1); // Gris metálico
    port.fillCircle(-77, 15, 6);
    port.lineStyle(1, 0x555555);
    port.strokeCircle(-77, 15, 6);
    // Indicador LED (apagado inicialmente)
    port.fillStyle(0x2ecc71, 0); // Verde, transparente
    port.fillCircle(-77, 15, 3);
    this.carPort = port;

    carContainer.add([body, lights, windows, handle, wheelGroup, port]);

    // Estación de carga (Mejorada)
    const station = this.add.container(160, 40);
    const stBody = this.add.graphics();
    stBody.fillStyle(0xecf0f1, 1); // Color base
    stBody.fillRoundedRect(-35, -90, 70, 180, 10);
    stBody.lineStyle(2, 0xbdc3c7); // Borde
    stBody.strokeRoundedRect(-35, -90, 70, 180, 10);
    // Pantalla digital (más detallada)
    stBody.fillStyle(0x000000, 1);
    stBody.fillRoundedRect(-28, -80, 56, 45, 5);
    stBody.lineStyle(1, 0x333333);
    stBody.strokeRoundedRect(-28, -80, 56, 45, 5);
    // Texto simulado (barras de carga)
    stBody.fillStyle(0x2ecc71, 1);
    stBody.fillRect(-25, -70, 40, 8);
    stBody.fillRect(-25, -55, 30, 8);
    stBody.fillRect(-25, -40, 20, 8);
    // Base (más robusta)
    stBody.fillStyle(0x7f8c8d, 1);
    stBody.fillRect(-45, 80, 90, 15);
    stBody.lineStyle(2, 0x555555);
    stBody.strokeRect(-45, 80, 90, 15);
    // Logo Energía (más definido)
    stBody.fillStyle(0xf1c40f, 1);
    stBody.beginPath();
    stBody.moveTo(0, -30);
    stBody.lineTo(10, -20);
    stBody.lineTo(5, -20);
    stBody.lineTo(10, -10);
    stBody.lineTo(0, -10);
    stBody.lineTo(5, -20);
    stBody.lineTo(0, -20);
    stBody.fillPath();
    stBody.lineStyle(1, 0xe67e22);
    stBody.strokePath();

    station.add(stBody);

    this.gameContainer.add([carContainer, station]);

    // Manguera de carga (Draggable, con más realismo)
    const nozzle = this.add.container(130, 60);

    // Highlight Circle
    const highlight = this.createHighlightCircle(50, 70);
    nozzle.add(highlight);

    // Mango ergonómico (con sombreado)
    const handleG = this.add.graphics();
    handleG.fillStyle(0xe67e22, 1); // Naranja
    handleG.fillRoundedRect(-12, -15, 24, 50, 8);
    handleG.fillStyle(0xd35400, 1); // Sombra
    handleG.fillRoundedRect(-12, -15, 24, 50, 8);
    handleG.fillStyle(0xf39c12, 0.5); // Brillo
    handleG.fillRoundedRect(-10, -13, 20, 46, 6);
    // Gatillo
    handleG.fillStyle(0xd35400, 1);
    handleG.fillRoundedRect(5, -5, 8, 20, 2);
    handleG.lineStyle(1, 0xa04000);
    handleG.strokeRoundedRect(5, -5, 8, 20, 2);
    // Punta conector (más metálica y detallada)
    handleG.fillStyle(0x95a5a6, 1);
    handleG.fillRect(-10, -35, 20, 25);
    handleG.lineStyle(2, 0x7f8c8d);
    handleG.strokeRect(-10, -35, 20, 25);
    handleG.fillStyle(0x2c3e50, 1);
    handleG.fillCircle(0, -35, 8); // Punta contacto
    handleG.lineStyle(1, 0x1a252f);
    handleG.strokeCircle(0, -35, 8);
    handleG.fillStyle(0xffffff, 0.3);
    handleG.fillCircle(0, -35, 4);

    // Cable (visual estático inicial)
    const cable = this.add.graphics();

    nozzle.add([handleG]);
    nozzle.setSize(50, 70);
    nozzle.setInteractive({ draggable: true });

    this.gameContainer.add(nozzle);
    this.chargingNozzle = nozzle;
    this.chargingStation = station;

    // Zona de caída (El puerto del coche)
    const dropZone = this.add
      .zone(-80, -40, 60, 60)
      .setRectangleDropZone(60, 60);
    this.gameContainer.add(dropZone);

    // Mostrar pista de mano
    this.showDragHint(this.chargingNozzle, dropZone);

    // Dibujar cable dinámicamente (con volumen)
    this.events.on("update", () => {
      if (!this.chargingNozzle.active) return;
      cable.clear();
      // Cable principal
      cable.lineStyle(10, 0x2c3e50); // Cable más grueso
      cable.beginPath();
      cable.moveTo(this.chargingStation.x, this.chargingStation.y + 40);

      // Curva Bezier
      const p1 = new Phaser.Math.Vector2(
        this.chargingStation.x,
        this.chargingStation.y + 40,
      );
      const p2 = new Phaser.Math.Vector2(
        this.chargingNozzle.x,
        this.chargingNozzle.y + 120,
      );
      const p3 = new Phaser.Math.Vector2(
        this.chargingNozzle.x,
        this.chargingNozzle.y + 30,
      );

      const curve = new Phaser.Curves.QuadraticBezier(p1, p2, p3);
      curve.draw(cable);

      // Sombra del cable
      cable.lineStyle(10, 0x1a252f, 0.7); // Sombra más oscura
      cable.beginPath();
      const shadowP1 = new Phaser.Math.Vector2(p1.x + 2, p1.y);
      const shadowP2 = new Phaser.Math.Vector2(p2.x + 5, p2.y + 5);
      const shadowP3 = new Phaser.Math.Vector2(p3.x + 2, p3.y);
      const shadowCurve = new Phaser.Curves.QuadraticBezier(
        shadowP1,
        shadowP2,
        shadowP3,
      );
      shadowCurve.draw(cable);

      // Brillo del cable
      cable.lineStyle(4, 0x7f8c8d, 0.8); // Brillo más claro
      cable.beginPath();
      const highlightP1 = new Phaser.Math.Vector2(p1.x - 2, p1.y);
      const highlightP2 = new Phaser.Math.Vector2(p2.x - 5, p2.y - 5);
      const highlightP3 = new Phaser.Math.Vector2(p3.x - 2, p3.y);
      const highlightCurve = new Phaser.Curves.QuadraticBezier(
        highlightP1,
        highlightP2,
        highlightP3,
      );
      highlightCurve.draw(cable);
    });
    this.gameContainer.addAt(cable, 0);

    this.setupDragDrop(nozzle, dropZone, 4, () => {
      // Feedback de carga
      this.tweens.addCounter({
        from: 0,
        to: 100,
        duration: 2500,
        onUpdate: (tween) => {
          const val = tween.getValue();
          // Parpadeo del puerto
          if (Math.floor(val) % 10 < 5) {
            this.carPort.clear();
            this.carPort.lineStyle(2, 0xffffff);
            this.carPort.strokeCircle(-80, 10, 12);
            this.carPort.fillStyle(0x2c3e50, 1);
            this.carPort.fillCircle(-80, 10, 12);
            this.carPort.fillStyle(0x2ecc71, 1); // Verde
            this.carPort.fillCircle(-80, 10, 7);
          } else {
            this.carPort.clear();
            this.carPort.lineStyle(2, 0xffffff);
            this.carPort.strokeCircle(-80, 10, 12);
            this.carPort.fillStyle(0x2c3e50, 1);
            this.carPort.fillCircle(-80, 10, 12);
          }
        },
        onComplete: () => {
          // Luz fija verde
          this.carPort.clear();
          this.carPort.fillStyle(0x2ecc71, 1);
          this.carPort.fillCircle(-80, 10, 12);
          this.carPort.lineStyle(2, 0xffffff);
          this.carPort.strokeCircle(-80, 10, 12);

          // Coche se va
          this.tweens.add({
            targets: carContainer,
            x: -600,
            duration: 1500,
            ease: "Power2",
          });
        },
      });
    });
  }

  showDragHint(fromObj, toObj) {
    if (this.activeHand) {
      this.activeHand.destroy();
      this.activeHand = null;
    }
    if (this.activeHandTween) {
      this.activeHandTween.stop();
      this.activeHandTween = null;
    }

    // Offset inicial para que la mano no tape el objeto completamente
    const startX = fromObj.x + 30;
    const startY = fromObj.y + 30;

    const hand = this.createHand(startX, startY);
    this.gameContainer.add(hand);
    this.activeHand = hand;

    // Calcular destino (centro de la zona)
    const targetX = toObj.x;
    const targetY = toObj.y;

    this.activeHandTween = this.tweens.add({
      targets: hand,
      x: targetX,
      y: targetY,
      duration: 1500,
      ease: "Power2",
      repeat: -1,
      hold: 500,
      onStart: () => {
        hand.alpha = 1;
      },
      onRepeat: () => {
        hand.x = startX;
        hand.y = startY;
        hand.alpha = 1;
      },
      onUpdate: (tween, target) => {
        // Desvanecer cerca del final
        if (tween.progress > 0.8) {
          target.alpha = 1 - (tween.progress - 0.8) * 5;
        }
      },
    });
  }

  createHighlightCircle(width, height) {
    const radius = Math.max(width, height) / 2 + 15;
    const graphics = this.add.graphics();

    // Círculo pulsante
    graphics.lineStyle(4, 0xffffff, 1);
    graphics.strokeCircle(0, 0, radius);

    this.tweens.add({
      targets: graphics,
      alpha: 0.2,
      scale: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    return graphics;
  }

  createHand(x, y) {
    const container = this.add.container(x, y);

    const text = this.add.text(0, 0, "👆", {
      fontSize: "60px",
      fontFamily: "Arial",
      color: "#ffffff",
    });
    text.setOrigin(0.2, 0.1); // Ajustar para que la punta del dedo esté en (0,0)

    // Sombra para mejor visibilidad
    text.setStroke("#000000", 4);
    text.setShadow(2, 2, "#000000", 2, true, true);

    container.add(text);
    return container;
  }

  setupDragDrop(item, zone, levelIndex, onSuccess) {
    // Guardar posición inicial al empezar a arrastrar
    item.on("dragstart", (pointer, dragX, dragY) => {
      item.dragStartX = item.x;
      item.dragStartY = item.y;
      // Eliminar cualquier pista de mano activa si se empieza a arrastrar el objeto correcto
      if (this.activeHandTween) {
        this.activeHandTween.stop();
        this.activeHandTween = null;
      }
      if (this.activeHand) {
        this.activeHand.destroy();
        this.activeHand = null;
      }
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      if (gameObject !== item) return;
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("drop", (pointer, gameObject, dropZone) => {
      // Si el objeto soltado no es este item, ignorar
      if (gameObject !== item) return;

      if (dropZone === zone) {
        if (levelIndex === -1) {
          // Objeto incorrecto en la zona correcta -> Rechazo
          this.tweens.add({
            targets: gameObject,
            x: gameObject.x + 10,
            y: gameObject.y,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
              this.returnToStart(gameObject);
            },
          });
        } else {
          // Objeto correcto en zona correcta
          gameObject.x = dropZone.x;
          gameObject.y = dropZone.y;
          gameObject.disableInteractive();
          gameObject.dropped = true; // Marcar como soltado correctamente

          // Feedback positivo
          this.cameras.main.flash(200, 255, 255, 255);

          // Estrellas
          const star = this.createStarGraphics(
            gameObject.x,
            gameObject.y - 50,
            0xffff00,
          );
          this.gameContainer.add(star);
          this.tweens.add({
            targets: star,
            y: "-=50",
            alpha: 0,
            duration: 1000,
          });

          if (onSuccess) onSuccess();
          this.completeLevel(levelIndex);
        }
      } else {
        // Esto no debería ocurrir si solo hay una zona, pero por seguridad:
        this.returnToStart(gameObject);
      }
    });

    // Manejar el caso donde se suelta fuera de cualquier zona o en una zona incorrecta
    this.input.on("dragend", (pointer, gameObject, dropped) => {
      if (gameObject !== item) return;
      if (!dropped) {
        this.returnToStart(gameObject);
      }
    });
  }

  returnToStart(gameObject) {
    // Animación de rechazo/retorno
    this.tweens.add({
      targets: gameObject,
      x: gameObject.dragStartX,
      y: gameObject.dragStartY,
      duration: 300,
      ease: "Bounce",
    });
  }

  showMiniCelebration() {
    const container = this.add.container(0, 0);

    // Texto de felicitación
    const text = this.add
      .text(0, -50, "¡Muy Bien!", {
        fontSize: "64px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Estrellas explotando
    for (let i = 0; i < 20; i++) {
      const star = this.createStarGraphics(0, 0, 0xffff00);
      star.scale = Phaser.Math.FloatBetween(0.5, 1);
      container.add(star);

      this.tweens.add({
        targets: star,
        x: Phaser.Math.Between(-200, 200),
        y: Phaser.Math.Between(-200, 200),
        angle: 360,
        alpha: 0,
        duration: 1000,
        ease: "Sine.out",
      });
    }

    container.add(text);
    this.gameContainer.add(container);

    // Animación de entrada y salida
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 500,
      ease: "Back.out",
      yoyo: true,
      hold: 1000,
      onComplete: () => {
        container.destroy();
      },
    });
  }

  completeLevel(index) {
    // Iluminar estrella UI
    const star = this.stars[index];
    star.clear();
    // Redibujar estrella encendida
    star.fillStyle(0xffff00, 1);
    star.beginPath();
    const points = 5;
    const outer = 15;
    const inner = 7;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / points - Math.PI / 2;
      star.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    star.fillPath();
    star.lineStyle(1, 0xff9800);
    star.strokePath();
    star.setAlpha(1);

    this.tweens.add({
      targets: star,
      scale: 1.5,
      duration: 300,
      yoyo: true,
    });

    // Mostrar celebración intermedia
    this.showMiniCelebration();

    this.time.delayedCall(2500, () => {
      if (index < 4) {
        this.startPuzzle(index + 1);
      } else {
        this.showFinalCelebration();
      }
    });
  }

  showFinalCelebration() {
    this.gameContainer.removeAll(true);

    // Fondo oscuro semitransparente
    const overlay = this.add.rectangle(
      0,
      0,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.7,
    );
    this.gameContainer.add(overlay);

    // Trofeo Emoji
    const trophy = this.add
      .text(0, -50, "🏆", {
        fontSize: "100px",
      })
      .setOrigin(0.5);

    this.gameContainer.add(trophy);

    this.tweens.add({
      targets: trophy,
      scale: 1.5,
      angle: 360,
      duration: 2000,
      ease: "Bounce",
    });

    // Texto Final
    const title = this.add
      .text(0, -200, "¡FELICIDADES!", {
        fontSize: "60px",
        fontFamily: "Arial",
        color: "#ffd700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    const subTitle = this.add
      .text(0, 80, "¡Juego Completado!", {
        fontSize: "40px",
        fontFamily: "Arial",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Botón Volver a Jugar
    const btnContainer = this.add.container(0, 180);
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x2ecc71, 1);
    btnBg.fillRoundedRect(-120, -30, 240, 60, 15);
    btnBg.lineStyle(4, 0xffffff);
    btnBg.strokeRoundedRect(-120, -30, 240, 60, 15);

    const btnText = this.add
      .text(0, 0, "Volver a Jugar", {
        fontSize: "28px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    btnContainer.add([btnBg, btnText]);
    btnContainer.setSize(240, 60);
    btnContainer
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => btnContainer.setScale(1.1))
      .on("pointerout", () => btnContainer.setScale(1))
      .on("pointerdown", () => this.scene.restart());

    this.gameContainer.add([title, subTitle, btnContainer]);

    // Confeti gráfico
    for (let i = 0; i < 50; i++) {
      const color = Phaser.Utils.Array.GetRandom([
        0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff,
      ]);
      const p = this.add.graphics({ x: 0, y: 0 });
      p.fillStyle(color, 1);
      p.fillRect(0, 0, 8, 8);
      this.gameContainer.add(p);

      this.tweens.add({
        targets: p,
        x: Phaser.Math.Between(-400, 400),
        y: Phaser.Math.Between(-300, 300),
        angle: Phaser.Math.Between(0, 360),
        alpha: 0,
        duration: 2000,
        ease: "Sine.out",
      });
    }
  }

  createAnimatedBackground(width, height) {
    // 1. Fondo base (Cielo)
    this.add.rectangle(0, 0, width, height, 0x81d4fa).setOrigin(0);

    // 2. Sol animado (Esquina superior derecha)
    const sunGroup = this.add.container(width - 80, 80);
    const sunBody = this.add.circle(0, 0, 40, 0xffeb3b);
    const sunRays = this.add.graphics();
    sunRays.lineStyle(4, 0xffeb3b);
    for (let i = 0; i < 12; i++) {
      const angle = Phaser.Math.DegToRad(i * 30);
      sunRays.moveTo(Math.cos(angle) * 50, Math.sin(angle) * 50);
      sunRays.lineTo(Math.cos(angle) * 70, Math.sin(angle) * 70);
    }
    sunRays.strokePath();
    sunGroup.add([sunRays, sunBody]);

    this.tweens.add({
      targets: sunRays,
      angle: 360,
      duration: 20000,
      repeat: -1,
      ease: "Linear",
    });
    this.tweens.add({
      targets: sunGroup,
      scale: 1.1,
      yoyo: true,
      repeat: -1,
      duration: 3000,
      ease: "Sine.inOut",
    });

    // 3. Colinas en el fondo (Paisaje)
    const hills = this.add.graphics();
    hills.fillStyle(0xa5d6a7, 1); // Verde suave
    hills.fillEllipse(width * 0.3, height, width * 0.8, 300);
    hills.fillStyle(0x81c784, 1); // Verde medio
    hills.fillEllipse(width * 0.8, height + 50, width * 0.8, 400);
    hills.fillStyle(0x66bb6a, 1); // Verde más fuerte (primer plano)
    hills.fillEllipse(width * 0.5, height + 100, width * 1.2, 250);

    // 4. Engranajes decorativos (Tema ingeniería/electricidad)
    this.createBackgroundGear(100, height - 100, 60, 0.05, 0xffffff, 0.1);
    this.createBackgroundGear(
      width - 100,
      height - 150,
      40,
      -0.08,
      0xffffff,
      0.1,
    );
    this.createBackgroundGear(
      width - 50,
      height - 80,
      80,
      0.03,
      0xffffff,
      0.15,
    );

    // 5. Nubes animadas (Mejoradas)
    for (let i = 0; i < 5; i++) {
      const cloud = this.add.container(
        Phaser.Math.Between(-100, width),
        Phaser.Math.Between(50, height / 2.5),
      );
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(0, 0, 30);
      g.fillCircle(25, 0, 40);
      g.fillCircle(50, 0, 30);
      cloud.add(g);
      cloud.setScale(Phaser.Math.FloatBetween(0.8, 1.2));

      // Movimiento horizontal continuo
      this.tweens.add({
        targets: cloud,
        x: width + 150,
        duration: Phaser.Math.Between(25000, 40000),
        repeat: -1,
        ease: "Linear",
        delay: Phaser.Math.Between(0, 10000),
        onRepeat: () => {
          cloud.x = -150;
          cloud.y = Phaser.Math.Between(50, height / 2.5);
        },
      });
      // Flotación vertical suave
      this.tweens.add({
        targets: cloud,
        y: cloud.y + 20,
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }

    // 6. Partículas flotantes (Energía/Polvo mágico)
    for (let i = 0; i < 15; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(2, 5),
        0xffffff,
        0.4,
      );
      this.tweens.add({
        targets: p,
        y: p.y - 150,
        alpha: { from: 0.4, to: 0 },
        duration: Phaser.Math.Between(4000, 7000),
        repeat: -1,
        onRepeat: () => {
          p.x = Phaser.Math.Between(0, width);
          p.y = height + 10;
          p.alpha = 0.4;
        },
      });
    }
  }

  createBackgroundGear(x, y, radius, speed, color, alpha) {
    const gear = this.add.graphics();
    gear.fillStyle(color, alpha);

    // Cuerpo principal
    gear.fillCircle(0, 0, radius);

    // Dientes del engranaje
    const teeth = 8;
    for (let i = 0; i < teeth; i++) {
      const angle = (i * Math.PI * 2) / teeth;
      const tx = Math.cos(angle) * (radius + 10);
      const ty = Math.sin(angle) * (radius + 10);
      gear.fillCircle(tx, ty, 12);
    }

    // Anillo decorativo
    gear.lineStyle(4, color, alpha + 0.1);
    gear.strokeCircle(0, 0, radius - 15);

    gear.x = x;
    gear.y = y;

    this.tweens.add({
      targets: gear,
      angle: 360,
      duration: 10000 / Math.abs(speed),
      repeat: -1,
      ease: "Linear",
    });

    return gear;
  }
}
