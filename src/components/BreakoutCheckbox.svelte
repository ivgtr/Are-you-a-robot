<svelte:options customElement="breakout-checkbox" />

<script>
  import { onMount, onDestroy } from 'svelte';

  let canvasRef;
  let animationId;
  let attempts = 0;
  let message = '';
  let showMessage = false;
  let gameStarted = false;

  const COLS = 8;
  const ROWS = 4;
  const BLOCK_W = 42;
  const BLOCK_H = 14;
  const BLOCK_PAD = 3;
  const BALL_R = 5;
  const PADDLE_W = 60;
  const PADDLE_H = 8;

  let blocks = [];
  let ballX, ballY, ballDX, ballDY;
  let paddleX;
  let canvasW = 350;
  let canvasH = 260;
  let checkboxRevealed = false;

  function initBlocks() {
    blocks = [];
    const offsetX = (canvasW - (COLS * (BLOCK_W + BLOCK_PAD))) / 2;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        blocks.push({
          x: offsetX + c * (BLOCK_W + BLOCK_PAD),
          y: 30 + r * (BLOCK_H + BLOCK_PAD),
          alive: true,
        });
      }
    }
  }

  function resetBall() {
    ballX = canvasW / 2;
    ballY = canvasH - 40;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
    ballDX = Math.cos(angle) * 3;
    ballDY = Math.sin(angle) * 3;
  }

  function startGame() {
    gameStarted = true;
    initBlocks();
    resetBall();
    paddleX = canvasW / 2 - PADDLE_W / 2;
    checkboxRevealed = false;
    loop();
  }

  function handleMouseMove(e) {
    if (!canvasRef || !gameStarted) return;
    const rect = canvasRef.getBoundingClientRect();
    paddleX = Math.max(0, Math.min(canvasW - PADDLE_W, e.clientX - rect.left - PADDLE_W / 2));
  }

  function handleTouchMove(e) {
    e.preventDefault();
    if (!canvasRef || !gameStarted) return;
    const rect = canvasRef.getBoundingClientRect();
    const touch = e.touches[0];
    paddleX = Math.max(0, Math.min(canvasW - PADDLE_W, touch.clientX - rect.left - PADDLE_W / 2));
  }

  function loop() {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');

    // Move ball
    ballX += ballDX;
    ballY += ballDY;

    // Wall collision
    if (ballX <= BALL_R || ballX >= canvasW - BALL_R) ballDX = -ballDX;
    if (ballY <= BALL_R) ballDY = -ballDY;

    // Paddle collision
    if (
      ballY >= canvasH - 30 - BALL_R &&
      ballY <= canvasH - 30 + PADDLE_H &&
      ballX >= paddleX &&
      ballX <= paddleX + PADDLE_W
    ) {
      ballDY = -Math.abs(ballDY);
      const hitPos = (ballX - paddleX) / PADDLE_W;
      ballDX = (hitPos - 0.5) * 5;
    }

    // Ball out
    if (ballY > canvasH) {
      resetBall();
    }

    // Block collision
    for (let b of blocks) {
      if (!b.alive) continue;
      if (
        ballX + BALL_R > b.x &&
        ballX - BALL_R < b.x + BLOCK_W &&
        ballY + BALL_R > b.y &&
        ballY - BALL_R < b.y + BLOCK_H
      ) {
        b.alive = false;
        ballDY = -ballDY;
        break;
      }
    }

    // Check if all blocks destroyed
    const allDestroyed = blocks.every(b => !b.alive);
    if (allDestroyed && !checkboxRevealed) {
      checkboxRevealed = true;
      attempts++;

      // ブロックを全部壊してもすぐにリセット
      setTimeout(() => {
        const msgs = [
          '認証ブロックが再生成されました',
          'セキュリティ層が追加されました',
          'もう1ラウンド必要です',
          'ブロック強度が上がりました',
          '追加検証が必要です',
        ];
        message = msgs[attempts % msgs.length];
        showMessage = true;
        setTimeout(() => { showMessage = false; }, 2000);
        checkboxRevealed = false;
        initBlocks();
        resetBall();
      }, 1500);
    }

    // Draw
    ctx.clearRect(0, 0, canvasW, canvasH);

    // Draw blocks
    for (let b of blocks) {
      if (!b.alive) continue;
      ctx.fillStyle = '#555';
      ctx.fillRect(b.x, b.y, BLOCK_W, BLOCK_H);
      ctx.strokeStyle = '#777';
      ctx.strokeRect(b.x, b.y, BLOCK_W, BLOCK_H);
    }

    // Draw checkbox area (behind blocks)
    if (checkboxRevealed) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(canvasW / 2 - 70, 50, 140, 30);
      ctx.strokeStyle = '#d0d0d0';
      ctx.strokeRect(canvasW / 2 - 70, 50, 140, 30);
      ctx.fillStyle = '#333';
      ctx.font = '12px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ 私はロボットではありません', canvasW / 2, 70);
    } else {
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔒 ブロックの奥に認証が隠れています', canvasW / 2, 22);
    }

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();

    // Draw paddle
    ctx.fillStyle = '#333';
    ctx.fillRect(paddleX, canvasH - 30, PADDLE_W, PADDLE_H);

    animationId = requestAnimationFrame(loop);
  }

  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
  });
</script>

<div class="container">
  {#if !gameStarted}
    <div class="start-screen" on:click={startGame}>
      <div class="start-icon">🧱</div>
      <div class="start-text">ブロックを壊して認証を解放せよ</div>
      <button class="start-btn">ゲーム開始</button>
    </div>
  {:else}
    <canvas
      bind:this={canvasRef}
      width={canvasW}
      height={canvasH}
      on:mousemove={handleMouseMove}
      on:touchmove|preventDefault={handleTouchMove}
    ></canvas>
  {/if}

  {#if showMessage}
    <div class="message">{message}</div>
  {/if}

  {#if attempts > 0}
    <div class="attempts">クリア回数: {attempts} (認証: 未完了)</div>
  {/if}
</div>

<style>
  .container {
    position: relative;
    width: 100%;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fafafa;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100%;
    cursor: none;
    background: #fafafa;
  }

  .start-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 260px;
    cursor: pointer;
    gap: 12px;
  }

  .start-icon {
    font-size: 36px;
  }

  .start-text {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    color: #666;
  }

  .start-btn {
    padding: 8px 20px;
    background: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    cursor: pointer;
  }

  .start-btn:hover {
    background: #1a1a1a;
  }

  .message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #c0392b;
    background: rgba(255, 255, 255, 0.95);
    padding: 8px 16px;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
    animation: fadeInOut 2s ease-out forwards;
    pointer-events: none;
    white-space: nowrap;
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    75% { opacity: 1; }
    100% { opacity: 0; }
  }

  .attempts {
    position: absolute;
    bottom: 8px;
    right: 10px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #999;
  }
</style>
