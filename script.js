const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startOverlay = document.getElementById('startOverlay');
const questionOverlay = document.getElementById('questionOverlay');
const resultOverlay = document.getElementById('resultOverlay');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const pipeScoreEl = document.getElementById('pipeScore');
const quizScoreEl = document.getElementById('quizScore');
const resultText = document.getElementById('resultText');
const resultTitle = document.getElementById('resultTitle');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

const game = {
  started: false,
  over: false,
  paused: false,
  animationId: null,
  bird: {
    x: 150,
    y: canvas.height / 2,
    radius: 18,
    velocityY: 0,
  },
  gravity: 0.42,
  flapForce: -7.3,
  pipes: [],
  pipeSpeed: 2.7,
  spawnTimer: 0,
  spawnInterval: 1500,
  passedPipes: 0,
  correctAnswers: 0,
  lastTimestamp: 0,
  timeLimit: 75000,
  elapsed: 0,
  activeQuestion: null,
  collisionPipe: null,
  usedQuestionIndices: [],
};

// --- Audio (WebAudio) helper and effects ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, duration = 0.12, type = 'sine', volume = 0.12) {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, audioCtx.currentTime);
  g.gain.setValueAtTime(volume, audioCtx.currentTime);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + duration);
}

function playSequence(seq) {
  let t = 0;
  for (const item of seq) {
    const { freq, dur = 0.12, type = 'sine', vol = 0.12 } = item;
    setTimeout(() => playTone(freq, dur, type, vol), t * 1000);
    t += dur;
  }
}

function playCorrect() {
  playSequence([
    { freq: 880, dur: 0.09, vol: 0.12 },
    { freq: 1320, dur: 0.12, vol: 0.12 },
  ]);
}

function playWrong() {
  playSequence([
    { freq: 220, dur: 0.12, vol: 0.14 },
    { freq: 196, dur: 0.14, vol: 0.12 },
  ]);
}

function playCollision() {
  playSequence([
    { freq: 150, dur: 0.16, vol: 0.16 },
    { freq: 120, dur: 0.18, vol: 0.12 },
  ]);
}

function playGroundHit() {
  playSequence([
    { freq: 110, dur: 0.18, vol: 0.18 },
    { freq: 90, dur: 0.22, vol: 0.14 },
  ]);
}

function playGameOver() {
  playSequence([
    { freq: 440, dur: 0.10, vol: 0.12 },
    { freq: 330, dur: 0.12, vol: 0.12 },
    { freq: 220, dur: 0.18, vol: 0.12 },
  ]);
}

// ============================================================
// BANK SOAL: Turunan Fungsi Trigonometri
// Topik:
//   1. Turunan Tingkat Tinggi
//   2. Nilai suatu turunan
//   3. Aplikasi turunan (Maksimum, Minimum, Interval Naik/Turun, Garis Singgung)
// ============================================================

