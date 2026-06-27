# EC11 로터리 엔코더 컨트롤러 연동 작업 보고서

## 1. 프로젝트 개요

점심 메뉴 결정 게임(`250918_lunch_menu_decision_game`)의 왼쪽 패들 조작을 마우스 대신 **EC11 로터리 엔코더 모듈**로 제어하는 물리 컨트롤러를 구현한다.

### 하드웨어 사양

| 항목 | 내용 |
|---|---|
| 모듈 | DFRobot EC11 (SEN0235) |
| MCU | Arduino UNO |
| 결선 | A→D2, B→D3, 버튼→D4, VCC→5V, GND→GND |
| 통신 | USB 시리얼 115200 baud |
| 포트 | `/dev/cu.wchusbserial2330` (CH340 칩) |

---

## 2. 시리얼 프로토콜

Arduino 펌웨어(`ec11_rotaryEncoder_test.ino`)가 출력하는 포맷:

| 이벤트 | 출력 형식 | 예시 |
|---|---|---|
| 엔코더 회전 | `count\tAB\tglitch` | `44\t11\t0` |
| 버튼 클릭 | `PRESS N` | `PRESS 3` |

- **count**: 쿼드러처 누적값. CW 회전 시 증가, CCW 시 감소. 1 detent(클릭) = 4 step
- **glitch**: 노이즈로 인한 비정상 전이 횟수 (테스트 결과 전부 0 — 신호 품질 양호)
- 버튼 디바운스 50ms 처리 완료 (펌웨어 내 구현)

---

## 3. 연결 방식

**Web Serial API** (브라우저 직접 연결) 방식 채택.

```
Arduino (EC11) ──USB──▶ Chrome Web Serial API ──▶ 게임 JS
```

- 중간 서버 불필요
- `localhost` 환경에서 별도 설정 없이 동작
- Chrome / Edge 전용 (Safari 미지원)

---

## 4. 구현 내용

### 4-1. 신규 파일: `controller.js`

Web Serial 연결 및 시리얼 파싱 담당.

```js
let encoderCount  = 0;   // 최신 누적 count값
let encoderPressed = false;  // 버튼 눌림 플래그

async function connectSerial()   // 포트 선택 → 연결 → 버튼 숨김
async function readSerial(port)  // 스트림 읽기 → 라인 파싱
```

파싱 규칙:
- `PRESS`로 시작 → `encoderPressed = true`
- 그 외 → 첫 번째 탭 이전 숫자를 `encoderCount`에 저장

### 4-2. `paddle.js` — `followEncoder(delta)` 추가

```js
followEncoder(delta) {
  const CURVE = 1.8; // 1이면 선형, 높을수록 빠른 회전에 가중치 (정밀도↑, 고속반응↑)
  const SCALE = 10;  // 전체 이동 속도 배율, 높을수록 패들이 빠르게 움직임
  const move = Math.sign(delta) * Math.pow(Math.abs(delta), CURVE) * SCALE;
  const half = this.h / 2;
  this.y = constrain(this.y + move, half, height - half);
}
```

**감도 커브 채택 이유**: velocity/acceleration(관성) 방식은 패들이 미끄러져 정밀 조작이 어려움. 감도 커브는 천천히 돌리면 정밀하게, 빠르게 돌리면 크게 반응하여 물리 컨트롤러 특성에 적합.

### 4-3. `sketch.js` 수정

```js
let prevEncoderCount = 0;  // 전 프레임 count값 (delta 계산용)
```

`draw()` 내 매 프레임:
```js
// 버튼: AudioContext 초기화 + 결과 화면 재시작
if (encoderPressed) { ... }

// 패들: 이전 count와의 차이(delta)로 이동
const delta = encoderCount - prevEncoderCount;
prevEncoderCount = encoderCount;
leftPaddle.followEncoder(delta);
```

### 4-4. `index.html` / `style.css` — 연결 버튼 추가

화면 우측 상단에 반투명 오버레이 버튼 배치. 연결 성공 시 자동으로 숨겨짐.

---

## 5. 입력 매핑

| EC11 입력 | 게임 동작 |
|---|---|
| 로터리 CW 회전 | 왼쪽 패들 아래로 이동 |
| 로터리 CCW 회전 | 왼쪽 패들 위로 이동 |
| 버튼 클릭 | 결과 화면에서 게임 재시작 |

마우스 조작(`followMouse`, `mousePressed`)은 그대로 유지 — 컨트롤러 없이도 플레이 가능.

---

## 6. 튜닝 파라미터

`paddle.js` `followEncoder()` 내 두 상수로 감도 조절:

| 상수 | 현재값 | 설명 |
|---|---|---|
| `CURVE` | `1.8` | 커브 지수. 높일수록 빠른 회전에 더 크게 반응 |
| `SCALE` | `10` | 전체 속도 배율. 높일수록 패들이 빠르게 움직임 |

---

## 7. 사용 방법

1. Arduino UNO를 USB로 연결
2. Chrome에서 `http://localhost:3000` 접속
3. 우측 상단 **"🎮 컨트롤러 연결"** 클릭 → 포트 선택 팝업에서 `wchusbserial2330` 선택
4. 엔코더 회전으로 패들 조작, 버튼으로 재시작
