<svelte:options customElement="tiny-checkbox" />

<script>
  import { onDestroy } from 'svelte';

  let attempts = 0;
  let currentScale = 1;
  let checked = false;
  let successMessage = '';
  let cleared = false;
  let gameOver = false;
  let messageTimeout = null;

  const scales = [1, 0.5, 0.25, 0.1, 0.05, 0.02];

  $: scaleIndex = Math.min(attempts, scales.length - 1);
  $: currentScale = scales[scaleIndex];

  function handleClick() {
    if (cleared || gameOver) return;
    attempts++;

    if (checked) {
      // 最小サイズ(2%)でチェック成功 = クリア
      if (currentScale <= 0.02) {
        cleared = true;
        successMessage = '信じられない...この精度は人間にしかできない。認証成功！';
        return;
      }

      // それ以外のサイズではチャンスが減る（そのまま次へ）
      successMessage = 'すごい！...でもまだ小さくなります';
      checked = false;

      if (messageTimeout) clearTimeout(messageTimeout);
      messageTimeout = setTimeout(() => {
        successMessage = '';
      }, 2000);
    } else {
      // チェックせずにクリック（最小サイズ時のみゲームオーバー）
      if (currentScale <= 0.02) {
        gameOver = true;
        successMessage = 'チェックを入れられませんでした。ゲームオーバー';
      }
    }
  }

  onDestroy(() => {
    if (messageTimeout) clearTimeout(messageTimeout);
  });
</script>

<div class="container">
  <div class="message">
    下のチェックボックスにチェックを入れてください
  </div>

  <div class="checkbox-area">
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
      class="checkbox-wrapper"
      style="transform: scale({currentScale});"
      on:click={handleClick}
    >
      <input
        type="checkbox"
        id="tiny-check"
        bind:checked
      />
      <label for="tiny-check">私はロボットではありません</label>
    </div>
  </div>

  {#if successMessage}
    <div class="success-message" class:is-success={cleared} class:is-gameover={gameOver}>
      {successMessage}
    </div>
  {/if}

  {#if attempts > 0}
    <div class="info">
      <div class="attempts">クリック試行回数: {attempts}</div>
      <div class="scale-info">現在のサイズ: {(currentScale * 100).toFixed(0)}%</div>
    </div>
  {/if}
</div>

<style>
  .container {
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fafafa;
  }

  .message {
    margin-bottom: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    text-align: center;
    color: #333;
  }

  .checkbox-area {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
    background: #fff;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0;
    cursor: pointer;
    transition: transform 0.5s ease-out;
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
    white-space: nowrap;
    color: #333;
  }

  .success-message {
    margin-top: 10px;
    padding: 10px 12px;
    background: #fffbe6;
    color: #7a6c1a;
    border: 1px solid #e6d98c;
    border-radius: 4px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    animation: slideIn 0.2s ease-out;
  }

  .success-message.is-success {
    background: #f0faf0;
    color: #1a6b2a;
    border: 1px solid #d4e8d4;
  }

  .success-message.is-gameover {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  .info {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .attempts {
    padding: 6px 8px;
    background: #fffbe6;
    border: 1px solid #e6d98c;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #7a6c1a;
  }

  .scale-info {
    padding: 6px 8px;
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-family: 'SF Mono', 'Fira Code', Menlo, Consolas, monospace;
    font-size: 11px;
    color: #666;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
