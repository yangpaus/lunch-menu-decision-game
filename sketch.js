let field, menu, leftPaddle, rightPaddle;
let itemsData, itemsArray;
let fireworks = [];
const STATE = { PLAYING: "playing", RESULT: "result" };
let gameState = STATE.PLAYING;
let resultMenu = null;

function preload() {
  itemsData = loadJSON("items.json");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  textFont("HBIOS-SYS");
  textAlign(CENTER, CENTER);
  rectMode(CENTER);

  itemsArray = Object.values(itemsData);

  const margin = width / 12;
  const pw = width / 120, ph = height / 10;

  field       = new Field();
  leftPaddle  = new Paddle(margin,         height / 2, pw, ph);
  rightPaddle = new Paddle(width - margin, height / 2, pw, ph);
  menu        = new Menu(itemsArray);
}

function draw() {
  textSize(width > height ? width * 0.02 : height * 0.02);
  field.show();

  if (gameState === STATE.PLAYING) {
    leftPaddle.followMouse();
    rightPaddle.followBall(menu, height / 80);
    leftPaddle.show();
    rightPaddle.show();

    menu.update();
    menu.collidePaddle(leftPaddle,  +1);
    menu.collidePaddle(rightPaddle, -1);
    menu.show();

    const goal = menu.isGoal();
    if (goal) {
      resultMenu = menu.text;
      gameState  = STATE.RESULT;
      sndGoal();
      launchFireworks();
    }
  } else {
    updateFireworks();
    field.showResult(resultMenu);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  const margin = width / 12;
  const pw = width / 120, ph = height / 10;

  leftPaddle.x  = margin;
  rightPaddle.x = width - margin;
  leftPaddle.w  = rightPaddle.w = pw;
  leftPaddle.h  = rightPaddle.h = ph;
}

function mousePressed() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === "suspended") actx.resume();
  if (gameState === STATE.RESULT) resetGame();
}

function resetGame() {
  menu        = new Menu(itemsArray);
  leftPaddle.y  = height / 2;
  rightPaddle.y = height / 2;
  resultMenu  = null;
  fireworks   = [];
  gameState   = STATE.PLAYING;
}

function launchFireworks() {
  for (let i = 0; i < 5; i++) {
    fireworks.push(new Firework(
      random(width * 0.2, width * 0.8),
      random(height * 0.2, height * 0.6)
    ));
  }
}

function updateFireworks() {
  for (const fw of fireworks) { fw.update(); fw.show(); }
  fireworks = fireworks.filter(fw => !fw.done);
}
