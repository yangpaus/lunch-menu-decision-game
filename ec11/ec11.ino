/*
 * DFRobot EC11 (SEN0235) 벤치마크 — Arduino UNO
 * 결선: A→D2, B→D3, C(버튼)→D4, VCC→5V, GND→GND
 * 시리얼 모니터 115200 baud. 명령: 'r' = 카운터 리셋
 */

const uint8_t PIN_A   = 2;   // INT0
const uint8_t PIN_B   = 3;   // INT1
const uint8_t PIN_BTN = 4;

// 4x 쿼드러처 디코더 테이블: index = (이전 AB << 2) | 현재 AB
// 유효한 1스텝 전이 = ±1, 2비트 동시 점프(비정상) = 0
const int8_t QDEC[16] = {
   0, -1,  1,  0,
   1,  0,  0, -1,
  -1,  0,  0,  1,
   0,  1, -1,  0
};

volatile long    count    = 0;   // 엣지 단위 누적 카운트
volatile long    glitches = 0;   // 비정상 전이(누락/노이즈) 횟수
volatile uint8_t prevAB   = 0;

void onChange() {
  uint8_t ab = (digitalRead(PIN_A) << 1) | digitalRead(PIN_B);
  int8_t  step = QDEC[(prevAB << 2) | ab];
  if (step == 0 && ab != prevAB) glitches++;  // 한 번에 2비트 점프 = 비정상
  count += step;
  prevAB = ab;
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_A,   INPUT);   // 보드에 47K 풀업 내장 → 별도 INPUT_PULLUP 불필요
  pinMode(PIN_B,   INPUT);
  pinMode(PIN_BTN, INPUT);   // 버튼 라인도 풀업 내장 → 평소 HIGH
  prevAB = (digitalRead(PIN_A) << 1) | digitalRead(PIN_B);
  attachInterrupt(digitalPinToInterrupt(PIN_A), onChange, CHANGE);
  attachInterrupt(digitalPinToInterrupt(PIN_B), onChange, CHANGE);
  Serial.println(F("EC11 bench ready.  'r' = reset"));
  Serial.println(F("count\tAB\tglitch"));
}

void loop() {
  // --- 엔코더: 값이 바뀔 때만 출력 ---
  static long lastCount = 0;
  noInterrupts();                 // volatile 다중바이트 원자적 읽기
  long c = count, g = glitches;
  uint8_t ab = prevAB;
  interrupts();

  if (c != lastCount) {
    Serial.print(c);      Serial.print('\t');
    Serial.print(ab >> 1);        // A 비트
    Serial.print(ab & 1);         // B 비트
    Serial.print('\t');
    Serial.println(g);
    lastCount = c;
  }

  // --- 버튼: raw 엣지 + 이전 엣지로부터 간격(바운스 관찰) ---
  // static uint8_t       lastBtn   = HIGH;
  // static unsigned long lastEdge  = 0;
  // uint8_t btn = digitalRead(PIN_BTN);
  // if (btn != lastBtn) {
  //   unsigned long now = millis();
  //   Serial.print(F("BTN "));
  //   Serial.print(btn == LOW ? F("DOWN") : F("UP  "));
  //   Serial.print(F("  +"));
  //   Serial.print(now - lastEdge);
  //   Serial.println(F("ms"));
  //   lastEdge = now;
  //   lastBtn  = btn;
  // }

// --- 버튼: 양방향 디바운스 + 누름 엣지만 PRESS ---
  const unsigned long DEBOUNCE = 50;        // ms
  static uint8_t stableBtn = HIGH;          // 확정된 안정 상태
  static uint8_t lastRead  = HIGH;          // 직전 raw 읽기
  static unsigned long lastChange = 0;      // raw가 마지막으로 바뀐 시각
  static unsigned long pressCount = 0;

  uint8_t raw = digitalRead(PIN_BTN);
  if (raw != lastRead) {                     // raw가 흔들리면 타이머 리셋
    lastChange = millis();
    lastRead = raw;
  }
  if ((millis() - lastChange) > DEBOUNCE) {  // DEBOUNCE 동안 안정됐을 때만 확정
    if (raw != stableBtn) {                   // 안정 상태가 실제로 바뀌었으면
      stableBtn = raw;
      if (stableBtn == LOW) {                 // 누름 엣지에서만
        pressCount++;
        Serial.print(F("PRESS "));           // ← restart 자리
        Serial.println(pressCount);
      }
    }
  }

  // --- 시리얼 명령 ---
  if (Serial.available() && Serial.read() == 'r') {
    noInterrupts(); count = 0; glitches = 0; interrupts();
    lastCount = 0;
    Serial.println(F("-- reset --"));
  }
}