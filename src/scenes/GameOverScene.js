class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create() {
    this.add.text(400, 240, 'GAME OVER (en construcción)', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
  }
}