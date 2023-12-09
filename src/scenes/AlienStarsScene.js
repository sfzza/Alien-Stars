import Phaser from "phaser";
import FallingObject from "../ui/FallingObject";
import Laser from "../ui/Laser";
import ScoreLabel from "../ui/ScoreLabel";
import LifeLabel from "../ui/LifeLabel";

export default class AlienStarsScene extends Phaser.Scene {
  constructor() {
    super("alien-stars-scene");
  }

  init() {
    this.nav_left = false;
    this.nav_right = false;
    this.shoot = false;
    this.ufo = undefined;
    this.speed = 100;
    this.cursors = undefined;
    this.meteors = undefined;
    this.meteorSpeed = 1.5;
    this.lasers = undefined;
    this.lastFired = 0;
    //score label
    this.scoreLabel = undefined;
    //life label
    this.lifeLabel = undefined;
    //star (untuk menambah life)
    this.star = undefined;
  }

  preload() {
    this.load.image("background", "images/bg2.png");
    this.load.image("left-btn", "images/left.gif");
    this.load.image("right-btn", "images/right.gif");
    this.load.image("shoot-btn", "images/shoot.gif");
    // star
    this.load.image("star", "images/star.png");
    this.load.spritesheet("ufo", "images/ufo.png", {
      frameWidth: 66,
      frameHeight: 66,
    });
    this.load.image("meteor", "images/meteor.png");
    this.load.spritesheet("laser", "images/bullets.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    var bg = this.add.image(0, 0, "background").setOrigin(0, 0);

    var scaleX = this.game.config.width / bg.width;
    var scaleY = this.game.config.height / bg.height;
    bg.setScale(scaleX, scaleY);

    this.createButton();

    this.ufo = this.createufo();
    this.cursors = this.input.keyboard.createCursorKeys();

    this.meteors = this.physics.add.group({
      classType: FallingObject,
      maxSize: 10,
      runChildUpdate: true,
    });

    this.time.addEvent({
      delay: Phaser.Math.Between(2000, 8000),
      callback: this.spawnmeteor,
      callbackScope: this,
      loop: true,
    });

    this.lasers = this.physics.add.group({
      classType: Laser,
      // maxSize: 10,
      runChildUpdate: true,
    });

    this.physics.world.enable([this.lasers, this.meteors]);

    this.physics.add.overlap(
      this.lasers,
      this.meteors,
      this.hitmeteor,
      null,
      this
    );
    this.input.keyboard.on("keydown-SPACE", this.shootLaser, this);

    // masukkan posisi score label
    this.scoreLabel = this.createScoreLabel(16, 16, 0);
    // masukkan posisi life label
    this.lifeLabel = this.createLifeLabel(16, 43, 3);

    // tambahkan overlap jika meteor dan ufo bersentuhan
    this.physics.add.overlap(
      this.ufo,
      this.meteors,
      this.decreaseLife,
      null,
      this
    );
    // star
    this.star = this.physics.add.group({
      classType: FallingObject,
      runChildUpdate: true,
    });
    this.time.addEvent({
      delay: 10000,
      callback: this.spawnstar,
      callbackScope: this,
      loop: true,
    });
    this.physics.add.overlap(
      this.ufo,
      this.star,
      this.increaseLife,
      null,
      this
    );
  }

  update(time) {
    this.moveufo(time);

    // win
    const targetScore = 150;
    if (this.scoreLabel.getScore() >= targetScore) {
      this.handleWin();
    }
  }

  createButton() {
    this.input.addPointer(3);
    this.shootButton = this.add
      .image(320, 550, "shoot-btn")
      .setInteractive()
      .setDepth(0.5)
      .setAlpha(0.8)
      .setScale(3);
    this.leftButton = this.add
      .image(50, 550, "left-btn")
      .setInteractive()
      .setDepth(0.5)
      .setAlpha(0.8)
      .setScale(3);
    this.rightButton = this.add
      .image(
        this.leftButton.x + this.leftButton.displayWidth + 20,
        550,
        "right-btn"
      )
      .setInteractive()
      .setDepth(0.5)
      .setAlpha(0.8)
      .setScale(3);

    this.leftButton.on(
      "pointerdown",
      () => {
        this.nav_left = true;
      },
      this
    );
    this.leftButton.on(
      "pointerup",
      () => {
        this.nav_left = false;
      },
      this
    );
    this.rightButton.on(
      "pointerdown",
      () => {
        this.nav_right = true;
      },
      this
    );
    this.rightButton.on(
      "pointerup",
      () => {
        this.nav_right = false;
      },
      this
    );
    this.shootButton.on(
      "pointerdown",
      () => {
        this.shoot = true;
      },
      this
    );
    this.shootButton.on(
      "pointerup",
      () => {
        this.shoot = false;
      },
      this
    );
  }

  createufo() {
    const ufo = this.physics.add.sprite(200, 70, "ufo").setScale(3);
    ufo.setCollideWorldBounds(true);

    return ufo;
  }

  moveufo(time) {
    if (this.cursors.left.isDown || this.nav_left) {
      this.ufo.setVelocityX(-this.speed);
    } else if (this.cursors.right.isDown || this.nav_right) {
      this.ufo.setVelocityX(this.speed);
    } else {
      this.ufo.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.ufo.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.ufo.setVelocityY(160);
    } else if (this.cursors.down.isUp || this.cursors.up.isUp) {
      this.ufo.setVelocityY(0);
    }

    if (this.shoot && time > this.lastFired) {
      const laser = this.lasers.get(0, 0, "laser");
      if (laser) {
        laser.fire(this.ufo.x, this.ufo.y);
        this.lastFired = time + 150;
      }
    }
  }

  spawnmeteor() {
    const numberOfMeteors = Phaser.Math.Between(1, 3); // Change the number of meteors spawned
  
    for (let i = 0; i < numberOfMeteors; i++) {
      const config = {
        speed: this.meteorSpeed,
        rotation: 0,
      };
  
      if (this.meteors.countActive(true) % 2 === 0) {
        config.rotation = 0.2;
      } else {
        config.rotation = 0.1;
      }
  
      const meteor = this.meteors.get(0, 0, "meteor", config);
      if (meteor) {
        const meteorWidth = meteor.displayWidth;
        const positionX = Phaser.Math.Between(
          meteorWidth,
          this.scale.width - meteorWidth
        );
        meteor.spawn(positionX);
        meteor.setScale(3);
      }
    }
  }
  

  hitmeteor(laser, meteor) {
    laser.erase(); //destroy laser yg bersentuhan
    meteor.die(); //destroy meteor yg bersentuhan
    this.scoreLabel.add(10);
    if (this.scoreLabel.getScore() % 100 == 0) {
      this.meteorSpeed += 0.2;
    }
  }

  shootLaser() {
    if (this.time.now > this.lastFired) {
      const laser = this.lasers.get(0, 0, "laser");
      if (laser) {
        laser.fire(this.ufo.x, this.ufo.y);
        this.lastFired = this.time.now + 150;
      }
    }
  }

  createScoreLabel(x, y, score) {
    const style = {
      fontSize: "20px",
      fill: "#000",
      backgroundColor: "white",
    };
    const label = new ScoreLabel(this, x, y, score, style).setDepth(1);
    this.add.existing(label);
    return label;
  }

  // m13
  createLifeLabel(x, y, life) {
    const style = { fontSize: "20px", fill: "#000", backgroundColor: "white" };
    const label = new LifeLabel(this, x, y, life, style).setDepth(1);

    this.add.existing(label);

    return label;
  }

  // m13
  decreaseLife(ufo, meteor) {
    meteor.die();
    this.lifeLabel.subtract(1);

    const currentLife = this.lifeLabel.getLife();

    if (currentLife === 2) {
      ufo.setTint(0xff0000).setAlpha(1); // If life is 2, set tint and normal alpha
    } else if (currentLife === 1) {
      ufo.setTint(0xff0000).setAlpha(0.5); // If life is 1, set tint and reduced alpha
    } else if (currentLife === 0) {
      this.scene.start("over-scene", {
        score: this.scoreLabel.getScore(),
      });
    }
  }
  spawnstar() {
    const config = {
      speed: 1.4,
      rotation: 0,
    };
    const star = this.star.get(0, 0, "star", config);
    const positionX = Phaser.Math.Between(70, 330);
    if (star) {
      star.spawn(positionX);
    }
  }
  increaseLife(ufo, star) {
    star.die();
    this.lifeLabel.add(1);

    const currentLife = this.lifeLabel.getLife();

    if (currentLife === 2) {
      ufo.setTint(0xff0000).setAlpha(1);
    } else if (currentLife >= 3) {
      ufo.clearTint().setAlpha(1);
    } else if (currentLife <= 1) {
      ufo.setTint(0xff0000).setAlpha(0.5);
    }
  }
  handleWin() {
    this.scene.start("win-scene", {
      score: this.scoreLabel.getScore(),
    });
  }
}
