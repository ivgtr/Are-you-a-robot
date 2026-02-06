<svelte:options customElement="unfocusable-checkbox" />

<script>
  import { onDestroy } from 'svelte';
  import CheckboxWrapper from '../internal/CheckboxWrapper.svelte';
  import MessageDisplay from '../internal/MessageDisplay.svelte';
  import AttemptsCounter from '../internal/AttemptsCounter.svelte';

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

  $: labelText = cleared ? '認証成功' : gameOver ? 'ゲームオーバー' : disabled ? '操作不能' : '私はロボットではありません';

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
    class="checkbox-outer"
    class:disabled
    on:click={handleClick}
  >
    <CheckboxWrapper
      id="unfocusable-check"
      disabled={disabled || cleared}
      label={labelText}
      on:focus={handleFocus}
      on:keydown={handleKeyDown}
    />
  </div>
  <MessageDisplay message={message} type={cleared ? 'success' : 'error'} />
  {#if attempts > 0}
    <div class="counter-spacing">
      <AttemptsCounter label="試行回数: {attempts}" />
    </div>
  {/if}
</div>

<style>
  .container {
    padding: var(--ar-container-padding, 16px);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius-lg, 6px);
    background: var(--ar-color-bg, #fafafa);
  }

  .checkbox-outer {
    transition: opacity var(--ar-transition-slow, 0.3s ease), background var(--ar-transition-slow, 0.3s ease);
  }

  .checkbox-outer.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .counter-spacing {
    margin-top: var(--ar-space-4, 8px);
  }
</style>
