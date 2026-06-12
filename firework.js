class Firework {
  constructor(x, y) {
    this.particles = [];
    const hue = random(360);
    const n = 60;
    for (let i = 0; i < n; i++) {
      this.particles.push(new Particle(x, y, hue));
    }
  }
  
  update() {
    for (const p of this.particles) p.update();
    this.particles = this.particles.filter(p => !p.dead);
  }
  
  show() {
    for (const p of this.particles) p.show();
  }
  
  get done() { return this.particles.length === 0; }
}