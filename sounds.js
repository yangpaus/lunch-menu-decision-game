let actx;

function blip(freq, dur = 0.08) {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;

  const t = actx.currentTime;
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

  osc.connect(gain);              // ← 체이닝 풀어둠 (p5.sound 충돌 방지)
  gain.connect(actx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

function crowdCheer(dur = 1.6) {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  const t = actx.currentTime;

  // 1) 화이트 노이즈
  const buf = actx.createBuffer(1, actx.sampleRate * dur, actx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = actx.createBufferSource();
  noise.buffer = buf;

  // 2) 밴드패스
  const bp = actx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 700;
  bp.Q.value = 0.7;

  // 3) swell 엔벨로프
  const gain = actx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.35, t + dur * 0.35);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  // 4) LFO — 게인을 흔들어 군중 웅성임 (← crowdCheer 안으로 들어옴)
  const lfo = actx.createOscillator();
  const lfoGain = actx.createGain();
  lfo.frequency.value = 18;
  lfoGain.gain.value = 0.08;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);     // swell 게인 위에 떨림을 더함
  lfo.start(t);
  lfo.stop(t + dur);

  noise.connect(bp);
  bp.connect(gain);
  gain.connect(actx.destination);
  noise.start(t);
  noise.stop(t + dur);
}

function sndWall()   { blip(240); }
function sndPaddle() { blip(480); }
function sndGoal()   { blip(120, 0.25); blip(120, 0.4); crowdCheer(1.6); }



