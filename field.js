class Field {
  show() {
    background(0);
    fill(255);
    noStroke();

    const spacing = width / 60;
    for (let i = 1; i * spacing < height; i++) {
      rect(width / 2, i * spacing, width / 120);
    }

    const lineH = height / 80;
    rect(width / 2, lineH / 2,          width, lineH);
    rect(width / 2, height - lineH / 2, width, lineH);

    push();
    textSize(height * 0.05);
    fill(255);
    text("Player", width / 4,     lineH + height * 0.04);
    text("COM",    width * 3 / 4, lineH + height * 0.04);
    pop();
  }

  showResult(menuText) {
    push();
    fill(0);
    rect(width / 2, height / 2, width / 4, height / 4);
    fill(0, 0, 100);
    textSize(height * 0.025);
    text("오늘 점심은", width / 2, height / 2 - height * 0.09);
    textSize(height * 0.045);
    text(menuText, width / 2, height / 2);
    pop();
  }
}
