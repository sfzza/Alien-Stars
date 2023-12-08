import Phaser from "phaser";

var replayButton;

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("over-scene");
  }

  init(data) {
    this.score = data.score;
  }

  preload() {
    this.load.image("background", "images/bg2.png");
    this.load.image("gameover", "images/GameOver.png");
    this.load.image("replay", "images/Replay.png");
  }

  create() {
    var bg = this.add.image(0, 0, "background").setOrigin(0, 0);

    // @ts-ignore
    var scaleX = this.game.config.width / bg.width;
    // @ts-ignore
    var scaleY = this.game.config.height / bg.height;
    bg.setScale(scaleX, scaleY);

    this.add.image(200, 130, "gameover").setScale(2);
    // Create the replay button and assign it to the replayButton variable
    replayButton = this.add.image(200, 300, "replay").setInteractive();

    // Set up the replay button event listener
    replayButton.on(
      "pointerup",
      () => {
        this.scene.start("alien-stars-scene");
      },
      this
    );

    replayButton.setScale(2);
    // Create the SCORE: text
    const scoreTextLabel = this.add.text(80, 400, "SCORE: ", {
      fontSize: "40px",
      // @ts-ignore
      fill: "#fff",
    });
    const scoreValueText = this.add.text(300, 400, this.score, {
      fontSize: "40px",
      // @ts-ignore
      fill: "#fff",
    });

    // Calculate the total width of both text elements
    const totalWidth = scoreTextLabel.width + scoreValueText.width;
    // @ts-ignore
    scoreTextLabel.x = this.game.config.width / 2 - totalWidth / 2;
    scoreValueText.x = scoreTextLabel.x + scoreTextLabel.width;
  }
}
