import Phaser from "phaser";

export default class Laser extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    this.setScale(1.5);
    this.speed = 200;
  }

  fire(x, y) {
    this.setPosition(x, y - 1);
    this.setActive(true);
    this.setVisible(true);
  }

  erase() {
    this.destroy();
  }
  update(time) {
    this.setVelocityY(400);
    if (this.y < -10) {
      this.erase();
    }
  }
}
