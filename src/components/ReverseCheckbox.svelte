<svelte:options customElement="reverse-checkbox" />

<script>
  import { onDestroy } from 'svelte';
  import CheckboxWrapper from '../internal/CheckboxWrapper.svelte';
  import MessageDisplay from '../internal/MessageDisplay.svelte';

  let checked = false;
  let toggleCount = 0;
  let cleared = false;
  let gameOver = false;
  let winTimer = null;

  // 8回までに正解しないとゲームオーバー
  const MAX_TOGGLES = 8;
  // この回数以上トグルした後、未チェック状態で2秒待つと勝利
  const WIN_THRESHOLD = 6;

  const messages = [
    { text: 'ロボットであることが確認されました', type: 'robot' },
    { text: '人間確認が取り消されました', type: 'cancel' },
    { text: 'やはりロボットのようです', type: 'robot' },
    { text: '人間...ではなさそうです', type: 'cancel' },
    { text: 'ロボット確定です。諦めてください', type: 'robot' },
    { text: '何度切り替えても無駄です', type: 'cancel' },
  ];

  $: currentLabel = gameOver ? 'ゲームオーバー' : cleared ? '認証成功' : checked ? '私はロボットではありません' : '私はロボットです';
  $: currentMessage = cleared
    ? { text: '逆転の発想...お見事です。認証成功', type: 'success' }
    : gameOver
    ? { text: '切り替え回数の上限に達しました。ゲームオーバー', type: 'gameover' }
    : toggleCount > 0 ? messages[Math.min(toggleCount - 1, messages.length - 1)] : null;

  $: messageText = currentMessage
    ? ((currentMessage.type === 'robot' || currentMessage.type === 'success') ? '✓ ' : '✗ ') + currentMessage.text
    : '';
  $: messageType = !currentMessage ? 'error'
    : (currentMessage.type === 'robot' || currentMessage.type === 'success') ? 'success'
    : 'error';

  function handleChange(e) {
    checked = e.target.checked;
    if (cleared || gameOver) return;
    toggleCount++;

    // 既存のタイマーをクリア
    if (winTimer) { clearTimeout(winTimer); winTimer = null; }

    // 上限に達したらゲームオーバー
    if (toggleCount >= MAX_TOGGLES) {
      gameOver = true;
      checked = false;
      return;
    }

    // 6回以上切り替えた後に「私はロボットです」（未チェック状態）のまま2秒待つと
    // 逆説的に「自分がロボットだと認める＝人間にしかできない自己否定」で認証成功
    if (toggleCount >= WIN_THRESHOLD && !checked) {
      winTimer = setTimeout(() => {
        if (!checked && !gameOver && !cleared) {
          cleared = true;
        }
      }, 2000);
    }
  }

  onDestroy(() => {
    if (winTimer) clearTimeout(winTimer);
  });
</script>

<div class="container">
  <CheckboxWrapper
    id="reverse-check"
    {checked}
    disabled={gameOver || cleared}
    label={currentLabel}
    on:change={handleChange}
  />
  <MessageDisplay message={messageText} type={messageType} visible={!!currentMessage} />
  {#if toggleCount >= 4 && !cleared && !gameOver}
    <div class="counter">
      切り替え回数: {toggleCount}/{MAX_TOGGLES} — どちらを選んでも人間とは認められません
    </div>
  {/if}
  {#if toggleCount >= WIN_THRESHOLD && !checked && !cleared && !gameOver}
    <div class="hint">...「私はロボットです」のままにしてみると？</div>
  {/if}
</div>

<style>
  .container {
    padding: var(--ar-container-padding, 16px);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius-lg, 6px);
    background: var(--ar-color-bg, #fafafa);
  }

  .counter {
    margin-top: var(--ar-space-4, 8px);
    padding: var(--ar-space-4, 8px);
    background: var(--ar-color-surface-dim, #f5f5f5);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius, 4px);
    text-align: center;
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-sm, 11px);
    color: var(--ar-color-text-secondary, #666);
  }

  .hint {
    margin-top: var(--ar-space-3, 6px);
    text-align: center;
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-sm, 11px);
    color: var(--ar-color-text-muted, #999);
    font-style: italic;
    animation: fadeIn 1s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
