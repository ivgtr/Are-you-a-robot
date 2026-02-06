<svelte:options customElement="stack-drop-checkbox" />

<script>
  import { onDestroy, createEventDispatcher } from 'svelte';
  import GameHeader from '../internal/GameHeader.svelte';
  import MessageDisplay from '../internal/MessageDisplay.svelte';
  import AttemptsCounter from '../internal/AttemptsCounter.svelte';

  const dispatch = createEventDispatcher();
  let attempts = 0;
  let message = '';
  let showMessage = false;
  let checkboxFallen = false;
  let checkboxOffset = 0;
  let checkboxTilt = 0;
  let animating = false;
  let cleared = false;
  let dragStartTime = 0;
  let gameOver = false;
  let isSuccess = false;
  let pendingTimeouts = [];

  // ドラッグ状態
  let draggingBlock = null;
  let dragStartX = 0;
  let dragCurrentX = 0;

  let blocks = [
    { id: 0, color: '#e74c3c', label: '利用規約', alive: true, offset: 0 },
    { id: 1, color: '#e67e22', label: 'プライバシー', alive: true, offset: 0 },
    { id: 2, color: '#f1c40f', label: 'Cookie同意', alive: true, offset: 0 },
    { id: 3, color: '#2ecc71', label: '通知許可', alive: true, offset: 0 },
    { id: 4, color: '#3498db', label: '位置情報', alive: true, offset: 0 },
  ];

  const failMessages = [
    'チェックボックスが落下しました！',
    'バランスを崩してしまいました',
    '積み直してやり直しです',
    '物理法則には逆らえません',
    'もっと慎重にスライドしてください',
  ];

  function showMsg(text) {
    message = text;
    showMessage = true;
  }

  function onDragStart(e, block) {
    if (animating || checkboxFallen || !block.alive || cleared || gameOver) return;
    e.preventDefault();
    draggingBlock = block;
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    dragStartX = clientX;
    dragCurrentX = clientX;
    dragStartTime = Date.now();
  }

  function onDragMove(e) {
    if (!draggingBlock) return;
    e.preventDefault();
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    dragCurrentX = clientX;
    const diff = dragCurrentX - dragStartX;
    draggingBlock.offset = diff;
    blocks = [...blocks];
  }

  function onDragEnd(e) {
    if (!draggingBlock) return;
    const block = draggingBlock;
    draggingBlock = null;

    const diff = Math.abs(block.offset);

    // 十分にスライドしたら除去
    if (diff > 60) {
      const direction = block.offset > 0 ? 1 : -1;
      block.offset = direction * 300;
      blocks = [...blocks];

      pendingTimeouts.push(setTimeout(() => {
        block.alive = false;
        blocks = [...blocks];
        attempts++;
        checkBalance();
      }, 200));
    } else {
      // 戻す
      block.offset = 0;
      blocks = [...blocks];
    }
  }

  // ドラッグの速度を計算（ゆっくり = 慎重な操作）
  function getDragSpeed() {
    const elapsed = Date.now() - dragStartTime;
    if (elapsed <= 0) return 999;
    const diff = Math.abs(dragCurrentX - dragStartX);
    return diff / elapsed; // px/ms
  }

  function checkBalance() {
    if (cleared || gameOver) return;
    const remaining = blocks.filter(b => b.alive).length;
    const speed = getDragSpeed();
    // ゆっくり操作(speed < 0.3)で安定性ボーナス
    const isCareful = speed < 0.3;

    if (remaining === 0) {
      // 全ブロック除去成功: 慎重に操作していれば認証成功
      if (isCareful) {
        cleared = true;
        animating = false;
        isSuccess = true;
        showMsg('完璧な手さばき...認証成功！');
        return;
      }
      // 雑に操作した場合はゲームオーバー
      animating = true;
      gameOver = true;
      showMsg('ブロックは除去しましたが、チェックボックスの着地が不正です。ゲームオーバー');
      dispatch('gameover');
    } else if (remaining <= 2) {
      // 慎重な操作なら30%の確率で耐える
      const surviveChance = isCareful ? 0.3 : 0;
      if (Math.random() < surviveChance) {
        // 耐えた
        checkboxTilt = (Math.random() > 0.5 ? 1 : -1) * 5;
        pendingTimeouts.push(setTimeout(() => { checkboxTilt = 0; }, 300));
        return;
      }
      // 落下 → ゲームオーバー
      animating = true;
      checkboxTilt = (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 30);
      pendingTimeouts.push(setTimeout(() => {
        checkboxFallen = true;
        checkboxOffset = checkboxTilt > 0 ? 120 : -120;
        gameOver = true;
        showMsg(failMessages[attempts % failMessages.length] + ' ゲームオーバー');
        dispatch('gameover');
      }, 400));
    } else {
      // 途中でもランダムにバランスを崩す（慎重操作なら確率低下）
      const failChance = isCareful ? 0.1 : 0.3;
      if (Math.random() < failChance) {
        animating = true;
        checkboxTilt = (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 15);
        pendingTimeouts.push(setTimeout(() => {
          if (Math.random() < 0.5) {
            // 落下 → ゲームオーバー
            checkboxFallen = true;
            checkboxOffset = checkboxTilt > 0 ? 100 : -100;
            gameOver = true;
            showMsg(failMessages[attempts % failMessages.length] + ' ゲームオーバー');
            dispatch('gameover');
          } else {
            // グラついたけど耐えた
            checkboxTilt = 0;
            animating = false;
          }
        }, 400));
      }
    }
  }

  onDestroy(() => {
    pendingTimeouts.forEach(t => clearTimeout(t));
  });

