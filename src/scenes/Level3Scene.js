class Level3Scene extends Phaser.Scene {
  constructor() { super('Level3Scene'); }

  preload() {
    this.load.image('personaje', 'assets/personaje.png');
    this.load.image('npc1', 'assets/npc1.png');
    this.load.image('npc2', 'assets/npc2.png');
    this.load.image('npc3', 'assets/npc3.png');
    this.load.image('enemigo', 'assets/enemigo.png');
    this.load.image('enemigo2', 'assets/enemigo2.png');
  }

  create() {
    // --- Piso ---
    this.piso = this.physics.add.staticGroup();
    const pisoRect = this.add.rectangle(400, 460, 800, 40, 0x555555);
    this.physics.add.existing(pisoRect, true);
    this.piso.add(pisoRect);

    // --- Plataformas elevadas (one-way), forma de X ---
    this.plataformasElevadas = this.physics.add.staticGroup();

    const platBajaIzq = this.add.rectangle(150, 340, 220, 20, 0x777777);
    this.physics.add.existing(platBajaIzq, true);
    this.plataformasElevadas.add(platBajaIzq);

    const platBajaDer = this.add.rectangle(650, 340, 220, 20, 0x777777);
    this.physics.add.existing(platBajaDer, true);
    this.plataformasElevadas.add(platBajaDer);

    const platCentro = this.add.rectangle(400, 220, 260, 20, 0x999999);
    this.physics.add.existing(platCentro, true);
    this.plataformasElevadas.add(platCentro);

    const platAltaIzq = this.add.rectangle(150, 100, 220, 20, 0xaaaaaa);
    this.physics.add.existing(platAltaIzq, true);
    this.plataformasElevadas.add(platAltaIzq);

    const platAltaDer = this.add.rectangle(650, 100, 220, 20, 0xaaaaaa);
    this.physics.add.existing(platAltaDer, true);
    this.plataformasElevadas.add(platAltaDer);

    this.physics.world.gravity.y = 600;

    // --- Jugador ---
    this.player = this.physics.add.sprite(100, 380, 'personaje').setScale(1.5);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.piso);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(this.player, this.plataformasElevadas, null, (player, plat) => {
      if (this.cursors.down.isDown) return false;
      return player.body.velocity.y >= 0;
    }, this);

    // --- Enemigo 1: persigue al jugador desde el inicio ---
    this.enemigo1 = this.physics.add.sprite(400, 240, 'enemigo').setScale(1.5);
    this.enemigo1.body.setAllowGravity(false);
    this.enemigo1.setCollideWorldBounds(true);
    this.enemigo1.postFX.addGlow(0xff0000, 4, 0, false, 0.2, 12); // borde rojo que sigue la forma del sprite

    this.physics.add.overlap(this.player, this.enemigo1, () => this.hitByEnemy(), null, this);

    // --- Enemigo 2: aparece recién a los 5 NPCs salvados, persigue al NPC activo ---
    this.enemigo2 = null;
    this.enemigo2Spawned = false;
    this.enemigo2TimeOnNpc = 0;

    this.enemyHitCooldown = false;

    // --- Contadores ---
    this.npcsSpawned = 0;
    this.npcsSavedCount = 0;
    this.npcsTotal = 10;
    this.levelDone = false;
    this.currentNpc = null;

    this.spawnPoints = [
      { x: 300, y: 380 }, { x: 500, y: 380 },
      { x: 150, y: 300 }, { x: 650, y: 300 },
      { x: 400, y: 180 },
      { x: 150, y: 60 }, { x: 650, y: 60 }
    ];

     this.registry.set('lives', 4);
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

    this.currentNpc = npc;

    // Más tiempo de reacción cuanto más arriba spawnea el NPC
    let delayInicial;
    if (punto.y <= 100) {
      delayInicial = 2200; // plataformas altas (y: 60)
    } else if (punto.y <= 220) {
      delayInicial = 1600; // plataforma central (y: 180)
    } else {
      delayInicial = 1000; // piso y plataformas bajas (y: 300, 380)
    }

    this.time.delayedCall(delayInicial, () => this.avisarYSoltarObjeto(npc, punto.y));
  }

  avisarYSoltarObjeto(npc, alturaSpawn) {
    if (!npc.active) return;

    const avisoX = npc.x;
    const aviso = this.add.circle(avisoX, alturaSpawn - 20, 20, 0xff0000, 0.6);

    this.time.delayedCall(700, () => {
      aviso.destroy();
      if (!npc.active) return;

      // La caja cae desde arriba de todo y solo se destruye al tocar el piso o al NPC.
      // Ya NO choca con las plataformas elevadas, así siempre puede llegar hasta el NPC.
      const caja = this.add.rectangle(avisoX, 0, 30, 30, 0x8b4513);
      this.physics.add.existing(caja);
      caja.body.setAllowGravity(true);

      this.physics.add.collider(caja, this.piso, () => caja.destroy());

      this.physics.add.overlap(caja, npc, (cajaObj, npcObj) => {
        if (npcObj.saved || npcObj.pushed) return;
        cajaObj.destroy();
        this.loseLife();
        npcObj.destroy();
        if (this.currentNpc === npcObj) this.currentNpc = null;
        this.time.delayedCall(500, () => this.spawnNPC());
      });
    });
  }

  pushNPC(player, npc) {
    if (npc.pushed) return;
    npc.pushed = true;
    npc.saved = true;
    this.addScore(10);

    this.npcsSavedCount++;
    if (this.npcsSavedCount === 5 && !this.enemigo2Spawned) {
      this.spawnEnemigo2();
    }

    if (this.currentNpc === npc) this.currentNpc = null;
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

spawnEnemigo2() {
    this.enemigo2Spawned = true;
    this.enemigo2 = this.physics.add.sprite(400, 460, 'enemigo2').setScale(1.5);
    this.enemigo2.body.setAllowGravity(false);
    this.enemigo2.setCollideWorldBounds(true);
    this.enemigo2.postFX.addGlow(0xff0000, 4, 0, false, 0.2, 12);

    this.physics.add.overlap(this.player, this.enemigo2, () => this.hitByEnemy(), null, this);
  }
  hitByEnemy() {
    if (this.enemyHitCooldown) return;
    this.enemyHitCooldown = true;
    this.loseLife();
    this.time.delayedCall(1000, () => { this.enemyHitCooldown = false; });
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
    this.add.text(400, 160, '¡NIVEL 3 COMPLETADO!', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

    const btnSiguiente = this.add.text(400, 240, 'Ver Victoria', {
      fontSize: '24px', color: '#0f0', backgroundColor: '#000', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    const btnMenu = this.add.text(400, 320, 'Volver al Menú', {
      fontSize: '24px', color: '#ff0', backgroundColor: '#000', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    btnSiguiente.on('pointerdown', () => this.scene.start('VictoryScene'));
    btnMenu.on('pointerdown', () => this.scene.start('MenuScene'));
  }

update(time, delta) {
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

    // Enemigo 1: persigue al jugador (daño instantáneo al tocarlo, sin cambios)
    const dx1 = this.player.x - this.enemigo1.x;
    const dy1 = this.player.y - this.enemigo1.y;
    const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
    const speed1 = 90;
    this.enemigo1.setVelocity((dx1 / dist1) * speed1, (dy1 / dist1) * speed1);

    // Enemigo 2: persigue al NPC activo, pero necesita quedarse 2.5s ENCIMA para matarlo
    if (this.enemigo2 && this.currentNpc && this.currentNpc.active) {
      const dx2 = this.currentNpc.x - this.enemigo2.x;
      const dy2 = this.currentNpc.y - this.enemigo2.y;
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
      const speed2 = 55;
      this.enemigo2.setVelocity((dx2 / dist2) * speed2, (dy2 / dist2) * speed2);

      // ¿Está "encima" del NPC? (suficientemente cerca en ambos ejes)
      const estaEncima = Math.abs(dx2) < 20 && Math.abs(dy2) < 20;

      if (estaEncima) {
        this.enemigo2TimeOnNpc += delta;

        if (this.enemigo2TimeOnNpc >= 1900) {
          // Pasaron 2.5s encima: mata al NPC y resta vida
          const npcAtrapado = this.currentNpc;
          this.enemigo2TimeOnNpc = 0;
          this.currentNpc = null;
          npcAtrapado.destroy();
          this.loseLife();
          this.time.delayedCall(500, () => this.spawnNPC());
        }
      } else {
        this.enemigo2TimeOnNpc = 0; // se alejó, se resetea el contador
      }
    } else if (this.enemigo2) {
      this.enemigo2.setVelocity(0, 0);
      this.enemigo2TimeOnNpc = 0;
    }
  }
}