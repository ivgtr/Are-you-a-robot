<svelte:options customElement="breakout-checkbox" />

<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import AttemptsCounter from '../internal/AttemptsCounter.svelte';

  const dispatch = createEventDispatcher();
  let canvasRef;
  let animationId;
  let attempts = 0;
  let message = '';
  let showMessage = false;
  let gameStarted = false;
  let cleared = false;
  let gameOver = false;

  const COLS = 8;
  const ROWS = 4;
  const BALL_R = 5;
  const PADDLE_H = 8;
  const BLOCK_H = 14;

  let canvasW = 350;
  let canvasH = 260;
  let paddleW = 60;

  let blocks = [];
  let ballX = 0, ballY = 0, ballDX = 0, ballDY = 0;
  let paddleX = 0;
  let checkboxRevealed = false;
  let resetTimeout = null;

  function initBlocks() {
    blocks = [];
    const pad = 3;
    const bw = (canvasW - 20) / COLS - pad;
    const offsetX = (canvasW - COLS * (bw + pad)) / 2;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        blocks.push({
          x: offsetX + c * (bw + pad),
          y: 30 + r * (BLOCK_H + pad),
          w: bw,
          alive: true,
        });
      }
    }
  }

  function resetBall() {
    ballX = canvasW / 2;
    ballY = canvasH - 50;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    const speed = 2.5;
    ballDX = Math.cos(angle) * speed;
    ballDY = Math.sin(angle) * speed;
  }

  function setupCanvas() {
    if (!canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvasW = Math.floor(rect.width);
      canvasH = Math.floor(rect.height);
    }
    canvasRef.width = canvasW;
    canvasRef.height = canvasH;
    paddleW = Math.max(50, canvasW * 0.17);
  }

  function startGame() {
    gameStarted = true;
    setupCanvas();
    initBlocks();
    resetBall();
    paddleX = canvasW / 2 - paddleW / 2;
    checkboxRevealed = false;
    if (animationId) cancelAnimationFrame(animationId);
    loop();
  }

  function getCanvasX(clientX) {
    if (!canvasRef) return 0;
    const rect = canvasRef.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return ((clientX - rect.left) / rect.width) * canvasW;
  }

  function handleMouseMove(e) {
    if (!canvasRef || !gameStarted) return;
    const cx = getCanvasX(e.clientX);
    paddleX = Math.max(0, Math.min(canvasW - paddleW, cx - paddleW / 2));
  }

  function handleTouchMove(e) {
    e.preventDefault();
    if (!canvasRef || !gameStarted) return;
    if (!e.touches[0]) return;
    const cx = getCanvasX(e.touches[0].clientX);
    paddleX = Math.max(0, Math.min(canvasW - paddleW, cx - paddleW / 2));
  }

  function handleCanvasClick(e) {
    if (!checkboxRevealed || cleared) return;
    // チェックボックスエリアをクリックしたかチェック
    const cx = getCanvasX(e.clientX);
    const rect = canvasRef.getBoundingClientRect();
    const cy = ((e.clientY - rect.top) / rect.height) * canvasH;
    const cbW = Math.min(180, canvasW - 40);
    const cbH = 34;
    const cbX = canvasW / 2 - cbW / 2;
    const cbY = 45;
    if (cx >= cbX && cx <= cbX + cbW && cy >= cbY && cy <= cbY + cbH) {
      cleared = true;
      clearTimeout(resetTimeout);
      cancelAnimationFrame(animationId);
      message = '認証ブロック突破！認証成功';
      showMessage = true;
    }
  }

  function loop() {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    // ボール移動
    ballX += ballDX;
    ballY += ballDY;

    // 壁との衝突
    if (ballX <= BALL_R) { ballX = BALL_R; ballDX = Math.abs(ballDX); }
    if (ballX >= canvasW - BALL_R) { ballX = canvasW - BALL_R; ballDX = -Math.abs(ballDX); }
    if (ballY <= BALL_R) { ballY = BALL_R; ballDY = Math.abs(ballDY); }

    // パドルとの衝突
    const paddleTop = canvasH - 30;
    if (
      ballDY > 0 &&
      ballY + BALL_R >= paddleTop &&
      ballY + BALL_R <= paddleTop + PADDLE_H + 4 &&
      ballX >= paddleX &&
      ballX <= paddleX + paddleW
    ) {
      ballDY = -Math.abs(ballDY);
      const hitPos = (ballX - paddleX) / paddleW - 0.5;
      ballDX = hitPos * 4;
      // Prevent pure vertical bounce
      if (Math.abs(ballDX) < 0.5) {
          ballDX = ballDX >= 0 ? 0.5 : -0.5;
      }
      ballY = paddleTop - BALL_R;
    }

    // ボール落下
    if (ballY > canvasH + 10) {
      resetBall();
    }

    // ブロックとの衝突
    for (let b of blocks) {
      if (!b.alive) continue;
      if (
        ballX + BALL_R > b.x &&
        ballX - BALL_R < b.x + b.w &&
        ballY + BALL_R > b.y &&
        ballY - BALL_R < b.y + BLOCK_H
      ) {
        b.alive = false;
        // Determine collision side
        const overlapLeft = (ballX + BALL_R) - b.x;
        const overlapRight = (b.x + b.w) - (ballX - BALL_R);
        const overlapTop = (ballY + BALL_R) - b.y;
        const overlapBottom = (b.y + BLOCK_H) - (ballY - BALL_R);
        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);
        if (minOverlapX < minOverlapY) {
            ballDX = -ballDX;
        } else {
            ballDY = -ballDY;
        }
        break;
      }
    }

    // 全ブロック破壊チェック
    const allDestroyed = blocks.every(b => !b.alive);
    if (allDestroyed && !checkboxRevealed && !cleared) {
      checkboxRevealed = true;
      attempts++;

      resetTimeout = setTimeout(() => {
        if (cleared) return;
        // チャンスを逃した → ゲームオーバー
        gameOver = true;
        cancelAnimationFrame(animationId);
        message = 'チェックボックスを逃しました。ゲームオーバー';
        showMessage = true;
        dispatch('gameover');
      }, 1500);
    }

    // 描画
    ctx.clearRect(0, 0, canvasW, canvasH);

    // ブロック描画
    const colors = ['#555', '#666', '#777', '#888'];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (!b.alive) continue;
      const row = Math.floor(i / COLS);
      ctx.fillStyle = colors[row % colors.length];
      ctx.fillRect(b.x, b.y, b.w, BLOCK_H);
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(b.x, b.y, b.w, BLOCK_H);
    }

    // チェックボックスエリア
    if (checkboxRevealed) {
      const cbW = Math.min(180, canvasW - 40);
      const cbH = 34;
      const cbX = canvasW / 2 - cbW / 2;
      const cbY = 45;
      ctx.fillStyle = '#fff';
      ctx.fillRect(cbX, cbY, cbW, cbH);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cbX, cbY, cbW, cbH);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cbX + 10, cbY + 9, 16, 16);
      ctx.fillStyle = '#333';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('私はロボットではありません', cbX + 32, cbY + 22);
    } else {
      ctx.fillStyle = '#bbb';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ブロックの奥に認証が隠れています', canvasW / 2, 22);
    }

    // ボール描画
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();

    // パドル描画
    ctx.fillStyle = '#333';
    ctx.beginPath();
    const r = 4;
    ctx.moveTo(paddleX + r, paddleTop);
    ctx.lineTo(paddleX + paddleW - r, paddleTop);
    ctx.arcTo(paddleX + paddleW, paddleTop, paddleX + paddleW, paddleTop + r, r);
    ctx.lineTo(paddleX + paddleW, paddleTop + PADDLE_H - r);
    ctx.arcTo(paddleX + paddleW, paddleTop + PADDLE_H, paddleX + paddleW - r, paddleTop + PADDLE_H, r);
    ctx.lineTo(paddleX + r, paddleTop + PADDLE_H);
    ctx.arcTo(paddleX, paddleTop + PADDLE_H, paddleX, paddleTop + PADDLE_H - r, r);
    ctx.lineTo(paddleX, paddleTop + r);
    ctx.arcTo(paddleX, paddleTop, paddleX + r, paddleTop, r);
    ctx.fill();

    animationId = requestAnimationFrame(loop);
  }

  onMount(() => {
    // 初期描画（開始前の状態）
    if (canvasRef) {
      setupCanvas();
      const ctx = canvasRef.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#bbb';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ブロックの奥に認証が隠れています', canvasW / 2, canvasH / 2);
      }
    }
  });

  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
    if (resetTimeout) clearTimeout(resetTimeout);
  });
