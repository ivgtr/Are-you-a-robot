<svelte:options customElement="unfocusable-checkbox" />

<script>
  let attempts = 0;
  let disabled = false;
  let message = '';
  let vulnerableWindow = false;
  let cleared = false;
  let gameOver = false;
  let vulnerableUsed = false;

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
    registerAttempt();
  }

  function handleKeyDown(e) {
    if (vulnerableWindow || cleared || gameOver) return;
    e.preventDefault();
    registerAttempt();
  }

  function handleClick(e) {
    if (cleared || gameOver) return;

    // 脆弱ウィンドウ中はチェックを許可する
    if (vulnerableWindow) {
      const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
      if (checkbox && checkbox.checked) {
        cleared = true;
        message = 'セキュリティの隙を突かれました...認証成功';
        disabled = false;
      }
      return;
    }

    attempts++;

    // 段階的エスカレーション
    if (attempts >= 3) {
      e.preventDefault();
      // チェックされていたら外す
      const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
      if (checkbox && checkbox.checked) {
        checkbox.checked = false;
      }
    }

    if (attempts >= 6) {
      disabled = true;
    }

    // 5回ごとにシステムが不安定になり一瞬操作可能 — チャンスは1回のみ
    if (!vulnerableUsed && attempts > 0 && attempts % VULNERABLE_INTERVAL === 0) {
      vulnerableUsed = true;
      vulnerableWindow = true;
      disabled = false;
      message = 'システムが不安定です...（今がチャンス！）';
      setTimeout(() => {
        if (!cleared) {
          vulnerableWindow = false;
          // チャンスを逃した → ゲームオーバー
          gameOver = true;
          disabled = true;
          message = 'セキュリティが完全に復旧しました。ゲームオーバー';
        }
      }, VULNERABLE_DURATION);
      return;
    }

    updateMessage();
  }

  function registerAttempt() {
    attempts++;
    if (attempts >= 6 && !vulnerableWindow) {
      disabled = true;
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
</script>

<div class="container">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    class="checkbox-wrapper"
    class:disabled
    on:click|preventDefault={handleClick}
  >
    <input
      type="checkbox"
      id="unfocusable-check"
      tabindex="-1"
      on:focus={handleFocus}
      on:keydown={handleKeyDown}
      {disabled}
    />
    <label for="unfocusable-check">
      {#if gameOver}
        ゲームオーバー
      {:else if disabled}
        操作不能
      {:else}
        私はロボットではありません
      {/if}
    </label>
  </div>
  {#if message}
    <p class="hint">{message}</p>
  {/if}
  {#if attempts > 0}
    <div class="attempts">試行回数: {attempts}</div>
  {/if}
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
    transition: opacity 0.3s, background 0.3s;
  }

  .checkbox-wrapper.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #f0f0f0;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #333;
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    color: #333;
  }

  .hint {
    margin-top: 10px;
    font-size: 11px;
    color: #b91c1c;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    animation: shake 0.3s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    75% { transform: translateX(3px); }
  }

  .attempts {
    margin-top: 8px;
    padding: 6px 8px;
    background: #fffbe6;
    border: 1px solid #e6d98c;
    border-radius: 4px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #7a6c1a;
  }
</style>