</script>

<svelte:window
  on:mousemove={onDragMove}
  on:mouseup={onDragEnd}
  on:touchmove|nonpassive={onDragMove}
  on:touchend={onDragEnd}
/>

<div class="container">
  <GameHeader icon="🏗️" title="ブロックをスワイプして認証を取り出せ" />

  <div class="play-area">
    <div class="stack">
      <div
        class="checkbox-top"
        class:fallen={checkboxFallen}
        style="transform: rotate({checkboxTilt}deg) translateX({checkboxOffset}px);"
      >
        <input type="checkbox" disabled={!cleared} checked={cleared} />
        <span>{cleared ? '認証OK' : '認証'}</span>
      </div>

      {#each blocks as block (block.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <div
          class="block"
          class:removed={!block.alive}
          class:dragging={draggingBlock && draggingBlock.id === block.id}
          style="background: {block.color}; transform: translateX({block.offset}px);"
          on:mousedown={(e) => onDragStart(e, block)}
          on:touchstart={(e) => onDragStart(e, block)}
        >
          <span class="block-label">{block.label}</span>
          {#if block.alive && !draggingBlock}
            <span class="swipe-hint">← →</span>
          {/if}
        </div>
      {/each}

      <div class="base">🏁 認証エリア</div>
    </div>
  </div>

  <MessageDisplay message={message} type={isSuccess ? 'success' : 'error'} visible={showMessage} />

  {#if attempts > 0}
    <div class="attempts-spacing">
      <AttemptsCounter label="試行回数: {attempts}" variant="inline" />
    </div>
  {/if}
</div>

<style>
  .container {
    padding: var(--ar-container-padding, 16px);
    border: 1px solid var(--ar-color-border, #e0e0e0);
    border-radius: var(--ar-radius-lg, 6px);
    background: var(--ar-color-bg, #fafafa);
    user-select: none;
    touch-action: none;
  }

  .play-area {
    display: flex;
    justify-content: center;
    padding: var(--ar-space-5, 10px) 0;
    overflow: hidden;
  }

  .stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    position: relative;
  }

  .checkbox-top {
    display: flex;
    align-items: center;
    gap: var(--ar-checkbox-wrapper-gap, 8px);
    padding: var(--ar-checkbox-wrapper-padding, 10px 14px);
    background: var(--ar-color-surface, #fff);
    border: 2px solid var(--ar-color-primary, #333);
    border-radius: var(--ar-radius, 4px);
    transition: transform 0.4s ease, opacity 0.4s ease;
    white-space: nowrap;
    z-index: 2;
  }

  .checkbox-top.fallen {
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease;
    opacity: 0.4;
  }

  .checkbox-top input {
    width: var(--ar-checkbox-size, 18px);
    height: var(--ar-checkbox-size, 18px);
    accent-color: var(--ar-checkbox-accent, #333);
  }

  .checkbox-top span {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-base, 13px);
    font-weight: var(--ar-font-weight-semibold, 600);
    color: var(--ar-color-text, #333);
  }

  .block {
    width: 220px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--ar-radius-sm, 3px);
    cursor: grab;
    transition: transform 0.2s ease, opacity 0.3s ease, height 0.3s ease;
    position: relative;
  }

  .block.dragging {
    cursor: grabbing;
    transition: none;
    opacity: 0.85;
    box-shadow: var(--ar-shadow-sm, 0 2px 8px rgba(0,0,0,0.2));
    z-index: 5;
  }

  .block:hover:not(.removed):not(.dragging) {
    filter: brightness(1.1);
  }

  .block.removed {
    opacity: 0;
    pointer-events: none;
    height: 0;
    margin: 0;
    overflow: hidden;
  }

  .block-label {
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-sm, 11px);
    font-weight: var(--ar-font-weight-semibold, 600);
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    pointer-events: none;
  }

  .swipe-hint {
    position: absolute;
    right: var(--ar-space-4, 8px);
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-xs, 10px);
    color: rgba(255,255,255,0.6);
    pointer-events: none;
  }

  .base {
    width: 220px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ar-color-primary, #333);
    color: var(--ar-color-primary-text, #fff);
    border-radius: var(--ar-radius-sm, 3px);
    font-family: var(--ar-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: var(--ar-font-size-xs, 10px);
    margin-top: var(--ar-space-2, 4px);
  }

  .attempts-spacing {
    margin-top: var(--ar-space-5, 10px);
    text-align: right;
  }
</style>
