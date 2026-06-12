class Menu {
  constructor(data) {
    this.items = data;
    this.text = random(this.items);

    this.pos = createVector(width / 2, height / 2);
    
    this.speedX = width /100;
    this.vyMax = width / 90;
    this.segments = 7;
    this.hitCount = 0;
    this.vel = createVector(this.speedX, random(-1, 1));

    this.sat = 85; // saturation
    this.bri = 100; // brightness
    const hueCandidates = Array.from({ length: 12 }, (_, i) => i * 30); // 0,30,...,330
    this.hue = random(hueCandidates);
    
    this.history = [];
  }

  update() {
    let rx = textWidth(this.text[0]) / 2; 
    let ry = (textAscent() + textDescent()) / 2;
    this.pos.add(this.vel);
    let hit = false;

    const lineH = height / 80;
    if (this.pos.y > height - lineH - ry) {
      this.pos.y = height - lineH - ry;
      this.vel.y = -Math.abs(this.vel.y);
      hit = true;
    } else if (this.pos.y < lineH + ry) {
      this.pos.y = lineH + ry;
      this.vel.y = Math.abs(this.vel.y);
      hit = true;
    }

    if (hit) {
      if (
        this._lastBounceFrame == null ||
        frameCount - this._lastBounceFrame > 1
      ) {
        this.pickNewText();
        sndWall();
        this.hue = (this.hue + 30) % 360; // 360 넘어가도 래핑
        this._lastBounceFrame = frameCount;
      }
    }

    let t = millis() / 1000.0; // 초 단위 시간
    let flicker = sin(TWO_PI * t); // 1Hz 주기 (1초마다 사이클)
    this.bri = map(flicker, -1, 1, 50, 100); // 50~100 사이에서 깜빡임
    
    this.history.push(this.pos.copy());
    const need = this.text.length * this.gapFrames() + 2;
    while (this.history.length > need) this.history.shift();
  }
  
  collidePaddle(pad, dir) {
    const rx = textWidth(this.text[0]) / 2;
    const ry = (textAscent() + textDescent()) / 2;
    
    if (Math.sign(this.vel.x) === dir) return false;
    
    const hitX = abs(this.pos.x - pad.x) < pad.w / 2 + rx;
    const hitY = abs(this.pos.y - pad.y) < pad.h / 2 + ry;
    if (!(hitX && hitY)) return false;
    
    this.pos.x = pad.x + dir * (pad.w / 2 + rx);
    this.vel.x = dir * this.speedX;
    
    let offset = constrain((this.pos.y - pad.y) / (pad.h / 2), -1, 1);
    const half = (this.segments - 1) / 2;
    const seg = Math.round(offset * half);
    const norm = constrain(seg / half, -1, 1);
    this.vel.y = norm * this.vyMax;
    
    this.registerHit();
    sndPaddle();
    this.pickNewText();
    return true;
  }
  
  registerHit() {
    this.hitCount++;
    if (this.hitCount === 4 || this.hitCount === 12) {
      this.speedX *= 1.25;
      this.vyMax  *= 1.15;
    }
  }
  
  gapFrames() {
    const speed = this.vel.mag();
    const step  = textSize();
    return max(1, round(step / speed));
  }

  pickNewText() {
    let next = this.text;
    if (this.items.length > 1) {
      while (next === this.text) {
        next = random(this.items);
      }
    }
    this.text = next;
  }
  
  isGoal() {
    const rx = textWidth(this.text[0]) / 2;
    if (this.pos.x < -rx) return "ai";
    if (this.pos.x > width + rx) return "player";
    return null;
  }

  show() {
    fill(this.hue, this.sat, this.bri);
    noStroke();
    const chars = this.text.split('');
    const g = this.gapFrames();
    for (let i = 0; i < chars.length; i++) {
      const idx = this.history.length - 1 - i * g;
      const p = idx >= 0 ? this.history[idx] : this.history[0];
      if (p) text(chars[i], p.x, p.y);
    }
  }
}
