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

  followEncoder(delta) {
    const CURVE = 1.8; // 1이면 선형, 높을수록 빠른 회전에 가중치 (정밀도↑, 고속반응↑)
    const SCALE = 10;   // 전체 이동 속도 배율, 높을수록 패들이 빠르게 움직임
    const move = Math.sign(delta) * Math.pow(Math.abs(delta), CURVE) * SCALE;
    const half = this.h / 2;
    this.y = constrain(this.y + move, half, height - half);
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
