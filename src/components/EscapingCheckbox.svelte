<svelte:options customElement="escaping-checkbox" />

<script>
  let x = 50;
  let y = 50;
  let containerRef;
  let chaseCount = 0;

  const taunts = [
    'もう少し！',
    '惜しい！',
    '頑張って！',
    '捕まえてみて！',
    'そっちじゃないよ！',
    '速すぎる？',
    '諦めないで！',
    'ロボットなら捕まえられるかも？',
  ];

  let tauntText = '';
  let showTaunt = false;

  function getEscapeBehavior() {
    const rand = Math.random();
    if (rand < 0.15) {
      // フェイント: 一瞬近づいてから逃げる
      return 'feint';
    } else if (rand < 0.35) {
      // ジグザグ: 斜め方向にずれて逃げる
      return 'zigzag';
    }
    return 'straight';
  }

  function handleMouseMove(e) {
    if (!containerRef) return;

    const rect = containerRef.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const distance = Math.sqrt(
      Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2)
    );

    if (distance < 120) {
      chaseCount++;
      const angle = Math.atan2(y - mouseY, x - mouseX);

      // 距離に反比例する逃走速度 (近いほど速い)
      const baseEscape = Math.max(30, 80 - distance * 0.4);
      const behavior = getEscapeBehavior();

      let escapeX, escapeY;

      if (behavior === 'feint') {
        // フェイント: 反対方向に大きく逃げる
        escapeX = x + Math.cos(angle) * baseEscape * 1.5;
        escapeY = y + Math.sin(angle) * baseEscape * 1.5;
      } else if (behavior === 'zigzag') {
        // ジグザグ: 垂直方向にずらす
        const perpAngle = angle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);
        escapeX = x + Math.cos(angle) * baseEscape * 0.5 + Math.cos(perpAngle) * baseEscape * 0.8;
        escapeY = y + Math.sin(angle) * baseEscape * 0.5 + Math.sin(perpAngle) * baseEscape * 0.8;
      } else {
        escapeX = x + Math.cos(angle) * baseEscape;
        escapeY = y + Math.sin(angle) * baseEscape;
      }

      x = Math.max(30, Math.min(rect.width - 30, escapeX));
      y = Math.max(30, Math.min(rect.height - 30, escapeY));

      // 一定回数追いかけたら挑発テキストを表示
      if (chaseCount % 5 === 0) {
        tauntText = taunts[Math.floor(Math.random() * taunts.length)];
        showTaunt = true;
        setTimeout(() => { showTaunt = false; }, 1500);
      }
    }
  }

  function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseMove({
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
  }
</script>

<div
  class="container"
  bind:this={containerRef}
  on:mousemove={handleMouseMove}
  on:touchmove|preventDefault={handleTouchMove}
>
  <div class="checkbox-wrapper" style="left: {x}px; top: {y}px;">
    <input type="checkbox" id="escaping-check" />
    <label for="escaping-check">私はロボットではありません</label>
  </div>
  {#if showTaunt}
    <div class="taunt">{tauntText}</div>
  {/if}
  {#if chaseCount > 0}
    <div class="chase-count">追跡回数: {chaseCount}</div>
  {/if}
</div>

<style>
  .container {
    position: relative;
    width: 100%;
    height: 280px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fafafa;
    overflow: hidden;
    touch-action: none;
  }

  .checkbox-wrapper {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: #fff;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    transform: translate(-50%, -50%);
    transition: left 0.25s ease-out, top 0.25s ease-out;
    cursor: pointer;
    white-space: nowrap;
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

  .taunt {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #999;
    pointer-events: none;
    animation: fadeInOut 1.5s ease-out forwards;
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    80% { opacity: 1; }
    100% { opacity: 0; transform: translate(-50%, -60%) scale(1); }
  }

  .chase-count {
    position: absolute;
    bottom: 8px;
    right: 10px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #999;
  }
</style>
