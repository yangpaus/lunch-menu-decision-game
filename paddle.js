class Paddle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  followMouse() {
    const half = this.h / 2;
    this.y = constrain(mouseY, half, height - half);
  }

  followBall(ball, maxSpeed) {
    const half = this.h / 2;
    const target = ball.vel.x > 0 ? ball.pos.y : height / 2;
    const dy = target - this.y;
    this.y += constrain(dy, -maxSpeed, maxSpeed);
    this.y = constrain(this.y, half, height - half);
  }

  show() {
    push();
    noStroke();
    fill(255);
    rect(this.x, this.y, this.w, this.h, 3);
    pop();
  }
}
