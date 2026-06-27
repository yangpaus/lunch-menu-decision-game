let encoderCount  = 0;
let encoderPressed = false;

async function connectSerial() {
  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    document.getElementById('connectBtn').style.display = 'none';
    readSerial(port);
  } catch (e) {
    console.warn('Serial connect cancelled or failed:', e);
  }
}

async function readSerial(port) {
  const decoder = new TextDecoderStream();
  port.readable.pipeTo(decoder.writable);
  const reader = decoder.readable.getReader();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith('PRESS')) {
        encoderPressed = true;
      } else {
        const n = parseInt(line.split('\t')[0]);
        if (!isNaN(n)) encoderCount = n;
      }
    }
  }
}
