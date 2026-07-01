class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create() {
    this.add.rectangle(400, 240, 800, 480, 0x000000, 0.85);

    this.add.text(400, 140, 'GAME OVER', { fontSize: '48px', color: '#ff3333' }).setOrigin(0.5);

    const score = this.registry.get('score') || 0;
    this.add.text(400, 210, 'Puntos: ' + score, { fontSize: '22px', color: '#fff' }).setOrigin(0.5);

    const btnRetry = this.add.text(400, 290, 'Reintentar Nivel', {
      fontSize: '24px', color: '#0f0', backgroundColor: '#000', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    const btnMenu = this.add.text(400, 360, 'Volver al Menú', {
      fontSize: '24px', color: '#ff0', backgroundColor: '#000', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    btnRetry.on('pointerdown', () => {
      const nivel = this.registry.get('currentLevel') || 'Level1Scene';
      this.registry.set('lives', 3);
      this.registry.set('score', 0);
      this.scene.start(nivel);
    });

    btnMenu.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}