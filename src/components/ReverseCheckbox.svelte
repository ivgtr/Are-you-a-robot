<svelte:options customElement="reverse-checkbox" />

<script>
  import { onDestroy } from 'svelte';

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

  function handleChange() {
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
  <div class="checkbox-wrapper">
    <input
      type="checkbox"
      id="reverse-check"
      bind:checked
      on:change={handleChange}
      disabled={gameOver || cleared}
    />
    <label for="reverse-check">{currentLabel}</label>
  </div>
  {#if currentMessage}
    <div class="message" class:robot={currentMessage.type === 'robot'} class:cancel={currentMessage.type === 'cancel'} class:success={currentMessage.type === 'success'} class:gameover={currentMessage.type === 'gameover'}>
      {#if currentMessage.type === 'robot'}
        ✓ {currentMessage.text}
      {:else if currentMessage.type === 'success'}
        ✓ {currentMessage.text}
      {:else}
        ✗ {currentMessage.text}
      {/if}
    </div>
  {/if}
  {#if toggleCount >= 4 && !cleared && !gameOver}
    <div class="despair">
      切り替え回数: {toggleCount}/{MAX_TOGGLES} — どちらを選んでも人間とは認められません
    </div>
  {/if}
  {#if toggleCount >= WIN_THRESHOLD && !checked && !cleared && !gameOver}
    <div class="hint">...「私はロボットです」のままにしてみると？</div>
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
    transition: color 0.2s;
  }

  .message {
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    animation: slideIn 0.2s ease-out;
  }

  .message.robot {
    background: #f0faf0;
    color: #1a6b2a;
    border: 1px solid #d4e8d4;
  }

  .message.cancel {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  .message.success {
    background: #f0faf0;
    color: #1a6b2a;
    border: 1px solid #d4e8d4;
  }

  .message.gameover {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  .despair {
    margin-top: 8px;
    padding: 8px;
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #666;
  }

  .hint {
    margin-top: 6px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #999;
    font-style: italic;
    animation: fadeIn 1s ease-out;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
