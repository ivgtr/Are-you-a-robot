<svelte:options customElement="infinite-loading-checkbox" />

<script>
  import { onDestroy } from 'svelte';

  let clicked = false;
  let dots = '';
  let progress = 0;
  let statusIndex = 0;
  let showAlmostDone = false;

  let dotsInterval;
  let progressInterval;
  let statusInterval;
  let almostDoneTimeout;

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

  function handleClick() {
    if (!clicked) {
      clicked = true;
      startLoading();
    }
  }

  function startLoading() {
    // ドットアニメーション
    dotsInterval = setInterval(() => {
      dots = dots.length >= 3 ? '' : dots + '.';
    }, 500);

    // 偽の進捗バー: 99%で止まる
    progressInterval = setInterval(() => {
      if (progress < 99) {
        // 最初は速く、後半は極端に遅くなる
        const remaining = 99 - progress;
        const increment = Math.max(0.1, remaining * 0.05);
        progress = Math.min(99, progress + increment);
      }
    }, 200);

    // ステータスメッセージの切替
    statusInterval = setInterval(() => {
      statusIndex++;
    }, 4000);

    // 30秒後に「もうすぐ完了」を表示（嘘）
    almostDoneTimeout = setTimeout(() => {
      showAlmostDone = true;
    }, 30000);
  }

  onDestroy(() => {
    if (dotsInterval) clearInterval(dotsInterval);
    if (progressInterval) clearInterval(progressInterval);
    if (statusInterval) clearInterval(statusInterval);
    if (almostDoneTimeout) clearTimeout(almostDoneTimeout);
  });
</script>

<div class="container">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="checkbox-wrapper" class:loading={clicked} on:click={handleClick}>
    {#if !clicked}
      <input type="checkbox" id="loading-check" />
      <label for="loading-check">私はロボットではありません</label>
    {:else}
      <div class="loading-content">
        <div class="spinner-row">
          <div class="spinner"></div>
          <span class="loading-text">{currentStatus}{dots}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: {progress.toFixed(1)}%;"></div>
        </div>
        <div class="progress-info">
          <span class="progress-percent">{progress.toFixed(1)}%</span>
          {#if showAlmostDone}
            <span class="almost-done">もうすぐ完了します...</span>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fafafa;
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #fff;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    width: fit-content;
    cursor: pointer;
    min-width: 300px;
  }

  .checkbox-wrapper.loading {
    cursor: wait;
    width: 100%;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #333;
  }

  label {
    cursor: pointer;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    color: #333;
  }

  .loading-content {
    width: 100%;
  }

  .spinner-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #e0e0e0;
    border-top: 2px solid #555;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-text {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    color: #666;
  }

  .progress-bar-container {
    width: 100%;
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: #555;
    border-radius: 2px;
    transition: width 0.2s linear;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 6px;
  }

  .progress-percent {
    font-family: 'SF Mono', 'Fira Code', Menlo, Consolas, monospace;
    font-size: 11px;
    color: #999;
  }

  .almost-done {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #1a6b2a;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
