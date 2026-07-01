class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }

  create() {
    this.add.rectangle(400, 240, 800, 480, 0x000000, 0.85);

    this.add.text(400, 140, '¡FELICIDADES!', { fontSize: '44px', color: '#0f0' }).setOrigin(0.5);
    this.add.text(400, 190, 'Completaste el juego', { fontSize: '22px', color: '#fff' }).setOrigin(0.5);

    const score = this.registry.get('score') || 0;
    const lives = this.registry.get('lives') || 0;
    this.add.text(400, 240, 'Puntos finales: ' + score, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
    this.add.text(400, 270, 'Vidas restantes: ' + lives, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);

    const btnMenu = this.add.text(400, 340, 'Volver al Menú', {
      fontSize: '24px', color: '#ff0', backgroundColor: '#000', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    btnMenu.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}