const trigQuestions = [
  // ===== TURUNAN TINGKAT TINGGI =====
  {
    question: 'Diketahui f(x) = sin(x). Turunan ketiga f\'\'\'(x) adalah...',
    options: ['-cos(x)', '-sin(x)', 'cos(x)', 'sin(x)'],
    answer: 0,
  },
  {
    question: 'Jika f(x) = cos(x), maka f\'\'(x) sama dengan...',
    options: ['-cos(x)', '-sin(x)', 'sin(x)', 'cos(x)'],
    answer: 0,
  },
  {
    question: 'Turunan keempat dari f(x) = sin(x) adalah...',
    options: ['cos(x)', '-cos(x)', '-sin(x)', 'sin(x)'],
    answer: 3,
  },
  {
    question: 'Diketahui f(x) = sin(3x). Turunan kedua f\'\'(x) adalah...',
    options: ['-9 sin(3x)', '-3 cos(3x)', '9 sin(3x)', '3 cos(3x)'],
    answer: 0,
  },
  {
    question: 'Jika f(x) = cos(2x), maka f\'\'\'(x) adalah...',
    options: ['-8 sin(2x)', '8 cos(2x)', '8 sin(2x)', '-8 cos(2x)'],
    answer: 2,
  },
  {
    question: 'Turunan kedua dari f(x) = sin(x) + cos(x) adalah...',
    options: ['sin(x) - cos(x)', '-sin(x) - cos(x)', '-sin(x) + cos(x)', 'sin(x) + cos(x)'],
    answer: 1,
  },
  {
    question: 'Diketahui f(x) = sin²(x). Turunan pertama f\'(x) adalah...',
    options: ['2 sin(x) cos(x)', 'sin(2x)', '-2 sin(x) cos(x)', 'cos²(x) - sin²(x)'],
    answer: 0,
  },
  {
    question: 'Jika f(x) = cos³(x), maka f\'(x) adalah...',
    options: ['-3 cos²(x) sin(x)', '3 cos²(x)', '-3 sin²(x) cos(x)', '3 cos²(x) sin(x)'],
    answer: 0,
  },
  {
    question: 'Turunan kelima dari f(x) = sin(x) adalah...',
    options: ['sin(x)', '-sin(x)', 'cos(x)', '-cos(x)'],
    answer: 2,
  },
  {
    question: 'Diketahui f(x) = x sin(x). Turunan kedua f\'\'(x) adalah...',
    options: ['2 cos(x) - x sin(x)', '-x sin(x)', 'cos(x) + x sin(x)', '-2 cos(x) + x sin(x)'],
    answer: 0,
  },

  // ===== NILAI DARI SUATU TURUNAN =====
  {
    question: 'Jika f(x) = sin(x), maka nilai f\'(π/3) adalah...',
    options: ['√3/2', '1/2', '1', '0'],
    answer: 1,
  },
  {
    question: 'Diketahui f(x) = cos(x). Nilai f\'(π/6) sama dengan...',
    options: ['-1/2', '-√3/2', '1/2', '√3/2'],
    answer: 0,
  },
  {
    question: 'Jika f(x) = sin(2x), maka f\'(π/4) adalah...',
    options: ['0', '1', '-1', '2'],
    answer: 0,
  },
  {
    question: 'Nilai f\'(π/2) untuk f(x) = cos(3x) adalah...',
    options: ['0', '3', '-3', '1'],
    answer: 1,
  },
  {
    question: 'Diketahui f(x) = sin(x) - cos(x). Nilai f\'(π/4) adalah...',
    options: ['√2', '0', '1', '-√2'],
    answer: 0,
  },
  {
    question: 'Jika f(x) = tan(x), maka nilai f\'(π/4) adalah...',
    options: ['2', '1', '0', '√2'],
    answer: 0,
  },
  {
    question: 'Nilai f\'(π/6) untuk f(x) = sin(2x) adalah...',
    options: ['1', '√3', '1/2', '√3/2'],
    answer: 0,
  },
  {
    question: 'Diketahui f(x) = cos(2x). Nilai f\'(π/3) adalah...',
    options: ['-√3', '√3', '-1', '1'],
    answer: 0,
  },
  {
    question: 'Jika f(x) = x cos(x), maka f\'(π) adalah...',
    options: ['-1', '1', '0', '-π'],
    answer: 0,
  },
  {
    question: 'Nilai f\'(π/6) untuk f(x) = sin²(x) adalah...',
    options: ['√3/2', '1/2', '1', '√3'],
    answer: 0,
  },

  // ===== APLIKASI: NILAI MAKSIMUM =====
  {
    question: 'Nilai maksimum fungsi f(x) = sin(x) + cos(x) pada interval [0, π/2] adalah...',
    options: ['√2', '2', '1', '1/2'],
    answer: 0,
  },
  {
    question: 'Nilai maksimum dari f(x) = 2 sin(x) + 1 pada interval [0, π] adalah...',
    options: ['3', '2', '1', '4'],
    answer: 0,
  },
  {
    question: 'Nilai maksimum fungsi f(x) = cos(2x) + 1 pada [0, π] adalah...',
    options: ['2', '1', '0', '3'],
    answer: 0,
  },
  {
    question: 'Nilai maksimum f(x) = 3 sin(x) - 4 cos(x) adalah...',
    options: ['5', '7', '1', '25'],
    answer: 0,
  },
  {
    question: 'Nilai maksimum fungsi f(x) = sin²(x) pada interval [0, π] adalah...',
    options: ['1', '0', '1/2', '2'],
    answer: 0,
  },

  // ===== APLIKASI: NILAI MINIMUM =====
  {
    question: 'Nilai minimum fungsi f(x) = sin(x) - cos(x) pada interval [0, π] adalah...',
    options: ['-√2', '-1', '-2', '0'],
    answer: 0,
  },
  {
    question: 'Nilai minimum dari f(x) = 2 cos(x) - 1 pada [0, 2π] adalah...',
    options: ['-3', '-1', '-2', '1'],
    answer: 0,
  },
  {
    question: 'Nilai minimum fungsi f(x) = sin(2x) - 2 pada interval [0, π] adalah...',
    options: ['-3', '-1', '-2', '0'],
    answer: 0,
  },
  {
    question: 'Nilai minimum f(x) = 4 - 3 sin(x) pada [0, 2π] adalah...',
    options: ['1', '4', '7', '-1'],
    answer: 3,
  },
  {
    question: 'Nilai minimum fungsi f(x) = cos²(x) - 1 pada interval [0, π] adalah...',
    options: ['-1', '0', '1', '-2'],
    answer: 0,
  },

  // ===== APLIKASI: INTERVAL NAIK =====
  {
    question: 'Fungsi f(x) = sin(x) naik pada interval...',
    options: ['(0, π/2)', '(π/2, π)', '(π, 3π/2)', '(3π/2, 2π)'],
    answer: 0,
  },
  {
    question: 'Fungsi f(x) = cos(x) naik pada interval...',
    options: ['(π, 2π)', '(0, π)', '(0, π/2)', '(π/2, 3π/2)'],
    answer: 0,
  },
  {
    question: 'Fungsi f(x) = sin(2x) naik pada interval...',
    options: ['(0, π/4)', '(π/4, π/2)', '(π/2, 3π/4)', '(3π/4, π)'],
    answer: 0,
  },
  {
    question: 'Fungsi f(x) = sin(x) + cos(x) naik pada interval...',
    options: ['(0, π/4)', '(π/4, π/2)', '(π/2, π)', '(π, 3π/2)'],
    answer: 0,
  },
  {
    question: 'Fungsi f(x) = cos(2x) naik pada interval...',
    options: ['(π/2, π)', '(0, π/2)', '(0, π)', '(π, 2π)'],
    answer: 0,
  },

  // ===== APLIKASI: INTERVAL TURUN =====
  {
    question: 'Fungsi f(x) = sin(x) turun pada interval...',
    options: ['(π/2, 3π/2)', '(0, π/2)', '(0, π)', '(3π/2, 2π)'],
    answer: 0,
  },
  {
    question: 'Fungsi f(x) = cos(x) turun pada interval...',
    options: ['(0, π)', '(π, 2π)', '(0, π/2)', '(π/2, 3π/2)'],
    answer: 0,
  },
  {
    question: 'Fungsi f(x) = sin(2x) turun pada interval...',
    options: ['(π/4, 3π/4)', '(0, π/4)', '(3π/4, π)', '(0, π/2)'],
    answer: 0,
  },
  {
    question: 'Fungsi f(x) = cos(2x) turun pada interval...',
    options: ['(0, π/2)', '(π/2, π)', '(π, 3π/2)', '(3π/2, 2π)'],
    answer: 0,
  },
  {
    question: 'Fungsi f(x) = sin(x) - cos(x) turun pada interval...',
    options: ['(3π/4, 7π/4)', '(0, π/4)', '(π/4, 3π/4)', '(0, π/2)'],
    answer: 0,
  },

  // ===== APLIKASI: PERSAMAAN GARIS SINGGUNG =====
  {
    question: 'Persamaan garis singgung kurva f(x) = sin(x) di titik x = π/4 adalah...',
    options: ['y = (√2/2)x + √2/2(1 - π/4)', 'y = (√2/2)x', 'y = x - π/4', 'y = (1/2)x + 1'],
    answer: 0,
  },
  {
    question: 'Persamaan garis singgung f(x) = cos(x) di x = π/3 adalah...',
    options: ['y = -√3/2 x + √3π/6 + 1/2', 'y = √3/2 x - 1/2', 'y = -√3 x + 1', 'y = x - π/3'],
    answer: 0,
  },
  {
    question: 'Garis singgung kurva f(x) = sin(x) di titik x = 0 adalah...',
    options: ['y = x', 'y = 0', 'y = 1', 'y = -x'],
    answer: 0,
  },
  {
    question: 'Persamaan garis singgung f(x) = cos(x) di x = 0 adalah...',
    options: ['y = 1', 'y = x', 'y = 0', 'y = -x + 1'],
    answer: 0,
  },
  {
    question: 'Garis singgung kurva f(x) = sin(2x) di x = π/6 adalah...',
    options: ['y = x - π/6 + √3/2', 'y = 2x - π/3', 'y = x + 1', 'y = -x + π/6'],
    answer: 0,
  },
  {
    question: 'Persamaan garis singgung f(x) = cos(2x) di x = π/4 adalah...',
    options: ['y = -2x + π/2', 'y = 2x - π/2', 'y = -x + π/4', 'y = x - π/4'],
    answer: 0,
  },
  {
    question: 'Garis singgung kurva f(x) = sin(x) + cos(x) di x = 0 adalah...',
    options: ['y = x + 1', 'y = -x + 1', 'y = 1', 'y = x'],
    answer: 0,
  },
  {
    question: 'Persamaan garis singgung f(x) = sin(x) di x = π/2 adalah...',
    options: ['y = 1', 'y = x - π/2 + 1', 'y = 0', 'y = x'],
    answer: 0,
  },

  // ===== SOAL CAMPURAN / KOMBINASI =====
  {
    question: 'Jika f(x) = sin(x) cos(x), maka f\'(x) sama dengan...',
    options: ['cos(2x)', 'sin(2x)', '-cos(2x)', '2 cos(2x)'],
    answer: 0,
  },
  {
    question: 'Turunan pertama dari f(x) = tan(2x) adalah...',
    options: ['2 sec²(2x)', 'sec²(2x)', '2 tan²(2x)', 'tan(2x) sec(2x)'],
    answer: 0,
  },
  {
    question: 'Diketahui f(x) = sin(x)/(1 + cos(x)). Nilai f\'(π/3) adalah...',
    options: ['2/3', '1/3', '1/2', '√3/2'],
    answer: 0,
  },
  {
    question: 'Fungsi f(x) = sin³(x) naik pada interval...',
    options: ['(0, π/2)', '(π/2, π)', '(π, 3π/2)', '(3π/2, 2π)'],
    answer: 0,
  },
  {
    question: 'Nilai maksimum fungsi f(x) = 2 sin²(x) - 1 pada [0, π] adalah...',
    options: ['1', '2', '0', '-1'],
    answer: 0,
  },
  {
    question: 'Persamaan garis singgung f(x) = tan(x) di x = π/4 adalah...',
    options: ['y = 2x - π/2 + 1', 'y = 2x + 1', 'y = x - π/4 + 1', 'y = x + 1'],
    answer: 0,
  },
  {
    question: 'Jika f(x) = sin(2x) cos(x), maka f\'(0) adalah...',
    options: ['2', '1', '0', '-1'],
    answer: 0,
  },
  {
    question: 'Turunan kedua dari f(x) = x sin(x) di x = π adalah...',
    options: ['-2', '2', '0', '-π'],
    answer: 0,
  },
  {
    question: 'Fungsi f(x) = cos²(x) - sin²(x) memiliki nilai minimum pada [0, π/2] yaitu...',
    options: ['-1', '0', '1', '-1/2'],
    answer: 0,
  },
  {
    question: 'Interval turun fungsi f(x) = sin(x/2) pada [0, 2π] adalah...',
    options: ['Tidak ada (selalu naik)', '(0, π)', '(π, 2π)', '(π/2, 3π/2)'],
    answer: 0,
  },
];

