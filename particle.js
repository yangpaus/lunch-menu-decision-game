class Particle {
  constructor(x, y, hue) {
    this.pos = createVector(x, y);
    const a = random(TWO_PI);
    const sp = random(2, 9);
    this.vel = p5.Vector.fromAngle(a).mult(sp);
    this.hue = hue;
    this.life = 1;
  }
  
  update() {
    this.vel.mult(0.92);
    this.vel.y += 0.15;
    this.pos.add(this.vel);
    this.life -= 0.02;
  }
  
  show() {
    noStroke();
    fill(this.hue, 80, 100, this.life);
    rect(this.pos.x, this.pos.y, 10);
  }
  get dead() { return this.life <= 0; }
}