const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 480,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MenuScene, Level1Scene, Level2Scene, Level3Scene, GameOverScene, VictoryScene]
};

const game = new Phaser.Game(config);