// ============================================================
// Fungsi utilitas
// ============================================================

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomQuestion() {
  // Reset jika semua soal sudah dipakai
  if (game.usedQuestionIndices.length >= trigQuestions.length) {
    game.usedQuestionIndices = [];
  }

  // Cari index yang belum dipakai
  const availableIndices = [];
  for (let i = 0; i < trigQuestions.length; i++) {
    if (!game.usedQuestionIndices.includes(i)) {
      availableIndices.push(i);
    }
  }

  const randomIdx = Math.floor(Math.random() * availableIndices.length);
  const questionIndex = availableIndices[randomIdx];
  game.usedQuestionIndices.push(questionIndex);

  const original = trigQuestions[questionIndex];

  // Acak posisi jawaban
  const shuffledOptions = shuffleArray(original.options);
  const newAnswerIndex = shuffledOptions.indexOf(original.options[original.answer]);

  return {
    question: original.question,
    options: shuffledOptions,
    answer: newAnswerIndex,
  };
}

function setOverlayState(overlay, visible) {
  overlay.classList.toggle('visible', visible);
  overlay.classList.toggle('hidden', !visible);
}

function resetGame() {
  game.started = true;
  game.over = false;
  game.paused = false;
  game.pipes = [];
  game.spawnTimer = 0;
  game.passedPipes = 0;
  game.correctAnswers = 0;
  game.elapsed = 0;
  game.activeQuestion = null;
  game.collisionPipe = null;
  game.lastTimestamp = 0;
  game.usedQuestionIndices = [];
  game.bird.y = canvas.height / 2;
  game.bird.velocityY = 0;
  pipeScoreEl.textContent = '0';
  quizScoreEl.textContent = '0';
}

