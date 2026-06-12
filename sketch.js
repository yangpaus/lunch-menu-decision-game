let menu;
let myFont;
let itemsData;
let itemsArray;
let leftPad, rightPad;
let aiMaxSpeed = 10;
const STATE = { PLAYING: "playing", RESULT: "result" };
let gameState = STATE.PLAYING;
let resultMenu = null;
let winner = null;
let fireworks = [];

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
  menu = new Menu(itemsArray);

  const margin = width / 12;
  const pw = width / 120,
    ph = height / 10;
  leftPad = { x: margin, y: height / 2, w: pw, h: ph };
  rightPad = { x: width - margin, y: height / 2, w: pw, h: ph };
}

function draw() {
  background(0);
  textSize(width > height ? width * 0.02 : height * 0.02);
  
  for (let i = 1; i < height; i++) {
    let spacing = width / 60;
    fill(255);
    rect(width / 2, i * spacing, width / 120);
  }
  
  if (gameState === STATE.PLAYING) {
    updatePlayer();
    updateAI();
    drawPaddles();
    menu.update();
    menu.collidePaddle(leftPad, +1);
    menu.collidePaddle(rightPad, -1);
    menu.show();

    const goal = menu.isGoal();
    if (goal) {
      resultMenu = menu.text;
      winner = goal;
      gameState = STATE.RESULT;
      sndGoal();
      launchFireworks();
    }
  } else if (gameState === STATE.RESULT) {
    drawResult();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawPaddles() {
  push();
  noStroke();
  fill(255);
  rect(leftPad.x, leftPad.y, leftPad.w, leftPad.h, 3);
  rect(rightPad.x, rightPad.y, rightPad.w, rightPad.h, 3);
  pop();
}

function updatePlayer() {
  const half = leftPad.h / 2;
  leftPad.y = constrain(mouseY, half, height - half);
}

function updateAI() {
  const half = rightPad.h / 2;
  const target = menu.vel.x > 0 ? menu.pos.y : height / 2;
  const dy = target - rightPad.y;
  rightPad.y += constrain(dy, -aiMaxSpeed, aiMaxSpeed);
  rightPad.y = constrain(rightPad.y, half, height - half);
}

function drawResult() {
  updateFireworks();
  push();
  fill(0)
  rect(width / 2, height / 2, width / 4, height / 4);
  fill(0, 0, 100);
  textSize(16);
  text("오늘 점심은", width / 2, height / 2 - 70);
  textSize(32);
  text(resultMenu, width / 2, height / 2);
  pop();
}

function mousePressed() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  if (gameState === STATE.RESULT) resetGame();
}

function resetGame() {
  menu = new Menu(itemsArray);
  leftPad.y = rightPad.y = height / 2;
  resultMenu = null;
  winner = null;
  fireworks = [];
  gameState = STATE.PLAYING;
}

function launchFireworks() {
  for (let i = 0; i < 5; i++) {
    const x = random(width * 0.2, width * 0.8);
    const y = random(height * 0.2, height * 0.6);
    fireworks.push(new Firework(x, y));
  }
}

function updateFireworks() {
  for (const fw of fireworks) { fw.update(); fw.show() }
  fireworks = fireworks.filter(fw => !fw.done );
}