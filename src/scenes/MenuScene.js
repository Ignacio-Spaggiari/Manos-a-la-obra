// MenuScene.js
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.registry.set('score', 0);
    this.registry.set('lives', 3);
    this.registry.set('npcsSaved', 0);

    this.add.text(400, 100, 'NOMBRE DEL JUEGO', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

    const playBtn = this.add.text(400, 200, 'JUGAR', { fontSize: '24px', color: '#0f0', backgroundColor: '#000', padding: {x:20,y:10} })
      .setOrigin(0.5).setInteractive();
    playBtn.on('pointerdown', () => this.scene.start('Level1Scene'));

    // --- Botones temporales de testeo (sacar antes de la entrega) ---
    this.add.text(400, 270, '--- TESTEO ---', { fontSize: '14px', color: '#888' }).setOrigin(0.5);

    const btnL1 = this.add.text(400, 310, 'Ir a Nivel 1', { fontSize: '18px', color: '#0ff', backgroundColor: '#000', padding: {x:15,y:8} })
      .setOrigin(0.5).setInteractive();
    btnL1.on('pointerdown', () => this.scene.start('Level1Scene'));

    const btnL2 = this.add.text(400, 355, 'Ir a Nivel 2', { fontSize: '18px', color: '#0ff', backgroundColor: '#000', padding: {x:15,y:8} })
      .setOrigin(0.5).setInteractive();
    btnL2.on('pointerdown', () => this.scene.start('Level2Scene'));

    const btnL3 = this.add.text(400, 400, 'Ir a Nivel 3', { fontSize: '18px', color: '#0ff', backgroundColor: '#000', padding: {x:15,y:8} })
      .setOrigin(0.5).setInteractive();
    btnL3.on('pointerdown', () => this.scene.start('Level3Scene'));
  }
}