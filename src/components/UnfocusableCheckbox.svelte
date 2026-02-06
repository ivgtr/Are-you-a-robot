<svelte:options customElement="unfocusable-checkbox" />

<script>
  import { onDestroy } from 'svelte';

  let attempts = 0;
  let disabled = false;
  let message = '';
  let vulnerableWindow = false;
  let cleared = false;
  let gameOver = false;
  let vulnerableUsed = false;
  let vulnerableTimeout = null;

  // 5回ごとにシステムが一瞬不安定になり、0.8秒だけ操作可能になる — チャンスは1回のみ
  const VULNERABLE_INTERVAL = 5;
  const VULNERABLE_DURATION = 800;

  const escalationMessages = [
    'キーボードでの操作はできません',
    'マウスクリックも無効化されました',
    'すべての操作がブロックされています',
    'チェックボックスが無効化されました',
    'あなたの操作権限が取り消されました',
  ];

  function handleFocus(e) {
    if (vulnerableWindow || cleared || gameOver) return;
    e.target.blur();
  }

  function handleKeyDown(e) {
    if (vulnerableWindow || cleared || gameOver) return;
    e.preventDefault();
  }

  function handleClick(e) {
    if (cleared || gameOver) return;

    // 脆弱ウィンドウ中はチェックを許可する
    if (vulnerableWindow) {
      const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
      if (checkbox && checkbox.checked) {
        cleared = true;
        disabled = false;
        message = 'セキュリティの隙を突かれました...認証成功';
      }
      return;
    }

    // 脆弱ウィンドウ外ではチェックボックスのトグルを防止
    e.preventDefault();
    const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
    if (checkbox && checkbox.checked) {
      checkbox.checked = false;
    }

    attempts++;

    if (attempts >= 6) {
      disabled = true;
    }

    // 5回ごとにシステムが不安定になり一瞬操作可能 — チャンスは1回のみ
    if (!vulnerableUsed && attempts > 0 && attempts % VULNERABLE_INTERVAL === 0) {
      vulnerableUsed = true;
      vulnerableWindow = true;
      disabled = false;
      message = 'システムが不安定です...（今がチャンス！）';
      vulnerableTimeout = setTimeout(() => {
        if (!cleared) {
          vulnerableWindow = false;
          gameOver = true;
          disabled = true;
          message = 'セキュリティが完全に復旧しました。ゲームオーバー';
        }
      }, VULNERABLE_DURATION);
      return;
    }

    updateMessage();
  }

  function updateMessage() {
    if (attempts <= 0) {
      message = '';
    } else if (attempts <= 2) {
      message = escalationMessages[0];
    } else if (attempts <= 4) {
      message = escalationMessages[1];
    } else if (attempts <= 6) {
      message = escalationMessages[2];
    } else if (attempts <= 8) {
      message = escalationMessages[3];
    } else {
      message = escalationMessages[4];
    }
  }

  onDestroy(() => {
    if (vulnerableTimeout) clearTimeout(vulnerableTimeout);
  });
</script>

<div class="container">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    class="checkbox-wrapper"
    class:disabled
    on:click={handleClick}
  >
    <input
      type="checkbox"
      id="unfocusable-check"
      tabindex="-1"
      on:focus={handleFocus}
      on:keydown={handleKeyDown}
      disabled={disabled || cleared}
    />
    <label for="unfocusable-check">
      {#if cleared}
        認証成功
      {:else if gameOver}
        ゲームオーバー
      {:else if disabled}
        操作不能
      {:else}
        私はロボットではありません
      {/if}
    </label>
  </div>
  {#if message}
    <p class="message" class:message--success={cleared} class:message--error={!cleared}>{message}</p>
  {/if}
  {#if attempts > 0}
    <div class="counter">試行回数: {attempts}</div>
  {/if}
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
    transition: opacity var(--ar-transition-slow, 0.3s ease), background var(--ar-transition-slow, 0.3s ease);
  }

  .checkbox-wrapper.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: var(--ar-color-surface-hover, #f0f0f0);
  }

  input[type="checkbox"] {
    width: var(--ar-checkbox-size, 18px);
    height: var(--ar-checkbox-size, 18px);
    cursor: pointer;
    accent-color: var(--ar-checkbox-accent, #333);
  }

  input[type="checkbox"]:disabled {
    cursor: not-allowed;
  }

  input[type="checkbox"]:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  label {
    cursor: pointer;
    user-select: none;
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-base, 13px);
    color: var(--ar-color-text, #333);
  }

  .message {
    margin-top: var(--ar-space-5, 10px);
    font-size: var(--ar-font-size-sm, 11px);
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    animation: shake 0.3s ease-in-out;
  }

  .message--error {
    color: var(--ar-color-error, #b91c1c);
  }

  .message--success {
    color: var(--ar-color-success, #1a6b2a);
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    75% { transform: translateX(3px); }
  }

  .counter {
    margin-top: var(--ar-space-4, 8px);
    padding: var(--ar-counter-padding, 6px 8px);
    background: var(--ar-color-warning-bg, #fffbe6);
    border: 1px solid var(--ar-color-warning-border, #e6d98c);
    border-radius: var(--ar-radius, 4px);
    text-align: center;
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-sm, 11px);
    color: var(--ar-color-warning, #7a6c1a);
  }
</style>
