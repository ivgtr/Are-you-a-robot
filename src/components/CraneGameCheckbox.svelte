<svelte:options customElement="crane-game-checkbox" />

<script>
  import { onDestroy } from 'svelte';

  let craneX = 50;
  let clawOpen = true;
  let clawY = 0;
  let dropping = false;
  let grabbing = false;
  let hasCheckbox = false;
  let checkboxY = 220;
  let checkboxX = 50;
  let attempts = 0;
  let message = '';
  let showMessage = false;
  let containerRef;

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

  function handleMouseMove(e) {
    if (dropping || grabbing) return;
    if (!containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    craneX = Math.max(10, Math.min(90, relX));
  }

  function handleTouchMove(e) {
    e.preventDefault();
    if (dropping || grabbing) return;
    if (!containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    const touch = e.touches[0];
    const relX = ((touch.clientX - rect.left) / rect.width) * 100;
    craneX = Math.max(10, Math.min(90, relX));
  }

  function dropClaw() {
    if (dropping || grabbing) return;
    dropping = true;
    clawOpen = true;
    clawY = 0;

    const dropInterval = setInterval(() => {
      clawY += 4;
      if (clawY >= 180) {
        clearInterval(dropInterval);
        clawOpen = false;
        grabbing = true;

        const distance = Math.abs(craneX - checkboxX);

        setTimeout(() => {
          if (distance < 12) {
            hasCheckbox = true;
          }

          const riseInterval = setInterval(() => {
            clawY -= 3;

            if (hasCheckbox) {
              checkboxY = 220 - (180 - clawY);
            }

            // チェックボックスを掴んでも途中で必ず落とす
            if (hasCheckbox && clawY <= 80 + Math.random() * 60) {
              hasCheckbox = false;
              checkboxY = 220;
              // チェックボックスの位置をランダムに変える
              checkboxX = 15 + Math.random() * 70;
              attempts++;
              message = messages[attempts % messages.length];
              showMessage = true;
              setTimeout(() => { showMessage = false; }, 2000);
            }

            if (clawY <= 0) {
              clearInterval(riseInterval);
              clawY = 0;
              dropping = false;
              grabbing = false;
              clawOpen = true;
              hasCheckbox = false;

              if (!showMessage) {
                attempts++;
                message = messages[attempts % messages.length];
                showMessage = true;
                setTimeout(() => { showMessage = false; }, 2000);
              }
            }
          }, 30);
        }, 400);
      }
    }, 20);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
  class="container"
  bind:this={containerRef}
  on:mousemove={handleMouseMove}
  on:touchmove|preventDefault={handleTouchMove}
  on:click={dropClaw}
>
  <div class="machine-top">
    <div class="rail"></div>
    <div class="crane-assembly" style="left: {craneX}%;">
      <div class="wire" style="height: {clawY}px;"></div>
      <div class="claw" class:open={clawOpen} style="top: {clawY}px;">
        <div class="claw-left"></div>
        <div class="claw-right"></div>
      </div>
    </div>
  </div>

  <div class="play-area">
    <div class="checkbox-prize" style="left: {checkboxX}%; bottom: 10px;">
      <input type="checkbox" disabled />
      <span>認証</span>
    </div>
    <div class="floor-items">
      <span class="decoy" style="left: 20%; bottom: 8px;">🧸</span>
      <span class="decoy" style="left: 70%; bottom: 8px;">🎀</span>
    </div>
  </div>

  {#if showMessage}
    <div class="message">{message}</div>
  {/if}

  <div class="instructions">
    {#if !dropping && !grabbing}
      クリックでクレーンを降ろす
    {:else}
      操作中...
    {/if}
  </div>

  {#if attempts > 0}
    <div class="attempts">投入金額: {attempts * 100}円</div>
  {/if}
</div>

<style>
  .container {
    position: relative;
    width: 100%;
    height: 320px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: linear-gradient(180deg, #2a2a3a 0%, #1a1a2e 50%, #fafafa 50%);
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    touch-action: none;
  }

  .machine-top {
    position: relative;
    height: 50%;
    overflow: visible;
  }

  .rail {
    position: absolute;
    top: 15px;
    left: 5%;
    right: 5%;
    height: 4px;
    background: #666;
    border-radius: 2px;
  }

  .crane-assembly {
    position: absolute;
    top: 17px;
    transform: translateX(-50%);
    transition: left 0.15s ease-out;
  }

  .wire {
    width: 2px;
    background: #888;
    margin: 0 auto;
    transition: height 0.05s linear;
  }

  .claw {
    position: relative;
    width: 40px;
    margin-left: -19px;
    display: flex;
    justify-content: space-between;
  }

  .claw-left, .claw-right {
    width: 4px;
    height: 20px;
    background: #aaa;
    border-radius: 0 0 2px 2px;
    transition: transform 0.3s ease;
  }

  .claw.open .claw-left {
    transform: rotate(-30deg);
    transform-origin: top center;
  }

  .claw.open .claw-right {
    transform: rotate(30deg);
    transform-origin: top center;
  }

  .claw:not(.open) .claw-left {
    transform: rotate(-5deg);
    transform-origin: top center;
  }

  .claw:not(.open) .claw-right {
    transform: rotate(5deg);
    transform-origin: top center;
  }

  .play-area {
    position: absolute;
    bottom: 50px;
    left: 0;
    right: 0;
    height: calc(50% - 50px);
  }

  .checkbox-prize {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    background: #fff;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    transform: translateX(-50%);
    transition: left 0.3s ease, bottom 0.1s linear;
    pointer-events: none;
    white-space: nowrap;
  }

  .checkbox-prize input {
    width: 14px;
    height: 14px;
    accent-color: #333;
  }

  .checkbox-prize span {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #333;
  }

  .decoy {
    position: absolute;
    font-size: 24px;
    pointer-events: none;
  }

  .message {
    position: absolute;
    top: 55%;
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

  .instructions {
    position: absolute;
    bottom: 28px;
    left: 0;
    right: 0;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #999;
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
