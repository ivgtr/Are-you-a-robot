<svelte:options customElement="gated-content" />

<script>
  import { onDestroy } from 'svelte';

  // ===== コンポーネントデータ =====
  const allComponents = [
    { tag: 'escaping-checkbox', name: '逃げるチェックボックス' },
    { tag: 'unfocusable-checkbox', name: 'フォーカス不可能チェックボックス' },
    { tag: 'reverse-checkbox', name: '反転チェックボックス' },
    { tag: 'infinite-loading-checkbox', name: '無限ローディング' },
    { tag: 'impossible-captcha', name: '不可能なCAPTCHA' },
    { tag: 'moving-checkbox', name: '移動するチェックボックス' },
    { tag: 'tiny-checkbox', name: '極小チェックボックス' },
    { tag: 'glitch-checkbox', name: 'グリッチチェックボックス' },
    { tag: 'crane-game-checkbox', name: 'UFOキャッチャー認証' },
    { tag: 'breakout-checkbox', name: 'ブロック崩し認証' },
    { tag: 'fake-close-checkbox', name: 'フェイク広告認証' },
    { tag: 'slider-puzzle-checkbox', name: 'スライドパズル認証' },
    { tag: 'stack-drop-checkbox', name: 'だるま落とし認証' },
  ];

  const NUM_STEPS = 5;
  const STEP_TIMEOUT = 30; // 秒 (クリア可能にするため15→30に拡張)

  // ===== グローバル状態 =====
  let currentStep = 0; // 0=イントロ, 1-N=チャレンジ, N+1=ゲーム解放
  let selectedComponents = [];
  let startTime = null;
  let elapsedTime = '00:00.000';
  let timerInterval = null;
  let completedCount = 0;

  // ステップごとの状態
  let componentContainer;
  let stepElapsed = 0;
  let stepTimer = null;
  let canProceed = false;
  let timeoutMsg = '';
  let transitioning = false;
  let nextStepTimeout = null;

  // 失敗（ロボット判定）状態
  let robotDetected = false;
  let failedAtStep = 0;

  const robotMessages = [
    'ロボットの疑いがあります',
    '人間ではない可能性が検出されました',
    '認証パターンが機械的です',
    '人間の応答速度を超えています',
    '不審な操作が検出されました',
    'ロボット特有の行動パターンを検知',
    '生体認証に失敗しました',
  ];

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startTimer() {
    if (startTime) return;
    startTime = Date.now();
    timerInterval = setInterval(() => {
      const ms = Date.now() - startTime;
      const min = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      const millis = ms % 1000;
      elapsedTime = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
    }, 33);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function begin() {
    selectedComponents = shuffle(allComponents).slice(0, NUM_STEPS);
    currentStep = 1;
    completedCount = 0;
    startTimer();
    // DOMの更新後にコンポーネントをロード
    requestAnimationFrame(() => loadCurrentComponent());
  }

  function saveEncounteredComponent(tag) {
    try {
      const encountered = JSON.parse(localStorage.getItem('encounteredComponents') || '[]');
      if (!encountered.includes(tag)) {
        encountered.push(tag);
        localStorage.setItem('encounteredComponents', JSON.stringify(encountered));
        window.dispatchEvent(new CustomEvent('component-encountered', { detail: { tag } }));
      }
    } catch (e) {
      // localStorage unavailable
    }
  }

  function loadCurrentComponent() {
    canProceed = false;
    timeoutMsg = '';
    stepElapsed = 0;

    let currentEl = null;

    requestAnimationFrame(() => {
      if (componentContainer) {
        componentContainer.innerHTML = '';
        const comp = selectedComponents[currentStep - 1];
        const el = document.createElement(comp.tag);
        el.addEventListener('gameover', () => {
          if (robotDetected) return;
          clearInterval(stepTimer);
          failedAtStep = currentStep;
          timeoutMsg = 'ゲームオーバーにより認証失敗';
          robotDetected = true;
          stopTimer();
        });
        componentContainer.appendChild(el);
        currentEl = el;
        saveEncounteredComponent(comp.tag);
      }
    });

    // ステップタイマー開始
    clearInterval(stepTimer);
    const stepStart = Date.now();
    stepTimer = setInterval(() => {
      stepElapsed = (Date.now() - stepStart) / 1000;

      // コンポーネント内のチェックボックスが選択されたか確認
      if (!canProceed && currentEl) {
        const shadow = currentEl.shadowRoot;
        if (shadow) {
          const checked = shadow.querySelector('input[type="checkbox"]:checked:not([disabled])');
          if (checked) {
            canProceed = true;
          }
        }
      }

      if (stepElapsed >= STEP_TIMEOUT && !canProceed && !robotDetected) {
        // タイムアウト → ロボット判定で失敗
        clearInterval(stepTimer);
        failedAtStep = currentStep;
        timeoutMsg = robotMessages[Math.floor(Math.random() * robotMessages.length)];
        robotDetected = true;
        stopTimer();
      }
    }, 100);
  }

  function nextStep() {
    clearInterval(stepTimer);
    completedCount++;
    transitioning = true;

    nextStepTimeout = setTimeout(() => {
      transitioning = false;
      if (currentStep >= NUM_STEPS) {
        currentStep = NUM_STEPS + 1;
        stopTimer();
      } else {
        currentStep++;
        requestAnimationFrame(() => loadCurrentComponent());
      }
    }, 500);
  }

  function restart() {
    clearInterval(timerInterval);
    clearInterval(stepTimer);
    cancelAnimationFrame(gameAnimFrame);
    if (nextStepTimeout) clearTimeout(nextStepTimeout);
    startTime = null;
    elapsedTime = '00:00.000';
    gameStarted = false;
    gameOver = false;
    gameRunning = false;
    robotDetected = false;
    failedAtStep = 0;
    currentStep = 0;
  }

  // ===== ジャンプゲーム =====
  let gameCanvas;
  let gameScore = 0;
  let gameBestScore = 0;
  let gameRunning = false;
  let gameOver = false;
  let gameAnimFrame;
  let gameStarted = false;

  let playerY = 0;
  let playerVelocity = 0;
  let isJumping = false;
  let obstacles = [];
  let gameSpeed = 3;
  let groundY = 0;
  let frameCount = 0;

  function initGame() {
    if (!gameCanvas) return;
    gameStarted = true;
    gameOver = false;
    gameRunning = true;
    playerVelocity = 0;
    isJumping = false;
    obstacles = [];
    gameScore = 0;
    gameSpeed = 3;
    frameCount = 0;
    cancelAnimationFrame(gameAnimFrame);
    // Canvas is now visible (gameStarted=true removes hidden class)
    // Wait for DOM update before reading dimensions
    requestAnimationFrame(() => {
      gameCanvas.width = gameCanvas.offsetWidth || 400;
      gameCanvas.height = 200;
      groundY = gameCanvas.height - 30;
      playerY = groundY;
      gameLoop();
    });
  }

  function jump() {
    if (!isJumping && gameRunning) {
      isJumping = true;
      playerVelocity = -10;
    }
    if (gameOver) {
      initGame();
    }
  }

  function gameLoop() {
    if (!gameCanvas) return;
    const ctx = gameCanvas.getContext('2d');
    const w = gameCanvas.width;
    const h = gameCanvas.height;

    if (!gameRunning) {
      drawGame(ctx, w, h);
      return;
    }

    frameCount++;

    if (isJumping) {
      playerVelocity += 0.6;
      playerY += playerVelocity;
      if (playerY >= groundY) {
        playerY = groundY;
        isJumping = false;
        playerVelocity = 0;
      }
    }

    if (frameCount % Math.max(40, 80 - Math.floor(gameScore / 50)) === 0) {
      obstacles.push({
        x: w + 10,
        width: 12 + Math.random() * 16,
        height: 18 + Math.random() * 24,
      });
    }

    for (let obs of obstacles) {
      obs.x -= gameSpeed;
    }
    obstacles = obstacles.filter(obs => obs.x > -50);

    const playerX = 40;
    const playerW = 18;

    for (let obs of obstacles) {
      if (
        playerX + playerW > obs.x + 2 &&
        playerX < obs.x + obs.width - 2 &&
        playerY > groundY - obs.height
      ) {
        gameRunning = false;
        gameOver = true;
        if (gameScore > gameBestScore) {
          gameBestScore = gameScore;
        }
        break;
      }
    }

    if (gameRunning) {
      gameScore++;
      if (gameScore % 300 === 0) {
        gameSpeed += 0.3;
      }
    }

    drawGame(ctx, w, h);

    if (gameRunning) {
      gameAnimFrame = requestAnimationFrame(gameLoop);
    }
  }

  function drawGame(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 1);
    ctx.lineTo(w, groundY + 1);
    ctx.stroke();

    ctx.strokeStyle = '#e0e0e0';
    ctx.setLineDash([4, 8]);
    for (let i = 0; i < 3; i++) {
      const y = groundY + 8 + i * 6;
      ctx.beginPath();
      for (let x = (-frameCount * gameSpeed + i * 20) % w - w; x < w + 20; x += 20) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + 10, y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    const px = 40;
    const py = playerY;
    const pw = 18;
    const ph = 26;

    ctx.fillStyle = '#333';
    ctx.fillRect(px, py - ph, pw, ph);

    ctx.fillStyle = '#fff';
    ctx.fillRect(px + 10, py - ph + 6, 6, 6);
    ctx.fillStyle = '#333';
    ctx.fillRect(px + 12, py - ph + 8, 3, 3);

    if (!isJumping && gameRunning) {
      const legPhase = Math.floor(frameCount / 6) % 2;
      ctx.fillStyle = '#333';
      if (legPhase === 0) {
        ctx.fillRect(px + 2, py, 5, 6);
        ctx.fillRect(px + 11, py, 5, 3);
      } else {
        ctx.fillRect(px + 2, py, 5, 3);
        ctx.fillRect(px + 11, py, 5, 6);
      }
    }

    for (let obs of obstacles) {
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(obs.x, groundY - obs.height, obs.width, obs.height);
      ctx.fillStyle = '#dc2626';
      const spikeW = obs.width / 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(obs.x + i * spikeW, groundY - obs.height);
        ctx.lineTo(obs.x + i * spikeW + spikeW / 2, groundY - obs.height - 5);
        ctx.lineTo(obs.x + (i + 1) * spikeW, groundY - obs.height);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#999';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE: ${Math.floor(gameScore / 10)}`, w - 10, 18);

    if (gameBestScore > 0) {
      ctx.fillText(`BEST: ${Math.floor(gameBestScore / 10)}`, w - 10, 32);
    }

    if (gameOver) {
      ctx.fillStyle = 'rgba(250, 250, 250, 0.8)';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#333';
      ctx.font = '600 18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', w / 2, h / 2 - 12);
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#666';
      ctx.fillText(`Score: ${Math.floor(gameScore / 10)}`, w / 2, h / 2 + 8);
      ctx.fillText('Click / Space to retry', w / 2, h / 2 + 28);
    }
  }

  function handleKeyDown(e) {
    if (e.code === 'Space' && currentStep === NUM_STEPS + 1 && gameStarted) {
      e.preventDefault();
      jump();
    }
  }

  onDestroy(() => {
    clearInterval(timerInterval);
    clearInterval(stepTimer);
    cancelAnimationFrame(gameAnimFrame);
    if (nextStepTimeout) clearTimeout(nextStepTimeout);
  });
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="gated-wrapper">
  <!-- 進行バー -->
  {#if currentStep > 0 && currentStep <= NUM_STEPS && !robotDetected}
    <div class="top-bar">
      <div class="progress-dots">
        {#each selectedComponents as _, i}
          <div
            class="dot"
            class:completed={i < completedCount}
            class:active={i === currentStep - 1 && !transitioning}
          ></div>
        {/each}
      </div>
      <div class="timer">{elapsedTime}</div>
    </div>
  {/if}

  <!-- イントロ画面 -->
  {#if currentStep === 0}
    <div class="intro">
      <div class="intro-icon">🤖</div>
      <h1 class="intro-title">私はロボットではありません</h1>
      <p class="intro-description">
        あなたが人間であることを証明するため、<br />
        {NUM_STEPS}つの認証をクリアしてください。
      </p>
      <div class="intro-rules">
        <div class="rule">
          <span class="rule-num">1</span>
          <span>ランダムに選ばれた認証に挑戦します</span>
        </div>
        <div class="rule">
          <span class="rule-num">2</span>
          <span>各認証をクリアして次へ進んでください</span>
        </div>
        <div class="rule">
          <span class="rule-num">3</span>
          <span>全認証クリアで隠しコンテンツが解放されます</span>
        </div>
      </div>
      <button class="begin-btn" on:click={begin}>認証を開始する</button>
    </div>
  {/if}

  <!-- チャレンジ画面 -->
  {#if currentStep >= 1 && currentStep <= NUM_STEPS && !robotDetected}
    <div class="challenge" class:transitioning>
      <div class="challenge-header">
        <span class="challenge-num">認証 {currentStep}/{NUM_STEPS}</span>
        <span class="challenge-title">{selectedComponents[currentStep - 1]?.name ?? ''}</span>
      </div>
      <p class="challenge-instruction">この認証を突破してください</p>

      <div class="component-area" bind:this={componentContainer}></div>

      <div class="challenge-footer">
        {#if canProceed}
          <button class="next-btn" on:click={nextStep}>
            {currentStep < NUM_STEPS ? '次の認証へ' : '結果を見る'}
          </button>
        {:else}
          <div class="step-progress">
            <div class="step-progress-bar" style="width: {Math.min(100, (stepElapsed / STEP_TIMEOUT) * 100)}%"></div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- ロボット判定（失敗画面） -->
  {#if robotDetected}
    <div class="robot-detected">
      <div class="robot-detected-inner">
        <div class="robot-icon">🤖</div>
        <h2 class="robot-title">ロボット判定</h2>
        <p class="robot-verdict">あなたはロボットです</p>
        <div class="robot-detail">
          <div class="robot-detail-row">
            <span class="robot-detail-label">判定理由</span>
            <span class="robot-detail-value">{timeoutMsg}</span>
          </div>
          <div class="robot-detail-row">
            <span class="robot-detail-label">失敗ステップ</span>
            <span class="robot-detail-value">認証 {failedAtStep}/{NUM_STEPS}</span>
          </div>
          <div class="robot-detail-row">
            <span class="robot-detail-label">経過時間</span>
            <span class="robot-detail-value">{elapsedTime}</span>
          </div>
        </div>
        <div class="robot-bar">
          <div class="robot-bar-fill"></div>
          <span class="robot-bar-label">ロボット確率: 99.7%</span>
        </div>
        <button class="retry-btn" on:click={restart}>もう一度挑戦する</button>
      </div>
    </div>
  {/if}

  <!-- ゲーム解放 -->
  {#if currentStep === NUM_STEPS + 1}
    <div class="game-unlocked">
      <div class="unlock-header">
        <div class="unlock-icon">🎉</div>
        <h2 class="unlock-title">人間認証完了！</h2>
        <p class="unlock-subtitle">あなたは（たぶん）人間です</p>
        <p class="unlock-time">クリアタイム: {elapsedTime}</p>
        <button class="retry-btn" on:click={restart}>もう一度挑戦する</button>
      </div>

      <div class="game-section">
        <div class="game-title-bar">
          <span>人間限定ミニゲーム</span>
        </div>
        {#if !gameStarted}
          <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
          <div class="game-start-overlay" on:click={initGame}>
            <div class="game-start-icon">🏃</div>
            <p class="game-start-text">クリック or スペースキーでジャンプ</p>
            <button class="game-start-btn">ゲーム開始</button>
          </div>
        {/if}
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <canvas
          class="game-canvas"
          bind:this={gameCanvas}
          on:click={jump}
          class:hidden={!gameStarted}
        ></canvas>
      </div>
    </div>
  {/if}
</div>

<style>
  .gated-wrapper {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    max-width: 520px;
    margin: 0 auto;
    color: var(--ar-color-text, #333);
  }

  /* トップバー */
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--ar-space-6, 12px) var(--ar-space-8, 16px);
    background: var(--ar-color-surface, #fff);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius-lg, 6px);
    margin-bottom: var(--ar-space-6, 12px);
  }

  .progress-dots {
    display: flex;
    gap: var(--ar-space-4, 8px);
  }

  .dot {
    width: var(--ar-space-5, 10px);
    height: var(--ar-space-5, 10px);
    border-radius: var(--ar-radius-full, 50%);
    background: var(--ar-color-border, #e0e0e0);
    transition: background 0.3s, transform 0.3s;
  }

  .dot.active {
    background: var(--ar-color-accent, #f59e0b);
    transform: scale(1.2);
  }

  .dot.completed {
    background: var(--ar-color-success, #1a6b2a);
  }

  .timer {
    font-family: var(--ar-font-mono, 'SF Mono', 'Fira Code', Menlo, Consolas, monospace);
    font-size: var(--ar-font-size-base, 13px);
    color: var(--ar-color-text-secondary, #666);
  }

  /* イントロ */
  .intro {
    text-align: center;
    padding: 48px var(--ar-space-12, 24px);
    background: var(--ar-color-surface, #fff);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius-xl, 8px);
  }

  .intro-icon {
    font-size: 48px;
    margin-bottom: var(--ar-space-8, 16px);
  }

  .intro-title {
    font-size: var(--ar-font-size-3xl, 22px);
    font-weight: var(--ar-font-weight-bold, 700);
    color: var(--ar-color-text-heading, #111);
    margin-bottom: var(--ar-space-6, 12px);
  }

  .intro-description {
    font-size: var(--ar-font-size-md, 14px);
    color: var(--ar-color-text-secondary, #666);
    line-height: 1.7;
    margin-bottom: 28px;
  }

  .intro-rules {
    text-align: left;
    max-width: 320px;
    margin: 0 auto 28px;
    display: flex;
    flex-direction: column;
    gap: var(--ar-space-6, 12px);
  }

  .rule {
    display: flex;
    align-items: center;
    gap: var(--ar-space-6, 12px);
    font-size: var(--ar-font-size-base, 13px);
    color: #444;
  }

  .rule-num {
    width: var(--ar-space-12, 24px);
    height: var(--ar-space-12, 24px);
    background: var(--ar-color-primary, #333);
    color: var(--ar-color-primary-text, #fff);
    border-radius: var(--ar-radius-full, 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--ar-font-size-base, 13px);
    font-weight: var(--ar-font-weight-semibold, 600);
    flex-shrink: 0;
  }

  .begin-btn {
    padding: var(--ar-space-6, 12px) var(--ar-space-16, 32px);
    background: var(--ar-color-primary, #333);
    color: var(--ar-color-primary-text, #fff);
    border: none;
    border-radius: var(--ar-radius-lg, 6px);
    font-size: var(--ar-font-size-lg, 15px);
    font-weight: var(--ar-font-weight-semibold, 600);
    cursor: pointer;
    transition: background 0.2s;
    font-family: inherit;
  }

  .begin-btn:hover {
    background: var(--ar-color-primary-hover, #1a1a1a);
  }

  /* チャレンジ */
  .challenge {
    background: var(--ar-color-surface, #fff);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius-xl, 8px);
    overflow: hidden;
    animation: fadeIn 0.3s ease-out;
  }

  .challenge.transitioning {
    opacity: 0.5;
    pointer-events: none;
    transition: opacity 0.3s;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .challenge-header {
    display: flex;
    align-items: center;
    gap: var(--ar-space-5, 10px);
    padding: var(--ar-space-7, 14px) 18px;
    border-bottom: 1px solid var(--ar-color-border, #e0e0e0);
    background: var(--ar-color-bg, #fafafa);
  }

  .challenge-num {
    font-size: var(--ar-font-size-base, 13px);
    font-weight: var(--ar-font-weight-bold, 700);
    color: var(--ar-color-primary-text, #fff);
    background: var(--ar-color-primary, #333);
    padding: 3px var(--ar-space-4, 8px);
    border-radius: var(--ar-radius-sm, 3px);
    white-space: nowrap;
  }

  .challenge-title {
    font-size: var(--ar-font-size-md, 14px);
    font-weight: var(--ar-font-weight-semibold, 600);
    color: var(--ar-color-text-heading, #111);
  }

  .challenge-instruction {
    padding: var(--ar-space-5, 10px) 18px;
    font-size: var(--ar-font-size-base, 13px);
    color: #888;
    border-bottom: 1px solid var(--ar-color-surface-hover, #f0f0f0);
  }

  .component-area {
    padding: var(--ar-space-8, 16px);
    min-height: 200px;
  }

  .challenge-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--ar-space-6, 12px) 18px;
    border-top: 1px solid var(--ar-color-border, #e0e0e0);
    background: var(--ar-color-bg, #fafafa);
    gap: var(--ar-space-6, 12px);
  }

  .next-btn {
    padding: var(--ar-space-4, 8px) var(--ar-space-10, 20px);
    background: var(--ar-color-primary, #333);
    color: var(--ar-color-primary-text, #fff);
    border: none;
    border-radius: var(--ar-radius, 4px);
    font-size: var(--ar-font-size-base, 13px);
    font-weight: var(--ar-font-weight-semibold, 600);
    cursor: pointer;
    transition: background 0.2s;
    font-family: inherit;
    white-space: nowrap;
    animation: fadeIn 0.3s ease-out;
    flex-shrink: 0;
  }

  .next-btn:hover {
    background: var(--ar-color-primary-hover, #1a1a1a);
  }

  .step-progress {
    width: 100%;
    height: var(--ar-space-2, 4px);
    background: var(--ar-color-border, #e0e0e0);
    border-radius: 2px;
    overflow: hidden;
  }

  .step-progress-bar {
    height: 100%;
    background: var(--ar-color-accent, #f59e0b);
    border-radius: 2px;
    transition: width 0.15s linear;
  }

  /* ロボット判定（失敗画面） */
  .robot-detected {
    animation: fadeIn 0.5s ease-out;
  }

  .robot-detected-inner {
    text-align: center;
    padding: 36px var(--ar-space-12, 24px);
    background: var(--ar-color-surface, #fff);
    border: 2px solid var(--ar-color-error, #b91c1c);
    border-radius: var(--ar-radius-xl, 8px);
  }

  .robot-icon {
    font-size: 56px;
    margin-bottom: var(--ar-space-6, 12px);
    animation: robotShake 0.5s ease-out;
  }

  @keyframes robotShake {
    0%, 100% { transform: rotate(0deg); }
    20% { transform: rotate(-10deg); }
    40% { transform: rotate(10deg); }
    60% { transform: rotate(-6deg); }
    80% { transform: rotate(6deg); }
  }

  .robot-title {
    font-size: var(--ar-font-size-3xl, 22px);
    font-weight: var(--ar-font-weight-bold, 700);
    color: var(--ar-color-error, #b91c1c);
    margin-bottom: var(--ar-space-2, 4px);
  }

  .robot-verdict {
    font-size: var(--ar-font-size-lg, 15px);
    color: var(--ar-color-error-accent, #dc2626);
    font-weight: var(--ar-font-weight-semibold, 600);
    margin-bottom: var(--ar-space-10, 20px);
  }

  .robot-detail {
    background: var(--ar-color-error-bg, #fef2f2);
    border: 1px solid var(--ar-color-error-border, #fecaca);
    border-radius: var(--ar-radius-lg, 6px);
    padding: var(--ar-space-7, 14px) 18px;
    margin-bottom: var(--ar-space-10, 20px);
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: var(--ar-space-4, 8px);
  }

  .robot-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--ar-font-size-base, 13px);
  }

  .robot-detail-label {
    color: var(--ar-color-error-hover, #991b1b);
    font-weight: var(--ar-font-weight-semibold, 600);
  }

  .robot-detail-value {
    color: var(--ar-color-error, #b91c1c);
    font-family: var(--ar-font-mono, 'SF Mono', 'Fira Code', Menlo, Consolas, monospace);
    font-size: var(--ar-font-size-base, 13px);
  }

  .robot-bar {
    position: relative;
    width: 100%;
    height: var(--ar-space-12, 24px);
    background: #fee2e2;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: var(--ar-space-12, 24px);
  }

  .robot-bar-fill {
    width: 99.7%;
    height: 100%;
    background: linear-gradient(90deg, var(--ar-color-error-accent, #dc2626), var(--ar-color-error, #b91c1c));
    border-radius: 12px;
    animation: barFill 1s ease-out;
  }

  @keyframes barFill {
    from { width: 0%; }
    to { width: 99.7%; }
  }

  .robot-bar-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: var(--ar-font-size-sm, 11px);
    font-weight: var(--ar-font-weight-bold, 700);
    color: var(--ar-color-primary-text, #fff);
  }

  /* ゲーム解放 */
  .game-unlocked {
    animation: fadeIn 0.5s ease-out;
  }

  .unlock-header {
    text-align: center;
    padding: var(--ar-space-16, 32px) var(--ar-space-12, 24px);
    background: var(--ar-color-surface, #fff);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius-xl, 8px);
    margin-bottom: var(--ar-space-8, 16px);
  }

  .unlock-icon {
    font-size: 48px;
    margin-bottom: var(--ar-space-6, 12px);
  }

  .unlock-title {
    font-size: var(--ar-font-size-2xl, 20px);
    font-weight: var(--ar-font-weight-bold, 700);
    color: var(--ar-color-text-heading, #111);
    margin-bottom: var(--ar-space-2, 4px);
  }

  .unlock-subtitle {
    font-size: var(--ar-font-size-base, 13px);
    color: var(--ar-color-text-muted, #999);
    margin-bottom: var(--ar-space-4, 8px);
  }

  .unlock-time {
    font-family: var(--ar-font-mono, 'SF Mono', 'Fira Code', Menlo, Consolas, monospace);
    font-size: var(--ar-font-size-md, 14px);
    color: var(--ar-color-success, #1a6b2a);
    font-weight: var(--ar-font-weight-semibold, 600);
    margin-bottom: var(--ar-space-8, 16px);
  }

  .retry-btn {
    padding: var(--ar-space-4, 8px) var(--ar-space-10, 20px);
    background: var(--ar-color-surface, #fff);
    color: var(--ar-color-text, #333);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius, 4px);
    font-size: var(--ar-font-size-base, 13px);
    font-weight: var(--ar-font-weight-medium, 500);
    cursor: pointer;
    transition: border-color 0.2s;
    font-family: inherit;
  }

  .retry-btn:hover {
    border-color: var(--ar-color-text-muted, #999);
  }

  .game-section {
    background: var(--ar-color-surface, #fff);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius-xl, 8px);
    overflow: hidden;
  }

  .game-title-bar {
    padding: var(--ar-space-5, 10px) var(--ar-space-8, 16px);
    background: var(--ar-color-primary, #333);
    color: var(--ar-color-primary-text, #fff);
    font-size: var(--ar-font-size-base, 13px);
    font-weight: var(--ar-font-weight-semibold, 600);
  }

  .game-start-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px var(--ar-space-10, 20px);
    gap: var(--ar-space-6, 12px);
    cursor: pointer;
  }

  .game-start-icon {
    font-size: 36px;
  }

  .game-start-text {
    font-size: var(--ar-font-size-base, 13px);
    color: var(--ar-color-text-secondary, #666);
  }

  .game-start-btn {
    padding: var(--ar-space-5, 10px) var(--ar-space-12, 24px);
    background: var(--ar-color-primary, #333);
    color: var(--ar-color-primary-text, #fff);
    border: none;
    border-radius: var(--ar-radius, 4px);
    font-size: var(--ar-font-size-md, 14px);
    font-weight: var(--ar-font-weight-semibold, 600);
    cursor: pointer;
    font-family: inherit;
  }

  .game-start-btn:hover {
    background: var(--ar-color-primary-hover, #1a1a1a);
  }

  .game-canvas {
    display: block;
    width: 100%;
    height: 200px;
    background: var(--ar-color-bg, #fafafa);
    cursor: pointer;
  }

  .game-canvas.hidden {
    display: none;
  }
</style>