function startGame() {
  if (game.animationId) {
    cancelAnimationFrame(game.animationId);
    game.animationId = null;
  }

  resetGame();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  setOverlayState(startOverlay, false);
  setOverlayState(resultOverlay, false);
  setOverlayState(questionOverlay, false);
  game.animationId = requestAnimationFrame(gameLoop);
}

function startNewRound() {
  startGame();
}

function flap() {
  if (!game.started || game.over) return;
  if (game.paused) return;
  game.bird.velocityY = game.flapForce;
}

function spawnPipe() {
  const gapHeight = 150;
  const minY = 80;
  const maxY = canvas.height - gapHeight - 80;
  const gapTop = Math.random() * (maxY - minY) + minY;

  game.pipes.push({
    x: canvas.width + 40,
    width: 72,
    gapTop,
    gapHeight,
    scored: false,
    hit: false,
  });
}

function updateGame(delta) {
  if (game.paused || game.over) return;

  game.elapsed += delta;

  if (game.elapsed >= game.timeLimit) {
    finishGame();
    return;
  }

  game.bird.velocityY += game.gravity;
  game.bird.y += game.bird.velocityY;

  if (game.bird.y + game.bird.radius >= canvas.height) {
    game.bird.y = canvas.height - game.bird.radius;
    game.bird.velocityY = 0;
    try { playGroundHit(); } catch (e) {}
    finishGame();
    return;
  }

  if (game.bird.y - game.bird.radius <= 0) {
    game.bird.y = game.bird.radius;
    game.bird.velocityY = 0;
  }

  game.spawnTimer += delta;
  if (game.spawnTimer >= game.spawnInterval) {
    spawnPipe();
    game.spawnTimer = 0;
  }

  for (const pipe of game.pipes) {
    pipe.x -= game.pipeSpeed * (delta / 16.67);

    if (!pipe.scored && pipe.x + pipe.width < game.bird.x) {
      pipe.scored = true;
      game.passedPipes += 1;
      pipeScoreEl.textContent = String(game.passedPipes);
    }

    const birdLeft = game.bird.x - game.bird.radius;
    const birdRight = game.bird.x + game.bird.radius;
    const birdTop = game.bird.y - game.bird.radius;
    const birdBottom = game.bird.y + game.bird.radius;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipe.width;
    const pipeTop = pipe.gapTop;
    const pipeBottom = pipe.gapTop + pipe.gapHeight;

    const intersectsHorizontally = birdRight > pipeLeft && birdLeft < pipeRight;
    const intersectsVertically = birdTop < pipeTop || birdBottom > pipeBottom;

    if (intersectsHorizontally && intersectsVertically && !pipe.hit) {
      pipe.hit = true;
      game.collisionPipe = pipe;
      triggerQuestion();
      break;
    }
  }

  game.pipes = game.pipes.filter((pipe) => pipe.x + pipe.width > -20);
}