</script>

<div class="container">
  <div class="canvas-wrapper">
    <canvas
      bind:this={canvasRef}
      width={canvasW}
      height={canvasH}
      on:mousemove={handleMouseMove}
      on:touchmove|preventDefault={handleTouchMove}
      on:click={handleCanvasClick}
    ></canvas>

    {#if !gameStarted}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <div class="start-overlay" on:click={startGame}>
        <div class="start-icon">🧱</div>
        <div class="start-text">ブロックを壊して認証を解放せよ</div>
        <button class="start-btn">ゲーム開始</button>
      </div>
    {/if}
  </div>

  {#if cleared}
    <input type="checkbox" checked style="position: absolute; bottom: 4px; left: 10px;" />
  {/if}

  {#if showMessage}
    <div class="message" class:success={cleared}>{message}</div>
  {/if}

  {#if attempts > 0}
    <div class="attempts-position"><AttemptsCounter label="クリア回数: {attempts} (認証: {cleared ? '完了！' : '未完了'})" variant="inline" /></div>
  {/if}
</div>

<style>
  .container {
    position: relative;
    width: 100%;
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius-lg, 6px);
    background: var(--ar-color-bg, #fafafa);
    overflow: hidden;
  }

  .canvas-wrapper {
    position: relative;
    width: 100%;
    height: 260px;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    background: var(--ar-color-bg, #fafafa);
  }

  .start-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(250, 250, 250, 0.95);
    cursor: pointer;
    gap: var(--ar-space-6, 12px);
    z-index: 5;
  }

  .start-icon {
    font-size: 36px;
  }

  .start-text {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-base, 13px);
    color: var(--ar-color-text-secondary, #666);
  }

  .start-btn {
    padding: var(--ar-btn-padding, 8px 20px);
    background: var(--ar-color-primary, #333);
    color: var(--ar-color-primary-text, #fff);
    border: none;
    border-radius: var(--ar-radius, 4px);
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-base, 13px);
    cursor: pointer;
  }

  .start-btn:hover {
    background: var(--ar-color-primary-hover, #1a1a1a);
  }

  .message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-base, 13px);
    font-weight: var(--ar-font-weight-semibold, 600);
    color: var(--ar-color-error, #b91c1c);
    background: rgba(255, 255, 255, 0.95);
    padding: var(--ar-space-4, 8px) var(--ar-space-8, 16px);
    border-radius: var(--ar-radius, 4px);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    animation: fadeInOut 2s ease-out forwards;
    pointer-events: none;
    white-space: nowrap;
    z-index: 10;
  }

  .message.success {
    color: var(--ar-color-success, #1a6b2a);
    border-color: var(--ar-color-success-border, #d4e8d4);
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    75% { opacity: 1; }
    100% { opacity: 0; }
  }

  .attempts-position {
    position: absolute;
    bottom: var(--ar-space-4, 8px);
    right: var(--ar-space-5, 10px);
  }
</style>
