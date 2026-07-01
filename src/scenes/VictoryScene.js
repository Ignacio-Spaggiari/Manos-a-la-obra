class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }

  create() {
    this.add.text(400, 240, 'LEVEL 2 (en construcción)', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
  }
}