function triggerQuestion() {
  if (!game.started || game.activeQuestion) return;

  game.paused = true;
  try { playCollision(); } catch (e) { /* ignore */ }

  const question = getRandomQuestion();
  game.activeQuestion = question;

  questionText.textContent = question.question;
  optionsContainer.innerHTML = '';

  question.options.forEach((optionText, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-btn';
    button.textContent = `${String.fromCharCode(65 + index)}. ${optionText}`;
    button.addEventListener('click', () => handleAnswer(index, button));
    optionsContainer.appendChild(button);
  });

  questionOverlay.classList.remove('hidden');
  questionOverlay.classList.add('visible');
}

function handleAnswer(selectedIndex, buttonElement) {
  if (!game.activeQuestion) return;

  const buttons = Array.from(optionsContainer.querySelectorAll('button'));
  const correctIndex = game.activeQuestion.answer;

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === correctIndex) button.classList.add('correct');
    if (index === selectedIndex && selectedIndex !== correctIndex) button.classList.add('wrong');
  });

  setTimeout(() => {
    if (selectedIndex === correctIndex) {
      try { playCorrect(); } catch (e) {}
      game.correctAnswers += 1;
      quizScoreEl.textContent = String(game.correctAnswers);
    }
    else {
      try { playWrong(); } catch (e) {}
    }

    game.activeQuestion = null;
    setOverlayState(questionOverlay, false);
    game.paused = false;
    game.bird.velocityY = 0;
    game.bird.y = Math.max(game.bird.radius + 10, Math.min(canvas.height - game.bird.radius - 10, game.bird.y));

    if (game.collisionPipe) {
      game.collisionPipe = null;
    }
  }, 700);
}

