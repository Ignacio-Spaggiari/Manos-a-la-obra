class Level2Scene extends Phaser.Scene {
  constructor() { super('Level2Scene'); }

  preload() {
    this.load.image('personaje', 'assets/personaje.png');
    this.load.image('npc1', 'assets/npc1.png');
    this.load.image('npc2', 'assets/npc2.png');
    this.load.image('npc3', 'assets/npc3.png');
  }

  create() {
    // --- Piso (sólido en todas direcciones) ---
    this.piso = this.physics.add.staticGroup();
    const pisoRect = this.add.rectangle(400, 460, 800, 40, 0x555555);
    this.physics.add.existing(pisoRect, true);
    this.piso.add(pisoRect);

    // --- Plataformas elevadas (one-way: se atraviesan desde abajo o apretando abajo) ---
    this.plataformasElevadas = this.physics.add.staticGroup();

    const plat1a = this.add.rectangle(150, 340, 220, 20, 0x777777);
    this.physics.add.existing(plat1a, true);
    this.plataformasElevadas.add(plat1a);

    const plat1b = this.add.rectangle(650, 340, 220, 20, 0x777777);
    this.physics.add.existing(plat1b, true);
    this.plataformasElevadas.add(plat1b);

    const plat2a = this.add.rectangle(400, 220, 260, 20, 0x999999);
    this.physics.add.existing(plat2a, true);
    this.plataformasElevadas.add(plat2a);

    this.physics.world.gravity.y = 600;

    // --- Jugador ---
    this.player = this.physics.add.sprite(100, 380, 'personaje').setScale(1.5);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.piso);

    // --- Controles ---
    this.cursors = this.input.keyboard.createCursorKeys();

    // Colisión one-way para el jugador
    this.physics.add.collider(this.player, this.plataformasElevadas, null, (player, plat) => {
      if (this.cursors.down.isDown) return false; // mantener abajo = atravesar hacia abajo
      return player.body.velocity.y >= 0; // solo colisiona si está cayendo (no si está subiendo)
    }, this);

    // --- Contadores ---
    this.npcsSpawned = 0;
    this.npcsTotal = 10;
    this.levelDone = false;

    // Posiciones posibles donde puede aparecer un NPC (piso + ambas capas de plataformas)
    this.spawnPoints = [
      { x: 300, y: 380 }, { x: 500, y: 380 }, // piso
      { x: 150, y: 300 }, { x: 650, y: 300 }, // plataformas capa 1
      { x: 400, y: 180 }                       // plataforma capa 2
    ];

    // --- HUD ---
    this.scoreText = this.add.text(16, 16, 'Puntos: ' + this.registry.get('score'), { fontSize: '18px', color: '#fff' });
    this.livesText = this.add.text(16, 40, 'Vidas: ' + this.registry.get('lives'), { fontSize: '18px', color: '#fff' });
    this.progressText = this.add.text(16, 64, 'NPCs: 0 / ' + this.npcsTotal, { fontSize: '18px', color: '#fff' });

    this.spawnNPC();
  }

  spawnNPC() {
    if (this.npcsSpawned >= this.npcsTotal) {
      this.showEndScreen();
      return;
    }

    this.npcsSpawned++;
    this.progressText.setText('NPCs: ' + (this.npcsSpawned - 1) + ' / ' + this.npcsTotal);

    const texturas = ['npc1', 'npc2', 'npc3'];
    const textura = Phaser.Utils.Array.GetRandom(texturas);
    const punto = Phaser.Utils.Array.GetRandom(this.spawnPoints);

    const npc = this.physics.add.sprite(punto.x, punto.y, textura).setScale(1.5);
    npc.setCollideWorldBounds(true);
    npc.saved = false;
    npc.pushed = false;

    this.physics.add.collider(npc, this.piso);
    this.physics.add.collider(npc, this.plataformasElevadas, null, (npcObj, plat) => {
      return npcObj.body.velocity.y >= 0;
    }, this);

    this.physics.add.overlap(this.player, npc, (player, npcObj) => {
      if (npcObj.pushed) return;
      this.pushNPC(player, npcObj);
    }, null, this);

    // Un poco más rápido que en el Nivel 1 (más difícil)
    this.time.delayedCall(1200, () => this.avisarYSoltarObjeto(npc, punto.y));
  }

  avisarYSoltarObjeto(npc, alturaSpawn) {
    if (!npc.active) return;

    const avisoX = npc.x;
    // La advertencia se dibuja cerca de la altura donde está el NPC
    const aviso = this.add.circle(avisoX, alturaSpawn - 20, 20, 0xff0000, 0.6);

    this.time.delayedCall(800, () => {
      aviso.destroy();
      if (!npc.active) return;

      const caja = this.add.rectangle(avisoX, 0, 30, 30, 0x8b4513);
      this.physics.add.existing(caja);
      caja.body.setAllowGravity(true);

      // La caja es sólida contra todo (piso y plataformas), se rompe al tocar cualquiera
      this.physics.add.collider(caja, this.piso, () => caja.destroy());
      this.physics.add.collider(caja, this.plataformasElevadas, () => caja.destroy());

      this.physics.add.overlap(caja, npc, (cajaObj, npcObj) => {
        if (npcObj.saved || npcObj.pushed) return;
        cajaObj.destroy();
        this.loseLife();
        npcObj.destroy();
        this.time.delayedCall(500, () => this.spawnNPC());
      });
    });
  }

  pushNPC(player, npc) {
    if (npc.pushed) return;
    npc.pushed = true;
    npc.saved = true;
    this.addScore(10);

    npc.body.enable = false;

    const direction = (npc.x >= player.x) ? 1 : -1;
    const startY = npc.y;
    const endX = npc.x + direction * 900;

    this.tweens.add({
      targets: npc,
      x: endX,
      angle: direction * 1080,
      duration: 700,
      ease: 'Cubic.easeIn',
      onUpdate: (tween) => {
        const t = tween.progress;
        npc.y = startY - Math.sin(t * Math.PI) * 150 + (t * t * 100);
      },
      onComplete: () => {
        npc.destroy();
        this.time.delayedCall(500, () => this.spawnNPC());
      }
    });
  }

  loseLife() {
    let lives = this.registry.get('lives') - 1;
    this.registry.set('lives', lives);
    this.livesText.setText('Vidas: ' + lives);
    if (lives <= 0) {
      this.scene.start('GameOverScene');
    }
  }

  addScore(amount) {
    const score = this.registry.get('score') + amount;
    this.registry.set('score', score);
    this.scoreText.setText('Puntos: ' + score);
  }

  showEndScreen() {
    if (this.levelDone) return;
    this.levelDone = true;
    this.progressText.setText('NPCs: ' + this.npcsTotal + ' / ' + this.npcsTotal);

    this.add.rectangle(400, 240, 800, 480, 0x000000, 0.6);
    this.add.text(400, 160, '¡NIVEL 2 COMPLETADO!', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

    const btnSiguiente = this.add.text(400, 240, 'Siguiente Nivel', {
      fontSize: '24px', color: '#0f0', backgroundColor: '#000', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    const btnMenu = this.add.text(400, 320, 'Volver al Menú', {
      fontSize: '24px', color: '#ff0', backgroundColor: '#000', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    btnSiguiente.on('pointerdown', () => this.scene.start('Level3Scene'));
    btnMenu.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-220);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(220);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-430);
    }
  }
}