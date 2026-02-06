<svelte:options customElement="infinite-loading-checkbox" />

<script>
  import { onDestroy } from 'svelte';

  let clicked = false;
  let dots = '';
  let progress = 0;
  let statusIndex = 0;
  let showAlmostDone = false;
  let completed = false;
  let clickCount = 0;
  let gameOver = false;
  let timeLeft = 0;

  // 99%到達後、プログレスバーを10回クリックすると100%に押し上げられる
  const CLICKS_TO_COMPLETE = 10;
  // 99%到達後の制限時間（秒）
  const TIME_LIMIT = 8;

  let dotsInterval;
  let progressInterval;
  let statusInterval;
  let almostDoneTimeout;
  let countdownInterval;
  let reached99 = false;

  const statusMessages = [
    '検証中',
    'サーバーに接続中',
    'ニューラルネットワーク分析中',
    '生体情報をスキャン中',
    '量子認証プロセス開始',
    'ブロックチェーンで本人確認中',
    'AIが人間性を評価中',
    '宇宙線ノイズを除去中',
    'タイムスタンプを検証中',
    '存在証明を計算中',
  ];

  $: currentStatus = statusMessages[statusIndex % statusMessages.length];

  function startCountdown() {
    if (reached99) return;
    reached99 = true;
    timeLeft = TIME_LIMIT;
    countdownInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        if (!completed) {
          gameOver = true;
          clearInterval(dotsInterval);
          clearInterval(progressInterval);
          clearInterval(statusInterval);
          clearTimeout(almostDoneTimeout);
        }
      }
    }, 1000);
  }

  function handleClick() {
    if (completed || gameOver) return;
    if (!clicked) {
      clicked = true;
      startLoading();
      return;
    }

    // 99%に到達している場合、クリックで少しずつ押し上げる
    if (progress >= 98.5) {
      if (!reached99) startCountdown();
      clickCount++;
      progress = Math.min(99 + (clickCount / CLICKS_TO_COMPLETE), 100);
      if (clickCount >= CLICKS_TO_COMPLETE) {
        completed = true;
        progress = 100;
        clearInterval(dotsInterval);
        clearInterval(progressInterval);
        clearInterval(statusInterval);
        clearTimeout(almostDoneTimeout);
        clearInterval(countdownInterval);
      }
    }
  }

  function startLoading() {
    dotsInterval = setInterval(() => {
      dots = dots.length >= 3 ? '' : dots + '.';
    }, 500);

    progressInterval = setInterval(() => {
      if (progress < 99) {
        const remaining = 99 - progress;
        const increment = Math.max(0.1, remaining * 0.05);
        progress = Math.min(99, progress + increment);
      }
    }, 200);

    statusInterval = setInterval(() => {
      statusIndex++;
    }, 4000);

    almostDoneTimeout = setTimeout(() => {
      showAlmostDone = true;
    }, 30000);
  }

  onDestroy(() => {
    if (dotsInterval) clearInterval(dotsInterval);
    if (progressInterval) clearInterval(progressInterval);
    if (statusInterval) clearInterval(statusInterval);
    if (almostDoneTimeout) clearTimeout(almostDoneTimeout);
    if (countdownInterval) clearInterval(countdownInterval);
  });
</script>

<div class="container">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="checkbox-wrapper" class:loading={clicked} on:click={handleClick}>
    {#if !clicked}
      <input type="checkbox" id="loading-check" />
      <label for="loading-check">私はロボットではありません</label>
    {:else if gameOver}
      <input type="checkbox" id="loading-check" disabled />
      <label for="loading-check">時間切れ。ゲームオーバー</label>
    {:else if completed}
      <input type="checkbox" id="loading-check" checked />
      <label for="loading-check">認証完了！手動で押し切りました</label>
    {:else}
      <div class="loading-content">
        <div class="spinner-row">
          <div class="spinner"></div>
          <span class="loading-text">{currentStatus}{dots}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: {progress.toFixed(1)}%;"></div>
        </div>
        <div class="progress-info">
          <span class="progress-percent">{progress.toFixed(1)}%</span>
          {#if showAlmostDone && progress < 98.5}
            <span class="progress-hint">もうすぐ完了します...</span>
          {:else if progress >= 98.5 && !completed && !gameOver}
            <span class="progress-hint">クリックで押し上げろ！({clickCount}/{CLICKS_TO_COMPLETE}) 残り{reached99 ? timeLeft : '--'}秒</span>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    padding: var(--ar-container-padding, 16px);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius-lg, 6px);
    background: var(--ar-color-bg, #fafafa);
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: var(--ar-checkbox-wrapper-gap, 8px);
    padding: var(--ar-checkbox-wrapper-padding, 10px 14px);
    background: var(--ar-color-surface, #fff);
    border: 1px solid var(--ar-color-border-dark, #d0d0d0);
    border-radius: var(--ar-radius, 4px);
    width: fit-content;
    cursor: pointer;
    min-width: 300px;
  }

  .checkbox-wrapper.loading {
    cursor: pointer;
    width: 100%;
  }

  input[type="checkbox"] {
    width: var(--ar-checkbox-size, 18px);
    height: var(--ar-checkbox-size, 18px);
    cursor: pointer;
    accent-color: var(--ar-checkbox-accent, #333);
  }

  label {
    cursor: pointer;
    user-select: none;
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-base, 13px);
    color: var(--ar-color-text, #333);
  }

  .loading-content {
    width: 100%;
  }

  .spinner-row {
    display: flex;
    align-items: center;
    gap: var(--ar-checkbox-wrapper-gap, 8px);
    margin-bottom: var(--ar-space-5, 10px);
  }

  .spinner {
    width: var(--ar-checkbox-size, 18px);
    height: var(--ar-checkbox-size, 18px);
    border: 2px solid var(--ar-color-border, #e0e0e0);
    border-top: 2px solid var(--ar-color-text-secondary, #555);
    border-radius: var(--ar-radius-full, 50%);
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-text {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-base, 13px);
    color: var(--ar-color-text-secondary, #666);
  }

  .progress-track {
    width: 100%;
    height: 4px;
    background: var(--ar-color-border, #e0e0e0);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--ar-color-text-secondary, #555);
    border-radius: 2px;
    transition: width 0.2s linear;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--ar-space-3, 6px);
  }

  .progress-percent {
    font-family: var(--ar-font-mono, 'SF Mono', 'Fira Code', Menlo, Consolas, monospace);
    font-size: var(--ar-font-size-sm, 11px);
    color: var(--ar-color-text-muted, #999);
  }

  .progress-hint {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-sm, 11px);
    color: var(--ar-color-success, #1a6b2a);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