function finishGame() {
  if (game.over) return;
  game.over = true;
  game.paused = true;
  const passLeader = game.passedPipes;
  const answerLeader = game.correctAnswers;

  let verdict = 'Skor kamu masih bisa ditingkatkan!';
  if (passLeader > answerLeader) {
    verdict = 'Pemenang ditentukan oleh jumlah tiang yang berhasil dilewati!';
  } else if (answerLeader > passLeader) {
    verdict = 'Pemenang ditentukan oleh jumlah jawaban benar!';
  } else {
    verdict = 'Hasil seri: kedua indikator sama kuat!';
  }

  resultTitle.textContent = 'Permainan Selesai';
  resultText.innerHTML = `
    Tiang berhasil dilewati: <strong>${passLeader}</strong><br>
    Jawaban benar: <strong>${answerLeader}</strong><br><br>
    ${verdict}
  `;
  try { playGameOver(); } catch (e) {}
  setOverlayState(resultOverlay, true);
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ccefff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#6cc3ff';
  for (let i = 0; i < 10; i++) {
    const x = (i * 150 + (game.elapsed * 0.02) % 200) - 80;
    const y = 50 + (i % 3) * 35;
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#a7d76d';
  ctx.fillRect(0, canvas.height - 45, canvas.width, 45);

  ctx.fillStyle = '#89c55d';
  ctx.fillRect(0, canvas.height - 50, canvas.width, 8);
}

function drawBird() {
  const { x, y, radius } = game.bird;
  ctx.fillStyle = '#ffdc5e';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff9f43';
  ctx.beginPath();
  ctx.arc(x + 8, y - 5, radius * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - 4, y - 5, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#081b2d';
  ctx.beginPath();
  ctx.arc(x - 3, y - 5, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f7a400';
  ctx.beginPath();
  ctx.moveTo(x + radius - 2, y + 2);
  ctx.lineTo(x + radius + 14, y + 8);
  ctx.lineTo(x + radius - 2, y + 14);
  ctx.closePath();
  ctx.fill();
}

function drawPipes() {
  for (const pipe of game.pipes) {
    const topHeight = pipe.gapTop;
    const bottomY = pipe.gapTop + pipe.gapHeight;

    ctx.fillStyle = '#3cb371';
    ctx.fillRect(pipe.x, 0, pipe.width, topHeight);
    ctx.fillRect(pipe.x, bottomY, pipe.width, canvas.height - bottomY);

    ctx.fillStyle = '#2e9d6a';
    ctx.fillRect(pipe.x - 4, topHeight - 16, pipe.width + 8, 16);
    ctx.fillRect(pipe.x - 4, bottomY, pipe.width + 8, 16);
    ctx.fillStyle = '#1d7a52';
    ctx.fillRect(pipe.x + 12, topHeight - 16, 8, 16);
    ctx.fillRect(pipe.x + 12, bottomY, 8, 16);
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(8, 27, 45, 0.6)';
  ctx.fillRect(20, 18, 180, 46);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Segoe UI';
  ctx.fillText(`Tiang: ${game.passedPipes}`, 36, 40);
  ctx.fillText(`Benar: ${game.correctAnswers}`, 36, 60);
}

function draw() {
  drawBackground();
  drawPipes();
  drawBird();
  drawHUD();
}

function gameLoop(timestamp) {
  const delta = game.lastTimestamp ? timestamp - game.lastTimestamp : 16.7;
  game.lastTimestamp = timestamp;

  if (game.started && !game.over) {
    updateGame(delta);
  }

  draw();

  if (game.started && !game.over) {
    game.animationId = requestAnimationFrame(gameLoop);
  } else {
    game.animationId = null;
  }
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    if (!game.started) {
      startGame();
      return;
    }
    flap();
  }
});

canvas.addEventListener('pointerdown', () => {
  if (!game.started) {
    startGame();
    return;
  }
  flap();
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startNewRound);

setOverlayState(startOverlay, true);
setOverlayState(resultOverlay, false);
setOverlayState(questionOverlay, false);
resetGame();
draw();
