class Level1Scene extends Phaser.Scene {
  constructor() { super('Level1Scene'); }

  preload() {
    this.load.image('personaje', 'assets/personaje.png');
    this.load.image('npc1', 'assets/npc1.png');
    this.load.image('npc2', 'assets/npc2.png');
    this.load.image('npc3', 'assets/npc3.png');
    this.load.image('fondo', 'assets/fondo.png');
    this.load.image('caja', 'assets/caja.png');
    this.load.image('advertencia', 'assets/advertencia.png');
    this.load.image('platEsqIzq', 'assets/plataformas-esq-izq.png');
    this.load.image('platEsqDer', 'assets/plataformas-esq-der.png');
    this.load.image('platMedio', 'assets/plataformas-medio.png');
  }

  crearPlataformaVisual(x, y, width, height) {
    const cornerWidth = 32;
    const visualHeight = height;
    const middleWidth = Math.max(width - cornerWidth * 2, 10);

    this.add.image(x - width / 2 + cornerWidth / 2, y, 'platEsqIzq').setDisplaySize(cornerWidth, visualHeight);
    this.add.image(x + width / 2 - cornerWidth / 2, y, 'platEsqDer').setDisplaySize(cornerWidth, visualHeight);
    this.add.tileSprite(x, y, middleWidth, visualHeight, 'platMedio');
  }

  create() {
        this.registry.set('currentLevel', 'Level1Scene');

    // --- Fondo ---
    this.add.image(400, 240, 'fondo').setDisplaySize(800, 480);

    // --- Piso (colisión invisible, lo visual ya está en el fondo) ---
    this.piso = this.physics.add.staticGroup();
    const pisoRect = this.add.rectangle(400, 460, 800, 40, 0x555555).setVisible(false);
    this.physics.add.existing(pisoRect, true);
    this.piso.add(pisoRect);
    this.crearPlataformaVisual(400, 460, 800, 40);

    this.physics.world.gravity.y = 600;

    // --- Jugador ---
    this.player = this.physics.add.sprite(100, 380, 'personaje').setScale(1.5);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.piso);

    // --- Controles ---
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- Contadores ---
    this.npcsSaved = 0;
    this.npcsTotal = 10;
    this.npc = null;
    this.levelDone = false;

    // --- HUD ---
    this.scoreText = this.add.text(16, 16, 'Puntos: 0', { fontSize: '18px', color: '#fff' });
    this.livesText = this.add.text(16, 40, 'Vidas: ' + this.registry.get('lives'), { fontSize: '18px', color: '#fff' });
    this.progressText = this.add.text(16, 64, 'NPCs: 0 / ' + this.npcsTotal, { fontSize: '18px', color: '#fff' });

    this.spawnNPC();
  }

  spawnNPC() {
    if (this.npcsSaved >= this.npcsTotal) {
      this.showEndScreen();
      return;
    }

    const texturas = ['npc1', 'npc2', 'npc3'];
    const textura = Phaser.Utils.Array.GetRandom(texturas);
    const x = Phaser.Math.Between(150, 650);

    const npc = this.physics.add.sprite(x, 380, textura).setScale(1.5);
    npc.setCollideWorldBounds(true);
    npc.saved = false;
    npc.pushed = false;
    this.physics.add.collider(npc, this.piso);

    this.physics.add.overlap(this.player, npc, (player, npcObj) => {
      if (npcObj.pushed) return;
      this.pushNPC(player, npcObj);
    }, null, this);

    this.npc = npc;

    this.time.delayedCall(1500, () => this.avisarYSoltarObjeto(npc));
  }

  avisarYSoltarObjeto(npc) {
    if (!npc.active) return;

    const avisoX = npc.x;
    const aviso = this.add.image(avisoX, 440, 'advertencia').setScale(1.3).setAlpha(0.9);
    aviso.postFX.addGlow(0xff0000, 4, 0, false, 0.3, 10);

    this.time.delayedCall(1000, () => {
      aviso.destroy();
      if (!npc.active) return;

      const caja = this.physics.add.image(avisoX, 0, 'caja').setDisplaySize(22, 22);
      caja.body.setAllowGravity(true);

      this.physics.add.collider(caja, this.piso, () => caja.destroy());
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

    this.npcsSaved++;
    this.progressText.setText('NPCs: ' + this.npcsSaved + ' / ' + this.npcsTotal);

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

    // Shake de cámara: siempre que se pierda una vida, sea la causa que sea
    this.cameras.main.shake(200, 0.01);

    if (lives <= 0) {
      this.scene.start('GameOverScene');
    }
  }

  playerHitFeedback() {
    this.tweens.add({
      targets: this.player,
      alpha: 0,
      duration: 80,
      yoyo: true,
      repeat: 4
    });
  }

  flashDamage() {
    // Destello rojo cubriendo toda la pantalla, para feedback claro de daño
    const flash = this.add.rectangle(400, 240, 800, 480, 0xff0000, 0.35).setDepth(999);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 250,
      onComplete: () => flash.destroy()
    });
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
    this.add.text(400, 160, '¡NIVEL 1 COMPLETADO!', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

    const btnSiguiente = this.add.text(400, 240, 'Siguiente Nivel', {
      fontSize: '24px', color: '#0f0', backgroundColor: '#000', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    const btnMenu = this.add.text(400, 320, 'Volver al Menú', {
      fontSize: '24px', color: '#ff0', backgroundColor: '#000', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    btnSiguiente.on('pointerdown', () => this.scene.start('Level2Scene'));
    btnMenu.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-350);
    }
  }
}