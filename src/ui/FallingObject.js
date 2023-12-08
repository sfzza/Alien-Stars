import Phaser from 'phaser';

export default class FallingObject extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, config) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.speed = config.speed;
        this.rotationVal = config.rotation;
    }

    spawn(positionX) {
        const gameHeight = this.scene.scale.height;
        this.setPosition(positionX, gameHeight + 10);
        this.setActive(true);
        this.setVisible(true);
      }

    die() {
        this.destroy();
    }

    update(time) {
        this.y -= this.speed;
        this.rotation += this.rotationVal;
        const gameHeight = this.scene.scale.height;
        if (this.y < -10) {
      this.die();
    }
    }
}
