<svelte:options customElement="crane-game-checkbox" />

<script>
  import { onDestroy, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  let containerRef;
  let craneX = 50;
  let clawY = 0;
  let clawOpen = true;
  let phase = 'idle'; // idle | dropping | closing | rising | resetting
  let hasCheckbox = false;
  let dropPoint = 0;
  let attempts = 0;
  let message = '';
  let showMessage = false;
  let cleared = false;
  let gameOver = false;

  // 5回までしかプレイできない
  const MAX_COINS = 5;

  let checkboxX = 50;
  let checkboxBottomPx = 10;

  let intervalId = null;
  let msgTimeout = null;
  let risingDelayTimeout = null;
  let resetDelayTimeout = null;

  const messages = [
    'つるっ！滑り落ちました',
    'もう少しだったのに...',
    'チェックボックスが逃げた！',
    'クレーンの力が足りない！',
    'あ、掴み損ねた！',
    '景品が重すぎます',
    'もう100円入れてください',
    'この台は設定が渋いです',
  ];

  function showMsg(text) {
    message = text;
    showMessage = true;
    msgTimeout = setTimeout(() => { showMessage = false; }, 2000);
  }

  function handleMouseMove(e) {
    if (phase !== 'idle') return;
    if (!containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    craneX = Math.max(10, Math.min(90, relX));
  }

  function handleTouchMove(e) {
    e.preventDefault();
    if (phase !== 'idle') return;
    if (!containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    const touch = e.touches[0];
    const relX = ((touch.clientX - rect.left) / rect.width) * 100;
    craneX = Math.max(10, Math.min(90, relX));
  }

  function dropClaw() {
    if (phase !== 'idle' || gameOver) return;
    phase = 'dropping';
    clawOpen = true;
    clawY = 0;

    // 下降フェーズ
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      clawY += 3;
      if (clawY >= 150) {
        clawY = 150;
        clearInterval(intervalId);
        // 閉じるフェーズ
        phase = 'closing';
        clawOpen = false;

        const distance = Math.abs(craneX - checkboxX);
        hasCheckbox = distance < 15;

        // 位置が近いほどキャッチ成功率が上がる（最大10%: distance<5で10%, distance<10で5%, それ以上は0%）
        const catchSuccess = hasCheckbox && (
          (distance < 5 && Math.random() < 0.10) ||
          (distance >= 5 && distance < 10 && Math.random() < 0.05)
        );

        // 少し待ってから上昇
        dropPoint = catchSuccess ? -1 : 40 + Math.floor(Math.random() * 60); // -1は成功を意味する
        risingDelayTimeout = setTimeout(() => {
          phase = 'rising';
          intervalId = setInterval(() => {
            clawY -= 2;

            if (hasCheckbox) {
              // チェックボックスをクローと一緒に持ち上げる
              checkboxBottomPx = 150 - clawY + 10;
            }

            // 事前に決めた高さで落とす（dropPoint === -1 はキャッチ成功）
            if (hasCheckbox && dropPoint >= 0 && clawY <= dropPoint) {
              hasCheckbox = false;
              checkboxBottomPx = 10;
              checkboxX = 15 + Math.random() * 70;
              attempts++;
              if (attempts >= MAX_COINS) {
                showMsg('コインが尽きました。ゲームオーバー');
                gameOver = true;
                dispatch('gameover');
              } else {
                showMsg(messages[attempts % messages.length]);
              }
            }

            if (clawY <= 0) {
              clawY = 0;
              clearInterval(intervalId);

              // キャッチ成功判定
              if (hasCheckbox && dropPoint === -1) {
                cleared = true;
                checkboxBottomPx = 10;
                phase = 'resetting';
                showMsg('やった！景品をゲットしました！認証成功！');
                return;
              }

              // リセットフェーズ
              phase = 'resetting';
              clawOpen = true;
              hasCheckbox = false;

              resetDelayTimeout = setTimeout(() => {
                if (!gameOver) phase = 'idle';
              }, 300);
            }
          }, 25);
        }, 500);
      }
    }, 20);
  }

  onDestroy(() => {
    clearInterval(intervalId);
    if (msgTimeout) clearTimeout(msgTimeout);
    if (risingDelayTimeout) clearTimeout(risingDelayTimeout);
    if (resetDelayTimeout) clearTimeout(resetDelayTimeout);
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
  class="container"
  bind:this={containerRef}
  on:mousemove={handleMouseMove}
  on:touchmove|preventDefault={handleTouchMove}
  on:click={dropClaw}
>
  <!-- マシン上部（暗い背景） -->
  <div class="machine-top">
    <div class="rail"></div>
    <div class="crane-arm" style="left: {craneX}%;">
      <div class="arm-head"></div>
      <div class="wire" style="height: {clawY}px;"></div>
      <div class="claw" class:open={clawOpen}>
        <div class="claw-left"></div>
        <div class="claw-center"></div>
        <div class="claw-right"></div>
      </div>
    </div>
  </div>

  <!-- プレイエリア（明るい背景） -->
  <div class="play-area">
    <div
      class="checkbox-prize"
      style="left: {checkboxX}%; bottom: {checkboxBottomPx}px;"
    >
      <input type="checkbox" disabled={!cleared} checked={cleared} />
      <span>{cleared ? '認証OK' : '認証'}</span>
    </div>
    <span class="decoy" style="left: 15%; bottom: 6px;">🧸</span>
    <span class="decoy" style="left: 75%; bottom: 6px;">🎀</span>
    <span class="decoy" style="left: 40%; bottom: 6px;">⭐</span>
  </div>

  <!-- UI オーバーレイ -->
  {#if showMessage}
    <div class="message" class:success={cleared}>{message}</div>
  {/if}

  <div class="instructions">
    {#if gameOver}
      ゲームオーバー
    {:else if phase === 'idle'}
      マウスで移動 → クリックでキャッチ
    {:else}
      操作中...
    {/if}
  </div>

  {#if attempts > 0}
    <div class="attempts">投入金額: {attempts * 100}円 (残り{MAX_COINS - attempts}回)</div>
  {/if}
</div>

<style>
  .container {
    position: relative;
    width: 100%;
    height: 320px;
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius-lg, 6px);
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    touch-action: none;
    background: var(--ar-color-bg, #fafafa);
  }

  /* マシン上部 */
  .machine-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 180px;
    background: #1e1e2e;
    border-bottom: 3px solid #444;
  }

  .rail {
    position: absolute;
    top: 18px;
    left: 5%;
    right: 5%;
    height: 4px;
    background: #555;
    border-radius: 2px;
  }

  .crane-arm {
    position: absolute;
    top: 14px;
    transform: translateX(-50%);
    transition: left 0.12s ease-out;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .arm-head {
    width: 16px;
    height: 12px;
    background: #888;
    border-radius: 3px 3px 0 0;
  }

  .wire {
    width: 2px;
    background: #aaa;
  }

  .claw {
    display: flex;
    align-items: flex-start;
    gap: 0;
    transition: gap 0.3s ease;
  }

  .claw-center {
    width: 6px;
    height: 8px;
    background: #999;
    border-radius: 0 0 2px 2px;
  }

  .claw-left,
  .claw-right {
    width: 3px;
    height: 18px;
    background: #bbb;
    border-radius: 0 0 2px 2px;
    transition: transform 0.3s ease;
  }

  .claw.open .claw-left {
    transform: rotate(-35deg);
    transform-origin: top center;
  }

  .claw.open .claw-right {
    transform: rotate(35deg);
    transform-origin: top center;
  }

  .claw:not(.open) .claw-left {
    transform: rotate(-8deg);
    transform-origin: top center;
  }

  .claw:not(.open) .claw-right {
    transform: rotate(8deg);
    transform-origin: top center;
  }

  /* プレイエリア */
  .play-area {
    position: absolute;
    top: 183px;
    left: 0;
    right: 0;
    bottom: 45px;
    background: var(--ar-color-bg, #fafafa);
  }

  .checkbox-prize {
    position: absolute;
    display: flex;
    align-items: center;
    gap: var(--ar-space-2, 4px);
    padding: var(--ar-space-3, 6px) var(--ar-space-5, 10px);
    background: var(--ar-color-surface, #fff);
    border: 2px solid var(--ar-color-primary, #333);
    border-radius: var(--ar-radius, 4px);
    transform: translateX(-50%);
    transition: left 0.3s ease, bottom 0.15s ease;
    pointer-events: none;
    white-space: nowrap;
    z-index: 2;
  }

  .checkbox-prize input {
    width: 14px;
    height: 14px;
    accent-color: var(--ar-checkbox-accent, #333);
  }

  .checkbox-prize span {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-sm, 11px);
    font-weight: var(--ar-font-weight-semibold, 600);
    color: var(--ar-color-text, #333);
  }

  .decoy {
    position: absolute;
    font-size: 22px;
    pointer-events: none;
  }

  .message {
    position: absolute;
    top: 195px;
    left: 50%;
    transform: translateX(-50%);
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
    0% { opacity: 0; transform: translateX(-50%) scale(0.8); }
    15% { opacity: 1; transform: translateX(-50%) scale(1); }
    75% { opacity: 1; }
    100% { opacity: 0; }
  }

  .instructions {
    position: absolute;
    bottom: 26px;
    left: 0;
    right: 0;
    text-align: center;
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-sm, 11px);
    color: var(--ar-color-text-muted, #999);
  }

  .attempts {
    position: absolute;
    bottom: var(--ar-space-4, 8px);
    right: var(--ar-space-5, 10px);
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-sm, 11px);
    color: var(--ar-color-text-muted, #999);
  }
</style>
